import { extractFirstName } from '../../util';
import { User, UserService } from '../../user';
import { BulkMessages } from '../bulk-message-service';
import { BulkMessagesTransport, MessageContextFactory, MessageTemplateContext } from '../types';
import { createAppError } from '../../error';

class TestContextFactory implements MessageContextFactory {
  createContextFromUser(user: User): Promise<MessageTemplateContext> {
    return Promise.resolve({
      firstName: extractFirstName(user.name),
      baseUrl: 'https://example.com',
      donateLink: `https://donate?u=${user._id}`
    });
  }
}

class TestMessageTransport implements BulkMessagesTransport {
  sentMessages: Array<{recipient: User, message: string}> = [];

  sendMessage(recipient: User, message: string): Promise<void> {
    this.sentMessages.push({ message, recipient });
    return Promise.resolve();
  }
  
}

describe('BulkMessages', () => {
  let service: BulkMessages;
  let users: UserService;
  let contextFactory: TestContextFactory;

  beforeEach(() => {
    users = {
      // @ts-ignore  
      getAllBeneficiaries: () => Promise.resolve([
        { _id: 'b1', name: 'John Doe' },
        { _id: 'b2', name: 'Foo Bar' }
      ]),
      // @ts-ignore
      getAllDonors: () => Promise.resolve([
        { _id: 'd1', name: 'Fizz Buzz' },
        { _id: 'd2', name: 'What What'},
        { _id: 'u1', name: 'Xy Zw' }
      ]),
      // @ts-ignore
      getByPhone: (phone) => {
        if (phone === '254700111222') {
          return Promise.resolve({ _id: 'u1', name: 'Xy Zw' });
        }

        if (phone === '254700111333') {
          return Promise.resolve({ _id: 'u2', name: 'Op Fa' });
        }

        throw createAppError('User not found');
      }
    };

    contextFactory = new TestContextFactory();

    service = new BulkMessages({
      users,
      contextFactory,
      transport: {
        sendMessage: jest.fn().mockImplementation(() => Promise.resolve())
      }
    });
  });

  describe('send', () => {
    test('should send message to all resolved unique recipients and return report', async () => {
      const template = 'Hi {firstName}, Click here to donate {donateLink}';
      const report = await service.send(['donors', '254700111222', '254700111333'], template);
      
      expect(report.errors.length).toBe(0);
      expect(report.numRecipients).toEqual(4);
      expect(report.recipients).toEqual([
        { user: 'd1', name: 'Fizz Buzz' },
        { user: 'd2', name: 'What What' },
        { user: 'u1', name: 'Xy Zw' },
        { user: 'u2', name: 'Op Fa' }
      ])
      expect(report.numFailed).toEqual(0);
      expect(service.transport.sendMessage).toHaveBeenCalledTimes(4);
      const expectedArgs = [
        [{ _id: 'd1', name: 'Fizz Buzz' }, 'Hi Fizz, Click here to donate https://donate?u=d1'],
        [{ _id: 'd2', name: 'What What'}, 'Hi What, Click here to donate https://donate?u=d2'],
        [{ _id: 'u1', name: 'Xy Zw' }, 'Hi Xy, Click here to donate https://donate?u=u1'],
        [{ _id: 'u2', name: 'Op Fa' }, 'Hi Op, Click here to donate https://donate?u=u2']
      ];

      expectedArgs.forEach(args => expect(service.transport.sendMessage).toHaveBeenCalledWith(args[0], args[1]));
    });

    test('should throw error if recipient groups are invalid', async () => {
      const template = 'Hi {firstName}, Click here to donate {donateLink}';
      try {
        await service.send(['donors', 'benficiaris', '0700111333'], template);
      }
      catch (e) {
        expect(e.message).toMatch(/invalid recipients: 'benficiaris', '0700111333'/i)
      }
    });

    test('should include failures in report', async () => {
      const template = 'Hi {firstName}, Click here to donate {donateLink}';
      const report = await service.send(['donors', '254700111222', '254700111444'], template);
      
      expect(report.numRecipients).toEqual(3);
      expect(report.numFailed).toEqual(1);
      expect(report.errors).toEqual([
        {
          message: 'User not found',
          recipientGroup: '254700111444',
          user: null,
          name: null
        }
      ]);
    });
  });

  describe('previewMessage', () => {
    test('should show return resolved template message based on a dummy user', async () => {
      const template = 'Hi {firstName}, Click here to donate {donateLink}';
      const preview = await service.previewMessage(template);
      expect(preview).toBe('Hi John, Click here to donate https://donate?u=dummy_user');
    });
  });
});
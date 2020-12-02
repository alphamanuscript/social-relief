import { Links } from '../link-generator-service';
import { User } from '../../user';
import { LinkShortener } from '../types';

describe('LinkGeneratorService tests', () => {
  const baseUrl = 'https://test.com';
  let shortener: LinkShortener;

  function getService() {
    return new Links({ shortener, baseUrl: baseUrl });
  }

  beforeEach(() => {
    shortener = {
      shortenLink: (link) => Promise.resolve(`shorten_${link}`)
    };
  });


  describe('getDonateLink', () => {
    test('should generate shortened donate link with arguments url encoded', async () => {
      const service = getService();
      const link = await service.getDonateLink({
        name: 'John Doe',
        phone: '711000222',
        email: 'test@mailer.com',
        amount: 3000
      });

      expect(link).toEqual('shorten_https://test.com?donate=1&n=John%20Doe&e=test%40mailer.com&p=711000222&a=3000');
    });

    test('should omit missing values from generated link', async () => {
      const service = getService();
      const link = await service.getDonateLink({
        name: 'John Doe',
        email: 'test@mailer.com'
      });

      expect(link).toEqual('shorten_https://test.com?donate=1&n=John%20Doe&e=test%40mailer.com');
    });

    test('should not shorten link if shorten option is false', async () => {
      const service = getService();
      const link = await service.getDonateLink({
        name: 'John Doe',
        phone: '711000222',
        email: 'test@mailer.com',
        amount: 3000
      }, false);

      expect(link).toEqual('https://test.com?donate=1&n=John%20Doe&e=test%40mailer.com&p=711000222&a=3000');
    });
  });

  describe('getUserDonateLink', () => {
    test('should generate a shortened link for the specified user', async () => {
      const service = getService();
      const link = await service.getUserDonateLink({
        _id: 'u1',
        name: 'John Doe',
        email: 'test@mailer.com',
        phone: '254711000222',
        addedBy: '',
        donors: [],
        roles: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }, 3000);

      expect(link).toEqual('shorten_https://test.com?donate=1&n=John%20Doe&e=test%40mailer.com&p=711000222&a=3000');
    });
  });
});

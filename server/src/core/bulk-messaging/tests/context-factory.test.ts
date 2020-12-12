import { User } from '../../user';
import { LinkGeneratorService } from '../../link-generator';
import { DefaultMessageContextFactory } from '../context-factory';


describe('DefaultBulkMessageContextFactory', () => {
  describe('createFromUser', () => {
    test('should create message context with generated donateLink and user first name', async () => {
      const linkGenerator: LinkGeneratorService = {
        getUserDonateLink: (user, amount) => Promise.resolve(`https://donate?p=${user.phone}&a=${amount}`),
        getDonateLink: () => Promise.resolve('')
      };
      const factory = new DefaultMessageContextFactory({ baseUrl: 'https://example.com', linkGenerator })
      const context = await factory.createContextFromUser(<User>{ name: 'John Doe', phone: '254777111222' })

      expect(context).toEqual({
        firstName: 'John',
        baseUrl: 'https://example.com',
        donateLink: 'https://donate?p=254777111222&a=2000'
      });
    });
  })
});

import { DefaultMessageTemplateResolver } from '../template-resolver';
import { MessageTemplateContext } from '../types';

describe('DefaultMessageTemplateResolver', () => {
  describe('resolve', () => {
    test('should replace placeholders with context variables', async () => {
      const resolver = new DefaultMessageTemplateResolver();
      const template = 'Hi {firstName}, we would like to announce a new feature. Please visit {baseUrl}/new-feature for more info. To donate, click {donateLink}';
      const context: MessageTemplateContext = {
        firstName: 'John',
        baseUrl: 'https://test.com',
        donateLink: 'https://donateLink'
      };

      const message = await resolver.resolve(context, template);
      expect(message).toEqual(
        'Hi John, we would like to announce a new feature. Please visit https://test.com/new-feature for more info. To donate, click https://donateLink'
      );
    });

    test('placeholders should be case insensitive', async () => {
      const resolver = new DefaultMessageTemplateResolver();
      const template = 'Hi {FIRSTNAME}, we would like to announce a new feature. Please visit {baseurl}/new-feature for more info. To donate, click {Donatelink}';
      const context: MessageTemplateContext = {
        firstName: 'John',
        baseUrl: 'https://test.com',
        donateLink: 'https://donateLink'
      };

      const message = await resolver.resolve(context, template);
      expect(message).toEqual(
        'Hi John, we would like to announce a new feature. Please visit https://test.com/new-feature for more info. To donate, click https://donateLink'
      );
    })
  });
});

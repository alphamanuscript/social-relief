import { UserService } from '../../user';
import { DefaultRecipientResolver } from '../recipient-resolver';
import { RecipientResolver } from '../types';


describe('DefaultRecipientResolver', () => {
  let users: UserService;
  let resolver: RecipientResolver;

    beforeEach(() => {
      users = {
        // @ts-ignore  
        getAllBeneficiaries: () => Promise.resolve([
          { _id: 'b1' },
          { _id: 'b2' }
        ]),
        // @ts-ignore
        getAllDonors: () => Promise.resolve([
          { _id: 'd1' },
          { _id: 'd2' }
        ]),
        // @ts-ignore
        getByPhone: (phone) => Promise.resolve(
          phone === '254700111222' ? { _id: 'u1' } :
          phone === '254700111333' ? { _id: 'u2' } :
          { _id: 'u3' }
        )
      }

      resolver = new DefaultRecipientResolver({ users });
    });

  describe('resolve', () => {
    test('should return all donors if recipient is donors', async () => {
      const result = await resolver.resolve('donors');
      expect(result).toEqual([
        { _id: 'd1' },
        { _id: 'd2' }
      ])
    });

    test('should return all beneficiaries if recipient is beneficiaries', async () => {
      const result = await resolver.resolve('beneficiaries');
      expect(result).toEqual([
        { _id: 'b1' },
        { _id: 'b2' }
      ])
    });

    test('should return user with specified phone number if recipient is a valid phone number', async () => {
      let result = await resolver.resolve('254700111222');
      expect(result).toEqual([
        { _id: 'u1' }
      ]);

      result = await resolver.resolve('254700111333');
      expect(result).toEqual([
        { _id: 'u2' }
      ]);
    });

  });

  describe('canResolve', () => {
    test('should return true for donors', () => {
      expect(resolver.canResolve('donors')).toBe(true);
    });

    test('should return true for beneficiaries', () => {
      expect(resolver.canResolve('beneficiaries')).toBe(true);
    });

    test('should return true for valid phone numbers', () => {
      expect(resolver.canResolve('254111222333')).toBe(true);
    });

    test('should return false for invalid phone numbers', () => {
      expect(resolver.canResolve('0711222333')).toBe(false);
    });

    test('should return false for unknown groups', () => {
      expect(resolver.canResolve('test')).toBe(false);
    });
  });
});

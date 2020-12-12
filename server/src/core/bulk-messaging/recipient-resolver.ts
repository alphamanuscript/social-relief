import { createAppError } from '../error';
import { User, UserService } from '../user';
import { validatePhone } from '../util';
import { RecipientResolver } from './types';

const DONORS_RECIPIENT_GROUP = 'donors';
const BENEFICIARIES_RECIPIENT_GROUP = 'beneficiaries';

export interface DefaultRecipientResolverArgs {
  users: UserService;
}

export class DefaultRecipientResolver implements RecipientResolver {
  private innerResolver: CombinedRecipientResolver;

  constructor(args: DefaultRecipientResolverArgs) {
    this.innerResolver = new CombinedRecipientResolver(
      new DonorGroupRecipientResolver(args.users),
      new BeneficiaryGroupRecipientResolver(args.users),
      new PhoneRecipientResolver(args.users)
    );
  }

  canResolve(recipient: string): boolean {
    return this.innerResolver.canResolve(recipient);
  }

  resolve(recipient: string): Promise<User[]> {
    return this.innerResolver.resolve(recipient);
  }

}

export class CombinedRecipientResolver implements RecipientResolver {
  private resolvers: RecipientResolver[];

  constructor(...resolvers: RecipientResolver[]) {
    this.resolvers = resolvers;
  }

  canResolve(recipient: string): boolean {
    return this.resolvers.some(resolver => resolver.canResolve(recipient));
  }
  
  resolve(recipient: string): Promise<User[]> {
    const resolver = this.resolvers.find(candidate => candidate.canResolve(recipient));
    if (!resolver) throw createAppError(`Recipient resolver not found for recipient ${resolver}`);

    return resolver.resolve(recipient);
  }
}

export class DonorGroupRecipientResolver implements RecipientResolver {
  users: UserService;

  constructor(users: UserService) {
    this.users = users;
  }

  canResolve(recipient: string): boolean {
    return recipient === DONORS_RECIPIENT_GROUP;
  }

  resolve(recipient: string): Promise<User[]> {
    return this.users.getAllDonors();
  }
}

export class BeneficiaryGroupRecipientResolver implements RecipientResolver {
  users: UserService;

  constructor(users: UserService) {
    this.users = users;
  }

  canResolve(recipient: string): boolean {
    return recipient === BENEFICIARIES_RECIPIENT_GROUP;
  }

  resolve(recipient: string): Promise<User[]> {
    return this.users.getAllBeneficiaries();
  }
}

export class PhoneRecipientResolver implements RecipientResolver {
  users: UserService;

  constructor(users: UserService) {
    this.users = users;
  }
  
  canResolve(recipient: string): boolean {
    try {
      validatePhone(recipient);
      return true;
    }
    catch (e) {
      return false;
    }
  }

  async resolve(recipient: string): Promise<User[]> {
    const user = await this.users.getByPhone(recipient);
    return [user];
  }

}
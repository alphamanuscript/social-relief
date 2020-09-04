import { 
  User,
  AnonymousService,
  UserService,
  AnonymousCreateArgs,
  AnonymousDonateArgs
} from './types';
import { Transaction } from '../payment';
import { rethrowIfAppError } from '../error';
import { string } from '@hapi/joi';

export interface AnonymousUsersArgs {
  users: UserService
};

export class AnonymousUsers implements AnonymousService {
  private users: UserService;

  constructor(args: AnonymousUsersArgs) {
    this.users = args.users;
  }

  async create(args: AnonymousCreateArgs): Promise<User> {
    const { name, phone, email } = args;
    try {
      let user = await this.users.getByPhone(phone);
      if (!user) {
        user = await this.users.create({ name, phone, email, password: '.', isAnonymous: true });
      }
      
      return user;
    }
    catch (e) {
      rethrowIfAppError(e);
    }
  }

  async donate(args: AnonymousDonateArgs): Promise<Transaction> {
    const { user, amount } = args;
    try { 
      const transaction = await this.users.initiateDonation(user._id, { amount });
      return transaction;
    }
    catch (e) {
      rethrowIfAppError(e);
    }
  }
}
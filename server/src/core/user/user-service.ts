import { Db, Collection } from 'mongodb';
import { generateId, hashPassword } from '../util';
import * as messages from '../messages';
import { User, DbUser, UserCreateArgs, UserService} from './types';
import { AppError, throwDbOpFailedError } from '../error/app-error';

const COLLECTION = 'users';

/**
 * removes fields that should
 * not be shared from the user
 * @param user 
 */
function getSafeUser(user: DbUser): User {
  const { _id, phone, createdAt, updatedAt } = user;
  return {
    _id,
    phone,
    createdAt,
    updatedAt
  };
}

export class Users implements UserService {
  private db: Db;
  private collection: Collection<DbUser>;

  constructor(db: Db) {
    this.db = db;
    this.collection = this.db.collection(COLLECTION);
  }

  async create(args: UserCreateArgs): Promise<User> {
    const now = new Date();
    const user = {
      _id: generateId(),
      password: hashPassword(args.password),
      phone: args.phone,
      createdAt: now,
      updatedAt: now
    };

    try {
      const res = await this.collection.insertOne(user);
      if (res.insertedCount !== 1) {
        throwDbOpFailedError(messages.ERROR_CREATE_USER_FAILED);
      }

      return getSafeUser(res.ops[0]);
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throwDbOpFailedError(e.message);
    }
  }
}
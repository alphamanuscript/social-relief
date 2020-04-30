import { Transaction } from '../transaction';

export interface User {
  _id: string,
  phone: string,
  createdAt: Date,
  updatedAt: Date
};

export interface DbUser extends User {
  password: string
}

export interface AccessToken {
  _id: string,
  user: string,
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date
};


export interface UserCreateArgs {
  phone: string,
  password: string
};

export interface UserLoginArgs {
  phone: string,
  password: string
};

export interface UserLoginResult {
  user: User,
  token: AccessToken
};

export interface InitiateDonationArgs {
  amount: number
};

export interface UserService {
  /**
   * ensures that all required database indexes
   * for this service are created.
   * This method is idempotent
   */
  createIndexes(): Promise<void>;
  /**
   * creates a user
   * @param args 
   */
  create(args: UserCreateArgs): Promise<User>;
  /**
   * logs in the user if the credentials are valid,
   * generates a temporary access token for the user
   * @param args 
   */
  login(args: UserLoginArgs): Promise<UserLoginResult>;
  /**
   * retrieves the user who owns the token, provided
   * the token is valid
   * @param token 
   */
  getByToken(token: string): Promise<User>;
  /**
   * invalidates the specified access token
   * @param token 
   */
  logout(token: string): Promise<void>;
  /**
   * invalidates all access tokens belonging to the
   * specified user
   * @param user 
   */
  logoutAll(user: string): Promise<void>;
  /**
   * initiates a donation from the specified user
   * @param user 
   * @param args 
   */
  initiateDonation(user: string, args: InitiateDonationArgs): Promise<Transaction>
};

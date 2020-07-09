import { Transaction, InitiateDonationArgs, SendDonationArgs } from '../payment';

export type UserRole = 'donor' | 'beneficiary' | 'middleman';

export interface User {
  _id: string,
  phone: string,
  email?: string,
  name: string,
  addedBy: string,
  /**
   * the donors from whom this beneficiary can receive funds
   */
  donors: string[],
  /**
   * the donors on behalf of whom this middleman can add beneficiaries
   */
  middlemanFor?: string[],
  roles: UserRole[],
  createdAt: Date,
  updatedAt: Date
};

export interface DbUser extends User {
  password?: string
}

/**
 * result of a nomination operation,
 * contains minimal data of the nominated user
 * that is safe for the nominator to see
 */
export interface NominatedUserResult {
  _id: string,
  phone: string
};

export interface AccessToken {
  _id: string,
  user: string,
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date
};

export interface UserCreateArgs {
  phone: string,
  name: string,
  password: string,
  googleIdToken: string
};

export interface UserNominateArgs {
  phone: string,
  name: string,
  email?: string,
  nominator: string,
};

export interface UserLoginArgs {
  phone: string,
  password: string,
  googleIdToken: string
};

export interface UserLoginResult {
  user: User,
  token: AccessToken
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
   * nominates an existing user as a beneficiary
   * only if they're not a donor. If user does not
   * exist, however, a user account is created 
   * with the role 'beneficiary'
   * @param args 
   */
  nominateBeneficiary(args: UserNominateArgs): Promise<User>;
  /**
   * nominates a user as a middleman to the nominating donor.
   * A user account is created for the middleman if does not already exist
   * @param args
   * @params args.nominator ID donor nominating the middleman
   * @params args.phone phone of the middleman being nominated
   * @params args.email email of the middleman being nominated
   */
  nominateMiddleman(args: UserNominateArgs): Promise<User>;
  /**
   * retrieves all the users 
   * nominated by the specified user
   * @param user
   */
  getAllBeneficiariesByUser(user: string): Promise<User[]>;
  /**
   * retrieves all middlemen for the specified user
   * @param user id of the user whose middlemen to retrieve
   */
  getAllMiddlemenByUser(user: string): Promise<User[]>;
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
  initiateDonation(user: string, args: InitiateDonationArgs): Promise<Transaction>;
  /**
   * 
   * @param from 
   * @param to 
   */
  sendDonation(from: string, to: string, args: SendDonationArgs): Promise<Transaction>;
};
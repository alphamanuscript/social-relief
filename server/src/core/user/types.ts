import { Transaction, InitiateDonationArgs, SendDonationArgs } from '../payment';
import { Invitation } from '../invitation';

export type UserRole = 'donor' | 'beneficiary' | 'middleman';

export type NominationRole = 'beneficiary' | 'middleman';

export type UserTransactionsBlockedReason = 'refundPending' | 'maxRefundsExceeded';

export type BeneficiaryStatus = 'pending' | 'verified';

export interface User {
  _id: string,
  phone: string,
  email?: string,
  name: string,
  isAnonymous?: boolean,
  /**
   * indicates whether or not the phone 
   * of the corresponding donor has been verified.
   */
  isPhoneVerified?: boolean,
  /**
   * indicates whether or not the added beneficiary user 
   * has been approved to receive funds from any donor.
   */
  isVetted?: boolean,
  /**
   * indicates whether or not the added beneficiary's claim 
   * has been verified.
   */
  beneficiaryStatus?: BeneficiaryStatus
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
  /**
   * indicates whether the user is blocked from making transactions
   * and why. If it's set and not null, then the user is blocked
   * from making transactions, otherwise the user is not blocked.
   * The transactions that should be blocked include donations, distributions
   * and refunds.
   * This is meant to protect from double-spending (e.g. getting
   * a refund while a distribution of the same fund is in progress)
   */
  transactionsBlockedReason?: UserTransactionsBlockedReason;
  /**
   * number of completed refunds
   */
  numRefunds?: number;
  createdAt: Date,
  updatedAt: Date
};

export interface UserPutArgs {
  name: string,
  email: string,
  password: string,
}

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
  email: string,
  password: string,
  isAnonymous?: boolean,
  googleIdToken?: string
};

export interface UserNominateArgs {
  phone: string,
  name: string,
  email?: string,
  nominatorId: string,
  nominatorName: string,
  role?: NominationRole,
};

export interface UserActivateArgs {
  invitationId: string
}

export interface UserActivateBeneficiaryArgs {
  phone: string,
  name: string,
  email?: string,
  nominatorId: string
}

export interface UserAddVettedBeneficiaryArgs {
  phone: string,
  name: string,
  email?: string
}

export interface UserVerifyBeneficiary {
  _id: string,
}

export interface UserActivateMiddlemanArgs extends UserActivateBeneficiaryArgs {}

export interface UserLoginArgs {
  phone: string,
  password: string,
  googleIdToken: string
};

export interface UserLoginResult {
  user: User,
  token: AccessToken
};

export interface UserInvitationEventData {
  senderName: string,
  recipientName: string,
  recipientPhone: string,
  recipientEmail: string,
  role: string,
  invitationId: string
}

export interface ReplyToInvitationArgs {
  id: string,
  reply: boolean,
}

export interface UserService {
  /**
   * creates a user
   * @param args 
   */
  create(args: UserCreateArgs): Promise<User>;
  /**
   * Creates and returns an invitation 
   * to the nominated person/user
   * @param args 
   */
  nominate(args: UserNominateArgs): Promise<Invitation>;
  /**
   * Activates an account for the invited user referenced by args.invitationId 
   * if they don't already have one. Otherwise, the existing user assumes a new role
   * specified by the corresponding invitation
   * @param args 
   */
  activate(args: UserActivateArgs): Promise<User>;
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
   * retrieves user by id
   * @param id
   */
  getById(id: string): Promise<User>;
  /**
   * retrieves the user who owns the token, provided
   * the token is valid
   * @param token 
   */
  getByToken(token: string): Promise<User>;
  /**
   * updates name, email, password of user account 
   * corresponding to userId
   * @param userId 
   * @param args 
   */
  put(userId: string, args: UserPutArgs): Promise<User>;
  /**
   * retrieves the newly created whose id is userId
   * and whose password has yet to be set
   * @param userId 
   */
  getNew(userId: string): Promise<User>;
  /**
   * retrieves the anonymous user 
   * corresponding to the specified userId
   * @param userId 
   */
  getAnonymous(userId: string): Promise<User>;
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
  /**
   * initiates a refund for the specified user,
   * this will fail if a distribution is in progress
   * the donor will be blocked from participating in distributions
   * until the refund has been fulfilled
   * @param user the donor to refund
   */
  initiateRefund(user: string): Promise<Transaction>;
  /**
   * initiates a donation 
   * from anonymous user args.phone
   * @param args 
   */
  donateAnonymously(args: UserDonateAnonymouslyArgs): Promise<Transaction>;
  /**
   * Adds a new beneficiary user
   * that does not have a donor
   * to nominate them 
   * @param args 
   */
  addVettedBeneficiary(args: UserAddVettedBeneficiaryArgs): Promise<User>;
  /**
   * Upgrades the unvetted beneficiary user
   * whose _id is specified by setting 
   * isVetted to true and beneficiaryStatus
   * to 'pending' for users without the latter
   * field
   * @param _id 
   */
  upgradeUnvettedBeneficiaryById(_id: string): Promise<User>;
  /**
   * Upgrades the unvetted beneficiary user
   * whose phone is specified by setting 
   * isVetted to true and beneficiaryStatus
   * to 'pending' for users without the latter
   * field
   * @param _id 
   */
  upgradeUnvettedBeneficiaryByPhone(phone: string): Promise<User>;
  /**
   * Verifies the vetted beneficiary user
   * whose _id is specified by setting 
   * beneficiaryStatus to 'verified'
   * @param _id 
   */
  verifyVettedBeneficiaryById(_id: string): Promise<User>;
  /**
   * Verifies the vetted beneficiary user
   * whose phone is specified by setting 
   * beneficiaryStatus to 'verified'
   * @param phone 
   */
  verifyVettedBeneficiaryByPhone(phone: string): Promise<User>;
  /**
   * Returns user with the specified phone number
   * @param phone 
   */
  getByPhone(phone: string): Promise<User>;
  /**
   * Returns all users with the role donor
   */
  getAllDonors(): Promise<User[]>;
  /**
   * Sets the isPhoneVerified field in user
   * to true
   */
  verifyUser(user: User): Promise<User>;
  /**
   * Returns all beneficiaries
   */
  getAllBeneficiaries(): Promise<User[]>
};

export interface UserCreateAnonymousArgs {
  name: string,
  phone: string,
  email: string
}


export interface UserDonateAnonymouslyArgs extends UserCreateAnonymousArgs {
  amount: number
}

export interface UserCreatedEventData {
  user: User;
}

export interface UserActivatedEventData extends UserCreatedEventData {}
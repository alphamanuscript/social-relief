export type UserRole = 'donor' | 'beneficiary' | 'middleman';
export type NominationRole = 'beneficiary' | 'middleman';
export type TransactionStatus = 'pending' | 'paymentRequested' | 'failed' | 'success';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';
export type TransactionType = 'donation' | 'distribution' | 'refund';

export interface Token {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  user: string;
}

export interface User {
  _id: string,
  name: string,
  phone: string,
  email: string,
  isAnonymous?: boolean,
  addedBy: string,
  donors: string[],
  roles: UserRole[],
  transactionsBlockedReason?: string,
  createdAt: Date,
  updatedAt: Date
}

export interface UserCreateArgs {
  name: string,
  phone: string,
  password: string,
  email: string,
  googleIdToken: string
}

export interface UserPutArgs {
  name: string,
  email: string,
  password: string
}

export interface UserLoginArgs {
  phone: string,
  password: string,
  googleIdToken: string
}


export interface LoginResult {
  user: User;
  token: Token;
}

export interface UserNominateArgs {
  name: string,
  phone: string,
  email?: string,
  role: NominationRole,
  nominatorId: string,
  nominatorName: string,
}

export interface InitiateDonationArgs {
  amount: Number
}

export interface AnonymousDonateArgs {
  amount: number;
  name: string,
  phone: string,
  email: string
}

export interface Transaction {
  _id: string,
  createdAt: Date,
  updatedAt: Date,
  status: TransactionStatus,
  failureReason?: string,
  expectedAmount: number,
  amount: number,
  from: string,
  to: string,
  type: TransactionType,
  fromExternal: boolean,
  toExternal: boolean,
  provider: string,
  providerTransactionId?: string,
  metadata?: any
}

export interface Invitation {
  _id: string,
  invitor: string,
  inviteeName: string,
  inviteePhone: string,
  inviteeEmail?: string,
  inviteeRole: NominationRole,
  hasAccount: boolean,
  status: InvitationStatus, 
  expiresAt: Date, 
  createdAt: Date,
  updatedAt: Date,
}

export interface Nominator {
  _id: string;
  associatedDonorId: string;
  timestamp: Date;
}
export interface Appointer {
  _id: string;
  associatedDonorId: string;
  timestamp: Date;
}

export interface Beneficiary {
  _id: string;
  phone: string;
  nominatedBy: Nominator[];
  owed: number[];
  receivedThisMonth: number;
}
export interface AppMessage {
  type: string;
  message: string;
}

export interface Invitation {
  _id: string;
  invitorId: string;
  invitorName: string;
  inviteeName: string;
  inviteePhone: string;
  inviteeEmail?: string; 
  inviteeRole: NominationRole; 
  hasAccount: boolean;
  status: InvitationStatus;
  expiresAt: Date; 
  createdAt: Date;
  updatedAt: Date;
};

export interface Stats {
  _id: string,
  numContributors: number,
  totalContributed: number,
  numRecipients: number,
  numBeneficiaries: number, 
  totalDistributed: number,
  updatedAt: Date
}

export interface Testimonial {
  name: string;
  message: string;
  date: Date;
}

export interface FAQ {
  question: string;
  answer: string;
};

export interface PhoneVerificationRecord {
  _id: string,
  phone: string,
  isVerified: boolean,
  createdAt: Date,
  updatedAt: Date,
}

export interface PhoneVerificationArgs {
  id: string, 
  code:  number
}

export interface AppState {
  user?: User;
  anonymousUser?: User;
  anonymousDonationDetails?: AnonymousDonateArgs;
  phoneVerificationRecord?: PhoneVerificationRecord;
  newUser?: User;
  beneficiaries: User[];
  middlemen: User[];
  transactions: Transaction[];
  invitations: Invitation[];
  currentInvitation?: Invitation;
  message: AppMessage;
  phoneVerificationErrorMessage: string,
  // keeps track of payment request that has just been created
  lastPaymentRequest?: Transaction;
  stats?: Stats;
  testimonials: Testimonial[];
  faqs: FAQ[]
}
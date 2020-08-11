export type UserRole = 'donor' | 'beneficiary' | 'middleman';
export type NominationRole = 'beneficiary' | 'middleman';
export type TransactionStatus = 'pending' | 'paymentRequested' | 'failed' | 'success';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';
export type TransactionType = 'donation' | 'distribution';

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
  metadata: any
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

export interface AppState {
  user?: User;
  newUser?: User;
  beneficiaries: User[];
  middlemen: User[];
  transactions: Transaction[];
  invitations: Invitation[];
  currentInvitation?: Invitation;
  message: AppMessage;
  // keeps track of payment request that has just been created
  lastPaymentRequest?: Transaction;
}
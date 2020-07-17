export type UserRole = 'donor' | 'beneficiary' | 'middleman';
export type NominationRoles = 'beneficiary' | 'middleman';
export type TransactionStatus = 'pending' | 'paymentRequested' | 'failed' | 'success';
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
  role: NominationRoles,
  nominator: string
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
  invitor: string; // id of inviting user
  inviteeName: string; // name of invited user
  inviteePhone: string; // phone of invited user
  inviteeEmail?: string; // email of invited user
  inviteeRole: NominationRoles; // role of invited user (i.e. beneficiary | middleman)
  expiresAt: Date; // time at which record will self-delete
  createdAt: Date;
  updatedAt: Date;
};

export interface AppState {
  user?: User;
  beneficiaries: User[];
  middlemen: User[];
  transactions: Transaction[];
  invitations: Invitation[];
  message: AppMessage;
  // keeps track of payment request that has just been created
  lastPaymentRequest?: Transaction;
}
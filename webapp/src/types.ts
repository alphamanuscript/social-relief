export type UserRole = 'donor' | 'beneficiary' | 'middleman';
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
  phone: string,
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

export interface AppState {
  user?: User;
  beneficiaries: User[];
  middlemen: User[];
  transactions: Transaction[];
  message: AppMessage;
}
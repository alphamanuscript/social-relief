
export type TransactionStatus = 'pending' | 'failed' | 'completed';
export type TransactionType = 'donation' | 'distribution';

export interface Transaction {
  _id: string,
  createdAt: Date,
  updatedAt: Date,
  status: TransactionStatus,
  amount: number,
  from: string,
  to: string,
  type: TransactionType,
  fromExternal: boolean,
  toExternal: boolean
};

export interface TransactionCreateArgs {
  amount: number,
  from: string,
  to: string,
  type: TransactionType,
  fromExternal: boolean,
  toExternal: boolean
};

export interface TransactionService {
  create(args: TransactionCreateArgs): Promise<Transaction>;
}
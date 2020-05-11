export interface SystemLockRecord {
  _id: string;
  locked: boolean;
  updatedAt: Date;
}

export interface SystemLock {
  lock(): Promise<void>;
  unlock(): Promise<void>;
  ensureUnlocked(): Promise<void>;
}

export interface SystemLockService {
  distribution(): SystemLock;
}

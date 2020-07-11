export interface SystemLockRecord {
  _id: string;
  locked: boolean;
  lockedWithKey: string;
  updatedAt: Date;
}

export interface SystemLock {
  lock(): Promise<void>;
  unlock(): Promise<void>;
  ensureUnlocked(): Promise<void>;
  getKey(): string;
}

export interface SystemLockService {
  distribution(): SystemLock;
}

export interface SystemLockRecord {
  _id: string;
  locked: boolean;
  enabled: boolean;
  lockedWithKey: string;
  updatedAt: Date;
}

export interface SystemLock {
  lock(): Promise<void>;
  unlock(): Promise<void>;
  ensureUnlocked(): Promise<void>;
  getKey(): string;
  disable(): Promise<void>;
  enable(): Promise<void>;
}

export interface SystemLockService {
  distribution(): SystemLock;
}

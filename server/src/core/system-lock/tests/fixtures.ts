export const systemLocks = [
  {
    _id: 'lock1',
    locked: true,
    enabled: true,
    updatedAt: new Date(),
    lockedWithKey: 'lock1Key'
  },
  {
    _id: 'lock2',
    enabled: true,
    locked: false,
    updatedAt: new Date()
  },
  {
    _id: 'lock3',
    locked: false,
    enabled: false,
    updatedAt: new Date(),
    lockedWithKey: 'lock3Key'
  }
]

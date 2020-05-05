const now = new Date();
const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
const twoWeeksAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
const longTimeAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

export const users = [
  {
    _id: 'donor2',
    roles: ['donor']
  },
  {
    _id: 'donor1',
    roles: ['donor']
  },
  {
    _id: 'donor3',
    roles: ['donor']
  },
  {
    _id: 'donor4',
    roles: ['donor']
  },
  {
    _id: 'beneficiary1',
    roles: ['beneficiary'],
    donors: ['donor1']
  },
  {
    _id: 'beneficiary2',
    roles: ['beneficiary'],
    donors: ['donor2', 'donor3']
  },
  {
    _id: 'beneficiary3',
    roles: ['beneficiary'],
    donors: ['donor1', 'donor2']
  },
  {
    _id: 'beneficiary4',
    roles: ['beneficiary'],
    donors: ['donor3']
  },
  {
    _id: 'beneficiary5',
    roles: ['beneficiary'],
    donors: []
  }
];

export const transactions = [
  {
    to: 'donor4',
    amount: 2500,
    status: 'success',
    updatedAt: longTimeAgo
  },
  {
    to: 'donor1',
    amount: 5000,
    status: 'success',
    updatedAt: longTimeAgo
  },
  {
    from: 'donor1',
    to: 'beneficiary1',
    amount: 1000,
    status: 'success',
    updatedAt: longTimeAgo
  },
  {
    to: 'donor1',
    amount: 4000,
    status: 'failed',
    updatedAt: thirtyDaysAgo
  },
  {
    from: 'donor1',
    to: 'beneficiary1',
    amount: 1000,
    status: 'failed',
    updatedAt: yesterday
  },
  {
    to: 'donor1',
    amount: 1000,
    status: 'pending',
    updatedAt: thirtyDaysAgo
  },
  {
    to: 'donor2',
    amount: 2500,
    status: 'success',
    updatedAt: thirtyDaysAgo
  },
  // pending transactions to donors do not count towards their balance
  {
    to: 'donor3',
    amount: 6000,
    status: 'pending',
    updatedAt: yesterday
  },
  {
    to: 'donor3',
    amount: 4000,
    status: 'success',
    updatedAt: thirtyDaysAgo
  },
  {
    from: 'donor1',
    to: 'beneficiary1',
    amount: 500,
    status: 'success',
    updatedAt: twoWeeksAgo
  },
  {
    from: 'donor2',
    to: 'beneficiary2',
    amount: 600,
    status: 'success',
    updatedAt: twoWeeksAgo
  },
  // pending transactions to beneficiaries count towards their limit
  // and towards the donors balance
  {
    from: 'donor3',
    to: 'beneficiary2',
    amount: 1400,
    status: 'pending',
    updatedAt: yesterday
  },
  {
    from: 'donor3',
    to: 'beneficiary3',
    amount: 1200,
    status: 'success',
    updatedAt: yesterday
  },
  {
    from: 'donor1',
    to: 'beneficiary3',
    amount: 170,
    status: 'success',
    updatedAt: twoWeeksAgo
  }
];

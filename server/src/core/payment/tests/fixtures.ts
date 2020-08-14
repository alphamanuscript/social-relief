export const transactions = [
  {
    _id: 'tx1',
    from: '',
    to: 'u1',
    type: 'donation',
    status: 'success',
    expectedAmount: 1500,
    amount: 1500
  },
  {
    _id: 'tx2',
    from: '',
    to: 'u2',
    type: 'donation',
    status: 'success',
    expectedAmount: 200,
    amount: 200
  },
  {
    _id: 'tx3',
    from: 'u1',
    to: 'u3',
    type: 'distribution',
    status: 'pending',
    expectedAmount: 200,
    amount: 0
  },
  {
    _id: 'tx4',
    from: 'u1',
    to: 'u4',
    type: 'distribution',
    status: 'failed',
    expectedAmount: 500,
    amount: 0
  },
  {
    _id: 'tx5',
    from: '',
    to: 'u1',
    type: 'donation',
    status: 'pending',
    expectedAmount: 2000,
    amount: 0
  },
  {
    _id: 'tx6',
    from: 'u1',
    to: 'u4',
    type: 'distribution',
    status: 'success',
    expectedAmount: 500,
    amount: 500
  },
  {
    _id: 'tx7',
    from: '',
    to: 'u1',
    type: 'donation',
    status: 'success',
    expectedAmount: 2000,
    amount: 2000
  },
  {
    _id: 'tx8',
    from: 'u1',
    to: '',
    type: 'refund',
    status: 'success',
    expectedAmount: 1000,
    amount: 1000
  }
];

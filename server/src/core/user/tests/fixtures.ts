export const users = [
  {
    _id: 'donor1',
    phone: '254700111111',
    roles: ['donor']
  },
  {
    _id: 'donor2',
    phone: '254700222222',
    roles: ['donor']
  },
  {
    _id: 'middleman1',
    phone: '254700333333',
    roles: ['middleman'],
    middlemanFor: ['donor1', 'donor2']
  },
  {
    _id: 'beneficiary1',
    phone: '254700444444',
    roles: ['beneficiary'],
    donors: ['donor2']
  }
];

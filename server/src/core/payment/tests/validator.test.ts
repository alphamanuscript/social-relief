import * as validators from '../validator';
import { testValidationSucceeds, testValidationFails } from '../../test-util';
import { generateId, generateToken } from '../../util'

describe('validatesGetAllByUser', () => {
  it('should not throw error if all test cases are valid', () => {
    testValidationSucceeds(validators.validatesGetAllByUser, [
      generateId(),
    ]);
  });
  it('should throw error for all invalid test cases', () => {
    testValidationFails(validators.validatesGetAllByUser, [
      123832929223627,
      'dksllcjzcsdmqozm123E2OE',
      'jkshvfb,cnsg&"àéà"ç2201393332EECDKRU842823.KSkflkfvvnfrozccDHDCJQvnfvvze32E9ZEZIZRZRZOR391029Egjkvkvdfc ',
    ]);
  });
})

describe('validatesInitiateDonation', () => {
  it('should not throw error if all test cases are valid', () => {
    testValidationSucceeds(validators.validatesInitiateDonation, [
      { userId: generateId(), amount: 100 },
      { userId: generateId(), amount: 500 },
      { userId: generateId(), amount: 2500 },
      { userId: generateId(), amount: 10905 },
      { userId: generateId(), amount: 527350 },
    ]);
  });
  it('should throw error for all invalid test cases', () => {
    testValidationFails(validators.validatesInitiateDonation, [
      { userId: 'fhdgjqjqmqcqmlcq', amount: 100 },
      { userId: '', amount: 100 },
      { userId: 34256, amount: 2000 },
      { userId: {}, amount: 530 },
      { amount: 100 },
      { userId: generateId() },
      { userId: generateId(), amount: 10 },
      { userId: generateId(), amount: '1000' }
    ]);
  });
})

describe('validatesSendDonation', () => {
  it('should not throw error if all test cases are valid', () => {
    testValidationSucceeds(validators.validatesSendDonation, [
      { from: generateId(), to: generateId(), amount: 100 },
      { from: generateId(), to: generateId(), amount: 20 },
      { from: generateId(), to: generateId(), amount: 0 },
      { from: generateId(), to: generateId(), amount: 500 },
      { from: generateId(), to: generateId(), amount: 2000 },
    ]);
  });
  it('should throw error for all invalid test cases', () => {
    testValidationFails(validators.validatesSendDonation, [
      { from: 'fhdgjqjqmqcqmlcq', amount: 100 },
      { from: 'fhdgjqjqmqcqmlcq', to: 'shcbsdnlcced', amount: 850 },
      { from: '', amount: 1000 },
      { from: '', to: '', amount: 425 },
      { from: 34256, amount: 2000 },
      { from: {}, amount: 530 },
      { from: {}, to: {}, amount: 530 },
      { to: {}, amount: 530 },
      { amount: 100 },
      { from: generateId() },
      { from: generateId(), to: generateId() },
      { from: generateId(), amount: 200 },
      { from: generateId(), amount: 10 },
      { from: generateId(), amount: '1000' },
      { from: generateId(), to: generateId(), amount: '1000' },
      { from: generateId(), to: generateId(), amount: 10905 },
      { from: generateId(), to: generateId(), amount: 527350 },
    ]);
  });
})

describe('validatesCheckUserTransactionStatus', () => {
  it('should not throw error if all test cases are valid', () => {
    testValidationSucceeds(validators.validatesCheckUserTransactionStatus, [
      { userId: generateId(), transactionId: generateId() },
      { userId: generateId(), transactionId: generateId() }
    ]);
  });
  it('should throw error for all invalid test cases', () => {
    testValidationFails(validators.validatesCheckUserTransactionStatus, [
      { userId: 'fhdgjqjqmqcqmlcq', transactionId: 'fhdgjqjqmqcqmlcq' },
      { userId: '', transactionId: '' },
      { userId: 34256, transactionId: 2000 },
      { userId: {}, transactionId: {} },
      { },
      { userId: generateId() },
      { transactionId: generateId() }
    ]);
  });
})

describe('validatesHandleProviderNotification', () => {
  it('should not throw error if all test cases are valid', () => {
    testValidationSucceeds(validators.validatesHandleProviderNotification, [
      { transactionId: `ATPid_${generateId()}` }
    ]);
  });
  it('should throw error for all invalid test cases', () => {
    testValidationFails(validators.validatesHandleProviderNotification, [
      { transactionId: 'shvf?K0332EECDKRU842823.KSkflkfvvnE9ZEZIZRZRZOR391029EgjkvkvdfcFMSnd' },
      { transactionId: generateId() },
      { transactionId: 104382 },
      { transactionId: undefined },
      { transactionId: null }
    ]);
  });
})


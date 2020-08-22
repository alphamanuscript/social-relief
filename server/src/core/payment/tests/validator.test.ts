import * as validators from '../validator';
import { testValidationSucceeds, testValidationFails } from '../../test-util';
import { generateId, generateToken } from '../../util'

describe('validatesGetAllByUser', () => {
  it('should not throw error if inputs are valid', () => {
    testValidationSucceeds(validators.validatesGetAllByUser, [
      generateId(),
    ]);
  });
  it('should throw error if inputs are not valid', () => {
    testValidationFails(validators.validatesGetAllByUser, [
      123832929223627,
      'dksllcjzcsdmqozm123E2OE',
      'jkshvfb,cnsg&"àéà"ç2201393332EECDKRU842823.KSkflkfvvnfrozccDHDCJQvnfvvze32E9ZEZIZRZRZOR391029Egjkvkvdfc ',
    ]);
  });
})

describe('validatesInitiateDonation', () => {
  it('should not throw error if inputs are valid', () => {
    testValidationSucceeds(validators.validatesInitiateDonation, [
      { userId: generateId(), amount: 100 },
      { userId: generateId(), amount: 500 },
      { userId: generateId(), amount: 2500 },
      { userId: generateId(), amount: 10905 },
      { userId: generateId(), amount: 527350 },
    ]);
  });
  it('should throw error if inputs are not valid', () => {
    testValidationFails(validators.validatesInitiateDonation, [
      { userId: {}, amount: 100 },
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
  it('should not throw error if inputs are valid', () => {
    testValidationSucceeds(validators.validatesSendDonation, [
      { from: generateId(), to: generateId(), amountArg: { amount: 100 } },
      { from: generateId(), to: generateId(), amountArg: { amount: 20 } },
      { from: generateId(), to: generateId(), amountArg: { amount: 0 } },
      { from: generateId(), to: generateId(), amountArg: { amount: 500 } },
      { from: generateId(), to: generateId(), amountArg: { amount: 2000 } },
    ]);
  });
  it('should throw an error if the argument includes unexpected fields or input is not valid', () => {
    testValidationFails(validators.validatesSendDonation, [
      { from: {}, amountArg: { amount: 100 } },
      { from: true, to: false, amountArg: { amount: 850 } },
      { from: '', amountArg: { amount: 1000 } },
      { from: '', to: '', amountArg: { amount: 425 } },
      { from: 34256, amountArg: { amount: 2000 } },
      { from: {}, amountArg: { amount: 530 } },
      { from: {}, to: {}, amountArg: { amount: 530 } },
      { to: {}, amountArg: 530 },
      { amountArg: { amount: 100 } },
      { from: generateId() },
      { from: generateId(), to: generateId() },
      { from: generateId(), amountArg: { amount: 200, someField1: 'Hey', someField2: 34 } },
      { from: generateId(), amountArg: { amount: 10 } },
      { from: generateId(), amountArg: { amount: '1000' } },
      { from: generateId(), to: generateId(), amountArg: { amount: '1000', someField1: 3492.53 } },
      { from: generateId(), to: generateId(), amountArg: { amount: 10905 } },
      { from: generateId(), to: generateId(), amountArg: { amount: 527350 } },
    ]);
  });
})

describe('validatesCheckUserTransactionStatus', () => {
  it('should not throw error if inputs are valid', () => {
    testValidationSucceeds(validators.validatesCheckUserTransactionStatus, [
      { userId: generateId(), transactionId: generateId() },
      { userId: generateId(), transactionId: generateId() }
    ]);
  });
  it('should throw error if inputs are not valid', () => {
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

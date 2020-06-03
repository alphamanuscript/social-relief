import * as validators from '../validator';
import { testValidationSucceeds, testValidationFails } from '../../test-util';
import { generateId, generateToken } from '../../util'

describe('validatesCreate', () => {
  it('should not throw error if inputs are valid', () => {
    testValidationSucceeds(validators.validatesCreate, [
      { phone: '254729291091', password: 'dsksjjn,' },
      { phone: '254729291091', password: 'dsks12jnDM4' },
      { phone: '254729291091', password: 'dsks12jnDM4SEZLZSS' }
    ]);
  });
  it('should throw error if inputs are not valid', () => {
    testValidationFails(validators.validatesCreate, [
      { phone: '25472929109', password: 'dsksjjn,' },
      { phone: '+254729291091', password: 'dsks12jnDM4' },
      { phone: '254829291091', password: 'dsks12jnDM4SEZLZSS' },
      { phone: '254738103012', password: 'f' },
      { phone: '254738103012', password: 'wiedna102Ldnffrfldm' },
      { phone: '', password: 'wiedna102Ldnffrfldm' },
      { phone: '254738103012', password: '' },
      { password: 'wiedna102Ldnffrfldm' },
      { phone: '254738103012' },
      { phone: '254738103012', password: 1 }
    ]);
  });
});

describe('validatesLogin', () => {
  it('should not throw error if inputs are valid', () => {
    testValidationSucceeds(validators.validatesLogin, [
      { phone: '254729291091', password: 'dsksjjn,' },
      { phone: '254729291091', password: 'dsks12jnDM4' },
      { phone: '254729291091', password: 'dsks12jnDM4SEZLZSS' }
    ]);
  });
  it('should throw error if inputs are not valid', () => {
    testValidationFails(validators.validatesLogin, [
      { phone: '25472929109', password: 'dsksjjn,' },
      { phone: '+254729291091', password: 'dsks12jnDM4' },
      { phone: '254829291091', password: 'dsks12jnDM4SEZLZSS' },
      { phone: '254738103012', password: 'f' },
      { phone: '254738103012', password: 'wiedna102Ldnffrfldm' }
    ]);
  });
});

describe('validatesNominateBeneficiary', () => {
  it('should not throw error if inputs are valid', () => {
    testValidationSucceeds(validators.validatesNominateBeneficiary, [
      { phone: '254729291091', nominator: '254729311023' },
      { phone: '254729311023', nominator: '254729291091' }
    ]);
  });
  it('should throw error if inputs are not valid', () => {
    testValidationFails(validators.validatesNominateBeneficiary, [
      { phone: '25472929109', nominator: '2547293110232' },
      { phone: '+254729291091', nominator: '254729311023' },
      { phone: '254729291091', nominator: '+254729311023' },
      { phone: '254829291091' },
      { nominator: '254729311023' }
    ]);
  });
});

describe('validatesGetAllBeneficiariesByUser', () => {
  it('should not throw error if inputs are valid', () => {
    testValidationSucceeds(validators.validatesGetAllBeneficiariesByUser, [
      generateId(),
    ]);
  });
  it('should throw error if inputs are not valid', () => {
    testValidationFails(validators.validatesGetAllBeneficiariesByUser, [
      'dksllcjzcsdmqozm123E2OE',
      'jkshvfb,cnsg&"àéà"ç22013933392028RI3CKF..V?K0332EECDKRU842823.KSkflkfvvnfrozcc32E9ZEZIZRZRZOR391029Egjkvkvdfc ',
      123832929223627
    ]);
  });
});

describe('validatesGetByToken', () => {
  it('should not throw error if inputs are valid', () => {
    testValidationSucceeds(validators.validatesGetByToken, [
      generateToken(),
    ]);
  });
  it('should throw error if inputs are not valid', () => {
    testValidationFails(validators.validatesGetByToken, [
      undefined,
      'shvf?K0332EECDKRU842823.KSkflkfvvnE9ZEZIZRZRZOR391029EgjkvkvdfcFMSnd',
      5.23426,
      {},
      null,
      generateId()
    ]);
  });
});

describe('validatesLogout', () => {
  it('should not throw error if inputs are valid', () => {
    testValidationSucceeds(validators.validatesLogout, [
      generateToken(),
    ]);
  });
  it('should throw error if inputs are not valid', () => {
    testValidationFails(validators.validatesLogout, [
      null,
      generateId(),
      '32EECDKRU3Edjsls2823.KSkflkfvvnE9ZEZIZRZRZOR391029EgjkvkvdfcFMSnd42029392?Ccncjcdkhhmczdbcdcsjnswc',
      {}
    ]);
  });
});

describe('validatesLogoutAll', () => {
  it('should not throw error if inputs are valid', () => {
    testValidationSucceeds(validators.validatesLogoutAll, [
      generateId(),
    ]);
  });
  it('should throw error if inputs are not valid', () => {
    testValidationFails(validators.validatesLogoutAll, [
      'shvf?K0332EECDKRU842823.KSkflkfvvnE9ZEZIZRZRZOR391029EgjkvkvdfcFMSnd',
      104382,
      undefined,
      null
    ]);
  });
});

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
});
import * as validators from '../validator';
import { testValidationSucceeds, testValidationFails } from './validation-test-helpers'

describe('validatesCreate', () => {
  it('should not throw error if all test cases are valid', () => {
    testValidationSucceeds(validators.validatesCreate, [
      { phone: '254729291091', password: 'dsksjjn,' },
      { phone: '254729291091', password: 'dsks12jnDM4' },
      { phone: '254729291091', password: 'dsks12jnDM4SEZLZSS' }
    ]);
  });
  it('should throw error for all invalid test cases', () => {
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
  it('should not throw error if all test cases are valid', () => {
    testValidationSucceeds(validators.validatesLogin, [
      { phone: '254729291091', password: 'dsksjjn,' },
      { phone: '254729291091', password: 'dsks12jnDM4' },
      { phone: '254729291091', password: 'dsks12jnDM4SEZLZSS' }
    ]);
  });
  it('should throw error for all invalid test cases', () => {
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
  it('should not throw error if all test cases are valid', () => {
    testValidationSucceeds(validators.validatesNominateBeneficiary, [
      { phone: '254729291091', nominator: '254729311023' },
      { phone: '254729311023', nominator: '254729291091' }
    ]);
  });
  it('should throw error for all invalid test cases', () => {
    testValidationFails(validators.validatesNominateBeneficiary, [
      { phone: '25472929109', nominator: '2547293110232' },
      { phone: '+254729291091', nominator: '254729311023' },
      { phone: '254729291091', nominator: '+254729311023' },
      { phone: '254829291091' },
      { nominator: '254729311023' }
    ]);
  });
});
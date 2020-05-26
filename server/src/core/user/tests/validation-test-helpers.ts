import { AppError } from '../..'

export const testValidationSucceeds = (validator: Function, testCases: any[]) => {
  testCases.forEach(testCase => {
    try {
      validator(testCase);
    }
    catch (e) {
      if (e instanceof AppError && e.code === 'validationError') {
        fail(`should not throw validation error for input ${testCase}`);
      }
    }
  })
};

export const testValidationFails = (validator: Function, testCases: any[]) => {
  for (const testCase of testCases) {
    try {
      validator(testCase);
      fail(`should throw validation error for input ${testCase}`);
    }
    catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect(e.code).toBe('validationError');
    }
  }
};
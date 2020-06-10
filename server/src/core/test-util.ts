import { Db, MongoClient } from 'mongodb';
import { AppError, ErrorCode } from './error';

export const TEST_DB_HOST = process.env.DB_URL || 'mongodb://localhost:27017';

/**
 * returns a date based on UTC timezone
 * @param year
 * @param month
 * @param date
 * @param hour
 * @param min
 * @param sec
 */
export function getUtcDate (year: number, month: number, date: number, hour?: number, min?: number, sec?: number) {
  const args = [year, month, date];
  if (hour) args.push(hour);
  if (min) args.push(min);
  if (sec) args.push(sec);
  // @ts-ignore
  return new Date(Date.UTC(...args));
}

/**
 * tests whether the specified function throws an instance of CoreError
 * @param testFn test function to call
 * @param errorCode optional error code to test for
 * @param message optional error message to test for
 */
export function expectAppError (testFn: Function, errorCode?: ErrorCode, message: string = '') {
  try {
    testFn();
    fail('should throw error');
  }
  catch (e) {
    expect(e).toBeInstanceOf(AppError);
    if (typeof errorCode !== 'undefined') {
        expect(e.code).toBe(errorCode);
    }
    if (message) {
        expect(e.message).toMatch(message);
    }
  }
}

/**
 * tests whether the specified async function throws an instance of CoreError
 * @param asyncTestFn async test function to call
 * @param errorCode optional error code to test for
 * @param message optional error message to test for
 */
export async function expectAsyncAppError (asyncTestFn: () => Promise<any>, errorCode?: ErrorCode, message: string = '') {
  try {
    await asyncTestFn();
    fail('should throw error');
  }
  catch (e) {
    expect(e).toBeInstanceOf(AppError);
    if (typeof errorCode !== 'undefined') {
        expect(e.code).toBe(errorCode);
    }
    if (message) {
        expect(e.message).toMatch(message);
    }
  }
}

export async function expectNoAsyncAppError (asyncTestFn: () => Promise<any>) {
  try {
    await asyncTestFn();
  }
  catch (e) {
    if (e instanceof AppError) {
      fail(`should not throw app error`);
    }
  }
}

/**
 * @description tests whether the specified function throws a validation error
 * the test fails if the function does not return a validation error
 * @param validateCallback function to test
 * @param message optional error message to test for
 */
export function testValidationError (validateCallback: Function, message: string = '') {
  expectAppError(validateCallback, 'validationError', message);
}

/**
 * creates a function to test for failed validation cases
 * and a function to test for successful validation cases
 * based on the specified validation function
 * @param fn validation function
 * @return array containing a testError and testSuccess functions
 */
export function createValidationTesters<T>(fn: (...args: any[]) => any) {
  return [
    function testError (...args: any[]) {
      testValidationError(() => fn(...args));
    },
    function testSuccess (...args: any[]) {
      fn(...args);
    }
  ];
}

/**
 * returns a jest mock that returns a promise that resolves
 * with the specified value
 * @param value
 */
export function mockResolve (value: any = undefined): Function {
  return jest.fn().mockReturnValue(Promise.resolve(value));
}

/**
 * returns a jest mock that returns a promise that rejects
 * with the specified error
 * @param value a error message or error object
 */
export function mockReject (error?: string | Error): Function {
  const _error = typeof error === 'string' ? new Error(error) : error;
  return jest.fn().mockImplementation(() => Promise.reject(_error));
}

export const DEFAULT_TEST_DATE = getUtcDate(2010, 10, 10);

export interface DateMocker {
  /**
   * restores the Date constructor that was
   * previously mocked
   */
  restoreDate: () => DateConstructor;
  /**
   * mocks the Date constructor such that calling new Date() will
   * return a fixed date
   */
  mockDate: (fixedDate?: Date) => DateConstructor;
}

/**
 * creates utility functions for mocking and restoring the global
 * Date constructor
 */
export function createDateMocker (): DateMocker {
  const RealDate = global.Date;
  function mockDate (fixedDate?: Date): DateConstructor {
    const MockDate = class extends RealDate {
      // @ts-ignore
      constructor (...args) {
        if (!args.length) {
          return fixedDate || DEFAULT_TEST_DATE;
        }
        // @ts-ignore
        return new RealDate(...args);
      }
    };
    // @ts-ignore
    global.Date = MockDate;
    // @ts-ignore
    return MockDate;
  }

  function restoreDate () {
    global.Date = RealDate;
    return Date;
  }
  return { mockDate, restoreDate };
}

/**
 * creates a function which tests whether the specified validation function `fn`
 * returns true or false (`validState`) given certain inputs
 * @param fn the validation function
 * @return a function that, given an expected valid state to test for
 * (either `true` or `false`),
 * returns another function that tests whether
 * the validation function returns that expected state
 */
export function makeValidityTesterFn(fn: (...args: any[]) => boolean) {
  return (validState: boolean) => (...args: any[]) =>
    expect(fn(...args)).toBe(validState);
}

/**
 * returns an object with helper methods for working with the database in tests
 * @param dbName database name
 * @param defaultColl default collection to use for collection-specific operations
 * @param dbHost database host, defaults to `TEST_DB_HOST`
 */
export function createDbUtils(dbName: string, defaultColl: string, dbHost: string = TEST_DB_HOST) {
  let db: Db;
  let conn: MongoClient;
  return {
    /**
     * sets up a blank test database
     */
    async setupDb() {
      conn = await MongoClient.connect(dbHost, { useUnifiedTopology: true });
      await conn.db(dbName).dropDatabase();
      db = conn.db(dbName);
      return db;
    },

    /**
     * gets the test database
     */
    getDb() {
      return db;
    },

    /**
     * clears and closes the test database
     */
    async tearDown() {
      await db.dropDatabase();
      await conn.close();
    },

    /**
     * drops collection if it exists
     * @param coll collection to drop
     */
    async dropCollection(coll: string = defaultColl) {
      await db.createCollection(coll);
      await db.dropCollection(coll);
    },

    /**
     * gets the specified collection, or the default collection if
     * `coll` is not specified
     * @param coll
     */
    getCollection(coll: string = defaultColl) {
      return db.collection(coll);
    },

    /**
     * empties the collection then loads the specified data into it
     * @param data data to load in collection
     * @param coll collection to reset
     */
    async resetCollectionWith(data: any[] = [], coll: string = defaultColl) {
      await this.dropCollection(coll);
      if (data.length) {
        await db.collection(coll).insertMany(data);
      }
    }
  };
}

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



// export const testValidationSucceeds(validator: Function, inputData: Array<any>[]): boolean => {
//   inputData.map(input => validator(...input))
// };

// export const testValidationSucceeds(([id, args] => validateSomeFunc(id, args), [
//   ['id', { foo: 'bar' }],
//   ['id2', { foo: 'baz', one: 2 }]
//  ]);

// // this test should pass only if the validator fails
// // to validate all the inputs
// testValidationFails(validateUserCreate, [
// 	{ },
// 	{ phone: 'invalidPhone' },
// 	{ phone: {} },
// 	{ phone: '254722123456', password: 'weak' }
// 	// ...
// ]);
// ​
// // this test should pass only if the validator validates all the inputs
// testValidationSucceeds(validateUserCreate, [
// 	{ phone: '254722111222', password: 'this is a strong password' },
// 	// ...
// ])
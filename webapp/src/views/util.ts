/* eslint-disable */
interface ObjToValidate {
  [fieldName: string]: any;
}

interface ValidatesFieldInObj {
  (obj: ObjToValidate): boolean;
}

interface Rule {
  test: ValidatesFieldInObj;
}

export const validateObj = (obj: ObjToValidate, rules: Rule[]): boolean[] => {
  const results: boolean[] = [];
  rules.forEach(rule => {
    results.push(rule.test(obj));
  });
  return results;
};
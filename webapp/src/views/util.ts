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

interface NamedValidationResults {
  [name: string]: boolean;
}

export const validateObj = (obj: ObjToValidate, rules: Rule[]): boolean[] => {
  const results: boolean[] = [];
  rules.forEach(rule => {
    results.push(rule.test(obj));
  });
  return results;
};

export const validateNamedRules = (obj: any, rules: { [name: string]: Rule }): NamedValidationResults => {
  return Object.keys(rules).reduce<NamedValidationResults>((res, name) => {
    const rule = rules[name];
    res[name] = rule.test(obj);
    return res;
  }, {});
};

export const formatWithCommaSeparator = (num: Number): String => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

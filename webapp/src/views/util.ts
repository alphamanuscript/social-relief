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
  return num.toLocaleString();
}

export const validationMessages = {
  name: 'Name is required',
  phone: 'Invalid phone number. Must be 9 digits long and cannot start with 0',
  password: 'Password required',
  confirmedPassword: 'Confirmed password does not match with password',
  email: 'Invalid email',
  amount: 'Insufficient amount. Donations must be at least of the amount 100'
}

export const validationRules = {
  name: { test: (creds: any) => !!creds.name.trim().length },
  phone: { test: (creds: any) => creds.phone[0] !== '0' && /^(?=.*\d)(?=.{9,9}$)/.test(creds.phone) },
  password: { test: (creds: any) => creds.password.length > 0 },
  confirmedPassword: { test: (creds: any) => creds.confirmedPassword === creds.password },
  email: { test: (creds: any) => /\S+@\S+\.\S+/.test(String(creds.email))},
  amount: { test: (creds: any) => creds.amount >= 100 }
}

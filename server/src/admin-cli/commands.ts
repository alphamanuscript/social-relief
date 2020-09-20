import { App } from '../core';
import { prompts } from './prompts';
import { prompt } from 'inquirer';
import { UserAddBeneficiaryArgs } from '../core/user/types';

export async function addBeneficiaryCmd(app: App) {
  try {
    const { name, phone, email } = await prompt(prompts.addBeneficiary);
    let args: UserAddBeneficiaryArgs = { name, phone };
    if (email) {
      args.email = email;
    }
    const res = await app.users.addBeneficiary(args);
    console.log(res);
  }
  catch(e) {
    console.log(e.message);
  }
}

export async function upgradeBeneficiaryCmd(app: App) {
  try {
    const { upgradeBy } = await prompt(prompts.upgradeBeneficiary);
    switch(upgradeBy) {
      case 'Name': 
        const { name } = await prompt(prompts.specifyBeneficiaryName);
        await verifyBeneficiaryByProperty('name', name, app);
        break;
      case 'Phone':
        const { phone } = await prompt(prompts.specifyBeneficiaryPhone); 
        await verifyBeneficiaryByProperty('phone', phone, app);
        break;
    }
  }
  catch(e) {
    console.log(e.message);
  }
}

async function verifyBeneficiaryByProperty(property: string, value: string, app: App) {
  let verifiedBeneficiary;
  try {
    if (property === 'name') {
      verifiedBeneficiary = await app.users.verifyBeneficiaryByName(value);
    }
    else if(property === 'phone') {
      verifiedBeneficiary = await app.users.verifyBeneficiaryByPhone(value);
    }
    console.log(verifiedBeneficiary);
  }
  catch(e) {
    console.log(e.message);
  }
}
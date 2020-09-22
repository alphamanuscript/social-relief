import { App } from '../core';
import { prompts } from './prompts';
import { prompt } from 'inquirer';
import { UserAddVettedBeneficiaryArgs } from '../core/user/types';
import { SPECIFY_VETTED_BENEFICIARY_BY_ID, SPECIFY_VETTED_BENEFICIARY_BY_PHONE } from './command-names';

export async function addVettedBeneficiaryCmd(app: App) {
  try {
    const { name, phone, email } = await prompt(prompts.addVettedBeneficiary);
    let args: UserAddVettedBeneficiaryArgs = { name, phone };
    if (email) {
      args.email = email;
    }
    const res = await app.users.addVettedBeneficiary(args);
    console.log(res);
  }
  catch(e) {
    console.error(e.message);
  }
}

export async function upgradeVettedBeneficiaryCmd(app: App) {
  try {
    const { upgradeBy } = await prompt(prompts.upgradeVettedBeneficiary);
    switch(upgradeBy) {
      case SPECIFY_VETTED_BENEFICIARY_BY_ID: 
        const { name } = await prompt(prompts.specifyVettedBeneficiaryID);
        await verifyVettedBeneficiaryByProperty(SPECIFY_VETTED_BENEFICIARY_BY_ID.toLowerCase(), name, app);
        break;
      case SPECIFY_VETTED_BENEFICIARY_BY_PHONE:
        const { phone } = await prompt(prompts.specifyVettedBeneficiaryPhone); 
        await verifyVettedBeneficiaryByProperty(SPECIFY_VETTED_BENEFICIARY_BY_PHONE.toLowerCase(), phone, app);
        break;
    }
  }
  catch(e) {
    console.error(e.message);
  }
}

async function verifyVettedBeneficiaryByProperty(property: string, value: string, app: App) {
  let verifiedVettedBeneficiary;
  try {
    if (property === SPECIFY_VETTED_BENEFICIARY_BY_ID.toLowerCase()) {
      verifiedVettedBeneficiary = await app.users.verifyVettedBeneficiaryById(`_${value}`);
    }
    else if(property === SPECIFY_VETTED_BENEFICIARY_BY_PHONE.toLowerCase()) {
      verifiedVettedBeneficiary = await app.users.verifyVettedBeneficiaryByPhone(value);
    }
    console.log(verifiedVettedBeneficiary);
  }
  catch(e) {
    console.error(e.message);
  }
}
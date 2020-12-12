import { App } from '../core';
import { User } from '../core/user';
import { prompts } from './prompts';
import { prompt } from 'inquirer';
import { UserAddVettedBeneficiaryArgs } from '../core/user/types';
import { SPECIFY_BENEFICIARY_BY_ID, SPECIFY_BENEFICIARY_BY_PHONE } from './command-names';

export async function addVettedBeneficiaryCmd(app: App) {
  try {
    const { name, phone, email } = await prompt(prompts.addVettedBeneficiary);
    let args: UserAddVettedBeneficiaryArgs = { name, phone };
    if (email) {
      args.email = email;
    }
    await askForConfirmationForAddCmd(args, app);
  }
  catch(e) {
    console.error(e.message);
  }
}

export async function upgradeUnvettedBeneficiaryCmd(app: App) {
  try {
    const { upgradeBy } = await prompt(prompts.upgradeUnvettedBeneficiary);
    let user;
    switch(upgradeBy) {
      case SPECIFY_BENEFICIARY_BY_ID: 
        const { id } = await prompt(prompts.specifyBeneficiaryID);
        user = await app.users.getById(id);
        if (user) {
          console.log(user);
          await askForConfirmationForUpgradeCmd(SPECIFY_BENEFICIARY_BY_ID.toLowerCase(), user, app);
        }
        break;
      case SPECIFY_BENEFICIARY_BY_PHONE:
        const { phone } = await prompt(prompts.specifyBeneficiaryPhone); 
        user = await app.users.getByPhone(phone);
        if (user) {
          console.log(user);
          await askForConfirmationForUpgradeCmd(SPECIFY_BENEFICIARY_BY_PHONE, user, app);
        }
        break;
    }
  }
  catch(e) {
    console.error(e.message);
  }
}

async function askForConfirmationForAddCmd(args: any, app: App) {
  console.log(args);
  prompts.confirmCommand[0].message = `Are you sure you want to add this beneficiary?`;
  const { confirmation } = await prompt(prompts.confirmCommand);
  if (confirmation) {
    const user = await app.users.addVettedBeneficiary(args);
    console.log(user);
  }
  else {
    console.log('Command aborted!');
  }
}

async function askForConfirmationForUpgradeCmd(property: string, user: User, app: App) {
  prompts.confirmCommand[0].message = `Are you sure you want to upgrade ${user.name}?`;
  const { confirmation } = await prompt(prompts.confirmCommand);
  if (confirmation) {
    const value = property === 'id' ? user._id : user.phone;
    await upgradeUnvettedBeneficiaryByProperty(property, value, app);
  }
  else {
    console.log('Command aborted!');
  }
}

async function askForConfirmationForVerifyCmd(property: string, user: User, app: App) {
  prompts.confirmCommand[0].message = `Are you sure you want to upgrade ${user.name}?`;
  const { confirmation } = await prompt(prompts.confirmCommand);
  if (confirmation) {
    const value = property === 'id' ? user._id : user.phone;
    await verifyVettedBeneficiaryByProperty(property, value, app);
  }
  else {
    console.log('Command aborted!');
  }
}

async function upgradeUnvettedBeneficiaryByProperty(property: string, value: string, app: App) {
  let upgradedBeneficiary;
  try {
    upgradedBeneficiary = property === SPECIFY_BENEFICIARY_BY_ID.toLowerCase() ? await app.users.upgradeUnvettedBeneficiaryById(value) : upgradedBeneficiary = await app.users.upgradeUnvettedBeneficiaryByPhone(value);
    console.log(upgradedBeneficiary);
  }
  catch(e) {
    console.error(e.message);
  }
}

export async function verifyVettedBeneficiaryCmd(app: App) {
  try {
    let user;
    const { verifyBy } = await prompt(prompts.verifyVettedBeneficiary);
    switch(verifyBy) {
      case SPECIFY_BENEFICIARY_BY_ID: 
        const { id } = await prompt(prompts.specifyBeneficiaryID);
        user = await app.users.getById(id);
        if (user) {
          console.log(user);
          await askForConfirmationForVerifyCmd(SPECIFY_BENEFICIARY_BY_ID.toLowerCase(), user, app);
        }
        break;
      case SPECIFY_BENEFICIARY_BY_PHONE:
        const { phone } = await prompt(prompts.specifyBeneficiaryPhone); 
        user = await app.users.getByPhone(phone);
        if (user) {
          console.log(user);
          await askForConfirmationForVerifyCmd(SPECIFY_BENEFICIARY_BY_PHONE.toLowerCase(), user, app);
        }
        break;
    }
  }
  catch(e) {
    console.error(e.message);
  }
}

export async function sendBulkMessageCmd(app: App) {
  try {
    const { recipients, message } = await prompt(prompts.sendBulkMessage);
    const preview = await app.bulkMessages.previewMessage(message);
    console.log('Here is a preview of the message that will be sent:');
    console.log(preview);
    prompts.confirmCommand[0].message = `Are you sure you want proceed sending the message?`;
    const { confirmation } = await prompt(prompts.confirmCommand);

    if (!confirmation) {
      console.log('Command aborted!');
      return;
    }

    const parsedRecipients = (<string>recipients).split(',').map(r => r.trim());
    console.log('Sending messages, please wait...');
    const report = await app.bulkMessages.send(parsedRecipients, message);

    console.log('Messages sent');
    console.log(`Total recipients: ${report.numRecipients}`);
    console.log(`Total failed: ${report.numFailed}`);
    if (report.errors.length) {
      
    }

    report.errors.forEach(e => {
      console.log(`Error for recipient '${e.recipientGroup}', user '${e.user}': ${e.message}`);
    });

  }
  catch (e) {
    console.error(e.message);
  }
}

async function verifyVettedBeneficiaryByProperty(property: string, value: string, app: App) {
  let verifiedVettedBeneficiary;
  try {
    verifiedVettedBeneficiary = property === SPECIFY_BENEFICIARY_BY_ID.toLowerCase() ? await app.users.verifyVettedBeneficiaryById(value) : await app.users.verifyVettedBeneficiaryByPhone(value);
    console.log(verifiedVettedBeneficiary);
  }
  catch(e) {
    console.error(e.message);
  }
}
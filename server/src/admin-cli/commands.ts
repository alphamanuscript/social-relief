#!/usr/bin/env node

import { App } from '../core';
import { prompts } from './prompts';
import { prompt } from 'inquirer';
// import * as program from 'commander';



// let app: App;

// program
//   .version('1.0.0')
//   .description('Admin CLI')

// program
//   .command('add')
//   .alias('a')
//   .description('Add new beneficiary')
//   .action(async () => {
//     try {
//       const { addBeneficiary } = prompts;
//       const { name, phone, email } = await prompt(addBeneficiary);
//       if (!app) {
//         app = await startApp();
//       }
//       const res = await app.users.addBeneficiary({
//         name,
//         phone,
//         email
//       });
//       console.log(res);
//     }
//     catch(e) {
//       console.error(e.message);
//       // process.exit(1);
//     }
//   });

// program.parse(process.argv);

export async function addNewBeneficiaryCmd(app: App) {
  try {
    const { name, phone, email } = await prompt(prompts.addBeneficiary);
    const res = await app.users.addBeneficiary({name, phone, email });
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
        const { name } = await prompt(prompts.specifiyBeneficiaryName);
        break;
      case 'Phone':
        const { phone } = await prompt(prompts.specifiyBeneficiaryPhone); 
        break;
    }
  }
  catch(e) {
    console.log(e.message);
  }
}
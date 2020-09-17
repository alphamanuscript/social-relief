#!/usr/bin/env node

import * as program from 'commander';
import { prompt } from 'inquirer';
import { prompts } from './prompts';

program
  .version('1.0.0')
  .description('Beneficiary Management CLI')

program
  .command('add')
  .alias('a')
  .description('Add new beneficiary')
  .action(async () => {
    try {
      const { addBeneficiary } = prompts;
      const { name, phone, email } = await prompt(addBeneficiary);
      console.log('name: ', name);
      console.log('phone: ', phone);
      console.log('email: ', email);
    }
    catch(e) {
      console.error(e.message);
    }
  });

program.parse(process.argv);
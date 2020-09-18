#!usr/bin/env node

import * as program from 'commander';
import { prompt } from 'inquirer';

// Questions
const questions = [
  { 
    type: 'input',
    name: 'firstname',
    message: 'Beneficiary First Name:'
  },
  { 
    type: 'input',
    name: 'lastname',
    message: 'Beneficiary Last Name:'
  },
  { 
    type: 'input',
    name: 'phone',
    message: 'Beneficiary Phone:'
  },
  { 
    type: 'input',
    name: 'email',
    message: 'Beneficiary Email:'
  }
]

program
  .version('1.0.0')
  .description('Beneficiary Management CLI')

program
  .command('add')
  .alias('a')
  .description('Add a beneficiary')
  .action(async () => {
    try {
      const { firstname, lastname, phone, email } = await prompt(questions);
      console.log('firstname: ', firstname);
      console.log('lastname: ', lastname);
      console.log('phone: ', phone);
      console.log('email: ', email);
    }
    catch(e) {
      console.error(e.message);
    }
  });

program
  .command('find <name>')
  .alias('f')
  .description('Find a beneficiary')
  .action((name: string) => {
    try {

    }
    catch(e) {

    }
  });

program.parse(process.argv);
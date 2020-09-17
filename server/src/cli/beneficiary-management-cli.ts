import { App } from '../core';
import { prompt } from 'inquirer';
import { prompts } from './prompts';
import { program } from 'commander';

export async function runBeneficiaryManagementCLI(app: App) {
  async function runloop() {
    // const { selectCommand } = prompts;
    // // Prompt user for a command
    // const { command } = await prompt(selectCommand);
    // console.log('Input command: ', command);
    // switch(command) {
    //   case 'Add new beneficiary':
    //     // TODO
    //     require('./commands')('add');
    //     break;
    //   case 'Upgrade existing beneficiary': 
    //     // TODO 
    //     break;
    //   default: 
    //     // TODO
    // }
    // // while(true) {
      
    // // }
  }

  runloop();
  program.parse(process.argv);
}
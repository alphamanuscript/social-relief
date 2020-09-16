import { App } from '../core';
import { prompt } from 'inquirer';
import { prompts } from './prompts';
import { program } from 'commander';
import * as child_process from 'child_process';

export async function runBeneficiaryManagementCLI(app: App) {
  async function runloop() {
    const { selectCommand } = prompts;
    while(true) {
      // Prompt user for a command
      const { command } = await prompt(selectCommand);
      console.log('Input command: ', command);
      switch(command) {
        case 'Add new beneficiary':
          // TODO
          console.log("process: ", process);
          break;
        case 'Upgrade existing beneficiary': 
          // TODO 
          break;
        default: 
          // TODO
      }
    }
  }

  runloop();
  program.parse(process.argv);
}
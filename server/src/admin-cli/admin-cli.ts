import { App } from '../core';
import { prompt } from 'inquirer';
import { prompts } from './prompts';
// import { program } from 'commander';
import { addNewBeneficiaryCmd, upgradeBeneficiaryCmd } from './commands';

export async function runAdminCLI(app: App) {
  async function cliLoop() {
    while(true) {
      const { selectCommand } = prompts;
      // Prompt user for a command
      const { command } = await prompt(selectCommand);
      switch(command) {
        case 'Add new beneficiary':
          const { name, phone, email } = await prompt(prompts.addBeneficiary);
          const res = await app.users.addBeneficiary({name, phone, email });
          console.log(res);
          break;
        case 'Upgrade existing beneficiary': 
          upgradeBeneficiaryCmd(app);
          break;
      }
    }
  }

  cliLoop();
  // program.parse(process.argv);
}
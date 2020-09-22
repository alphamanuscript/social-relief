import { App } from '../core';
import { prompt } from 'inquirer';
import { prompts } from './prompts';
import { addVettedBeneficiaryCmd, upgradeVettedBeneficiaryCmd } from './commands';
import { ADD_VETTED_BENEFICIARY, UPGRADE_VETTED_BENEFICIARY } from './command-names';

export async function runAdminCLI(app: App) {
  async function cliLoop() {
    while(true) {
      const { selectCommand } = prompts;
      // Prompt user for a command
      const { command } = await prompt(selectCommand);
      switch(command) {
        case ADD_VETTED_BENEFICIARY:
          await addVettedBeneficiaryCmd(app);
          break;
        case UPGRADE_VETTED_BENEFICIARY:
          await upgradeVettedBeneficiaryCmd(app);
          break;
      }
    }
  }

  cliLoop();
}
import { App } from '../core';
import { prompt } from 'inquirer';
import { prompts } from './prompts';
import { addVettedBeneficiaryCmd, sendBulkMessageCmd, upgradeUnvettedBeneficiaryCmd, verifyVettedBeneficiaryCmd } from './commands';
import { ADD_VETTED_BENEFICIARY, SEND_BULK_MESSAGE, UPGRADE_UNVETTED_BENEFICIARY, VERIFY_VETTED_BENEFICIARY } from './command-names';

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
        case UPGRADE_UNVETTED_BENEFICIARY: 
          await upgradeUnvettedBeneficiaryCmd(app);
          break;
        case VERIFY_VETTED_BENEFICIARY:
          await verifyVettedBeneficiaryCmd(app);
          break;
        case SEND_BULK_MESSAGE:
          await sendBulkMessageCmd(app);
          break;
      }
    }
  }

  cliLoop();
}
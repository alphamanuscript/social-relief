#!/usr/bin/env node

import { App } from '../core';
import { prompt, ui } from 'inquirer';
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
          await addBeneficiaryCmd(app);
          break;
        case 'Upgrade existing beneficiary':
          await upgradeBeneficiaryCmd(app);
          break;
        case 'Quit': 
          console.log('Goodbye');
          break;
      }

      if (command === 'Quit') {
        break;
      }
    }
  }

  cliLoop();
}
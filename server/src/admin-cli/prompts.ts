import {
  ADD_VETTED_BENEFICIARY, UPGRADE_VETTED_BENEFICIARY, 
  SPECIFY_VETTED_BENEFICIARY_BY_ID, SPECIFY_VETTED_BENEFICIARY_BY_PHONE
} from './command-names';

export const prompts = {
  selectCommand: [
    {
      type: 'list',
      message: 'Select a command to continue:',
      name: 'command',
      choices: [ADD_VETTED_BENEFICIARY, UPGRADE_VETTED_BENEFICIARY]
    }
  ],
  addVettedBeneficiary: [
    { 
      type: 'input',
      name: 'name',
      message: 'Name:'
    },
    { 
      type: 'input',
      name: 'phone',
      message: 'Phone:'
    },
    { 
      type: 'input',
      name: 'email',
      message: 'Email:'
    }
  ],
  upgradeVettedBeneficiary: [
    {
      type: 'list',
      message: 'Specify vetted beneficiary by:',
      name: 'upgradeBy',
      choices: [SPECIFY_VETTED_BENEFICIARY_BY_ID, SPECIFY_VETTED_BENEFICIARY_BY_PHONE],
    }
  ],
  specifyVettedBeneficiaryID: [
    { 
      type: 'input',
      name: 'name',
      message: 'ID:'
    },
  ],
  specifyVettedBeneficiaryPhone: [
    { 
      type: 'input',
      name: 'phone',
      message: 'Phone:'
    }
  ]
}
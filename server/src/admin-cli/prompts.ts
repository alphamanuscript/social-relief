import {
  ADD_VETTED_BENEFICIARY, UPGRADE_UNVETTED_BENEFICIARY, VERIFY_VETTED_BENEFICIARY, 
  SPECIFY_BENEFICIARY_BY_ID, SPECIFY_BENEFICIARY_BY_PHONE
} from './command-names';

export const prompts = {
  selectCommand: [
    {
      type: 'list',
      message: 'Select a command to continue:',
      name: 'command',
      choices: [ADD_VETTED_BENEFICIARY, UPGRADE_UNVETTED_BENEFICIARY, VERIFY_VETTED_BENEFICIARY]
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
  upgradeUnvettedBeneficiary: [
    {
      type: 'list',
      message: 'Specify unvetted beneficiary by:',
      name: 'upgradeBy',
      choices: [SPECIFY_BENEFICIARY_BY_ID, SPECIFY_BENEFICIARY_BY_PHONE],
    }
  ],
  verifyVettedBeneficiary: [
    {
      type: 'list',
      message: 'Specify vetted beneficiary by:',
      name: 'verifyBy',
      choices: [SPECIFY_BENEFICIARY_BY_ID, SPECIFY_BENEFICIARY_BY_PHONE],
    }
  ],
  specifyBeneficiaryID: [
    { 
      type: 'input',
      name: 'id',
      message: 'ID:'
    },
  ],
  specifyBeneficiaryPhone: [
    { 
      type: 'input',
      name: 'phone',
      message: 'Phone:'
    }
  ],
  confirmCommand: [
    {
      type: 'confirm',
      name: 'confirmation',
      message: ''
    }
  ]
}
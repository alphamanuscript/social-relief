import {
  ADD_VETTED_BENEFICIARY, UPGRADE_UNVETTED_BENEFICIARY, VERIFY_VETTED_BENEFICIARY, SEND_BULK_MESSAGE,
  SPECIFY_BENEFICIARY_BY_ID, SPECIFY_BENEFICIARY_BY_PHONE, SHOW_USER_INFO
} from './command-names';

export const prompts = {
  selectCommand: [
    {
      type: 'list',
      message: 'Select a command to continue:',
      name: 'command',
      choices: [SHOW_USER_INFO, ADD_VETTED_BENEFICIARY, UPGRADE_UNVETTED_BENEFICIARY, VERIFY_VETTED_BENEFICIARY, SEND_BULK_MESSAGE]
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
  sendBulkMessage: [
    {
      type: 'input',
      message: 'Enter recipients, separated by a comma. A recipient can \'donors\', \'beneficiaries\' or a phone number',
      name: 'recipients'
    },
    {
      type: 'input',
      message: 'Enter message to send. You can include placeholders like {firstName}, {donateLink} or {baseUrl}',
      name: 'message'
    }
  ],
  showUserInfo: [
    {
      type: 'input',
      message: 'Enter user\'s id or phone number',
      name: 'identifier'
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
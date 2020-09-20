export const prompts = {
  selectCommand: [
    {
      type: 'list',
      message: 'Select a command to continue:',
      name: 'command',
      choices: ["Add new beneficiary", "Upgrade existing beneficiary"]
    }
  ],
  addBeneficiary: [
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
      message: 'Email:',
      validate: (email: string) => {
        if (email || !email) {
          return true;
        }
      }
    }
  ],
  upgradeBeneficiary: [
    {
      type: 'list',
      message: 'Specify beneficiary by:',
      name: 'upgradeBy',
      choices: ["Name", "Phone"]
    }
  ],
  specifyBeneficiaryName: [
    { 
      type: 'input',
      name: 'name',
      message: 'Name:'
    },
  ],
  specifyBeneficiaryPhone: [
    { 
      type: 'input',
      name: 'phone',
      message: 'Phone:'
    }
  ]
}
export const prompts = {
  selectCommand: [
    {
      type: 'list',
      message: 'Select a command to continue:',
      name: 'command',
      choices: ["Add new beneficiary", "Upgrade existing beneficiary", "Quit"]
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
      message: 'Email:'
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
  specifiyBeneficiaryName: [
    { 
      type: 'input',
      name: 'name',
      message: 'Name:'
    },
  ],
  specifiyBeneficiaryPhone: [
    { 
      type: 'input',
      name: 'phone',
      message: 'Phone:'
    }
  ]
}
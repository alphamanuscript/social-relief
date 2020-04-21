import axios from 'axios';
import { 
  User, 
  Nominator, 
  Appointer, 
  Beneficiary, 
  Middleman
} from '../store/index';

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000';
const generateId = (): string => {
  return Math.floor(Math.random() * 10000).toString();
};

export const AccountService = {
  async login(_id: string) {
    const args = { uid: _id };
    const res = await axios.post<User>(`${API_URL}/login`, args);
    return res.data;
  },
  async donate(accountId: string, amount: number) {
    const res = await axios({
      method: 'POST',
      url: `${API_URL}/donate`,
      data: {
        from : '',
        to: accountId,
        amount,
        type: 'donation',
        timestamp: new Date()
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accountId
      }
    })
    return res.data;
  },
  async updateUser(updatedUser: User) {
    const res = await axios({
      method: 'PUT',
      url: `${API_URL}/users/${updatedUser._id}`,
      data: updatedUser,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': updatedUser._id
      }
    });
    return res.data;
    // const res = await fetch('http://localhost:3000/users', {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': updatedUser._id
    //   },
    //   body: JSON.stringify(updatedUser)
    // });
    
    // return res.json();
  },
  async nominateBeneficiary(nominator: Nominator, beneficiary: string) {
    const res = await axios({
      method: 'POST',
      data: {
        phone: beneficiary,
        nominatedBy: [nominator],
        owed: [0],
        receivedThisMonth: 0
      },
      url: `${API_URL}/beneficiaries`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': nominator._id
      }
    });
    return res.data;
  },
  async getBeneficiaries(accountId: string) {
    const res = await axios({
      method: 'GET',
      url: `${API_URL}/beneficiaries`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accountId
      }
    });
    return res.data;
  },
  async getBeneficiary(beneficiary: string, accountId: string) {
    const res = await axios({
      method: 'GET',
      url: `${API_URL}/beneficiaries/${beneficiary}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accountId
      }
    });
    return res.data;
    // const payload = { phone: beneficiary };
    // const res = await fetch('http://localhost:3000/beneficiaries/query', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': accountId
    //   },
    //   body: JSON.stringify(payload)
    // });
    
    // return res.json();
  },
  async updateBeneficiary(nominator: Nominator, beneficiary: Beneficiary) {
    const args = {
      _id: beneficiary._id,
      phone: beneficiary.phone,
      nominatedBy: [ ...beneficiary.nominatedBy, nominator],
      owed: [ ...beneficiary.owed, 0],
      receivedThisMonth: beneficiary.receivedThisMonth
    };
    const res = await axios({
      method: 'PUT',
      url: `${API_URL}/beneficiaries/${beneficiary._id}`,
      data: args,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': nominator._id
      }
    });
    return res.data;
    // const payload = {
    //   _id: beneficiary._id,
    //   phone: beneficiary.phone,
    //   nominatedBy: [ ...beneficiary.nominatedBy, nominator],
    //   owed: [ ...beneficiary.owed, 0],
    //   receivedThisMonth: beneficiary.receivedThisMonth
    // };

    // const res = await fetch('http://localhost:3000/beneficiaries', {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': nominator._id
    //   },
    //   body: JSON.stringify(payload)
    // });
    
    // return res.json();
  },
  async appointMiddleman(appointer: Appointer, middleman: string) {
    const res = await axios({
      method: 'POST',
      url: `${API_URL}/middlemen`,
      data: { 
        phone: middleman,
        appointedBy: [appointer]
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': appointer._id
      }
    });
    return res.data;
    // const payload = {
    //   phone: middleman,
    //   appointedBy: [appointer]
    // };
    // const res = await fetch('http://localhost:3000/middlemen', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': appointer._id
    //   },
    //   body: JSON.stringify(payload)
    // });
    
    // return res.json();
  },
  async getMiddlemen(accountId: string) {
    // const res = await axios.get<Middleman[]>('http://localhost:3000/middlemen');
    const res = await axios({
      method: 'GET',
      url: `${API_URL}/middlemen`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accountId
      }
    });
    return res.data;
    // const res = await fetch('http://localhost:3000/middlemen', {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': accountId
    //   }
    // });
    
    // return res.json();
  },
  async getMiddleman(middleman: string, accountId: string) {
    const res = await axios({
      method:'GET',
      url: `${API_URL}/middlemen/${middleman}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accountId
      }
    });
    return res.data;
    // const payload = { phone: middleman };
    // const res = await fetch('http://localhost:3000/middlemen/query', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': accountId
    //   },
    //   body: JSON.stringify(payload)
    // });
    
    // return res.json();
  },
  async updateMiddleman(appointer: Appointer, middleman: Middleman) {
    const res = await axios({
      method: 'PUT',
      url: `${API_URL}/middlemen/${middleman.phone}`,
      data: {
        _id: middleman._id,
        phone: middleman.phone,
        appointedBy: [ ...middleman.appointedBy, appointer],
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': appointer._id
      }
    });
    return res.data;
    // const payload = {
    //   _id: middleman._id,
    //   phone: middleman.phone,
    //   appointedBy: [ ...middleman.appointedBy, appointer],
    // };

    // const res = await fetch('http://localhost:3000/middlemen', {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': appointer._id
    //   },
    //   body: JSON.stringify(payload)
    // });
    
    // return res.json();
  },
  async getTransactions(accountId: string) {
    const res = await axios({
      method: 'GET',
      url: `${API_URL}/transactions`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accountId
      }
    });
    return res.data;
  },
  async queryTransactions(donorsId: string, bnfId: string, ) {
    const payload =  {
      pipeline: [
        {
          $match: { to: bnfId }
        },
        {
            $project: { 
              type: 1, 
              amount: 1, 
              from: 1, 
              to: 1, 
              timestamp: 1, 
              month: { "$month":  { $dateFromString: { dateString: "$timestamp" } } } 
            }
        },
        {
            $match: { month: new Date().getMonth() }
        },
        {
            $project: { type: 1, amount: 1, from: 1, to: 1, timestamp: 1 }
        }
      ]
    };
    const res = await fetch('http://localhost:3000/transactons/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': donorsId
      },
      body: JSON.stringify(payload)
    });
    
    return res.json();
  },
  async getInvitations(inviter: string) {
    const res = await axios({
      method: 'GET',
      url: `${API_URL}/invitations`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': inviter
      }
    });
    return res.data;
  },
  async sendInvitation(donor: User, invitee: string) {
    const res = await axios({
      method: 'POST',
      url: `${API_URL}/invitations`,
      data: {
        inviter: donor.phone,
        invitee,
        code: generateId(),
        generatedLink: `${API_URL}/invitations/${generateId()}`,
        timestamp: new Date()
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': donor._id
      }
    });
    return res.data
  },
  async deleteInvitation(donor: User, invtId: string) {
    const res = await axios({
      method: 'DELETE',
      url: `${API_URL}/invitations/${invtId}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': donor._id
      }
    });
    return res.data
  }
};

import { FAQ } from '../types';

export const faqs: FAQ[] = [
  {
    question: 'How does SocialRelief work?',
    answer: 'When a donor donates some money, the money is deposited to a virtual wallet linked to the donor.'
      + ' Everyday an automated process goes through all eligible beneficiaries and transfers funds '
      + 'from the donors\' accounts to the beneficiaries Mobile Money accounts.'
  },
  {
    question: 'Who runs SocialRelief?',
    answer: 'SocialRelief is developed and run by Alpha Manuscript, a small, pre-revenue tech startup based in Nairobi.'
  },
  {
    question: 'Who are the beneficiaries and how are they enrolled to the program?',
    answer: 'We target adults who live in great financial distress and are having difficulty to cope and recover from economic impacts of the Covid-19 Pandemic.' +
      ' Our field officers meet potential beneficiaries in person and interview them as part of the enrolment process.' +
      ' We conduct additional follow-up visits or phone calls to verify the that beneficiaries legitimately need the assistance.' +
      ' Once verified, the beneficiaries are eligible to receive funds through the platform.' +
      ' Currently all our beneficiaries reside in Kibera, but we seek to partner with other organisations in order to expand our reach.'
  },
  {
    question: 'How are donations sent to beneficiaries?',
    answer: 'We have an automated distribution process that runs every day.' +
      ' This process finds all eligible beneficiaries and allocates available funds for each of them, potentially from different donors.' +
      ' It then transfers the funds directly to beneficiaries via M-Pesa transfer.' +
      ' The process ensures that no beneficiary receives more than 2,000Ksh within a 30-day period.' +
      ' It is possible for some beneficiaries not to reach the target 2,000Ksh per month or not to receive any funds at all if there is not enough money to go around'
  },
  {
    question: 'When will I know whether my donation has been used?',
    answer: 'The platform will send you an SMS and email each time your money is sent to a beneficiary.' +
      ' The message will include the amount transferred and the first name of the beneficiary.'
  },
  {
    question: 'Is my entire donation sent to beneficiaries?',
    answer: 'The full amount that is donated by donors is transferred in full to beneficiaries.' +
      ' A transaction fee is added on top of each donation by the payment provider and is paid by the donor.' +
      ' Alpha Manuscript covers the remainder of expenses such as transaction fee when sending money to beneficiaries, ' +
      ' technology fees, paying field officers and other operational expenses.'
  },
  {
    question: 'Why should I trust SocialRelief?',
    answer: 'From the onset of the project, we have aspired to provide a credible, transparent and effective means of distributing donations to those who need it,' +
      ' and to gain the trust of both donors and beneficiaries.' +
      ' These goals inform the design of the platform, our processes for enrolment and follow-up and the way we handle data.' +
      ' Some of the features we have put in place to improve the credibility and transparency of the platform include:' +
      ' A donor will get a notification each time a part of their donation is sent to a beneficiary.' +
      ' If you create an account as a donor, you will be able to see a detailed history of all the transactions made from your account.' +
      ' There is an option to request a refund.'
  },
  {
    question: 'How are testimonials collected?',
    answer: 'After beneficiaries have received funds, we conduct follow-ups to assess the impact of the funds received.' +
      ' During this process, the beneficiaries provide information about their current situation and how they used the funds.' +
      ' We respect beneficiaries\' privacy and only share the information that they allow us to share.' +
      ' We use the response that they give to the following questions as testimonial:' +
      ' "How has the money you received from SocialRelief impacted you?"'
  },
  {
    question: 'How long will the program run?',
    answer: 'We aim to run the program from October to December 2020. We run a pilot program and field tests in the months of August and September.'
  }
];

import { FAQ } from '../types';

export const faqs: FAQ[] = [
  {
    question: 'How does SocialRelief work?',
    answer: 'Test'
  },
  {
    question: 'Who runs SocialRelief?',
    answer: 'test'
  },
  {
    question: 'Who are the beneficiaries and how are they enrolled to the program?',
    answer: 'test'
  },
  {
    question: 'How are donations sent to beneficiaries',
    answer: 'We have an automated distribution process that runs every day.' +
      ' This process finds all eligible beneficiaries and allocates available funds for each of them, potentially from different donors.' +
      ' It then transfers the funds directly to beneficiaries via M-Pesa transfer.' +
      ' The process ensures that no beneficiary receives more than 2,000Ksh within a 30-day period.' +
      ' It is possible for some beneficiaries not to reach the target 2,000Ksh per month or not to receive any funds at all if there is not enough money to go around'
  },
  {
    question: 'When will I know whether my donation has been used',
    answer: 'The platform will send you an SMS and email each time your money is sent to a beneficiary.' +
      'The message will include the amount transferred and the first name of the beneficiary.'
  },
  {
    question: 'Is part of my donation used to fund SocialRelief operations?',
    answer: ''
  },
  {
    question: 'Should I trust SocialRelief?',
    answer: ''
  },
  {
    question: 'How are testimonials collected?',
    answer: ''
  },
  {
    question: 'How long will the program run?',
    answer: ''
  }
];

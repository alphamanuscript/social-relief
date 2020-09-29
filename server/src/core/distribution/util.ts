export function configurePipelineForEligibleBeneficiary(periodLimit: number, periodMilliseconds: number, coll: string = 'transactions', beneficiaryConstraint: string = 'Donor-added beneficiaries'): any {
  return [
    configureFirstMatchStage(beneficiaryConstraint),
    configureLookupStage(coll, periodMilliseconds),
    {
      $replaceRoot: { newRoot: { $mergeObjects: [ { totalReceived: 0 }, { $arrayElemAt: ['$transactions', 0] }, '$$ROOT' ] } }
    },
    {
      $match: { totalReceived: { $lt: periodLimit } }
    },
    configureProjectStage(periodLimit, beneficiaryConstraint)
  ];
}

function configureFirstMatchStage(beneficiaryConstraint: string) {
  if (beneficiaryConstraint === 'Donor-added beneficiaries') {
    return {
      $match: { roles: 'beneficiary', isVetted: { $exists: false }, beneficiaryStatus: { $exists: false } }
    }
  }
  else if (beneficiaryConstraint === 'Vetted and verified beneficiaries') {
    return {
      $match: { roles: 'beneficiary', isVetted: true, beneficiaryStatus: 'verified' }
    }
  }
}

function configureLookupStage(coll: string, periodMilliseconds: number): any {
  return {
    $lookup: {
      from: coll,
      let: { user: '$_id' },
      pipeline: [
        { // filter transactions to this user within the last period
          $match: {
            $expr: {
              $and: [
                { $eq: ['$to', '$$user']},
                // we take a conservative approach and assume that any distribution
                // that has not failed will potentially succeed
                // if it's a pending transaction that eventually fails, then this
                // means that the beneficiary will be entitled to less funds than they're supposed to
                // in that case, then hopefully the status will updated by the time the next distribution runs
                // it's better than giving the beneficiary more money (in case the transaction succeeds)
                // because that's practically irreversible
                { $ne: ['$status', 'failed']},
                { $lt: [{ $subtract: [new Date(), '$updatedAt'] }, periodMilliseconds]}
              ]
            }
          },
        },
        { 
          $group: { 
            _id: null,
            totalReceived: {
              // for pending transactions, amount might be 0, so use expectedAmount
              $sum: { $cond: [{ $eq: ['$status', 'success'] }, '$amount', '$expectedAmount'] }
            } 
          } 
        },
        { $project: { _id: 0 } }
      ],
      as: 'transactions'
    }
  }
}

function configureProjectStage(periodLimit: number, beneficiaryConstraint: string) {
  if (beneficiaryConstraint === 'Donor-added beneficiaries') {
    return {
      $project: { _id: 1, donors: 1, totalReceived: 1, remaining: { $subtract: [periodLimit, '$totalReceived']} }
    }
  }
  else if (beneficiaryConstraint === 'Vetted and verified beneficiaries') {
    return {
      $project: { _id: 1, totalReceived: 1, remaining: { $subtract: [periodLimit, '$totalReceived']} }
    }
  }
}
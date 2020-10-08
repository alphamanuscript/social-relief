export interface Stats {
  _id: string,
  /**
   * total number of donors who have made a donation
   */
  numContributors: number,
  /**
   * total amount donated (refunds are deducted)
   */
  totalContributed: number,
  /**
   * total number of beneficiaries who have received a donation
   */
  numRecipients: number, 
  /**
   * total amount distributed to beneficiaries
   */
  totalDistributed: number,
  /**
   * total number of beneficiaries (whether they have received donations or not)
   */
  numBeneficiaries: number,
  /**
   * when the stats were last updated
   */
  updatedAt: Date
}

export interface StatsService {
  /**
   * retrieves the one stats document 
   * in the database
   */
  get(): Promise<Stats>;
  /**
   * updates the stats document
   */
  update(): Promise<Stats>;
}
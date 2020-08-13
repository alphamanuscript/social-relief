export interface Stats {
  _id: string,
  numContributors: number,
  totalContributed: number,
  numBeneficiaries: number, 
  totalDistributed: number,
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
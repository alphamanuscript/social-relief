import { App } from '../core';

export function runVettedBeneficiaryDistributionWorker(app: App, intervalMilliseconds: number) {
  async function workLoop() {
    console.log(`Starting distribution process for vetted beneficiaries at ${new Date()}...`);
    const result = await app.donationDistributions.distributeDonations(true);
    console.log(`Completed distribution process for vetted beneficiaries at ${new Date()}`);
    console.log(result);
    console.log();
    setTimeout(workLoop, intervalMilliseconds);
  }

  workLoop();
}
import { App } from '../core';

export function runDistributionWorker(app: App, intervalMilliseconds: number) {
  async function workLoop() {
    try { 
      console.log(`Starting distribution process at ${new Date()}...`);
      const result = await app.donationDistributions.distributeDonations();
      console.log(`Completed distribution process at ${new Date()}`);
      console.log(result);
      console.log();
      setTimeout(workLoop, intervalMilliseconds);
    }
    catch(e) {
      console.error(e);
      setTimeout(workLoop, intervalMilliseconds);
    }
  }

  workLoop();
}
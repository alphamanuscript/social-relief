import { App } from '../core';

export function runStatsComputationWorker(app: App, intervalMilliseconds: number) {
  async function workLoop() {
    console.log(`Starting statistics computation process at ${new Date()}...`);
    const result = await app.stats.update();
    console.log(`Completed stats computation process at ${new Date()}`);
    console.log(result);
    console.log();
    setTimeout(workLoop, intervalMilliseconds);
  }

  workLoop();
}
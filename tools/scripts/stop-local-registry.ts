/**
 * This script stops the local registry for e2e testing purposes.
 * It is meant to be called in jest's globalTeardown.
 */

export default () => {
  console.log('Stopping local registry...');
  if (global.stopLocalRegistry) {
    global.stopLocalRegistry();
    console.log('Local registry stopped.');
    return;
  }
  console.error('No local registry to stop.');
};

/**
 * This script starts a local registry for e2e testing purposes.
 * It is meant to be called in jest's globalSetup.
 */
import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry';
import { spawn } from 'child_process';
import { runMany } from 'nx/src/command-line/run-many/run-many';
import { withRunManyOptions } from 'nx/src/command-line/yargs-utils/shared-options';

export default async () => {
  // local registry target to run
  const localRegistryTarget = 'nx-aws-cdk:local-registry';
  // storage folder for the local registry
  const storage = './tmp/local-registry/storage';

  try {
    console.log('Attempting to start local registry...');
    global.stopLocalRegistry = await startLocalRegistry({
      localRegistryTarget,
      storage,
      verbose: false,
    });
    console.log('Local registry started successfully.');

    console.log('Attempting to run publish target using spawn...');

    // Execute the nx run-many command using spawn
    // Use 'pnpm exec' which should resolve to the local nx binary.
    // Nx forwards unknown args like --ver and --tag to the underlying executor.
    await runCommand('npx nx run-many', [
      '--target=publish',
      '--ver=1.0.0',
      '--tag=e2e',
    ]);

    console.log('Publish target command completed.');
  } catch (error) {
    console.error('Error during global setup:', error);
    throw error;
  }
};

// Helper function to run a command using spawn and return a Promise
function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      // Pipe output/error directly to the parent process's streams
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: process.env,
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to start command ${command}: ${error.message}`));
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Command ${command} ${args.join(' ')} failed with exit code ${code}`
          )
        );
      }
    });
  });
}

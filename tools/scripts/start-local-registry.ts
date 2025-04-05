/**
 * This script starts a local registry for e2e testing purposes.
 * It is meant to be called in jest's globalSetup.
 */
import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry';
import { spawn } from 'child_process';

import { writeFile } from 'node:fs';
import path from 'node:path';

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
    // Use 'npx' which should resolve to the local nx binary.
    // Nx forwards unknown args like --ver and --tag to the underlying executor.
    // Separate the command ('npx') from its arguments ('nx', 'run-many', ...)
    await runCommand('npx', [
      // Base command is 'npx'
      'nx', // First argument to npx
      'run-many', // Second argument to npx
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
function runCommand(baseCommand: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    // Log the command and arguments correctly
    console.log(`Executing: ${baseCommand} ${args.join(' ')}`);

    // Spawn the base command with its arguments
    const child = spawn(baseCommand, args, {
      // Pipe output/error directly to the parent process's streams
      stdio: 'inherit',
      // The shell option is less critical now but kept for potential Windows edge cases
      shell: process.platform === 'win32',
      env: process.env,
    });

    child.on('error', (error) => {
      // Provide a more informative error message for ENOENT
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        reject(
          new Error(
            `Command '${baseCommand}' not found. Is it installed and in your PATH? Original error: ${error.message}`
          )
        );
      } else {
        reject(
          new Error(`Failed to start command ${baseCommand}: ${error.message}`)
        );
      }
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            // Log the command and arguments correctly in the error message
            `Command ${baseCommand} ${args.join(
              ' '
            )} failed with exit code ${code}`
          )
        );
      }
    });
  });
}

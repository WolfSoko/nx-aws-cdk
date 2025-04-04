import {
  ExecutorContext,
  Tree,
  addProjectConfiguration,
  getProjects,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import child_process from 'node:child_process';
import { deployExecutor } from './deploy';
import path from 'node:path';

describe('deploy', () => {
  let tree: Tree;
  let executorContext: ExecutorContext;
  let expectedExecOptions: child_process.ExecOptions;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'test-project', {
      root: 'apps/test-project',
    });
    executorContext = {
      nxJsonConfiguration: undefined,
      projectGraph: {} as unknown as ExecutorContext['projectGraph'],
      root: '/virtual',
      cwd: '/virtual',
      projectName: 'test-project',
      isVerbose: false,
      projectsConfigurations: {
        version: -1,
        projects: Object.fromEntries(getProjects(tree)),
      },
    };
    expectedExecOptions = {
      cwd: path.normalize(`/virtual/apps/test-project`),
      maxBuffer: 1024000000,
    };
    jest.clearAllMocks();
  });

  it('should execute cdk deploy', async () => {
    const execSpy = jest.spyOn(child_process, 'exec');

    await deployExecutor({}, executorContext);

    expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
      path.normalize('/virtual/node_modules/.bin/cdk') + ' deploy',
      expectedExecOptions
    );
  });

  describe('stacks', () => {
    it('should translate to argv', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await deployExecutor(
        {
          stacks: '*',
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        path.normalize('/virtual/node_modules/.bin/cdk') + ' deploy *',
        expectedExecOptions
      );
    });
  });

  describe('app', () => {
    it('should translate to --app', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await deployExecutor(
        {
          app: 'cdk.out/apps/test-app',
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        `${path.normalize(
          '/virtual/node_modules/.bin/cdk'
        )} deploy --app "${path.normalize('../../cdk.out/apps/test-app')}"`,
        expectedExecOptions
      );
    });
  });

  describe('hotswapFallback', () => {
    it('should translate to --hotswap-fallback', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await deployExecutor(
        {
          hotswapFallback: true,
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        `${path.normalize(
          '/virtual/node_modules/.bin/cdk'
        )} deploy --hotswap-fallback`,
        expectedExecOptions
      );
    });
  });

  describe('noRollback', () => {
    it('should translate to --no-rollback', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await deployExecutor(
        {
          noRollback: true,
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        `${path.normalize(
          '/virtual/node_modules/.bin/cdk'
        )} deploy --no-rollback`,
        expectedExecOptions
      );
    });
  });

  describe('context', () => {
    it('should translate single value to single --context', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await deployExecutor(
        {
          context: ['first=1'],
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        `${path.normalize(
          '/virtual/node_modules/.bin/cdk'
        )} deploy --context first=1`,
        expectedExecOptions
      );
    });

    it('should translate multiple values to multiple --context', async () => {
      const execSpy = jest.spyOn(child_process, 'exec');

      await deployExecutor(
        {
          context: ['second=2', 'random=value'],
        },
        executorContext
      );

      expect(execSpy).toHaveBeenCalledWith<[string, child_process.ExecOptions]>(
        `${path.normalize(
          '/virtual/node_modules/.bin/cdk'
        )} deploy --context second=2 --context random=value`,
        expectedExecOptions
      );
    });
  });
});

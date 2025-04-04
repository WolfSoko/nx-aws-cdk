import { Tree, readJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { CDK_LIB_VERSION, CDK_VERSION, CONSTRUCTS_VERSION, initGenerator, TSX_VERSION } from './init';

describe('init', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should install dependencies', async () => {
    await initGenerator(tree);

    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.devDependencies['aws-cdk']).toEqual(CDK_VERSION);
    expect(packageJson.devDependencies['aws-cdk-lib']).toEqual(CDK_LIB_VERSION);
    expect(packageJson.devDependencies['constructs']).toEqual(CONSTRUCTS_VERSION);
    expect(packageJson.devDependencies['tsx']).toEqual(TSX_VERSION);
  });
});

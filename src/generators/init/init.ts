import {
  addDependenciesToPackageJson,
  GeneratorCallback,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';

export const CDK_VERSION = '^2.1007.0' as const;
export const CDK_LIB_VERSION = '^2.188.0';

export const CONSTRUCTS_VERSION = '^10.4.0' as const;
export const TSX_VERSION = '^4.19.0' as const;

async function addDependencies(tree: Tree): Promise<GeneratorCallback> {
  return addDependenciesToPackageJson(
    tree,
    {},
    {
      'aws-cdk': CDK_VERSION,
      'aws-cdk-lib': CDK_LIB_VERSION,
      constructs: CONSTRUCTS_VERSION,
      tsx: TSX_VERSION,
    },
    undefined,
    false
  );
}

export async function initGenerator(tree: Tree): Promise<GeneratorCallback> {
  const tasks: GeneratorCallback[] = [];

  tasks.push(await addDependencies(tree));

  return runTasksInSerial(...tasks);
}

export default initGenerator;

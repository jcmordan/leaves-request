import { execSync } from 'child_process';

/**
 * Builds the Podman images for the Leave Request system.
 * Compatible with both Mac and Linux.
 */
function buildImages() {
  const commands = [
    {
      name: 'Backend API',
      command: 'podman build -t leave-management-api ./backend'
    },
    {
      name: 'Frontend Web',
      command: 'podman build -t leave-management-web . -f frontend/Dockerfile --build-arg GRAPHQL_ENDPOINT=http://leave-management-api:5148/graphql/'
    }
  ];

  for (const { name, command } of commands) {
    console.log(`\n--- Building ${name} ---`);
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error building ${name}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n✅ Build completed successfully!');
}

buildImages();

import { execSync } from 'child_process';
import { resolve } from 'path';

/**
 * Starts all services using Podman Quadlets.
 * Intelligent enough to handle Mac (via Podman Machine) and Linux (Native).
 */
function startAll() {
  const isMac = process.platform === 'darwin';
  const workspacePath = resolve(process.cwd());
  const quadletDir = '~/.config/containers/systemd';
  
  console.log(`🚀 Starting production environment from: ${workspacePath}`);

  /**
   * Helper to execute a command on the target system (Host or VM)
   */
  const runOnTarget = (cmd) => {
    const fullCmd = isMac ? `podman machine ssh "${cmd}"` : cmd;
    console.log(`Running: ${fullCmd}`);
    execSync(fullCmd, { stdio: 'inherit' });
  };

  try {
    // 1. Ensure systemd directory exists
    runOnTarget(`mkdir -p ${quadletDir}`);

    // 2. Link Quadlet files to systemd directory
    // Note: We use the absolute path from the host, which is mirrored in the Podman Machine
    runOnTarget(`ln -sf ${workspacePath}/quadlets/* ${quadletDir}/`);

    // 3. Reload systemd generator
    runOnTarget('systemctl --user daemon-reload');

    // 4. Restart the entry point service to force recreation with new config
    runOnTarget('systemctl --user restart leave-management-web.service');

    console.log('\n✅ All services are starting!');
    console.log('You can check status with: podman ps');
  } catch (error) {
    console.error('\n❌ Failed to start services:', error.message);
    process.exit(1);
  }
}

startAll();

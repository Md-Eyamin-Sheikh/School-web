import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backendDir = resolve(appDir, '..', 'SchoolBackend');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = new Set();
let shuttingDown = false;

function prefixStream(label, stream) {
  let buffered = '';

  return (chunk) => {
    buffered += chunk.toString();
    const lines = buffered.split(/\r?\n/);
    buffered = lines.pop() ?? '';

    for (const line of lines) {
      stream.write(line ? `[${label}] ${line}\n` : '\n');
    }
  };
}

function stopAll(signal = 'SIGTERM') {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

function start(label, args, cwd) {
  const child = spawn(npmCommand, args, {
    cwd,
    env: { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR ?? '1' },
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  children.add(child);
  child.stdout.on('data', prefixStream(label, process.stdout));
  child.stderr.on('data', prefixStream(label, process.stderr));

  child.on('exit', (code, signal) => {
    children.delete(child);

    if (!shuttingDown) {
      shuttingDown = true;
      stopAll();
      process.exitCode = code ?? (signal ? 1 : 0);
    }
  });

  child.on('error', (error) => {
    console.error(`[${label}] ${error.message}`);
    if (!shuttingDown) {
      shuttingDown = true;
      stopAll();
      process.exitCode = 1;
    }
  });

  return child;
}

process.on('SIGINT', () => {
  shuttingDown = true;
  stopAll('SIGINT');
});

process.on('SIGTERM', () => {
  shuttingDown = true;
  stopAll('SIGTERM');
});

start('backend', ['run', 'dev'], backendDir);
start('vite', ['run', 'dev:frontend'], appDir);

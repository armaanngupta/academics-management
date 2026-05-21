const { spawn } = require('child_process');

const mode = process.argv[2] || 'dev';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const services = [
  {
    name: 'backend',
    args: ['--prefix', 'backend', 'run', mode === 'dev' ? 'dev' : 'start'],
  },
  {
    name: 'frontend',
    args: ['--prefix', 'frontend', 'start'],
  },
];

const children = [];
let shuttingDown = false;

const prefixOutput = (name, colorCode, stream, target) => {
  let buffer = '';

  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';

    lines.forEach((line) => {
      if (!line.trim()) {
        target.write('\n');
        return;
      }
      target.write(`\x1b[${colorCode}m[${name}]\x1b[0m ${line}\n`);
    });
  });

  stream.on('end', () => {
    if (buffer.trim()) {
      target.write(`\x1b[${colorCode}m[${name}]\x1b[0m ${buffer}\n`);
    }
  });
};

const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  children.forEach((child) => {
    if (!child.killed) {
      child.kill(signal);
    }
  });
};

services.forEach((service, index) => {
  const colorCode = index === 0 ? '36' : '35';
  const child = spawn(npmCommand, service.args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });

  prefixOutput(service.name, colorCode, child.stdout, process.stdout);
  prefixOutput(service.name, colorCode, child.stderr, process.stderr);

  child.on('exit', (code) => {
    if (!shuttingDown && code !== 0) {
      shutdown('SIGTERM');
      process.exitCode = code || 1;
    }
  });

  children.push(child);
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

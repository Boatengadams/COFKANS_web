#!/usr/bin/env node
/**
 * Stop local Firebase emulators + any customer Vite holding the demo ports.
 *
 * Usage: pnpm emulators:stop
 */
import { execSync } from 'node:child_process';

const PORTS = [4000, 4400, 4500, 5001, 8080, 8443, 8455, 9099, 9150];

function pidsOnPort(port) {
  try {
    const out = execSync(`ss -ltnp 'sport = :${port}' 2>/dev/null || true`, {
      encoding: 'utf8',
    });
    const pids = new Set();
    for (const m of out.matchAll(/pid=(\d+)/g)) pids.add(m[1]);
    return [...pids];
  } catch {
    return [];
  }
}

const killed = new Set();
for (const port of PORTS) {
  for (const pid of pidsOnPort(port)) {
    if (killed.has(pid)) continue;
    try {
      process.kill(Number(pid), 'SIGTERM');
      killed.add(pid);
      console.log(`Sent SIGTERM to pid ${pid} (port ${port})`);
    } catch (err) {
      console.warn(`Could not kill pid ${pid}:`, err.message);
    }
  }
}

if (!killed.size) {
  console.log('No emulator/Vite processes found on demo ports.');
} else {
  console.log(`Stopped ${killed.size} process(es). Wait a second, then: pnpm emulators`);
}

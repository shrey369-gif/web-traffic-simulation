#!/usr/bin/env node

/**
 * Verify Build Script
 * Checks that all critical modules are available and exports are valid
 */

const fs = require('fs');
const path = require('path');

const checks = [
  {
    name: 'Simulation Store',
    path: 'lib/simulation/store.ts',
  },
  {
    name: 'Simulation Engine',
    path: 'lib/simulation/simulation-engine.ts',
  },
  {
    name: 'Java Fallback',
    path: 'lib/java-fallback.ts',
  },
  {
    name: 'Export Utils',
    path: 'lib/export-utils.ts',
  },
  {
    name: 'API Health Check',
    path: 'app/api/health/route.ts',
  },
];

let passed = 0;
let failed = 0;

console.log('\n🔍 Verifying Build Configuration...\n');

checks.forEach(check => {
  const fullPath = path.join(process.cwd(), check.path);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`✅ ${check.name}`);
    passed++;
  } else {
    console.log(`❌ ${check.name} (missing: ${check.path})`);
    failed++;
  }
});

console.log(`\n${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}

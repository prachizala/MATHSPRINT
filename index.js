// Universal Cloud Server Entrypoint for Render / Railway / Heroku
const path = require('path');
const fs = require('fs');

const distEntry = path.join(__dirname, 'backend', 'dist', 'index.js');

if (!fs.existsSync(distEntry)) {
  console.log('⚡ [MATHSPRINT] Compiling backend typescript on cloud host...');
  const { execSync } = require('child_process');
  execSync('npm --prefix backend install && npm --prefix backend run build', { stdio: 'inherit' });
}

console.log('🚀 [MATHSPRINT] Booting production backend from:', distEntry);
require(distEntry);

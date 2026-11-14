// Universal Cloud Server Entrypoint for Render / Railway / Heroku
const path = require('path');
const distEntry = path.join(__dirname, 'backend', 'dist', 'index.js');

console.log('🚀 [MATHSPRINT] Booting production backend from:', distEntry);
require(distEntry);

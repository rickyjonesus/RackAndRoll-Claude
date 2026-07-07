const fs = require('fs');
const path = require('path');

// Netlify build env var, e.g. https://your-app.up.railway.app/api
const apiUrl = process.env['API_URL'];
const wsUrl = process.env['WS_URL'] || (apiUrl ? apiUrl.replace(/\/api\/?$/, '') : '');

if (!apiUrl) {
  console.warn('[set-prod-env] API_URL not set — falling back to relative /api (same-origin deploy).');
}

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl || '/api'}',
  wsUrl: '${wsUrl}',
};
`;

fs.writeFileSync(
  path.join(__dirname, '../src/environments/environment.prod.ts'),
  content,
);

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

export const server = http.createServer((req, res) => {
  if (req.url.endsWith('.dat')) {
    const filePath = path.join(import.meta.dirname, req.url);
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(fs.readFileSync(filePath, 'utf8'));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, renderPage } from './pages.mjs';

const project = resolve(fileURLToPath(new URL('../', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm' };

export function createHandler(directory, publicDirectory) {
  const roots = [resolve(directory), ...(publicDirectory ? [resolve(publicDirectory)] : [])];
  return async (request, response) => {
    const missing = () => { response.writeHead(404); response.end('Not found'); };
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch { missing(); return; }
    if (pathname === '/') pathname = '/index.html';
    if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(part => part.startsWith('.'))) { missing(); return; }
    const page = pages.find(page => page.path === pathname.replace(/\/$/, ''));
    if (page && publicDirectory) {
      const html = Buffer.from(renderPage(page));
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': html.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : html);
      return;
    }
    if (page) pathname = page.path + '/index.html';
    let file, info;
    for (const root of roots) {
      const candidate = resolve(root, '.' + pathname);
      if (!candidate.startsWith(root + sep)) continue;
      try {
        const actual = await realpath(candidate);
        if (!actual.startsWith(root + sep)) continue;
        const metadata = await stat(actual);
        if (metadata.isFile()) { file = actual; info = metadata; break; }
      } catch { /* Try the public asset directory. */ }
    }
    if (!file) { missing(); return; }
    const headers = { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff' };
    let start = 0, end = info.size - 1, status = 200;
    if (request.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range);
      let valid = !!match && !!(match[1] || match[2]);
      if (valid) {
        if (match[1]) { start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), end) : end; }
        else { start = Math.max(0, info.size - Number(match[2])); valid = Number(match[2]) > 0; }
        valid = valid && Number.isSafeInteger(start) && Number.isSafeInteger(end) && start <= end && start < info.size;
      }
      if (!valid) { response.writeHead(416, { ...headers, 'Content-Range': `bytes */${info.size}`, 'Content-Length': 0 }); response.end(); return; }
      headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
      headers['Content-Length'] = end - start + 1;
      status = 206;
    }
    response.writeHead(status, headers);
    if (request.method === 'HEAD' || info.size === 0) { response.end(); return; }
    const stream = createReadStream(file, { start, end });
    response.on('close', () => stream.destroy());
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const production = process.argv.includes('--dist');
  const port = Number(process.env.PORT || 5173);
  const server = createServer(production
    ? createHandler(resolve(project, 'dist'))
    : createHandler(resolve(project, 'src'), resolve(project, 'public')));
  server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} is in use. Stop the other preview or set PORT.` : error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => { console.log(`\n  KikiBuddy ${production ? 'build' : 'source'} preview\n\n  Local: http://localhost:${server.address().port}/\n`); });
}

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const publicDir = path.join(__dirname, 'public');
const dataFile = path.join(__dirname, 'data.json');

function readData() { return JSON.parse(fs.readFileSync(dataFile, 'utf8')); }
function saveData(data) { fs.writeFileSync(dataFile, JSON.stringify(data, null, 2)); }
function send(res, status, payload, type = 'application/json') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(type === 'application/json' ? JSON.stringify(payload) : payload);
}
function getBody(req) { return new Promise((resolve, reject) => { let raw=''; req.on('data', chunk => raw += chunk); req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON')); } }); }); }
function hash(password, salt = crypto.randomBytes(16).toString('hex')) { return { salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') }; }
function publicUser(user) { const { passwordHash, salt, ...safe } = user; return safe; }
function scoreComplaint(c) {
  const text = `${c.title} ${c.description}`.toLowerCase();
  const critical = /live wire|sparking|collapsed|fire|gas leak|electroc/.test(text);
  const high = /sewage|overflow|accident|open manhole|flood|danger/.test(text);
  const priority = critical ? 92 : high ? 72 : /pothole|streetlight|garbage/.test(text) ? 52 : 31;
  return { priority, severity: critical ? 'Critical' : high ? 'High' : priority >= 45 ? 'Medium' : 'Low', department: /wire|streetlight|electroc/.test(text) ? 'Electrical' : /garbage|waste|sewage/.test(text) ? 'Solid Waste Management' : /pothole|road|drain/.test(text) ? 'Public Works' : 'Citizen Services', ai: critical ? 'Immediate public safety risk detected from the reported keywords and location context. Escalated for urgent action.' : high ? 'High impact municipal issue with health, sanitation, or safety signals. Priority increased for same-day response.' : 'Routine civic issue. Ranked using issue type, nearby report patterns, and time-pending signals.' };
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === '/api/data' && req.method === 'GET') { const d = readData(); return send(res, 200, { complaints: d.complaints, notifications: d.notifications }); }
    if (url.pathname === '/api/register' && req.method === 'POST') {
      const input = await getBody(req); const d = readData();
      if (!input.name || !input.email || !input.password || !input.zone || !input.role) return send(res, 400, { error: 'Please complete all required fields.' });
      if (d.users.some(u => u.email.toLowerCase() === input.email.toLowerCase() && u.role === input.role)) return send(res, 409, { error: 'An account with this email already exists for this role.' });
      const secured = hash(input.password); const user = { id: Date.now(), name: input.name, mobile: input.mobile || '', email: input.email.toLowerCase(), zone: input.zone, address: input.address || '', designation: input.designation || '', role: input.role, passwordHash: secured.hash, salt: secured.salt };
      d.users.push(user); saveData(d); return send(res, 201, { user: publicUser(user) });
    }
    if (url.pathname === '/api/login' && req.method === 'POST') {
      const input = await getBody(req); const d = readData(); const user = d.users.find(u => u.email === String(input.email || '').toLowerCase() && u.role === input.role);
      if (!user || !input.password) return send(res, 401, { error: 'Email, role, or password is incorrect.' });
      const candidate = hash(input.password, user.salt).hash;
      if (!crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(user.passwordHash, 'hex'))) return send(res, 401, { error: 'Email, role, or password is incorrect.' });
      return send(res, 200, { user: publicUser(user) });
    }
    if (url.pathname === '/api/complaints' && req.method === 'POST') { const input = await getBody(req); const d = readData(); const complaint = { id: `NMC-2026-${1043 + d.complaints.length}`, created: 'Just now', status: 'Received', attachments: input.attachments || [], ...input, ...scoreComplaint(input) }; d.complaints.unshift(complaint); saveData(d); return send(res, 201, { complaint }); }
    if (url.pathname === '/api/sos' && req.method === 'POST') { const input = await getBody(req); const d = readData(); d.notifications.unshift({ id: Date.now(), title: 'SOS received', body: `Emergency alert recorded for ${input.zone}. The control room has been notified.`, date: 'Just now' }); saveData(d); return send(res, 201, { ok: true }); }
    const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1); const target = path.resolve(publicDir, rel);
    if (!target.startsWith(publicDir + path.sep) && target !== path.join(publicDir, 'index.html')) return send(res, 403, { error: 'Forbidden' });
    fs.readFile(target, (err, file) => { if (err) return send(res, 404, 'Not found', 'text/plain'); const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' }; send(res, 200, file, types[path.extname(target)] || 'application/octet-stream'); });
  } catch (error) { send(res, 400, { error: error.message || 'Request failed.' }); }
});
server.listen(process.env.PORT || 4173, () => console.log('Nagar Sathi running at http://localhost:4173'));

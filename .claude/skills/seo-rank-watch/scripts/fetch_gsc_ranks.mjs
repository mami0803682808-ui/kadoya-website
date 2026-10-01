#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function parseArgs(argv) {
  const args = { repo: process.cwd(), days: 28, append: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') args.repo = argv[++i];
    else if (a === '--days') args.days = Number(argv[++i]);
    else if (a === '--append') args.append = true;
    else if (a === '--site') args.site = argv[++i];
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function usage() {
  console.log(`Usage:
  node fetch_gsc_ranks.mjs --repo <REPO_PATH> [--days 7|28] [--append] [--site <GSC_PROPERTY>]

Required environment variables:
  GSC_CLIENT_EMAIL   Service account client email
  GSC_PRIVATE_KEY    Service account private key (\\n escaped is OK)
  GSC_SITE_URL       Search Console property, e.g. sc-domain:komaki-kadoya.com

Notes:
  - The service account must have access to the Search Console property.
  - Secrets are never written to repository files.
`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

async function getAccessToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(privateKey).toString('base64url');
  const assertion = `${unsigned}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });

  if (!res.ok) throw new Error(`OAuth token request failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.access_token;
}

function ymd(date) {
  return date.toISOString().slice(0, 10);
}

function normalizePath(urlOrPath) {
  try {
    return new URL(urlOrPath).pathname.replace(/\/+$/, '') || '/';
  } catch {
    const p = String(urlOrPath || '/').replace(/\/+$/, '');
    return p || '/';
  }
}

function aggregate(rows) {
  const impressions = rows.reduce((s, r) => s + (r.impressions || 0), 0);
  const clicks = rows.reduce((s, r) => s + (r.clicks || 0), 0);
  const weightedPosition = impressions > 0
    ? rows.reduce((s, r) => s + (r.position || 0) * (r.impressions || 0), 0) / impressions
    : null;
  const ctr = impressions > 0 ? clicks / impressions : 0;
  return {
    rank: weightedPosition === null ? null : Number(weightedPosition.toFixed(2)),
    impressions,
    clicks,
    ctr: Number(ctr.toFixed(4))
  };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) return usage();
  if (!Number.isFinite(args.days) || args.days < 1 || args.days > 90) {
    throw new Error('--days must be between 1 and 90');
  }

  const repo = path.resolve(args.repo);
  const watchFile = path.join(repo, 'data/seo/watchwords.json');
  const historyFile = path.join(repo, 'data/seo/rank-history.json');

  if (!fs.existsSync(watchFile)) throw new Error(`Missing ${watchFile}`);
  if (!fs.existsSync(historyFile)) throw new Error(`Missing ${historyFile}`);

  const clientEmail = process.env.GSC_CLIENT_EMAIL;
  const privateKey = (process.env.GSC_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const siteUrl = args.site || process.env.GSC_SITE_URL;
  if (!clientEmail || !privateKey || !siteUrl) {
    throw new Error('Set GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY and GSC_SITE_URL (or pass --site).');
  }

  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1); // GSC daily data can lag; use yesterday as the end date.
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (args.days - 1));

  const token = await getAccessToken(clientEmail, privateKey);
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      startDate: ymd(start),
      endDate: ymd(end),
      dimensions: ['query', 'page'],
      rowLimit: 25000,
      dataState: 'final'
    })
  });

  if (!res.ok) throw new Error(`GSC query failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const rows = data.rows || [];
  const watchwords = readJson(watchFile);

  const results = watchwords.map(w => {
    const keyword = String(w.keyword).trim().toLowerCase();
    const targetPath = normalizePath(w.targetPath);
    const matched = rows.filter(r => {
      const [query, page] = r.keys || [];
      return String(query || '').trim().toLowerCase() === keyword && normalizePath(page) === targetPath;
    });
    return {
      keyword: w.keyword,
      targetPath: w.targetPath,
      ...aggregate(matched)
    };
  });

  const snapshot = {
    measuredAt: new Date().toISOString(),
    source: 'gsc',
    siteUrl,
    days: args.days,
    startDate: ymd(start),
    endDate: ymd(end),
    results
  };

  if (args.append) {
    const history = readJson(historyFile);
    if (!Array.isArray(history)) throw new Error('rank-history.json must be a JSON array');
    history.push(snapshot);
    writeJson(historyFile, history);
    console.log(`Appended GSC snapshot for ${results.length} watchwords to ${historyFile}`);
  } else {
    console.log(JSON.stringify(snapshot, null, 2));
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});

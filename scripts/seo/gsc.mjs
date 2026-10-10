import crypto from 'node:crypto';
export function parsePrivateKey(raw, clientEmail) {
  let value = String(raw || '').trim();
  // Accept the downloaded service-account JSON or its quoted private_key value.
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'string') value = parsed;
    else if (parsed && typeof parsed.private_key === 'string') {
      if (parsed.client_email && parsed.client_email !== clientEmail) {
        throw new Error('GSC credential email mismatch: use the client_email from the same service-account JSON.');
      }
      value = parsed.private_key;
    }
  } catch (err) {
    if (err.message.startsWith('GSC credential email mismatch:')) throw err;
    // A copied JSON property line is also supported by the PEM extraction below.
  }
  value = value.replace(/\\+r\\+n/g, '\n').replace(/\\+n/g, '\n').replace(/\r/g, '\n');
  const match = value.match(/-----BEGIN (RSA PRIVATE KEY|PRIVATE KEY)-----([\s\S]*?)-----END \1-----/);
  if (!match) {
    throw new Error('GSC_PRIVATE_KEY has no complete PEM key. Replace the secret with the complete service-account JSON or private_key value; do not send it in chat.');
  }
  const body = match[2].replace(/\s/g, '');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(body)) {
    throw new Error('GSC_PRIVATE_KEY contains invalid key characters. Replace it from the original service-account JSON.');
  }
  const pem = `-----BEGIN ${match[1]}-----\n${body.match(/.{1,64}/g).join('\n')}\n-----END ${match[1]}-----\n`;
  let key;
  try {
    key = crypto.createPrivateKey(pem);
  } catch {
    throw new Error('GSC_PRIVATE_KEY cannot be decoded after format normalization. The key may be incomplete or damaged; replace it from the original service-account JSON.');
  }
  if (key.asymmetricKeyType !== 'rsa') {
    throw new Error('GSC_PRIVATE_KEY must be an RSA service-account private key.');
  }
  return key;
}


export function metrics(rows) {
  if (!rows.length) return {rank:null, impressions:null, clicks:null, ctr:null, status:'no_data'};
  const impressions = rows.reduce((n,r)=>n+r.impressions,0);
  const clicks = rows.reduce((n,r)=>n+r.clicks,0);
  return {rank:impressions ? rows.reduce((n,r)=>n+r.position*r.impressions,0)/impressions : null,
    impressions, clicks, ctr:impressions ? clicks/impressions : null, status:impressions ? 'measured':'no_data'};
}
export function shift(date, days) {const d=new Date(date+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+days); return d.toISOString().slice(0,10);}
export function pacificDate(now=new Date()) {
  const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const get=t=>p.find(x=>x.type===t).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
export function normalizePath(value) {return new URL(value,'https://komaki-kadoya.com').pathname.replace(/\/+$/,'')||'/';}
export async function connect(env=process.env, request=fetch) {
  let email=env.GSC_CLIENT_EMAIL, raw=env.GSC_SERVICE_ACCOUNT_JSON || env.GSC_PRIVATE_KEY;
  if(env.GSC_SERVICE_ACCOUNT_JSON) {
    let json; try {json=JSON.parse(raw);} catch {throw new Error('GSC_SERVICE_ACCOUNT_JSON is invalid JSON.');}
    if(email && email!==json.client_email) throw new Error('GSC credential email mismatch.');
    email=json.client_email;
  }
  if(!email || !raw) throw new Error('GSC credentials missing. Set GSC_SERVICE_ACCOUNT_JSON or GSC_CLIENT_EMAIL + GSC_PRIVATE_KEY in Actions secrets.');
  const key=parsePrivateKey(raw,email), now=Math.floor(Date.now()/1000);
  const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
  const unsigned=enc({alg:'RS256',typ:'JWT'})+'.'+enc({iss:email,scope:'https://www.googleapis.com/auth/webmasters.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
  const assertion=unsigned+'.'+crypto.sign('RSA-SHA256',Buffer.from(unsigned),key).toString('base64url');
  const auth=await request('https://oauth2.googleapis.com/token',{method:'POST',signal:AbortSignal.timeout(30000),headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})});
  if(!auth.ok) throw new Error(`Google OAuth failed (${auth.status}). Check original service-account credentials; no history was written.`);
  const token=(await auth.json()).access_token;
  if(!token) throw new Error('Google OAuth returned no access token.');
  const site=env.GSC_SITE_URL || 'sc-domain:komaki-kadoya.com';
  const endpoint=`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
  async function query(body) {
    const rows=[];
    for(let startRow=0;;startRow+=25000) {
      let response;
      for(let attempt=0;attempt<3;attempt++) {
        response=await request(endpoint,{method:'POST',signal:AbortSignal.timeout(30000),headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify({type:'web',dataState:'final',aggregationType:'auto',...body,rowLimit:25000,startRow})});
        if(response.ok || ![429,500,502,503,504].includes(response.status)) break;
        await new Promise(resolve=>setTimeout(resolve,500*2**attempt));
      }
      if(!response.ok) throw new Error(`Search Console API failed (${response.status}). Check property access and API enablement; no history was written.`);
      const batch=(await response.json()).rows || [];
      rows.push(...batch);
      if(batch.length<25000) return rows;
    }
  }
  return {site,query};
}
export async function collectPeriod(api,watchwords,startDate,endDate) {
  const dates=await api.query({startDate,endDate,dimensions:['date']});
  const results=[];
  for(const word of watchwords) {
    const queryFilter={dimension:'query',operator:'equals',expression:word.keyword};
    const siteRows=await api.query({startDate,endDate,dimensionFilterGroups:[{filters:[queryFilter]}]});
    const pageRows=await api.query({startDate,endDate,dimensionFilterGroups:[{filters:[queryFilter,{dimension:'page',operator:'equals',expression:new URL(word.targetPath,'https://komaki-kadoya.com').href}]}]});
    results.push({keyword:word.keyword,targetPath:word.targetPath,...metrics(pageRows),siteMetrics:metrics(siteRows)});
  }
  const totals=await api.query({startDate,endDate});
  const pages=await api.query({startDate,endDate,dimensions:['page']});
  const discovery=await api.query({startDate,endDate,dimensions:['query','page']});
  return {startDate,endDate,totals:metrics(totals),availableDates:dates.map(r=>r.keys[0]).sort(),results,
    pages:pages.map(r=>({targetPath:normalizePath(r.keys[0]),...metrics([r])})),
    discovery:discovery.map(r=>({keyword:r.keys[0],targetPath:normalizePath(r.keys[1]),...metrics([r])}))};
}

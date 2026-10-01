# SEO Rank Watch setup

## 1. Google Search Console property

Use the Search Console property for the site. Recommended value for this site:

```text
sc-domain:komaki-kadoya.com
```

## 2. Service account

Create a Google Cloud service account and grant its email access to the Search Console property.

Do not commit credentials to GitHub.

Set these environment variables locally or in the execution environment:

```bash
export GSC_CLIENT_EMAIL='service-account@project.iam.gserviceaccount.com'
export GSC_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n'
export GSC_SITE_URL='sc-domain:komaki-kadoya.com'
```

## 3. Measure rankings

28-day measurement and append to history:

```bash
node .claude/skills/seo-rank-watch/scripts/fetch_gsc_ranks.mjs \
  --repo . --append
```

7-day measurement for reviewing an improvement:

```bash
node .claude/skills/seo-rank-watch/scripts/fetch_gsc_ranks.mjs \
  --repo . --days 7
```

## 4. Data files

- `data/seo/watchwords.json`
- `data/seo/rank-history.json`
- `data/seo/improvement-log.json`

Never rewrite or delete prior records from `rank-history.json`; only append new snapshots.

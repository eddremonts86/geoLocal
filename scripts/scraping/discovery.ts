#!/usr/bin/env tsx
// ─── Source discovery crawler ─────────────────────────────────────────────────
// Runs manually: npx tsx scripts/scraping/discovery.ts [--max N]
//
// For each seed URL: fetch HTML, extract outbound href domains, score them for
// DK real-estate relevance (Danish keywords + schema markers), and insert new
// candidates into scraped_source_candidates for admin review.

import { config } from 'dotenv'
config({ path: '.env.development' })
config()

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { scrapedSourceCandidates } from '../../src/shared/lib/db/schema'
import { fetchHtml } from './helpers/html-extract'

const SEEDS = [
  'https://www.edc.dk/',
  'https://www.edc.dk/bolig/ejerlejlighed/1000-1399-koebenhavn-k/',
  'https://www.boligsiden.dk/sitemap',
  'https://www.boliga.dk/resultat?zipCodes=&propertyType=1',
  'https://homestra.com/list/houses-for-sale/?country=denmark',
  'https://www.dba.dk/bolig/',
  'https://www.danbolig.dk/',
  'https://www.home.dk/',
  'https://www.nybolig.dk/',
  'https://www.estate.dk/',
  'https://www.realmaeglerne.dk/',
]

// Domains we already ingest or that are noise (search engines, social, CDNs)
const IGNORED_DOMAINS = new Set([
  'edc.dk', 'boligsiden.dk', 'boliga.dk', 'homestra.com',
  'airbnb.com', 'airbnb.dk', 'facebook.com', 'linkedin.com',
  'google.com', 'google.dk', 'googletagmanager.com', 'googleapis.com',
  'gstatic.com', 'youtube.com', 'twitter.com', 'x.com', 'instagram.com',
  'apple.com', 'microsoft.com', 'w3.org', 'schema.org', 'cookielaw.org',
  'trustpilot.com', 'addtoany.com', 'sharethis.com', 'disqus.com',
])

const DK_REAL_ESTATE_KEYWORDS = [
  'bolig', 'ejendom', 'udlejning', 'til salg', 'til leje',
  'lejlighed', 'villa', 'hus', 'ejerlejlighed', 'fritidsbolig',
  'makler', 'real estate', 'property', 'apartment',
]

const HREF_RE = /href\s*=\s*["']([^"'#]+)["']/gi

function rootDomain(hostname: string): string {
  const parts = hostname.toLowerCase().split('.')
  if (parts.length <= 2) return parts.join('.')
  // Keep the last 2 parts for gTLDs (foo.dk), last 3 for known ccTLDs
  return parts.slice(-2).join('.')
}

function scoreUrl(href: string, linkText: string): number {
  const s = (href + ' ' + linkText).toLowerCase()
  let score = 0
  for (const kw of DK_REAL_ESTATE_KEYWORDS) {
    if (s.includes(kw)) score++
  }
  // Small boost for .dk TLD
  try {
    if (new URL(href).hostname.endsWith('.dk')) score++
  } catch { /* not a URL */ }
  return score
}

function extractLinks(html: string, baseUrl: string): Array<{ domain: string; href: string; score: number }> {
  const out = new Map<string, { domain: string; href: string; score: number }>()
  for (const m of html.matchAll(HREF_RE)) {
    const href = m[1]
    if (!href) continue
    let abs: string
    try { abs = new URL(href, baseUrl).toString() } catch { continue }
    let domain: string
    try { domain = rootDomain(new URL(abs).hostname) } catch { continue }
    if (!domain || IGNORED_DOMAINS.has(domain)) continue
    // Use link text neighbourhood as context (approximation without DOM parse)
    const score = scoreUrl(abs, '')
    if (score === 0) continue
    const existing = out.get(domain)
    if (!existing || score > existing.score) out.set(domain, { domain, href: abs, score })
  }
  return Array.from(out.values())
}

async function run() {
  const args = process.argv.slice(2)
  const maxArg = args.find((a) => a.startsWith('--max'))
  const maxCandidates = maxArg
    ? parseInt(maxArg.includes('=') ? maxArg.split('=')[1]! : args[args.indexOf('--max') + 1]!, 10)
    : 50

  const connectionString =
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5434/geo_dashboard'
  const client = postgres(connectionString, { prepare: false })
  const db = drizzle(client)

  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║         GeoLocal — Source Discovery                      ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log(`  Seeds          : ${SEEDS.length}`)
  console.log(`  Max candidates : ${maxCandidates}`)
  console.log()

  const all = new Map<string, { domain: string; href: string; score: number; from: string }>()
  for (const seed of SEEDS) {
    console.log(`▶ Crawling ${seed}...`)
    try {
      const html = await fetchHtml(seed)
      const links = extractLinks(html, seed)
      for (const l of links) {
        const existing = all.get(l.domain)
        if (!existing || l.score > existing.score) {
          all.set(l.domain, { ...l, from: seed })
        }
      }
      console.log(`  found ${links.length} scored links`)
    } catch (err) {
      console.error(`  ✗ ${err instanceof Error ? err.message : err}`)
    }
    await new Promise((r) => setTimeout(r, 1500))
  }

  const ranked = Array.from(all.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCandidates)

  console.log(`\n▶ Persisting ${ranked.length} candidates...`)
  let added = 0
  let skipped = 0
  for (const cand of ranked) {
    try {
      const [existing] = await db
        .select({ id: scrapedSourceCandidates.id })
        .from(scrapedSourceCandidates)
        .where(eq(scrapedSourceCandidates.domain, cand.domain))
        .limit(1)
      if (existing) {
        skipped++
        continue
      }
      await db.insert(scrapedSourceCandidates).values({
        domain: cand.domain,
        discoveredFrom: cand.from,
        status: 'pending',
        notes: `score=${cand.score}; first-seen-url=${cand.href.slice(0, 300)}`,
      })
      added++
    } catch (err) {
      console.error(`  ✗ ${cand.domain}: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log(`\n✓ Discovery complete. Added ${added}, skipped ${skipped} (already known).`)
  console.log('  Review at: /admin/scraping/sources')
  await client.end()
  process.exit(0)
}

run()

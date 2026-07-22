import { describe, expect, it } from 'vitest'
import { parseEdcDetailHtml } from '../../scripts/scraping/scrapers/edc'

describe('EDC detail parser', () => {
  it('falls back to server-rendered microdata when JSON-LD is absent', () => {
    const html = `
      <title>Toldbodgade 10A, 1., København K - Ejerlejlighed til salg</title>
      <meta name="description" content="Active apartment for sale">
      <meta property="og:image" content="https://img.example/house.jpg">
      <span itemProp="streetAddress">Toldbodgade 10A, 1.</span>
      <span itemProp="postalCode">1253</span><span itemProp="addressLocality">København K</span>
      <div itemProp="price" content="15.750.000 kr."></div>
      <script type="application/json">{"caseNumber":"11304443","livingArea":{"value":184},"latitude":55.68,"longitude":12.59}</script>
    `
    const item = parseEdcDetailHtml(html, 'https://www.edc.dk/alle-boliger/x/11304443/')
    expect(item).toMatchObject({
      sourceId: '11304443',
      title: 'Toldbodgade 10A, 1., København K',
      price: 15_750_000,
      currency: 'DKK',
      city: 'København K',
      areaSqm: 184,
      latitude: 55.68,
      longitude: 12.59,
      imageUrls: ['https://img.example/house.jpg'],
    })
  })
})

# PagePulse

PagePulse is a production-grade URL auditing service built for the Digital Heroes Training Task.

## Tech Stack

- Shopify
- Liquid
- Vue.js
- HTML
- CSS
- Node.js
- Express

## Features

- URL validation
- Request timeouts
- Concurrency limiting
- Configurable caching
- Per-client rate limiting
- Structured logging
- Request IDs
- Structured error responses
- SSRF protection
- Automated tests
- GitHub Actions CI

## API

### Health Check

GET /health

### Audit URL

POST /api/v1/audits

Request:

```json
{
  "url": "https://example.com"
}

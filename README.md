# PagePulse

A production-grade URL auditing service built using Shopify,
Liquid, Vue.js, HTML/CSS and Node.js.

## Live Demo

Storefront: YOUR LIVE SHOPIFY URL

API health endpoint: YOUR BACKEND /health

## Features

- URL auditing
- URL validation
- Request timeout
- SSRF protection
- Concurrency limiting
- Configurable caching
- Request coalescing
- Per-client rate limiting
- Structured errors
- Structured logging
- Request IDs
- Automated testing
- GitHub Actions CI

## Architecture

Shopify + Liquid + Vue
        |
        v
PagePulse API
        |
        v
Target website

## API

POST /api/v1/audits

### Request

{
  "url": "https://example.com"
}

### Successful response

{
  "ok": true,
  "requestId": "...",
  "cached": false,
  "data": {}
}

## Configuration

CACHE_TTL_SECONDS=300
REQUEST_TIMEOUT_MS=5000
MAX_CONCURRENT_AUDITS=10
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=20

## Testing

npm test

## Security

The API validates URL protocols and blocks private/internal
network destinations to reduce SSRF risk.

## CI

GitHub Actions runs the automated test suite on every push
and pull request.

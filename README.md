# Chef Claudinei

Brazilian BBQ Catering one-page website.

## Live Site

**[https://chefclaudinei.com](https://chefclaudinei.com)**

## About

A single-page website for Chef Claudinei's Brazilian churrasco and catering
services, based in Freeport and serving Long Island and New York City. Built with
pure HTML, CSS, and vanilla JavaScript - no frameworks or dependencies.

## Structure

```
index.html          # Everything: markup, inline <style>, inline <script>
assets/
  fonts/            # Self-hosted woff2 subsets
  img/              # Photos, plus -600/-1000 webp and tile/ variants
  video/            # Event highlight video
```

## Development

No build step, no dependencies. Serve the folder over HTTP:

```bash
python3 -m http.server 8788
# then open http://localhost:8788/index.html
```

Serve it rather than opening the file directly: under `file://` the origin is
`null`, so the self-hosted fonts fail their CORS check and the console fills
with errors that do not happen in production.

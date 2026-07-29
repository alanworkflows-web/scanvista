# Security Policy

## Supported Versions

Currently, only the latest `main` branch deployed to production is actively supported with security updates. 

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| v0.x.x  | :x:                |

## Reporting a Vulnerability

Security is a top priority for ScanVista. If you discover a vulnerability, please report it to our security team.

**Do not file a public issue.**

Instead, please email **security@scanvista.com**. 
You will receive an acknowledgment within 24 hours, and we aim to provide a timeline for a fix within 48 hours.

## Implemented Hardening
The application runs with the following security features enabled in production:
- Strict Content-Security-Policy (CSP) blocking inline scripts and unauthorized domains.
- Full HTTP strict transport security (HSTS) with subdomains preloaded.
- Zod-based request validation eliminating mass-assignment and prototype pollution.
- Safe structured logging that automatically strips PII and secrets before stdout.
- Comprehensive rate limiting protecting Auth, API, and Webhook routes.
- Anti-spoofing proxy configuration (`trust proxy 1`).
- Helmet-powered anti-clickjacking (`frame-ancestors 'none'`) and MIME-sniffing protections.

## Known Architecture Decisions
- **File Uploads**: Server-side file uploads are not currently implemented. All image URLs must use absolute HTTPS links pointing to verified external providers.
- **RSC CSRF Bypass (`react-router-dom` >=7.12.0)**: Node modules flagged this vulnerability. However, ScanVista uses Vite as a purely client-side SPA (CSR). We do not use React Server Components (RSC) or Remix server actions, so this vulnerability is functionally unexploitable in our context. A downgrade was deferred to prevent breaking changes.

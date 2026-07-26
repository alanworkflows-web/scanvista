# Security Debt Register

**Purpose:** Track accepted security risks to ensure they are remediated in future releases, preventing "temporary" exceptions from becoming permanent architectural flaws.

| ID | Risk | Severity | Target Version | Owner | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-001** | Content-Security-Policy (CSP) globally disabled in Helmet config. | High | v1.1 | Security Team | OPEN | Accepted for Pilot to preserve velocity with React/Vite inline scripts. Must implement strict hash/nonce-based CSP before public launch. |

# Security Policy

We take security seriously. Please follow this policy to report vulnerabilities responsibly.

## Supported Versions
Security fixes are applied to the `main` branch. If you are running a fork or modified version, backport patches manually.

## Reporting a Vulnerability
1. DO NOT create a public GitHub issue for an unpatched vulnerability.
2. Email: security@impactid.xyz with subject: `SECURITY REPORT`.
3. Include:
   - Affected components / endpoints
   - Steps to reproduce
   - Impact assessment (confidentiality/integrity/availability)
   - Proof-of-concept exploit (if applicable)
4. Encrypt communications if sensitive (PGP key forthcoming).

## Response Process
- Acknowledge receipt within 3 business days.
- Triage & validate severity (CVSS style reasoning optional).
- Prepare and test a patch privately.
- Release patch and disclose after fix is available.

## Scope
In-scope:
- Backend API (authentication, authorization, data exposure)
- Websocket real-time channel security
- Frontend leaking secrets or bypassing auth

Out-of-scope examples:
- Social engineering
- Denial-of-service requiring unrealistic resource levels
- Automated scanner false positives without proof-of-impact

## Safe Harbor
We will not pursue legal action for good-faith research adhering to this policy and not exfiltrating excessive data.

## Best Practices (Users / Deployers)
- Rotate JWT secrets periodically.
- Enforce HTTPS (HSTS) in production.
- Run database with restricted network access.
- Monitor logs for anomalous auth events.

Thank you for helping keep Impact ID secure.

# Security Engineering Standards

## 1. Zero Trust Architecture
- Never trust client-side data, headers, or parameters.
- Verify authentication and authorization on every single sensitive route and mutation.
- Principle of Least Privilege: Services and database roles must possess only the bare minimum permissions needed to operate.

## 2. Secrets Management & Environment Isolation
- Never commit secrets, credentials, API keys, private keys, or `.env` files into source control.
- Enforce `.gitignore` hygiene and use secret-scanning pre-commit hooks.
- In production, load secrets exclusively from secure secret managers (AWS Secrets Manager, Vault, Doppler, GCP Secret Manager).
- Separate staging, development, and production credentials strictly.

## 3. Defense Against Common Web Vulnerabilities
- **Injection Attacks**: Parameterize all database queries. Avoid dynamic string interpolation in shell commands, SQL, or template engines.
- **Cross-Site Scripting (XSS)**: Rely on framework escaping (e.g. React/Vue JSX auto-escaping). Disallow unescaped HTML injection (`dangerouslySetInnerHTML`). Set a strict Content Security Policy (CSP).
- **Cross-Site Request Forgery (CSRF)**: Use `SameSite=Lax` or `Strict` cookies and CSRF tokens for state-modifying requests.
- **Rate Limiting & DDoS Prevention**: Implement rate limiting per IP or authenticated user key to prevent brute-force and resource starvation.
- **Secure File Uploads**: Validate file magic bytes (not just file extension or MIME type), restrict allowed sizes, sanitize file names, and store uploads in isolated object storage (S3/GCS) with private ACLs.


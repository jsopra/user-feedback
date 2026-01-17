# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please send an email to the project maintainers at:

- **Email:** [security@example.com](mailto:security@example.com)

Please include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the manifestation of the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

We will respond to your report within 48 hours and aim to resolve critical issues within 7 days.

## Security Best Practices for Deployment

### 1. **Change Default Credentials**

⚠️ **CRITICAL:** The default admin user setup has been disabled for security. You must:

- Create the first admin user manually via the application interface after installation
- OR set up a secure password hash via environment variables
- Never use predictable passwords in production

### 2. **Environment Variables**

Ensure all sensitive credentials are stored securely:

```bash
# Required variables
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Keep this secret!

# Never commit .env files to version control
```

### 3. **Database Security**

- Use SSL/TLS connections to your database
- Implement Row Level Security (RLS) in Supabase
- Regularly rotate database credentials
- Keep database backups encrypted

### 4. **API Security**

- Implement rate limiting on public endpoints
- Use CORS headers appropriately
- Validate all user inputs
- Implement request size limits

### 5. **Docker Security**

- Keep base images updated (we use Node.js 22 LTS Alpine)
- Don't run containers as root
- Scan images for vulnerabilities regularly
- Use multi-stage builds (already implemented)

### 6. **Dependency Security**

We actively monitor and update dependencies:

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update
```

### 7. **Production Checklist**

Before deploying to production:

- [ ] Change all default credentials
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Implement backup strategy
- [ ] Configure rate limiting
- [ ] Review and restrict CORS policies
- [ ] Enable security headers (CSP, HSTS, etc.)
- [ ] Remove debug logging
- [ ] Implement session timeout policies

## Security Headers

Add these headers to your reverse proxy (nginx/Apache) or Next.js middleware:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Session Security

- Sessions expire after 24 hours
- Implement logout functionality
- Clear sessions on password change
- Use secure, httpOnly cookies when possible

## Data Privacy

This system processes user feedback data. Ensure compliance with:

- GDPR (Europe)
- LGPD (Brazil)
- CCPA (California)
- Other relevant data protection regulations

### GDPR Compliance Checklist

- [ ] Implement data export functionality
- [ ] Implement data deletion (right to be forgotten)
- [ ] Add privacy policy
- [ ] Obtain user consent for data collection
- [ ] Implement data minimization
- [ ] Encrypt sensitive data at rest

## Known Security Considerations

1. **bcrypt Salt Rounds:** We use 12 rounds for password hashing (secure default)
2. **Session Tokens:** Random generated tokens with 24-hour expiration
3. **API Keys:** Project-specific keys for survey embedding
4. **CORS:** Configure appropriately for your domains

## Security Updates

We follow these practices:

- Monthly dependency audits
- Immediate patches for critical vulnerabilities
- Security-focused code reviews
- Regular penetration testing (recommended)

## Contact

For security concerns, please contact:
- GitHub: [Open a security advisory](https://github.com/jsopra/user-feedback/security/advisories/new)
- Email: security@example.com

## Acknowledgments

We appreciate responsible disclosure of security vulnerabilities and will acknowledge researchers who report issues following our guidelines.

# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the SDC website, **please do not open a public issue.**

Instead, please report it privately by emailing: **needtochangelibur@gmail.com**

Include:
- A description of the vulnerability
- Steps to reproduce
- The potential impact

We will respond as quickly as possible and work with you to resolve the issue before any public disclosure.

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (main branch) | ✅ |

## Security Measures

- All sensitive credentials are stored as environment variables, never in source code
- Database access is protected by Supabase Row Level Security (RLS) policies
- Authentication is handled by Supabase Auth with email verification
- Ticket operations require active authenticated sessions and are validated server-side

## Responsible Disclosure

We kindly ask that you:
- Give us reasonable time to address the issue before public disclosure
- Avoid accessing or modifying other users' data
- Act in good faith to avoid disruption to the platform

Thank you for helping keep SDC safe! 🙏

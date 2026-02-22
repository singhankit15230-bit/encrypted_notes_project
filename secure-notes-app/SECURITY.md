# Security Architecture

## Overview
This document describes the security measures implemented in the Secure Notes application.

## Authentication System

### JWT (JSON Web Tokens)
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Token Expiry**: 7 days (configurable)
- **Storage**: Client-side localStorage
- **Transmission**: Authorization header with Bearer scheme

### Password Security
- **Hashing Algorithm**: bcrypt
- **Salt Rounds**: 10
- **Password Requirements**: Minimum 6 characters
- **Storage**: Only hashed passwords stored in database

## File Encryption

### Encryption Algorithm
- **Algorithm**: AES-256-CBC (Advanced Encryption Standard)
- **Key Size**: 256 bits (32 bytes)
- **Block Size**: 128 bits (16 bytes)
- **Mode**: Cipher Block Chaining (CBC)

### Encryption Process

```
1. User uploads file
   ↓
2. Multer saves temporary file
   ↓
3. Generate random IV (16 bytes)
   ↓
4. Create cipher with AES-256-CBC
   ↓
5. Encrypt file buffer
   ↓
6. Save encrypted file
   ↓
7. Store IV in database
   ↓
8. Delete original file
```

### Decryption Process

```
1. User requests file download
   ↓
2. Verify user authorization
   ↓
3. Retrieve encrypted file path and IV
   ↓
4. Read encrypted file
   ↓
5. Create decipher with IV
   ↓
6. Decrypt file buffer
   ↓
7. Send decrypted buffer to user
```

### Key Management

#### Development
- Key stored in `.env` file
- Must be 32 bytes (64 hex characters)
- Generated using cryptographically secure random bytes

#### Production Recommendations
1. **Environment Variables**: Store in secure environment variable system
2. **Key Rotation**: Implement periodic key rotation
3. **Key Backup**: Securely backup encryption keys
4. **Hardware Security Modules (HSM)**: Consider for enterprise deployments
5. **AWS KMS / Azure Key Vault**: Use cloud key management services

## Authorization

### Route Protection
All note routes require valid JWT token in Authorization header.

### Ownership Verification
```javascript
// Verify user owns the note before any operation
if (note.user.toString() !== req.user.id) {
  return res.status(403).json({
    success: false,
    message: 'Not authorized'
  });
}
```

## Data Validation

### Input Validation
- **Email**: Valid email format
- **Password**: Minimum length validation
- **Note Title**: Max 200 characters
- **Note Content**: Max 10,000 characters
- **File Size**: Max 10MB
- **File Types**: Whitelist of allowed MIME types

### Output Sanitization
- Sensitive file paths never exposed to client
- Encryption IVs never exposed to client
- User passwords never included in responses

## Network Security

### CORS Configuration
```javascript
// Production: Restrict to specific origins
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### HTTPS
- **Development**: HTTP acceptable
- **Production**: HTTPS mandatory
- Prevents man-in-the-middle attacks
- Protects JWT tokens in transit

## Database Security

### MongoDB Security
- **Authentication**: Enable MongoDB authentication
- **Encryption at Rest**: Enable for production
- **Network Access**: Restrict to application servers
- **Backup**: Regular encrypted backups

### Sensitive Data
- Passwords hashed before storage
- Files stored encrypted
- No plain text sensitive data in database

## File Storage Security

### Directory Structure
```
uploads/
├── file1.jpg.encrypted
├── file2.pdf.encrypted
└── ...
```

### File Permissions
- **Directory**: 755 (rwxr-xr-x)
- **Files**: 644 (rw-r--r--)
- **Process User**: Limited privileges

### Cleanup
- Original files deleted after encryption
- Orphaned files cleaned up on note deletion

## Error Handling

### Security Considerations
- Never expose stack traces to client
- Generic error messages for failed authentication
- Detailed errors logged server-side only
- Rate limiting on authentication endpoints (recommended)

## Threat Model

### Protected Against
✅ SQL Injection (NoSQL injection)
✅ XSS (Cross-Site Scripting)
✅ CSRF (Cross-Site Request Forgery)
✅ Unauthorized file access
✅ Password cracking (bcrypt)
✅ Man-in-the-middle (HTTPS)
✅ Data breaches (encrypted at rest)

### Additional Recommendations
⚠️ Rate limiting on API endpoints
⚠️ IP whitelisting for sensitive operations
⚠️ 2FA (Two-Factor Authentication)
⚠️ Account lockout after failed attempts
⚠️ Security headers (Helmet.js)
⚠️ Content Security Policy
⚠️ Regular security audits
⚠️ Penetration testing

## Compliance

### Data Protection
- User data encrypted at rest
- Files encrypted with AES-256
- Secure transmission over HTTPS
- User isolation (can only access own data)

### Best Practices
- OWASP Top 10 considerations
- Principle of least privilege
- Defense in depth
- Secure by default

## Security Checklist for Production

- [ ] Change all default secrets
- [ ] Generate new encryption key
- [ ] Generate new JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Enable MongoDB authentication
- [ ] Enable MongoDB encryption at rest
- [ ] Implement rate limiting
- [ ] Add security headers
- [ ] Set up monitoring and alerting
- [ ] Regular backups
- [ ] Regular security audits
- [ ] Update dependencies regularly
- [ ] Implement logging
- [ ] Secure environment variables
- [ ] Use strong passwords
- [ ] Implement session management
- [ ] Add 2FA (optional but recommended)

## Incident Response

### Security Breach Protocol
1. Immediately revoke compromised credentials
2. Rotate encryption keys
3. Invalidate all JWT tokens
4. Notify affected users
5. Conduct security audit
6. Implement fixes
7. Document and learn

## Regular Maintenance

### Security Updates
- Weekly dependency updates
- Monthly security audits
- Quarterly penetration testing
- Annual security review

### Monitoring
- Failed login attempts
- Unusual file access patterns
- API abuse
- Server resource usage
- Error rates

---

**Last Updated**: 2024
**Security Contact**: security@yourdomain.com

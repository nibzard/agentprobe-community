# AgentProbe Community API

A secure backend service for collecting and sharing CLI test results from the community.

## Security Features

### 🔐 Authentication & Authorization
- **Bearer Token Authentication**: JWT-based authentication for user sessions
- **API Key Authentication**: Secure API keys for programmatic access
- **Multi-layer Authorization**: Role-based permissions with granular API key permissions
- **Account Security**: Password hashing with bcrypt, account lockout protection

### 🛡️ API Security
- **Rate Limiting**: Multiple levels of rate limiting (global, per-endpoint, per-API-key)
- **Request Validation**: Comprehensive input validation and sanitization
- **CORS Configuration**: Production-ready CORS settings
- **Security Headers**: Helmet.js for security headers including CSP
- **API Versioning**: Future-proof API versioning strategy

### 🔍 Input Validation & Sanitization
- **Schema Validation**: Joi schemas for complex data validation
- **XSS Prevention**: Input sanitization to prevent XSS attacks
- **SQL Injection Protection**: Parameterized queries and input filtering
- **Content Security Policy**: CSP validation for user-submitted content
- **File Size Limits**: Protection against oversized payloads

### 📊 Monitoring & Auditing
- **Comprehensive Logging**: Structured logging with Winston
- **Security Event Tracking**: Dedicated security audit logs
- **Performance Monitoring**: Request timing and performance metrics
- **Error Tracking**: Detailed error logging with context

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /logout` - User logout
- `GET /me` - Get user profile
- `PUT /me` - Update user profile
- `POST /verify-email` - Email verification
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset
- `POST /change-password` - Change password

### API Keys (`/api/v1/api-keys`)
- `POST /` - Create new API key
- `GET /` - List user's API keys
- `GET /:id` - Get API key details
- `PUT /:id` - Update API key
- `DELETE /:id` - Revoke API key
- `POST /:id/regenerate` - Regenerate API key
- `GET /stats` - Usage statistics
- `POST /cleanup` - Cleanup expired keys

### Test Results (`/api/v1/results`)
- `POST /` - Submit test result
- `POST /batch` - Batch submit results
- `GET /` - List test results (with filtering)
- `GET /search` - Search test results
- `GET /stats` - Get statistics
- `GET /trending` - Get trending tests
- `GET /:id` - Get specific result
- `PUT /:id` - Update result
- `DELETE /:id` - Delete result
- `GET /user/history` - User's test history

## Security Configuration

### Environment Variables

```bash
# Security
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_SALT_ROUNDS=12
API_KEY_LENGTH=32

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
PRODUCTION_DOMAINS=https://agentprobe.com,https://www.agentprobe.com
```

### Rate Limiting Strategy

1. **Global Rate Limiting**: 100 requests per 15 minutes per IP
2. **Authentication Endpoints**: 5 requests per 15 minutes per IP
3. **API Key Operations**: 10 requests per 15 minutes per user
4. **Test Submissions**: 100 submissions per minute per API key
5. **Per-API-Key Limits**: 1000 requests per hour per API key

### API Key Permissions

- `read`: Read access to test results and public data
- `write`: Submit new test results and update own data
- `delete`: Delete own test results and data
- `admin`: Full administrative access (admin users only)

### Data Validation

- **Test Results**: Comprehensive validation of test data structure
- **User Input**: Sanitization and validation of all user inputs
- **File Uploads**: Size limits and content validation
- **Search Queries**: Input sanitization for search functionality

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```

## Security Best Practices Implemented

### Defense in Depth
- Multiple layers of security controls
- Input validation at multiple levels
- Authentication and authorization checks
- Rate limiting and DDoS protection

### Least Privilege
- Granular API key permissions
- Role-based access control
- Minimum necessary data exposure
- Scoped authentication tokens

### Zero Trust
- All inputs are validated and sanitized
- Authentication required for sensitive operations
- Audit logging for all actions
- Comprehensive error handling

### Secure by Default
- Secure default configurations
- Automatic security headers
- Protected sensitive endpoints
- Encrypted data transmission

## Monitoring and Alerting

The API includes comprehensive logging and monitoring:

- **Access Logs**: All API requests with timing and authentication info
- **Security Logs**: Failed authentication attempts and security violations
- **Audit Logs**: All data modification operations
- **Performance Logs**: Slow queries and performance metrics
- **Error Logs**: Application errors with full context

## Contributing

Please ensure all contributions maintain the security standards established in this project:

1. Follow secure coding practices
2. Add input validation for new endpoints
3. Include security tests
4. Update documentation for security changes
5. Conduct security review before merging

## License

MIT License - see LICENSE file for details.
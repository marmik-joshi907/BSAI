# BugShield AI Backend

A comprehensive REST API for vulnerability scanning and security analysis of web applications.

## Features

- **File Upload Scanning**: Upload multiple files for vulnerability analysis
- **GitHub Integration**: Scan public GitHub repositories
- **Code Snippet Analysis**: Analyze individual code snippets
- **Multiple Vulnerability Types**: Detects SQL injection, XSS, hardcoded secrets, and more
- **Report Generation**: Generate detailed security reports in JSON, CSV, and HTML formats
- **Authentication**: JWT-based user authentication
- **Rate Limiting**: Prevents abuse with configurable rate limits
- **Comprehensive Logging**: Winston-based logging system

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Scanning
- `POST /api/scan/files` - Scan uploaded files
- `POST /api/scan/snippet` - Scan code snippet
- `GET /api/scan/history` - Get scan history

### GitHub Integration
- `POST /api/github/scan` - Scan GitHub repository
- `GET /api/github/repo-info` - Get repository information

### Reports
- `POST /api/reports/generate` - Generate vulnerability report

### System
- `GET /api/health` - Health check
- `GET /api` - API documentation

## Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Security
JWT_SECRET=your-super-secret-jwt-key-here
BCRYPT_ROUNDS=12

# GitHub Integration
GITHUB_TOKEN=your-github-personal-access-token

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB
MAX_FILES=20

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
SCAN_LIMIT_MAX_REQUESTS=10

# Logging
LOG_LEVEL=info
```

## Vulnerability Detection

The scanner detects the following vulnerability types:

### Critical Severity
- SQL Injection
- Code Injection (eval usage)
- Hardcoded API keys with recognizable prefixes
- Plain text password comparisons
- Path traversal with file inclusion

### High Severity
- Cross-Site Scripting (XSS)
- Hardcoded secrets and passwords
- Insecure password hashing (MD5)
- Direct user input in innerHTML

### Medium Severity
- CSRF vulnerabilities
- Missing security headers
- Insecure password hashing (SHA1)
- Path traversal sequences

### Low Severity
- Insecure random number generation
- Information disclosure (excessive logging)

## Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: Prevents abuse
- **File Type Validation**: Only allows safe file types
- **Input Validation**: Express-validator for request validation
- **JWT Authentication**: Secure token-based auth
- **CORS Configuration**: Configurable cross-origin requests

## File Upload Security

- Maximum file size: 10MB (configurable)
- Maximum files per request: 20 (configurable)
- Allowed file types: HTML, JS, CSS, PHP, Python, and more
- Files stored in user-specific directories
- Automatic cleanup (implement as needed)

## Error Handling

Comprehensive error handling with:
- Structured error responses
- Detailed logging
- Development vs production error messages
- Specific error types (validation, authentication, etc.)

## Logging

Winston-based logging system:
- Console output in development
- File logging in production
- Configurable log levels
- Error and combined log files

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure secure JWT secret
3. Set up proper logging
4. Configure rate limits
5. Set up reverse proxy (nginx)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
# Amine Baha — Portfolio

A personal portfolio website built with Next.js, Better Auth, and PostgreSQL. Features authentication, a modern microservices architecture, and a polished UI.

**Live site:** [aminebaha.dev](https://aminebaha.dev)

## Architecture

This application follows a microservices architecture with three main services:

- **Frontend** (Next.js) - User-facing web application on port 3000
- **Backend** (Next.js API) - Backend API service on port 8080
- **Auth Service** (Better Auth) - Authentication service on port 3001

### Database

- **app-db** (PostgreSQL 17) - Application database on port 5433
- **auth-db** (PostgreSQL 17) - Authentication database on port 5434

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Git
- Node.js 20+ (for local development, optional)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-website
   ```

2. **Create `.env` file**
   ```bash
   # Copy the example and update values
   cp .env.example .env
   ```

3. **Configure environment variables**
   
   Required variables (minimum):
   ```env
   # Authentication Secrets (must be at least 32 characters)
   BETTER_AUTH_SECRET=your-32-character-secret-here
   AUTH_JWT_SECRET=your-32-character-jwt-secret-here
   
   # Optional: Google OAuth (see OAUTH_SETUP.md)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Start all services**
   ```bash
   docker compose up --build -d
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Auth Service: http://localhost:3001

### Initial Setup



## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js frontend application |
| Backend | 8080 | Next.js API backend |
| Auth Service | 3001 | Better Auth authentication service |
| app-db | 5433 | PostgreSQL database for application data |
| auth-db | 5434 | PostgreSQL database for authentication |

### Accessing Services

- **Production**: [aminebaha.dev](https://aminebaha.dev)
- **Frontend** (local): http://localhost:3000
- **Backend API** (local): http://localhost:8080/api
- **Auth Service** (local): http://localhost:3001

## Environment Variables

### Required Variables

```env
# Authentication Secrets (minimum 32 characters each)
BETTER_AUTH_SECRET=your-secret-here-min-32-chars
AUTH_JWT_SECRET=your-jwt-secret-here-min-32-chars

# URLs (defaults provided, override if needed)
BETTER_AUTH_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
```

### Optional Variables

```env
# Google OAuth (see OAUTH_SETUP.md for setup)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

## Project Structure

```
portfolio-website/
├── docker-compose.yml          # Docker Compose configuration
├── .env                        # Environment variables (create from .env.example)
├── README.md                   # This file
├── OAUTH_SETUP.md              # Google OAuth setup guide
│
├── frontend/                   # Next.js frontend application
│   ├── src/
│   │   ├── app/               # Next.js app router pages
│   │   │   ├── login/         # Login page
│   │   │   ├── signup/        # Signup page
│   │   │   ├── dashboard/     # Dashboard (post-login)
│   │   │   ├── admin/         # Admin dashboard
│   │   │   └── api/           # Frontend API routes
│   │   ├── components/        # React components
│   │   └── lib/               # Utilities and hooks
│   ├── Dockerfile
│   └── package.json
│
├── backend/                    # Next.js backend API
│   ├── src/
│   │   ├── app/api/           # API routes
│   │   └── lib/
│   │       ├── auth/          # JWT verification
│   │       └── db/            # Database schema
│   ├── Dockerfile
│   └── package.json
│
└── auth-service/              # Better Auth service
    ├── src/
    │   ├── app/api/auth/      # Auth API routes
    │   ├── lib/
    │   │   ├── auth/          # Better Auth configuration
    │   │   └── db/            # Database schema
    │   └── middleware.ts      # Auth middleware
    ├── scripts/               # Database setup scripts
    ├── Dockerfile
    └── package.json
```

## Development

### Rebuilding Services

After making changes to code, rebuild the specific service:

```bash
# Rebuild frontend
docker compose up --build -d frontend

# Rebuild backend
docker compose up --build -d backend

# Rebuild auth-service
docker compose up --build -d auth-service

# Rebuild all services
docker compose up --build -d
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f auth-service
```

### Database Access

```bash
# Connect to app-db
docker exec -it app-db psql -U app_user -d portfolio_app

# Connect to auth-db
docker exec -it auth-db psql -U auth_user -d auth_db
```

### Stopping Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (erases database data)
docker compose down -v
```

## Authentication

### User Roles

- **CUSTOMER** - Default role for regular users
- **ADMIN** - Administrative access

### Authentication Flow

1. Users sign up or log in via the frontend
2. Auth service handles authentication using Better Auth
3. JWT tokens are issued for API access
4. Backend validates JWT tokens for protected routes

### OAuth (Google)

See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed Google OAuth setup instructions.

**Quick Setup:**
1. Create OAuth credentials in Google Cloud Console
2. Add authorized origins: `http://localhost:3000`, `http://localhost:3001`, `https://aminebaha.dev`
3. Add redirect URIs: `http://localhost:3001/api/auth/callback/google` (local), `https://[auth-domain]/api/auth/callback/google` (production)
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

### Session Management

**Note for Development:** Due to cross-origin cookie limitations between `localhost:3000` and `localhost:3001`, the application uses a token-based session establishment workaround. This is handled automatically and doesn't require manual configuration.

## API Endpoints

### Backend API

- `GET /api/health` - Health check
- `GET /api/protected/example` - Protected endpoint (requires authentication)
- `GET /api/admin/example` - Admin-only endpoint (requires ADMIN role)

### Auth Service API

- `GET /api/health` - Health check
- `GET /api/auth/get-session` - Get current session
- `POST /api/auth/sign-in` - Sign in
- `POST /api/auth/sign-up` - Sign up
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/token` - Get JWT token for API access

## Common Issues

### Port Already in Use

If a port is already in use, either:
1. Stop the conflicting service
2. Change the port in `docker-compose.yml`

### Database Connection Errors

1. Ensure databases are healthy: `docker compose ps`
2. Check database logs: `docker compose logs app-db auth-db`
3. Verify environment variables are set correctly

### OAuth Redirect Issues

1. Verify redirect URIs in Google Cloud Console match exactly
2. Check that `BETTER_AUTH_URL` and `FRONTEND_URL` are set correctly
3. Ensure cookies are enabled in your browser

### Session Not Found After OAuth

This is a known issue in development due to cross-origin cookies. The application handles this automatically with a token-based workaround. If issues persist:
1. Check browser console for errors
2. Verify the token is being passed in the URL
3. Check auth-service logs for session creation

## Security Notes

- **Never commit `.env` files** with real secrets
- Use strong, randomly generated secrets (minimum 32 characters)
- In production, use HTTPS and secure cookie settings
- Regularly rotate secrets and tokens
- Review and update dependencies regularly

## Production Deployment

**Live deployment:** [https://aminebaha.dev](https://aminebaha.dev)

For production deployment:

1. Set all required environment variables
2. Use strong, randomly generated secrets
3. Configure proper CORS origins
4. Set up HTTPS/SSL certificates
5. Configure proper database backups
6. Review security settings in `auth-service/src/lib/auth/auth.ts`
7. Update `BETTER_AUTH_URL` and `FRONTEND_URL` to production domains

## Troubleshooting

### Services Won't Start

1. Check Docker is running: `docker ps`
2. Check logs: `docker compose logs`
3. Verify `.env` file exists and has required variables
4. Check port conflicts: `netstat -an | grep <port>`

### Build Failures

1. Clear Docker cache: `docker compose build --no-cache`
2. Check for syntax errors in code
3. Verify all dependencies are in `package.json`
4. Check Node.js version compatibility (requires Node 20+)

### Authentication Issues

1. Verify secrets are set and at least 32 characters
2. Check database connectivity
3. Review auth-service logs
4. Verify JWT secrets match between auth-service and backend

## CI/CD

GitHub Actions workflows are configured for:
- **Frontend** - Lint, type check, and build on push/PR
- **Backend** - Lint, type check, and build on push/PR
- **Auth Service** - Lint, type check, and build on push/PR

Workflows run automatically on:
- Push to `main`, `master`, or `develop` branches
- Pull requests to `main`, `master`, or `develop` branches

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with Docker
4. Ensure CI passes (linting, type checking, build)
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue in the repository.

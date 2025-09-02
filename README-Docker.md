# Docker Setup for Esprit App

This guide explains how to run the Esprit App using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### 1. Environment Setup

First, create your environment file:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual configuration values.

### 2. Production Build

To run the application in production mode:

```bash
# Build and run with docker-compose
npm run docker:prod

# Or manually build and run
npm run docker:build
npm run docker:run
```

The application will be available at `http://localhost:3000`

### 3. Development Mode

To run the application in development mode with hot reload:

```bash
npm run docker:dev
```

The development server will be available at `http://localhost:3001`

## Docker Commands

### Build the Docker image
```bash
docker build -t esprit-app .
```

### Run the container
```bash
docker run -p 3000:3000 --env-file .env.local esprit-app
```

### Run with docker-compose (production)
```bash
docker-compose up app
```

### Run with docker-compose (development)
```bash
docker-compose --profile dev up app-dev
```

### Stop containers
```bash
docker-compose down
```

## File Structure

- `Dockerfile` - Production Docker configuration
- `Dockerfile.dev` - Development Docker configuration
- `docker-compose.yml` - Docker Compose configuration
- `.dockerignore` - Files to exclude from Docker build context
- `env.example` - Environment variables template

## Volumes

The Docker setup includes the following volume mounts:

- `./public/uploads:/app/public/uploads` - Persistent file uploads
- `./temp:/app/temp` - Temporary files for PDF processing

## Health Check

The production container includes a health check that verifies the application is running correctly.

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, you can change the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change 3001 to any available port
```

### Environment Variables
Make sure all required environment variables are set in your `.env.local` file. Check the `env.example` file for reference.

### File Permissions
If you encounter file permission issues with uploads, make sure the `public/uploads` directory exists and has proper permissions:

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### Python Dependencies
The Docker image includes Python and pdfplumber for PDF processing. If you need additional Python packages, modify the Dockerfile to install them.

## Production Deployment

For production deployment, consider:

1. Using a reverse proxy (nginx) in front of the application
2. Setting up proper SSL certificates
3. Using environment-specific configuration files
4. Setting up proper logging and monitoring
5. Using a container orchestration platform like Kubernetes

## Development Tips

- Use `docker-compose logs -f app` to view application logs
- Use `docker-compose exec app sh` to access the container shell
- The development profile includes volume mounts for hot reloading

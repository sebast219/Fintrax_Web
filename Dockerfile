# Railway-compatible build for production
FROM node:20-alpine

WORKDIR /app

# Copy package files from Backend directory
COPY Backend/package*.json ./Backend/

# Change to Backend directory for dependency installation
WORKDIR /app/Backend

# Install all dependencies for build
RUN npm ci

# Copy source code from Backend directory
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port (Railway uses PORT env var)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]

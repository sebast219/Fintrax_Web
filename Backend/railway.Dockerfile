# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY Backend/package*.json ./Backend/
COPY Backend/prisma ./Backend/prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY Backend/ ./Backend/

# Build the application
WORKDIR /app/Backend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder /app/Backend/dist ./dist
COPY --from=builder /app/Backend/node_modules ./node_modules
COPY --from=builder /app/Backend/package*.json ./
COPY --from=builder /app/Backend/prisma ./prisma

# Install Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Start the application
CMD ["npm", "start"]

# Railway-compatible build for production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies for build
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port (Railway uses PORT env var)
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]

# QuickBridge Backend Dockerfile
# 支持多架构：AMD64 和 ARM64

# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.11.0

WORKDIR /app

# Copy package files
COPY package.json ./

# Install all dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# Production stage
FROM node:22-alpine

# Install pnpm
RUN npm install -g pnpm@10.11.0

WORKDIR /app

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN pnpm install --prod

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy other necessary files
COPY --from=builder /app/uploads ./uploads

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.js"]

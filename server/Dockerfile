# FROM node:18-alpine

# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install dependencies (using npm install instead of npm ci for better compatibility)
# RUN npm install --only=production

# # Copy application code
# COPY . .

# # Expose port
# EXPOSE 3010

# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:3010/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# # Start the application
# CMD ["node", "server.js"] 

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies and add curl for debugging
RUN npm install && \
    apk add --no-cache curl

COPY . .

# Set environment variables with defaults
ENV PORT=3010
ENV SERVICE_NAME=nodejs-app
ENV LOKI_URL=http://loki:3100/loki/api/v1/push
ENV NODE_ENV=production
ENV LOG_LEVEL=info

EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3010/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"


# Use a simple command that ensures logs go to stdout/stderr
CMD ["node", "server.js"]
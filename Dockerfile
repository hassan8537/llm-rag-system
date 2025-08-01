# Multi-stage build for TypeScript Node.js application

# --- Builder stage ---
FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:18-alpine3.20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY . .
RUN mkdir -p ./migrations && npm run build


# --- Production stage ---
FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:18-alpine3.20 AS production

# Define build arguments
ARG APP_SECRETS
ARG RDS_CREDENTIALS

# Install tools
RUN apk add --no-cache dumb-init jq

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001

WORKDIR /app

# Copy dependencies and install production packages
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Setup environment variables from injected JSON secrets
RUN mkdir -p /secrets && \
    printf "%s\n" "$APP_SECRETS" | jq -r 'to_entries[] | "export \(.key)=\(.value)"' > /secrets/app_secrets.env && \
    printf "%s\n" "$RDS_CREDENTIALS" | jq -r 'if .host then "export DB_HOST=" + .host else empty end, if .dbname then "export DB_NAME=" + .dbname else empty end, if .db_username then "export DB_USER=" + .db_username else empty end, if .username then "export DB_USER=" + .username else empty end, if .db_password then "export DB_PASSWORD=" + .db_password else empty end, if .password then "export DB_PASSWORD=" + .password else empty end, if .db_port then "export DB_PORT=" + (.db_port | tostring) else empty end, if .port then "export DB_PORT=" + (.port | tostring) else empty end' > /secrets/rds_secrets.env

# Init wrapper to load secrets at runtime
RUN printf '#!/bin/sh\n. /secrets/app_secrets.env\n. /secrets/rds_secrets.env\nexec "$@"\n' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Set permissions
RUN chown -R appuser:nodejs /app
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

ENTRYPOINT ["dumb-init", "--", "/entrypoint.sh"]
CMD ["npm", "start"]

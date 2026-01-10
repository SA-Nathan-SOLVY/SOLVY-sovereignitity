FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm
RUN pnpm install

# Install backend deps
RUN pnpm add express cors stripe jose typescript @types/node @types/express @types/cors

# Copy source
COPY . .

# Build Frontend
RUN pnpm build

# Build Backend
RUN pnpm tsc -p server/tsconfig.json

# FIX: Copy the keys to the dist folder
RUN cp server/*.json dist-server/ 2>/dev/null || :

# Expose ports
EXPOSE 3000 3001

# Start command
CMD ["sh", "-c", "node dist-server/index.js & pnpm preview --host --port 3000"]

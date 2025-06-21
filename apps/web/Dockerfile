FROM node:18-alpine

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps ./apps

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --force

# Set working directory to the web app
WORKDIR /app/apps/web

# Build the web app
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"] 
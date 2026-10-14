# Production Dockerfile for TikTok Growth Suite & Clipper
FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies: FFmpeg, curl, ca-certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install standalone yt-dlp binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application source
COPY . .

# Create uploads and output directories
RUN mkdir -p uploads output

# Expose server ports (3000 for standard, 10000 for Render default)
EXPOSE 3000 10000

ENV PORT=3000
ENV NODE_ENV=production

# Start application
CMD ["node", "server.js"]

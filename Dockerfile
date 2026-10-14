# Production Dockerfile for TikTok Growth Suite & Clipper
FROM node:20-bullseye-slim

# Install system dependencies: FFmpeg, Python, PIP, curl, ca-certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install edge-tts (viral TikTok voiceovers) and yt-dlp
RUN pip3 install --no-cache-dir edge-tts yt-dlp

# Set working directory
WORKDIR /app

# Copy package files first for Docker layer caching
COPY package*.json ./

# Install npm production dependencies
RUN npm install --omit=dev

# Copy application source files
COPY . .

# Create uploads and output directories
RUN mkdir -p uploads output

# Expose server port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start Express application
CMD ["node", "server.js"]

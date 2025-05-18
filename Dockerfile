# Base image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package.json and bun.lockb
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN bun run build

# Expose the port Next.js runs on
EXPOSE 3000

# Command to run the app
CMD ["bun", "start"]
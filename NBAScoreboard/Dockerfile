# File: NBAScoreboard/Dockerfile
FROM node:18-alpine

# Install necessary build dependencies
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps and production flags
RUN npm install --legacy-peer-deps --production=false

# Copy the rest of the application code
COPY . .

# Set environment variables
ENV PORT=3000

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "--port", "3000"]
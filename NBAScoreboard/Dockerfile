# File: NBAScoreboard/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install dependencies with legacy peer deps flag for compatibility
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Expose the port
EXPOSE 5173

# Start the application using serve
CMD ["npm", "run", "dev", "--", "--host"]
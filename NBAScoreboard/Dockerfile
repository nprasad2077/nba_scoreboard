# NBAScoreboard/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Install serve to run the built application
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 5173

# Command to run the application
CMD ["npm", "run", "dev", "--", "--host"]
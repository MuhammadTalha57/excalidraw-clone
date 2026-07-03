FROM node:20-alpine
WORKDIR /app

# Copy package files first for efficient caching
COPY package*.json ./

# Install ONLY production dependencies (ignores nodemon)
RUN npm install --omit=dev

# Copy your source code (src/server.js, etc.)
COPY . .

# Expose the port Express app uses
EXPOSE 4000

# Fire up the server
CMD ["npm", "start"]
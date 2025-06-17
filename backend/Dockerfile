# Use official Node image
FROM node:20

# Set working dir
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy code & key
COPY . .

# Run processor
CMD ["node", "server.js"]
# Use an official Node.js runtime
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy dependencies files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port (if using Express)
EXPOSE 3000

# Run the app
CMD ["node", "index.js"]
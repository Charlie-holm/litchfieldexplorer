# Use the official Node image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy your backend source code
COPY . .

# Expose the port your server uses
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
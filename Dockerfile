# Use the official Node.js image as the base image
FROM node:21.5.0

# Create and set the working directory
WORKDIR /uptime_app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the necessary ports
EXPOSE 3000
EXPOSE 3001

# Define the command to run the application
CMD ["npm", "start"]

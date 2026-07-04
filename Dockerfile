# Use the official Node 24 alpine image as a base
FROM node:24-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's cache layer
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose Vite's default dev server port
EXPOSE 5173

# Start the application, binding Vite to all interfaces so it's accessible from the host
CMD ["npm", "run", "dev", "--", "--host"]

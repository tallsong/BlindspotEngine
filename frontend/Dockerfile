# Stage 1: Build the React application
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port Vite runs on
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev", "--", "--host"]

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

COPY . .

# Use non-root user for security
USER node

# Start the application
CMD ["npm", "start"]

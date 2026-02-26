# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy dependency definitions first to leverage Docker cache
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (Make sure your package.json specifies Prisma version 7)
RUN npm install

# Generate the Prisma Client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose the port your Express server will run on
EXPOSE 3000

# Command to run the application (assuming you have a "dev" script in package.json)
CMD ["npm", "run", "dev"]
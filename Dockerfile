# Stage 1: Build Stage
FROM node:20.11.1 AS build

WORKDIR /app

# Copy package.json and package-lock.json
# COPY package*.json ./
COPY . .

# Install dependencies
RUN npm install 
RUN cd modules/confluence-plugin && yarn install && yarn build:full

# Build the application
RUN npm run build

# Stage 2: Production Stage
FROM node:20.11.1-buster

# Copy built files from the build stage to the production image
COPY --from=build /app/ /app

WORKDIR /app
EXPOSE 8080
CMD ["node", "-r", "esm", "app.js"]

FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package*.json ./
RUN npm install

# Copy app source.
COPY . .

EXPOSE 3005

# Run Vite in container-accessible mode.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3005"]

FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --production

# Copy the rest of the backend
COPY . .

EXPOSE 5000

# Recommended: run migrations via a release / prestart hook in your provider, or
# configure `DATABASE_URL` and enable the below combined command as the start command
# CMD ["sh", "-lc", "npm run migrate && npm start"]
CMD ["node", "server.js"]

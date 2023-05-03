FROM node:18-alpine3.16
WORKDIR /app
COPY package*.json ./
COPY src/ ./src
RUN npm install --platform=linux-armv7
EXPOSE 3000
CMD ["npm", "start"]

FROM node:18-alpine3.16
WORKDIR /app
COPY package*.json ./
COPY src/ ./src
COPY assets/ ./assets
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]

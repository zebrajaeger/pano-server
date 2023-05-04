FROM node:18-alpine3.16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src/ ./src
COPY fe-build/ ./fe-build
COPY fe/ ./fe
COPY assets/ ./assets
RUN npm run fe:build
EXPOSE 3000
CMD ["npm", "start"]

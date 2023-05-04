FROM node:18-alpine3.16
WORKDIR /app
RUN npm install
COPY package*.json ./
COPY src/ ./src
COPY fe-build/ ./fe-build
COPY fe/ ./fe
COPY assets/ ./assets
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

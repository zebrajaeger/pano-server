FROM node:18-alpine3.16
WORKDIR /app
COPY package*.json *.js ./
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]

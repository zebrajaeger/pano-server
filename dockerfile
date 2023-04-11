# Verwenden des offiziellen Node.js-Images als Basis
FROM node:18-alpine3.16

# Setzen des Arbeitsverzeichnisses
WORKDIR /app

# Kopieren der package.json-Datei und der package-lock.json-Datei in das Arbeitsverzeichnis
COPY package*.json ./

# Installieren der Abhängigkeiten
RUN npm install

# Kopieren des restlichen Anwendungsquellcodes in das Arbeitsverzeichnis
COPY . .

# Erstellen des Build
RUN npm run build

# Öffnen des Ports 3000 für den Container
EXPOSE 3000

# Starten der Anwendung
CMD ["npm", "start"]

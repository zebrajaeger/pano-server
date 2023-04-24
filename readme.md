# Pano Server

## Setup

### Clone end configure
    git clone git@github.com:zebrajaeger/pano-server.git
    cd pano-server

create and edit the file `server.env`:

    nano server.env

with content like this:

    SERVER_URL=https://my.pano.server.org


### Build and start


    docker-compose up --build -d

### Update, rebuild and start

     git pull && docker-compose up --build -d

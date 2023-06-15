# Pano Server

Frontend for a folder structure with panos.    
Scans the folder structure, reads the information and presents 
it in a more - or less - pretty way.

// TODO screenshot

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

## Pano structure

To identify a pano-folder, this software searches for the following files
in the listed order:
- index.html
- index.template.html
- index.m.html
- index.m.template.html
- index.p.html
- index.p.template.html

Data is extracted from html-head:
- og:image ➔ preview image
- og:alt ➔ alternative preview image description
- og:title ➔ title
- og:description ➔ description

In addition, if a file 'pano.description.json' exists into the top level 
of the directory, the following data is extracted (and overwrites the information from the html header):
- htmlData.preview ➔ string ➔ preview image
- htmlData.alt ➔ string ➔ alternative preview image description
- descData.title ➔ string ➔ title
- descData.description ➔ string ➔ description
- link ➔ string ➔ link (otherwise the absolute path to the current folder)
- tags ➔ string[ ] ➔ tags

### Preview image

The preview image will be scaled to max 150x150 pixel and stored in

    <link>/.panoserver/<imagename>.150.jpg

FROM devslopes/ubuntu-node:latest

COPY package*.json ./
RUN npm install

EXPOSE 3000 46656 46657

CMD [ "npm", "start" ]

stream {
    server {
        listen     46656;

        #TCP traffic will be proxied to the "stream_backend" upstream group
        proxy_pass stream_backend;
    }

    server {
        listen     46656;
        #TCP traffic will be proxied a proxied server
        proxy_pass 159.65.168.34:46656;
    }
}

stream {
    upstream lotion {
        server 0.0.0.0:46656;
    }

    server {
        listen 46656;
        proxy_pass lotion;
    }
}

http {
    server {
                listen 80 default_server;
                listen [::]:80 default_server;
                root /var/www/html;
                index index.html index.htm index.nginx-debian.html;

                server_name _;
                location / {
                        proxy_pass http://localhost:46657;
                        proxy_http_version 1.1;
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection 'upgrade';
                        proxy_set_header Host $host;
                        proxy_cache_bypass $http_upgrade;
               }

        }
}


server {
        listen 80 default_server;
        listen [::]:80 default_server;
        root /var/www/html;
        index index.html index.htm index.nginx-debian.html;

        server_name _;
        location / {
                proxy_pass http://localhost:46657;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
       }

}
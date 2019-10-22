echo "Restarting zigfred.ch"
docker stop production.backend.web.zigfred
docker rm production.backend.web.zigfred
docker run \
--name=production.backend.web.zigfred \
-d \
--restart=always \
-ti \
-v "/var/www/zigfred.ch/data/:/app/data/" \
-v "/var/www/zigfred.ch/dist/:/app/static/" \
-p 8088:1337 registry.technokrat.ch/zigfred/backend.web.zigfred:production
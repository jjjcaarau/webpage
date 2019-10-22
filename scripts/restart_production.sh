echo "Restarting zigfred.ch"
docker stop production.jjjcaarau-webpage
docker rm production.jjjcaarau-webpage
docker run \
--name=production.jjjcaarau-webpage \
-d \
--restart=always \
-ti \
-v "/var/www/jjjcaarau.ch/data/:/app/data/" \
-p 8088:1337 jjjcaarau.ch:production
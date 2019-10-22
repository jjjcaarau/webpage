echo "Restarting zigfred.ch"
docker stop jjjcaarau-webpage
docker rm jjjcaarau-webpage
docker run \
--name=jjjcaarau-webpage \
-d \
--restart=always \
-ti \
-v "/var/www/jjjcaarau-webpage/data/:/app/data/" \
-p 8088:1337 jjjcaarau-webpage:production
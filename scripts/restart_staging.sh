echo "Restarting zigfred.ch"
docker stop staging.jjjcaarau-webpage
docker rm staging.jjjcaarau-webpage
docker run \
--name=staging.jjjcaarau-webpage \
-d \
--restart=always \
-ti \
-v "/var/www/new.jjjcaarau.ch/data/:/app/data/" \
-p 8088:1337 new.jjjcaarau.ch:staging
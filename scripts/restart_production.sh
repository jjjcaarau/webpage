echo "Restarting webpage"
docker stop production.jjjcaarau-webpage
docker rm production.jjjcaarau-webpage
docker run \
    --name=production.jjjcaarau-webpage \
    --user 1003:33 \
    -d \
    --restart=always \
    -ti \
    -v "/var/www/jjjcaarau.ch/data/:/app/data/" \
    -p 8088:1337 jjjcaarau-webpage:production
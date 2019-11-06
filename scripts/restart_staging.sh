echo "Restarting webpage"
docker stop staging.jjjcaarau-webpage
docker rm staging.jjjcaarau-webpage
docker run \
    --name=staging.jjjcaarau-webpage \
    --user 1003:33 \
    -d \
    --restart=always \
    -ti \
    -v "/var/www/staging.jjjcaarau.ch/data/:/app/data/" \
    -e JJJCA_CONFIG=defaults/config/staging.toml \
    -p 8087:1337 jjjcaarau-webpage:staging
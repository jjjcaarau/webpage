echo "Restarting staging.zigfred.ch"
docker stop staging.backend.web.zigfred
docker rm staging.backend.web.zigfred
docker run \
--name=staging.backend.web.zigfred \
-d \
--restart=always \
-ti \
-v "/var/www/staging.zigfred.ch/data/:/app/data/" \
-v "/var/www/staging.zigfred.ch/dist/:/app/static/" \
-p 8087:1337 registry.technokrat.ch/zigfred/backend.web.zigfred:staging
#!/bin/sh

echo "Starting up webserver"

if [ -f "/app/data/db.sqlite3" ]; then
    echo "Database found. Doing nothing."
else 
    echo "No database found. Initializing."
    ./housekeeping/diesel setup --database-url /app/data/db.sqlite3 --migration-dir /app/housekeeping/migrations
fi

echo "Migrating."
./housekeeping/diesel migration run --database-url /app/data/db.sqlite3 --migration-dir /app/housekeeping/migrations

echo "Ensuring directories"
mkdir -p data/config/
mkdir -p data/templates/

if [ "$(ls -A data/config)" ]; then
     echo "Config found, not taking any action."
else
    echo "No config found. Setting up a default one."
    cp defaults/config/* data/config/
fi

if [ "$(ls -A data/templates)" ]; then
     echo "Templates found, not taking any action."
else
    echo "No templates found. Setting up a default ones."
    cp defaults/templates/* data/templates/
fi

pwd
ls defaults
cp defaults/GeoLite2Country.mmdb data/

cd data

ZIGFRED_WEB_PORT=1337 \
ZIGFRED_WEB_ADDRESS=0.0.0.0 \
ZIGFRED_WEB_STATIC_ROOT=/app/static \
../zigfred-web-backend
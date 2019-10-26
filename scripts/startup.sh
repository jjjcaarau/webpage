#!/bin/sh

echo "Starting up webserver"

if [ -f "/app/data/db.sqlite3" ]; then
    echo "Database found. Doing nothing."
else 
    echo "No database found. Initializing."
    ./housekeeping/diesel \
    setup \
    --database-url /app/data/db.sqlite3 \
    --migration-dir /app/housekeeping/migrations
fi

cp /app/data/db.sqlite3 /app/data/old.sqlite3

echo "Migrating."
./housekeeping/diesel \
migration run \
--database-url /app/data/db.sqlite3 \
--migration-dir /app/housekeeping/migrations

# Insert SQL diff here.

echo "Ensuring directories"
mkdir -p data/config/
mkdir -p data/templates/
mkdir -p data/blog/

if [ "$(ls -A data/config)" ]; then
     echo "Config found, not taking any action."
else
    echo "No config found. Setting up a default one."
    cp -R defaults/config/* data/config/
fi

if [ "$(ls -A data/templates)" ]; then
     echo "Templates found, not taking any action."
else
    echo "No templates found. Setting up a default ones."
    cp -R defaults/templates/* data/templates/
fi

cd data

JJJCAARAU_WEB_PORT=1337 \
JJJCAARAU_WEB_ADDRESS=0.0.0.0 \
JJJCAARAU_WEB_STATIC_ROOT=/app/static \
JJJCAARAU_WEB_BLOG_ROOT=/app/data/blog \
DATABASE_URL=/app/data/db.sqlite3 \
RUST_BACKTRACE=1 \
../jjjcaarau-webpage
docker run \
--rm \
-ti \
-v "/home/yatekii/repos/jjjcaarau-webpage/backend/config:/app/data/config" \
-v "/home/yatekii/repos/jjjcaarau-webpage/backend/db.sqlite3:/app/data/db.sqlite3" \
-v "/home/yatekii/repos/jjjcaarau-webpage/backend/templates:/app/data/templates" \
-v "/home/yatekii/repos/jjjcaarau-webpage/blog:/app/data/blog" \
-p 1337:1337 \
jjjcaarau-webpage:latest
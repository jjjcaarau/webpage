docker run \
--rm \
-ti \
-v "/home/yatekii/repos/backend.web.zigfred/:/app/data/" \
-v "/home/yatekii/repos/frontend.web.zigfred/dist/:/app/static/" \
-p 1337:1337 backend.web.zigfred
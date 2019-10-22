# Move config files from the temporary scp location to their final destination.
sudo mv preview.zigzag/zigzag-web.service /etc/systemd/system/zigzag-web.service
sudo mv preview.zigzag/zigzag-web.conf /etc/nginx/sites-available/zigzag-web.conf

# Enable the nginx server block.
sudo ln -s /etc/nginx/sites-available/zigzag-web.conf /etc/nginx/sites-enabled/zigzag-web.conf

# Make sure nginx is not running.
sudo service nginx stop

# Aquire an LE certificate.
sudo certbot certonly --standalone -d preview.zigzag.technokrat.ch

# Start up nginx.
sudo service nginx start

# Remove this script from the temporary location.
rm preview.zigzag/setup-remote.sh
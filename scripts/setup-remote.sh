# Move config files from the temporary scp location to their final destination.
sudo mv jjjcaarau-webpage/new.jjjcaarau.ch.conf /etc/nginx/sites-available/new.jjjcaarau.ch.conf

# Enable the nginx server block.
sudo ln -s /etc/nginx/sites-available/new.jjjcaarau.ch.conf /etc/nginx/sites-enabled/new.jjjcaarau.ch.conf

# Make sure nginx is not running.
sudo service nginx stop

# Aquire an LE certificate.
sudo certbot certonly --standalone -d new.jjjcaarau.ch

# Start up nginx.
sudo service nginx start

# Remove this script from the temporary location.
rm jjjcaarau-webpage/setup-remote.sh
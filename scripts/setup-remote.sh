if (( $# != 4 )); then
    echo "Usage:"
    echo "$0 <webserver_domain> <webroot> <['staging', 'production']> [<subdomain>]"
    exit 1
fi

domain=$1 # 'the webservers servers domain'
webroot=$2
environment=$3 # ['staging', 'production']
subdomain=$4

# Move config files from the temporary scp location to their final destination.
sudo mv jjjcaarau-webpage/$domain.conf /etc/nginx/sites-available/$domain.conf

# Enable the nginx server block.
sudo ln -s /etc/nginx/sites-available/$domain.conf /etc/nginx/sites-enabled/$domain.conf

# Make sure nginx is not running.
sudo service nginx stop

# Aquire an LE certificate.
if [ $environment == 'production']; then
    if [ -z "$subdomain" ]; then
        sudo certbot certonly --standalone -d $domain
    else
        sudo certbot certonly --standalone -d $subdomain.$domain
    fi
else
    sudo certbot certonly --standalone -d staging.$domain
fi

# Start up nginx.
sudo service nginx start
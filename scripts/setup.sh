if (( $# != 5 && $# != 6 )); then
    echo 'Usage:'
    echo '$0 <ssh_server> <ssh_user> <webserver_domain> <webroot> <[staging, production]> [<subdomain>]'
    exit 1
fi

set -x

server=$1 # 'some_random_ssh_host'
user=$2 # 'some_random_ssh_user'
domain=$3 # 'the webservers servers domain'
webroot=$4
environment=$5 # ['staging', 'production']
subdomain=$6

setup_remote='server_setup'

case $environment in
staging | production)
    ssh -t deploy@$server "mkdir -p $setup_remote"
    if [ "$environment" == "staging" ]; then
        conf="staging.$domain"
    elif [ "$environment" == "production" ]; then
        conf="$domain"
    else
        echo "This is a bug".
        exit 1
    fi
    scp scripts/$conf.conf scripts/setup-remote.sh deploy@$server:$setup_remote
    ssh -t deploy@$server "/bin/bash $setup_remote/setup-remote.sh $domain $webroot $environment $subdomain"
    ssh -t deploy@$server "rm -rf $setup_remote"
    ;;
full)
    ssh -t deploy@$server "mkdir -p $setup_remote"
    scp scripts/$domain.conf scripts/staging.$domain.conf scripts/setup-remote.sh deploy@$server:$setup_remote
    ssh -t deploy@$server "/bin/bash $setup_remote/setup-remote.sh $domain $webroot production $subdomain"
    ssh -t deploy@$server "/bin/bash $setup_remote/setup-remote.sh $domain $webroot staging $subdomain"
    ssh -t deploy@$server "rm -rf $setup_remote"
    ;;
*)
  echo "$4 is not a valid environment"
  ;;
esac
ssh -t deploy@new.jjjcaarau.ch 'mkdir -p jjjcaarau-webpage'

scp scripts/new.jjjcaarau.ch.conf scripts/setup-remote.sh deploy@new.jjjcaarau.ch:jjjcaarau-webpage

ssh -t deploy@new.jjjcaarau.ch '/bin/bash jjjcaarau-webpage/setup-remote.sh'
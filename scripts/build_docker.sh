if (( $# != 1 )); then
    echo "Usage:"
    echo "$0 <docker_file_root>"
    exit 1
fi

docker \
build \
-t jjjcaarau-webpage \
$1
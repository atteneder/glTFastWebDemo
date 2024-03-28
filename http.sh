#!/bin/sh

# Brotli compression support
params="-b"

# https support
if [ -f ~/.ssh/cert.pem ] && [ -f ~/.ssh/key.pem ]; then
    echo "HTTPS with global certificates"
    params="$params -S -C ~/.ssh/cert.pem -K ~/.ssh/key.pem"
elif [ -f cert.pem ] && [ -f key.pem ]; then
    echo "HTTPS with local certificates"
    params="$params -S"
fi

echo $params
http-server $params

# This one supports multithreading via COOP and stuff
# npx statikk --port 8000 --coi

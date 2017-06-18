#!/bin/sh

height_arg=$1
height=$2

cd `dirname $0`
cd cts_node
osascript -e "tell application \"Terminal\" to set normal text color of window 1 to {35583, 57087, 65535}"
osascript -e "tell application \"Terminal\" to set background color of window 1 to {2815, 4351, 6655}"
echo "Fetching dependencies..."
npm install
if [[ -n "$height_arg" && ("$height_arg" == "--height" || "$height_arg" == "-h") && -n "$height" ]]; then
	printf "\e[8;$2;80t"
    echo "Starting CTS with screen height $height..."
    node index.js -h $height
else
	printf "\e[8;24;80t"
    echo "Starting CTS..."
    node index.js
fi
cd ..
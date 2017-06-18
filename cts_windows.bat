SETLOCAL ENABLEDELAYEDEXPANSION
echo off
set height_arg=%1
set height=%2
set defaultHeight=24

IF defined height_arg (
	IF !height_arg! == --height (
		echo is --height
		IF DEFINED height (
			SET tempHeight=!height!
			
		)
	)

	IF !height_arg! == -h (
		echo is --h
		IF DEFINED height (
			SET tempHeight=!height!
		)
	)
)

color 0B

IF DEFINED tempHeight (
	mode con: cols=80 lines=!tempHeight!
) ELSE (
	mode con: cols=80 lines=%defaultHeight%
)

cd cts_node
echo Fetching dependencies...
call npm install

IF DEFINED tempHeight (
	echo Starting CTS with screen height !tempHeight!...
	call node index.js -h !tempHeight!
) ELSE (
	echo Starting CTS...
	call node index.js
)

cd ..
color
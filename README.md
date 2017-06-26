```
             ___   ___   _   _   ___     _     ___    ___   ___ 
            / __| | _ \ | | | | / __|   /_\   |   \  | __| | _ \
           | (__  |   / | |_| | \__ \  / _ \  | |) | | _|  |   /
            \___| |_|_\  \___/  |___/ /_/ \_\ |___/  |___| |_|_\
  _______  _____             _   _   _____  _____    ____   _____  _______ 
 |__   __||  __ \     /\    | \ | | / ____||  __ \  / __ \ |  __ \|__   __|
    | |   | |__) |   /  \   |  \| || (___  | |__) || |  | || |__) |  | |   
    | |   |  _  /   / /\ \  | . ` | \___ \ |  ___/ | |  | ||  _  /   | |   
    | |   | | \ \  / ____ \ | |\  | ____) || |     | |__| || | \ \   | |   
    |_|   |_|  \_\/_/    \_\|_| \_||_____/ |_|      \____/ |_|  \_\  |_|   
         _____  ____ __  ___ __  __ __     ___   ______ ____   ____ 
        / ___/ /  _//  |/  // / / // /    /   | /_  __// __ \ / __ \
        \__ \  / / / /|_/ // / / // /    / /| |  / /  / / / // /_/ /
       ___/ /_/ / / /  / // /_/ // /___ / ___ | / /  / /_/ // _, _/ 
      /____//___//_/  /_/ \____//_____//_/  |_|/_/   \____//_/ |_|  

Text-based hauling companion for Star Citizen v2.6.3 by SteveCC
```  

For questions, feedback, and discussion, check out the [CTS discord](https://discord.gg/HABqM8E).

* [About](#about)
* [Instructions](#instructions)
* [How to play](#how-to-play)
* [Media](#media)
* [FAQ](#faq)
* [Version history](#version-history)
* [Credits](#credits)

# About

## CTS on YouTube
For an introduction to CTS, as well as an installation guide and tutorial videos, check out the [YouTube playlist](https://www.youtube.com/playlist?list=PLh8DS9twpRSCsP-uFNloe9ZDkonpI_7ZC).

## What
Crusader Transport Simulator is a text-based companion for Star Citizen cargo hauling, which you can play either standalone or alongside Star Citizen's Persistent Universe. Get randomly generated contracts from job boards, quantum travel to destinations around Crusader, rendezvous and dock with imaginary ships to load and offload imaginary cargo, land at stations to load and offload said cargo, earn a payout based on the distance you moved the cargo and how much you moved, and a bonus if you delivered it on time. Use the UEC you earn to "buy" the ships you already own (or ones that you don't, if you want to pretend your Aurora is a Caterpillar).

The thin plot justification is this: Crusader and Olisar are getting too dangerous (due to terrorism, marauders, pirates, 'accidental' collisions, Crusader Security being understaffed) and the major insurers jacked up the rates for the big shipping companies to insure their cargo. That's where you come in: there's money to be made by meeting transport ships in deep space where they're less likely to get blown up, and ferrying their cargo around Crusader. Plus, the stations around Crusader also need their regular shipping needs taken care of too. Contracts are randomly generated: deliver ship scrap from Cry-Astro to Dumper's Depot, or Hurston electron guns to Drake Interplanetary supply ships on their way to Magnus.

## Why
When Alpha 2.6.3 was released, I'd been enjoying flying my Caterpillar around Crusader, taking off from and landing at the different ports, while at the same time playing a lot of American Truck Simulator. While waiting for Star Citizen Alpha 3.0, I thought I could make a quick companion script that would give me random destinations to visit with a thin justification (transport 300 SCU of widgets from Port Olisar to Grim Hex!). It took over a month, but by late March it was looking pretty good ([gfycat of v0.1](https://gfycat.com/EvergreenUnknownKudu)), although it was still fun more in theory than in practice. When 3.0's release date was announced in mid-April, I decided to do a last round of polish and release it so people could play it before 3.0 came out... which took two more months. I've always wanted to make a space trading game, and making it work alongside the Persistent Universe's wacky hijinks has been pretty satisfying (if nothing can go hilariously wrong, what's the point?).

## What's in it
* 18 ships to purchase
* 29 types of cargo to transport
* 19 employers to get contracts from
* 17 quantum locations to pick up and drop off cargo at
* 8 ports to land at or dock with

## What can I do?
* Fight with confused stowaways over opening the cargo door when you're trying to unload cargo
* Curse when someone steals your assigned landing pad at Port Olisar
* Get blown up by randos and have to pay for all the cargo that was aboard your ship
* Fly in a straight line for minutes at a time on your way to a rendezvous
* Deliver Big Benny's to Tessa
* Obsessively sort cargo into your five different Caterpillar cargo modules (_"No no, no! THIS one goes there, THAT one goes there, right?"_)
* Grind enough imaginary UEC to buy all of your ships, starting from your Aurora
* Complain to the security detail at Kareah when they demand your papers and you insist you have a critical delivery to make
* Handle CTS from the copilot seat while someone else pilots the ship (screensharing the window over hangouts or something)

## How long do I have?
CTS is set up to work within the limitations of the Star Citizen 2.6.3 Persistent Universe, and is calibrated with measured distances, quantum destinations, etc. It will no longer work as a companion when Star Citizen [Alpha 3.0](https://robertsspaceindustries.com/schedule-report) is released, currently expected for late July. Star Citizen Alpha 3.0 is planned to include cargo transportation contracts and cargo trading, among other enhancements.

# Instructions

[Watch the installation video](https://www.youtube.com/watch?v=09gATXh_SYE&list=PLh8DS9twpRSCsP-uFNloe9ZDkonpI_7ZC&index=2)

## Prerequisites
CTS is a node.js app, so you'll need to install the `node.js` javascript runtime for your platform. You can install either the "Most Users" version (currently v6.11.0) or the "Latest Features" version (currently v8.1.2). You can get the installer from https://nodejs.org/ directly, but if you're on OSX, I recommend using `homebrew` (`brew install node`). Treehouse has some great install guides for `node.js`:

**OSX** http://blog.teamtreehouse.com/install-node-js-npm-mac

and **Windows** http://blog.teamtreehouse.com/install-node-js-npm-windows

## Download
Download the zip of the latest release, from:
https://github.com/scaires/crusader-transport-sim/releases/latest
Download `Source code (zip)` or `Source code (tar.gz)`, and unzip it to the folder you want to run CTS from.

Or, if you prefer, clone the repo for the latest version: `git clone https://github.com/scaires/crusader-transport-sim.git`

## Launch
You can launch CTS by opening the script for your platform from the directory where you unzipped it:
**Windows:** `cts_windows.bat`
**OSX:** `cts_osx.command`

When you run CTS, the script will first run `npm install` to download the CTS dependencies to the `node_modules` folder, which requires an internet connection for the first time. Afterwards, it'll configure your terminal to the preferred dimensions and launch CTS. (If you want to skip the terminal window configuration and dependency installation, you can run CTS directly from the `cts_node` folder with the command `node index.js`)

## Get Star Citizen 2.6.3
If you want to play CTS alongside Star Citizen, you'll need to download and patch Star Citizen to the latest version, 2.6.3: [https://robertsspaceindustries.com/download](https://robertsspaceindustries.com/download). You'll also need an account and a ship package, if you don't already have one.

## Running CTS on the same computer as Star Citizen
You can Star Citizen in a window, and alt-tab to CTS when you need to. Star Citizen takes controller input while alt-tabbed, so if you're using a joystick or gamepad this might be convenient. (I tried writing an AutoHotkey script to make this a little easier, but the app stopped getting key commands, sadly).

## Running CTS on a Tablet
It's currently a workaround, but you can run CTS on a tablet if you can SSH or Telnet into a computer with CTS installed. See [these instructions](#can-i-run-cts-on-my-tablet-or-phone).

# How to play

These instructions assume running CTS alongside Star Citizen. For a video demonstration, check out these tutorials:

[How to play: Your first contract](https://www.youtube.com/watch?v=ckZc1t7p41w&index=3&list=PLh8DS9twpRSCsP-uFNloe9ZDkonpI_7ZC)

[How to play: Rendezvous with ships](https://www.youtube.com/watch?v=kCWEWp4-TkY&index=4&list=PLh8DS9twpRSCsP-uFNloe9ZDkonpI_7ZC)

In Crusader Transport Simulator, to simulate running a small cargo hauling company, you'll take actions in CTS alongside those in Star Citizen, earning UEC which you can spend in CTS and that's used to calculate your score. For example, to quantum to a location, you'll select the `Quantum travel` option in CTS when you initiate quantum travel in Star Citizen. To transfer cargo to your ship, you'll first open your cargo hold in Star Citizen, then in CTS, you'll select `Transfer to ship...`, and wait for the cargo to finish transferring in CTS. To purchase a ship in CTS that's on your Star Citizen account, you'll first buy the ship in CTS using your UEC, then spawn that ship from the Star Citizen ship terminals. As you complete contracts, you'll earn UEC, which you'll use to pay off your debt and purchase new ships. Note: only ships that have cargo capacity are currently included, but I'd like to add the rest.

## Quickstart

See [User Guide](GUIDE.md).

## Recovering from bugs

It happens for any number of reasons: Your client crashed, your connection was lost to the server, your ship flung you into space when you tried to EVA back in, or your accelerated on its own and slammed into Port Olisar. Respawning in CTS assumed you respawned for a valid gameplay reason rather than an error out of your control. If an error does happen, the best way to recover is to get Star Citizen back into the state it was before you encountered the error. For example, if you were loading cargo at Comm 306 and were disconnected from the server, you can relaunch Star Citizen, spawn your ship again, and head back to Comm 306 before resuming CTS. Because the save feature in CTS isn't fully implemented, however, if you need to exit at this point, your contracts won't be saved.

# Media
Note: These were composited together while running both CTS and Star Citizen in different windows.

## Videos
[What is CTS?](https://www.youtube.com/watch?v=Krcoke-Idek&index=1&list=PLh8DS9twpRSCsP-uFNloe9ZDkonpI_7ZC)

[52 minute playthrough](https://www.youtube.com/watch?v=U4tU0gxQ5ZI)

## gfycats
![https://gfycat.com/EnragedPerfumedBunting](https://thumbs.gfycat.com/EnragedPerfumedBunting-size_restricted.gif)

https://gfycat.com/EnragedPerfumedBunting

![https://gfycat.com/KnobbyCharmingAsianwaterbuffalo](https://thumbs.gfycat.com/KnobbyCharmingAsianwaterbuffalo-size_restricted.gif)

https://gfycat.com/KnobbyCharmingAsianwaterbuffalo

![https://gfycat.com/VeneratedObedientBlackwidowspider](https://thumbs.gfycat.com/VeneratedObedientBlackwidowspider-size_restricted.gif)

https://gfycat.com/VeneratedObedientBlackwidowspider

## Screenshots

![cts1splash](https://user-images.githubusercontent.com/478385/27250643-74705a32-52e9-11e7-8ff7-dd78435f1829.jpg)

![cts2contractcompletion](https://user-images.githubusercontent.com/478385/27250644-747264ee-52e9-11e7-8784-f4f346a08032.jpg)

![cts3catmodules](https://user-images.githubusercontent.com/478385/27250646-74753d40-52e9-11e7-8d29-2a8dd0064cac.jpg)

![cts4padassignment](https://user-images.githubusercontent.com/478385/27250648-74796fdc-52e9-11e7-90cc-bc5b069ea6da.jpg)

![cts5catcrusader](https://user-images.githubusercontent.com/478385/27250647-747619b8-52e9-11e7-9fb9-55d98d2520cf.jpg)

![cts6shipterminal](https://user-images.githubusercontent.com/478385/27250645-7474e516-52e9-11e7-8c97-fe929cd9f7e7.jpg)

![cts7quantumtravel](https://user-images.githubusercontent.com/478385/27250649-74882586-52e9-11e7-8639-0286196b956c.jpg)

![cts8contracts](https://user-images.githubusercontent.com/478385/27250650-74886140-52e9-11e7-9df5-057030824058.jpg)

# FAQ

### What's a good way to record or stream CTS?
I'm pretty new to both streaming and recording, but when I recorded the gameplay video, I used [OBS](https://obsproject.com/), with window capture on the Command Prompt window where CTS was running, and Star Citizen in a window. I used a Chroma Key filter with an unlikely Star Citizen color (magenta) with the opacity set to about 80%.

### Can you play CTS on its own, without also running Star Citizen?
Yes! CTS is functional as a stand-alone game, and doesn't need Star Citizen to be running. However, when making a ship rendezvous, since you can't find the distance to the quantum location in Star Citizen, you can still just enter the target distance directly.

### Can you play multiplayer?
Even though CTS is only running on one player's computer, you could use screenshare the terminal window through Hangouts or something similar, so your shipmates can see it. You could also transfer the savegame file for your company to another player to give them control.

### Can I run CTS on my tablet or phone?
Yes, if you can SSH (OSX) or Telnet (Windows) to a command prompt on a computer with CTS installed, you can use a terminal app on your device to connect to your computer, then launch CTS from the command line.

#### OSX
If connecting to an OSX machine that has CTS installed, you'll be able to connect via SSH from your tablet. You'll need to enable 'Remote Login' in the Sharing Preferences, which will also display the local IP to connect to. You'll need to connect using the login credentials for an OSX account. Using SSH from OSX/Linux is is more robust than telnet support to Windows, so there are more workable app options; I have been using Termius: [Termius for iOS (Free)](https://itunes.apple.com/us/app/termius-ssh-shell-console-terminal/id549039908?mt=8) or [Termius for Android (Free)](https://play.google.com/store/apps/details?id=com.server.auditor.ssh.client)).

![SSH/iOS CTS Screenshot](https://user-images.githubusercontent.com/478385/27258609-8c4b2c5c-53b3-11e7-9bdb-a5fc2130dacb.jpg)

#### Linux
I haven't tried connecting to a Linux computer, but I imagine it would be similar to the OSX setup and that SSH would be preferred.

#### Windows
If connecting to a Windows machine, you can configure and start a Telnet server ([Instructions](https://technet.microsoft.com/en-us/library/cc732046(v=ws.10).aspx)), then connect to it with an app on your device. The only one I've found on iPad that displays CTS running on a Windows server correctly is [iTerminal (Free)](https://itunes.apple.com/us/app/iterminal-ssh-telnet-client/id581455211), though it's not ideal (only about half the screen is visible if the keyboard is up, and there's no portrait support). The upside is, however, that you can serve CTS off of the same computer you're running Star Citizen from.

![Telnet/iOS CTS Screenshot](https://user-images.githubusercontent.com/478385/27303969-5a063806-54f1-11e7-96f8-ac6d2bd78f51.png)

In either case, you'll want to make sure that the folder where CTS is installed is easily accessible when you SSH into the computer, from the account you're connecting with. After you're connected, navigate to the folder where CTS is located and launch either `cts_windows.bat` or `./cts_osx.command` from the terminal. You might want a custom keyboard that has the number keys always displayed, too, if you want to avoid switching between numbers and letters for some CTS menu options. If you're playing in portrait mode, you might see a portion of the previous screen if your terminal is too tall. You can run CTS with the `--height` (or `-h`) argument, eg `./cts_osx --height 50`.

## Gameplay

### Why does time advance one hour every jump, when it's only a few seconds in game?
I wanted time to advance in a predictable way in game, and running in "real time" wasn't a realistic technical option. One jump = one hour seemed the easiest and most straightforward, and it makes route planning to complete contracts on time more interesting and less stressful ("It expires in 6 hours, how many jumps can I get there in?"). It also means the player's career can take place over the course of days, instead of minutes and hours.

### Why is there no cargo trading, and only cargo hauling?
I wanted to focus on the experience of Space Trucking, where the enjoyment is in traveling from place to place in your ship, and earning credits doing it. "Buying low and selling high" to fill a massive cargo hold seemed like it would be a letdown if it was just around Crusader and its moons, since there's only one "real" port ("You're telling me that Tessa will buy these 120 SCU of Big Benny's noodles?"). However, I am tempted to add "Captain's Cargo" in the future, small amounts of off-market goods on the order of a handful of SCU, for you to buy and sell (and maybe smuggle) to make a little money on the side.

### My ship is buggy! Do I really need to open the hold every time I transfer cargo?
It's only a suggestion to help with the immersion - if it's a pain, don't do it, (or just leave the doors open, or enlist a friend to be on Door Duty). For example, when you get out of your seat, the Freelancer spins uncontrollably, the Caterpillar might fling you into space, the Avenger puts your head through the ceiling, etc.

### Where are the other flyable Star Citizen ships?
I wanted to get all the ships that had cargo capacity in first. I'd like to add the others in an update, for folks that want to grind their way to a Super Hornet.

### What's up with these SCU values and prices?
Most of the SCU values are the rounded down values from the [Hull B Q&A](https://robertsspaceindustries.com/comm-link/transmission/14684-Hull-B) for those that existed at the time, with some exceptions. I didn't know the Starfarer's internal volume, so I [estimated](https://youtu.be/vvUBEYD6ik0?t=200) it from the size of the four cargo pads to be 160 on each, for a total of 640. It seems like the Q&A value for the Freelancer didn't include the secondary hold, so I added an extra 8 SCU onto it. Even though the ships with external cargo boxes, like the Aurora, have a smaller internal volume of those boxes, the external value was used for simplicity. As for prices, even though the eventual UEC ship prices aren't going to scale 1:1 with their store value, I used USD * 1000 (or, REC / 10) across all ships for consistency, and to keep the grind more manageable.

### Why does the Reliant Kore have 15 SCU instead of 30? or 6?
The Reliant's stats page shows a likely incorrect value of 30 SCU; it's been suggested that mistakenly, the size of the bay in cubic meters was used, since there's no way the internal volume can hold 30 SCU (which are 1.98 cubic meters each, giving a theoretical capacity of 15 SCU if you completely filled it). However, [ATV 3.5](https://youtu.be/vvUBEYD6ik0?t=223) showed a cargo pad capacity of only 6 SCU (4 x 1 SCU and 16 x 1/8 SCU), likely because the walkway can't be blocked since it's the only way to enter and exit the ship. It felt weird, though, to cripple the Reliant by giving it only 6 SCU, especially since some folks originally assumed that it held 30! The handwavey compromise for CTS was to assume players could fill the entire theoretical interior with 15 SCU, which gives the Reliant a still-useful capacity.

## Technical

### I can see a portion of the previous screen; my terminal is too tall!
In some cases, like if you're playing in portrait mode on a tablet, you may be unable to resize your terminal window, and a portion of the previous screen will display. If this is the case, you can run CTS with the `--height` (or `-h`) argument, eg `./cts_osx --height 50`

### Why isn't this running in a browser? Why is it a Node.js app?
When I started this project, I wanted it to be a web app, but since I don't know much web programming, I wanted to prototype it quick and dirty with a text based interface. I found [readline-sync](https://github.com/anseki/readline-sync), which handles text-based numerical menus intended for things like server configuration, but worked perfectly for the prototype. I kept adding to it, and eventually realized that to convert it to a web-app I'd have to rewrite most of it, and then it probably wouldn't come out before 3.0 did.

### What's this `node-gyp` error during installation?
One of the dependencies, `deasync`, that controls the sleep function, needs to be natively compiled on each platform. NPM (Node Package Manager) should be able to find these binaries (it should have them for Windows and OSX), but if it doesn't, `node-gyp` will try to compile one. `node-gyp` needs Python 2.7 to run, and command-line compilation tools for your platform, which on OSX means [XCode](https://developer.apple.com/xcode/), and on Windows, means [Visual C++ Build Tools, 2015, probably](http://landinghub.visualstudio.com/visual-cpp-build-tools). This *shouldn't* happen, but if it does, let me know! You can find more information about `node-gyp` [here](https://github.com/nodejs/node-gyp).

# Version history

## v1.0.0c (6/26/2017)
* Added Discord link to main menu
* Updated Readme

## v1.0.0 (6/19/2017)
* Initial Release

# Credits

by Steve Caires (RSI: SteveCC)

Feedback and updates: https://github.com/scaires/crusader-transport-sim

### Thanks to:

AGTMADCAT

Alysianah Noire\'s World of Star Citizen

Anseki's readline-sync

Antagonist

AstroNavis Merchant Advanced board game

Drake Interplanetary Ship Designer Josh C.

Elijah Rockseeker

Harlock Space Pirate

Litauen's Star Citizen Blueprints

Nintendoskeleton

/r/starcitizen

Roberts Space Industries

SCS Software

Shoklar\'s Starmaps

StarCitizenDB

StarCitizen.tools

The fine folks of the (now retired) Drake Caterpillar Shipyard subforums

Xena and Ichi <3

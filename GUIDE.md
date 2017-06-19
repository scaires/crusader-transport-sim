# Crusader Transport Simulator User Guide

## Quickstart

* [Starting a game](#starting-a-game)
* [Purchasing and requesting a ship](#purchasing-and-requesting-a-ship)
* [Accepting a contract and picking up cargo](#accepting-a-contract-and-picking-up-cargo)
* [Quantum travel](#quantum-travel)
* [Landing at a port](#landing-at-a-port)
* [Rendezvousing with a ship](#rendezvousing-with-a-ship)
* [Delivering cargo and completing contracts](#delivering-cargo-and-completing-contracts)
* [Refueling, repairs and insurance](#refueling-repairs-and-insurance)
* [Respawning](#respawning)
* [Saving and exiting](#saving-and-exiting)
* [Success, failure, and scoring](#success-failure-and-scoring)

### Starting a game

Launch Star Citizen, select `Universe`, then load the Persistent Universe (Crusader). In CTS, from the main menu, start a new Career game, and choose the amount of your starting loan. Ship prices are USD * 1000, but you'll only need a 20% down payment to purchase one. For example, the minimum down payment for a 20,000 UEC Aurora is 4,000 UEC, while the minimum down payment for a Caterpillar is 59,000 UEC. When you spawn (Star Citizen), tell CTS which location you spawned at (Port Olisar or Grim Hex), and if Port Olisar, which strut you're at.

### Purchasing and requesting a ship

You start at port after spawning. Navigate to `Ship terminals -> Purchase ship... -> [Ship name] -> Purchase ship` and select the amount of your down payment. You may wish to purchase one of the ships that's on your account, to match the ship the ship you requisition in game. Spawn your ship from the Ship Terminals (Star Citizen), and select `Request ship from hangar` (CTS) and enter the landing pad your ship spawned at. Select `Enter ship` when you enter your ship (Star Citizen).

### Accepting a contract and picking up cargo

You can only accept contracts from the port you're currently landed at. Select `Contracts -> Available contracts -> Port Olisar Admin Office -> [Contract name] -> Accept` (if at Olisar) to accept your first contract. Note the pickup and dropoff locations; deliveries to and from Port Olisar may be on a different strut than you're currently on. Unless you accepted a contract originating from the port you're located at, you'll need to navigate to the pickup location first. Once you're at the pickup location, select `Cargo -> [Port Name] -> [Cargo name] -> Transfer from [Port name]` (CTS) and select the number of containers you want to transfer with the `A` and `D` keys, then hit `Space` to confirm. For ships with internal cargo, open the cargo hold (Star Citizen). Lastly, confirm you want to transfer the cargo (CTS), and wait for the transfer to complete. You can accept a contract that requires more SCU capacity than your ship currently has, but note that you'll need to complete it in multiple trips. All contracts have an expiry time listed in hours; if the contract is not fully delivered by then, you won't receieve the 'on-time' bonus, but will still receive the base payout.

### Quantum travel

After taking off (`Take off from [Pad name]` (CTS)), select `Navigation -> Quantum Destinations -> [Destination name]` (CTS) to set your destination, then when you initiate Quantum Travel (Star Citizen), select `Quantum travel to [destination name]` (CTS). Some quantum locations are obstructed. To reach them, you'll need to travel to another quantum location first. To travel to a location with `(via)` in the name, such as `Crusader (via Comm 126)`, you first need to travel to Comm 126, then from there to Crusader; that will put you at location of the ship you're rendezvousing with. Each quantum jump advances time by one in-game hour.

### Landing at a port

To land at a port, select `Navigation -> Port Name`, then answer `Y` or `N` to whether you want a landing pad automatically assigned. You will only be automatically assigned pads that are the correct size for your ship, but you can manually land on a pad that's not the correct size (eg: technically, Pad 02 at Grim Hex is a size 4 pad only, but you can still barely fit a Caterpillar or Starfarer on it). If there's no acceptable pad for your ship type, you'll be assigned a tender; stop your ship in space at 5km or less from the port and wait for the tender to arrive. To land at a pad, when you land your ship on the pad (Star Citizen), select `Land at [Pad name]` (CTS) to tell CTS that you've landed. Then, select `Cargo` to access the port's cargo.

### Rendezvousing with a ship

The ships you need to rendezvous with are located in space around the Comm Arrays. All ships are located at a distance from your current location (usually a comm array), in the direction of another quantum location. You'll know you've reached the rendezvous location when the distance to the other quantum location is the target amount. When you reach the quantum location, select `Navigation -> [Ship name]` (CTS), be within 5km of the quantum location you're traveling from (Star Citizen), align to the quantum location you're traveling to (Star Citizen), move towards it until you're about the target distance away and stop your ship (Star Citizen). 

`[Comm 556] -> 75km -> [Moldy Falcon (Origin 315p)] -> 115231km -> [Comm 472]`.

For example, to rendezvous with the Moldy Falcon, first travel to Comm 556, get within 5km of it (quantum travel puts you about 5km from Comm Arrays), point your ship towards Comm 472, travel 75km, and stop when the distance to Comm 472 is about 115,231km.

Then, select `Rendezvous with [Ship name]` and enter in the current distance to the target quantum location (CTS). Ensure your speed is 0m/s (Star Citizen), select `Dock with [Ship name]` to dock, then select `Cargo` to access the ship's cargo (CTS). The further you are from the target rendezvous point, the longer you'll need to wait for the ship to reach you before you can dock.

### Delivering cargo and completing contracts

To deliver cargo, once you're docked with a ship or landed at a port, select `Cargo -> [Cargo name] -> Transfer to [Port or ship name]` , then select the number of containers you want to transfer with the `A` and `D` keys, then hit `Space` to confirm. For ships with internal cargo, first open the cargo hold (Star Citizen). Lastly, confirm you want to transfer the cargo (CTS), and wait for the transfer to complete. Before delivering cargo, make sure that the destination in the cargo details matches the ship or port you're at! After transferring cargo, select `Contracts -> [Contract name] -> Complete`. If you completed the contract at or before it expired, you'll receive the on-time bonus as well. If any of the cargo was picked up but not delivered (eg, your ship was destroyed), you can still complete the contract, but you'll have to pay for the cargo that was lost, at a rate equal to what you would have earned for that cargo had it been delivered.

### Refueling, repairs and insurance

Currently, CTS doesn't have any costs for refueling, repairing, or paying to replace your ship. These costs are incurred only in Star Citizen, and must be paid with the 'alpha UEC' that you've earned there. For gameplay purposes, think of it as a legal separation between your personal and company assets.

### Respawning

If you need to respawn for a valid gameplay reason (eg, your ship was destroyed or damaged, or you were killed by another player, or lost in space), select `Respawn` (CTS). Time will advance 24 hours, and all your current contracts will be abandoned. (Presumably, you're being picked up by Search & Rescue and all your contracts expired). You'll be fined for any lost cargo, but will not need to pay anything to replace your ship. If you needed to respawn from a bug, see [Recovering from bugs](README.md#recovering-from-bugs).

### Saving and exiting

Currently, the save feature only saves your ships and company details; it does not currently save your contracts. When you save and exit, your currently accepted contracts will be abandoned. If any of the cargo for those contracts has been picked up but not delivered, you'll be fined for it. Note: In a future release, I'd like save games to save your contracts as well to avoid this!

### Success, failure, and scoring

In a career game, you need to pay back your initial loan by the end of the payback period, have at least one ship and a positive score, or your game will end. Your score is calculated from your net worth (credits + ship value - debt), cargo you've delivered to and from Crusader, and contracts you've completed for Crusader Industries or Crusader Security. If you succeed, you'll be able to keep playing, but if you fail, your game will end. In either case, your score and company report will be saved to `Top Companies` from the main menu.
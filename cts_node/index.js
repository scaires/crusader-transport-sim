// index.js

var data = require('./data');
var map = require('./map');
var quantum = require('./quantum');
var shipType = require('./shiptype');
var shipcontact = require('./shipcontact');
var port = require('./port');
var jobboard = require('./jobboard');
var journal = require('./journal');
var landingPad = require('./landingpad');
var menu = require('./menu');
var container = require('./container');
var commodities = require('./commodities');
var contract = require('./contract');
var metacontract = require('./metacontract');
var cargohold = require('./cargohold');
var logo = require('./logo');
var random = require('./random');
var store = require('./store')('saves');
var scores = require('./store')('scores');
var breakConsole = require('./breakConsole')(80);
var sleep = require('system-sleep');
var readlineSync = require('readline-sync');
var moment = require('moment');
const argv = require('yargs').argv

var SCREEN_MIN_HEIGHT = 24;
var SCREEN_CLEAR_LINES = SCREEN_MIN_HEIGHT;

if (argv.h > SCREEN_MIN_HEIGHT) {
  var SCREEN_CLEAR_LINES = argv.h;
}

var CANCEL_STRING = "Back";

var CTS_VERSION_NAME = "1.0.0";
var CTS_VERSION_ORDINAL = 10000;
var CTS_MIN_SAVE_VERSION_ORDINAL = 10000;
var STAR_CITIZEN_VERSION_NAME = "2.6.3"

var MAX_SAVES = 9;
var MAX_CONTRACTS = 12;
var MAX_SHIPS = 12;
var MAX_CARGO_CONTRACTS = 12;
var MAX_HIGH_SCORES = 10;

MIN_RENDEZVOUS_DISTANCE_KM = 10;

var clearScreen = function() {
	for (var i = 0; i < SCREEN_CLEAR_LINES; i++) {
		console.log('');
	};
	console.log('------------------');
}

var keyInPause = function() {
	readlineSync.keyIn("Continue... (Hit space)", {
	    limit:              " ",
	    // -------- forced
	    hideEchoBack:       true,
	    mask:               ''
	  });
}

var keyInYNBack = function(query) {
	var result = readlineSync.keyInYN(query + " [y/n] or [0] (Back):", {guide:false});
	if (result == '' && typeof result !== 'boolean') {
		return -1;
	} else {
		return result;
	}
}

var displayTimeout = function(times) {
	for (var i = 0; i < times; i++) {
		console.log('.');
		sleep(750);
	}
}

var travelToDestination = function(destination) {
	if (destination.type == "quantum") {
		quantumTravelWithMap(data.player.destination.id);
		if (destination.distance_km >= 1000) {
			incrementTick();
		}
		data.player.destination = null;
	} else if (destination.type == "landingpad") {
		if (data.ship.landing_pad_location_id != null) {
			takeOff(destination.id);
			data.player.destination = null;
		} else {
			landAt(destination.id);
		}
	} else if (destination.type == "tender") {
		if (data.ship.landing_pad_location_id != null) {
			undockFromTender(destination.id);
			data.player.destination = null;
		} else {
			dockToTender(destination.id);
		}
	
	} else if (data.player.destination.type == "shipcontact") {
		if (data.ship.docked_shipcontact_id != null) {
			undockFrom(destination.id);
			data.player.destination = null;
		} else {
			dockTo(destination.id);
		}
	} else if (data.player.destination.type == "rendezvous") {
		rendezvousWith(destination);
	}
}

var quantumTravel = function(locationId) {
	console.log('------------------');
	console.log('Traveling to ' + quantum.quantumIdToLocation(locationId))
	displayTimeout(3);
	data.player.quantum_location_id = locationId;
	data.ship.quantum_location_id = locationId;
}

var landAt = function(locationId) {
	console.log('------------------');
	console.log('Landing at ' + landingPad.landingPadIdToLocation(locationId))
	displayTimeout(3);
	data.ship.landing_pad_location_id = locationId;
}

var takeOff = function(locationId) {
	console.log('------------------');
	console.log('Taking off from ' + landingPad.landingPadIdToLocation(locationId))
	displayTimeout(3);
	data.ship.landing_pad_location_id = null;
}

var dockToTender = function(locationId) {
	console.log('------------------');

	var confirmStopped = readlineSync.keyInYNStrict("Confirm that ship speed is 0m/s?", {guide:true});

	if (!confirmStopped) {
		clearScreen();
		return;
	}

	console.log('------------------');

	var tenderTimeout = random.randomIntInRange(15,30);

	var confirmDocking = readlineSync.keyInYNStrict("Dock with tender? It will take " + tenderTimeout + " seconds to arrive.", {guide:true});

	if (confirmDocking) {
		console.log('------------------');
		console.log('Waiting for ' + landingPad.landingPadIdToLocation(locationId));
		displayTimeout(tenderTimeout);
		console.log('------------------');
		console.log('Docking with ' + landingPad.landingPadIdToLocation(locationId));
		displayTimeout(3);
		data.ship.landing_pad_location_id = locationId;
	} else {
		clearScreen();
	}
}

var undockFromTender = function(locationId) {
	console.log('------------------');
	console.log('Undocking from ' + landingPad.landingPadIdToLocation(locationId))
	displayTimeout(3);
	data.ship.landing_pad_location_id = null;
}

var dockTo = function(shipContactId) {
	console.log('------------------');
	var confirmStopped = readlineSync.keyInYNStrict("Confirm that ship speed is 0m/s?", {guide:true});

	if (!confirmStopped) {
		clearScreen();
		return;
	}

	console.log('------------------');
	console.log('Docking with ' + shipcontact.shipContactIdToShipContact(shipContactId))
	displayTimeout(3);
	data.ship.docked_shipcontact_id = shipContactId;
}

var undockFrom = function(shipContactId) {
	console.log('------------------');
	console.log('Undocking from ' + shipcontact.shipContactIdToShipContact(shipContactId))
	displayTimeout(3);
	data.ship.docked_shipcontact_id = null;
}

var rendezvousWith = function(rendezvous) {
	var rendezvousQuantumLocation = quantum.quantumIdToLocation(rendezvous.quantum_destination_id);

	console.log('------------------');
	var distance_current = readlineSync.questionFloat("Enter the distance (in km) to " + rendezvousQuantumLocation + ": ", {limit: '$<0-9>'});
	var distance_from_rendezvous = Math.abs(distance_current - rendezvous.distance_from_dest);
	distance_from_rendezvous = Math.round(distance_from_rendezvous);
	_shipContact = shipcontact.shipContactIdToShipContact(rendezvous.shipcontact_id);

	if (distance_from_rendezvous > MIN_RENDEZVOUS_DISTANCE_KM) {
		console.log('------------------');
		console.log('Cannot rendezvous with ' + _shipContact + ".\nYou must be " + MIN_RENDEZVOUS_DISTANCE_KM + "km or less from the rendezvous point.")
		displayTimeout(3);
	} else {
		_shipType = shipType.shipIdToShip(_shipContact.type_id);

		var shipTimeout;
		var scmTimeout;
		var topTimeout;
		if (distance_from_rendezvous == 0) {
			shipTimeout = 0;
		} else if (distance_from_rendezvous <= 1) {
			scmTimeout = ((distance_from_rendezvous * 1000.0) / _shipType.scm_speed);
			topTimeout = 0;
			var randomFloat = random.randomNumberInRange(-1, 1);
			shipTimeout = Math.round(randomFloat + scmTimeout);
			// console.log("dr: " + distance_from_rendezvous + " scm: " + scmTimeout + " top: " + topTimeout + " rn: " + randomFloat + " st: " + shipTimeout + " rn2: " + random.randomIntInRange(0, 5));
		} else {
			// Ship travels at SCM for the last kilometer, but top speed up until that (handwaving away deceleration).
			scmTimeout = ((1000.0) / _shipType.scm_speed);
			topTimeout = (((distance_from_rendezvous - 1) * 1000.0) / _shipType.top_speed);
			var randomFloat = random.randomNumberInRange(-1, 1);
			shipTimeout = Math.round(randomFloat + scmTimeout + topTimeout);
			// console.log("dr: " + distance_from_rendezvous + " scm: " + scmTimeout + " top: " + topTimeout + " rn: " + randomFloat + " st: " + shipTimeout + " rn2: " + random.randomIntInRange(0, 5));
		}

		console.log('------------------');
		if (shipTimeout == 0) {
			console.log("You have arrived at " + _shipContact + "\'s location.");
		} else {
			console.log("" + _shipContact + " will take " + shipTimeout + " seconds to arrive, traveling " + distance_from_rendezvous + "km.");
		}
		var confirmDocking = readlineSync.keyInYNStrict("Rendezvous?", {guide:true});

		if (confirmDocking) {
			if (shipTimeout > 0) {
				console.log('------------------');
				console.log('Waiting for ' + _shipContact);
				displayTimeout(shipTimeout);
			}
			setDestination(_shipContact.shipContactDestination);
			console.log('------------------');
			console.log('Ready to dock with ' + _shipContact)
			displayTimeout(3);
		} else {
			clearScreen();
		}
	}
}

var quantumTravelWithMap = function(locationId) {
	console.log('------------------');
	console.log('Traveling to ' + quantum.quantumIdToLocation(locationId))
	displayTimeout(3);
	clearScreen();
	map.showCrusaderMap(data.player.quantum_location_id);
	sleep(500);
	clearScreen();
	map.showCrusaderMap("");
	sleep(500);
	clearScreen();
	map.showCrusaderMap(data.player.quantum_location_id);
	sleep(500);
	clearScreen();
	map.showCrusaderMap("");
	sleep(500);
	clearScreen();
	map.showCrusaderMap(data.player.quantum_location_id);
	sleep(250);
	clearScreen();
	map.showCrusaderMap("");
	sleep(250);
	clearScreen();
	map.showCrusaderMap(data.player.quantum_location_id);
	sleep(250);
	clearScreen();
	map.showCrusaderMap("");
	sleep(250);
	clearScreen();
	map.showCrusaderMap(data.player.quantum_location_id);
	sleep(250);
	clearScreen();
	map.showCrusaderMap("");
	sleep(750);
	clearScreen();
	map.showCrusaderMap(locationId);
	sleep(500);
	clearScreen();
	map.showCrusaderMap("");
	sleep(500);
	clearScreen();
	map.showCrusaderMap(locationId);
	data.player.quantum_location_id = locationId;
	data.ship.quantum_location_id = locationId;
	sleep(500);
	keyInPause();
}

var setDestination = function(quantumDestination) {
	data.player.destination = quantumDestination;
}

var showCompanyLog = function(_journal) {
	// Company name, date, day x/x
	console.log(_journal.name + ", " + _journal.dateString() + ((_journal.hasEnded() && !_journal.isSandbox) ? " (Final Report)" : (" (" + _journal.elapsedDayString() + ")")));
	console.log("");

	var scoreObj = null;

	if (_journal.hasEnded() && !_journal.isSandbox) {
		scoreObj = _journal.score;
	} else {
		scoreObj = _journal.updatedScore();
	}

	if (!_journal.isSandbox) {
		if (!_journal.hasEnded()) {
			console.log("Success criteria at the end of day " + _journal.endDay() + ":\nYou have a ship, your starting loan is repaid and your score is positive.");
		} else {
			if (_journal.isVictory()) {
				console.log("SUCCESS: You met the conditions of your loan.");
			} else {
				if (scoreObj.credits_spent_debt < scoreObj.debt_initial && scoreObj.ownedShips == 0) {
					console.log("FAILURE: You did not repay your loan in time and did not have a flyable ship.");
				} else if (scoreObj.ownedShips == 0) {
					console.log("FAILURE: You did not keep at least one flyable ship.");
				} else if (scoreObj.credits_spent_debt < scoreObj.debt_initial) {
					console.log("FAILURE: You did not repay your loan in time.");
				} else {
					console.log("FAILURE: Your score was not positive.");
				}
			}
		}
		console.log("  Debt repaid: " + scoreObj.credits_spent_debt + "/" + scoreObj.debt_initial + " UEC,  Number of ships: " + scoreObj.ownedShips);	
		console.log("");
	}

	console.log("Score:");
	console.log("  Net worth: " + scoreObj.netWorthScore + " pts (" + scoreObj.credits + " UEC + " + scoreObj.shipSellValue + " ship value - " + scoreObj.debt + " debt)");
	console.log("  SCU delivered to/from Crusader: " + scoreObj.crusaderScuScore + " pts (" + scoreObj.crusaderScu + " SCU x " + journal.multiplier_score_scu + " pts)");
	console.log("  Contracts completed for Crusader Ind/Sec: " + scoreObj.crusaderContractsScore + " pts (" + scoreObj.crusaderContracts + " contracts x " + journal.multiplier_score_contracts + " pts)");
	console.log("Total: " + scoreObj.totalScore + " pts");
	console.log('------------------');
	console.log("Company history:");
	console.log("  Contracts:");
	console.log("    Completed (" + _journal.completed_contract_count + "), Abandoned (" + _journal.abandoned_contract_count + "), SCU delivered (" + _journal.delivered_scu_count + ")");
	console.log("  Credits earned: " + _journal.creditsEarned() + " UEC");
	console.log("    Loan (" + _journal.credits_history.credits_initial + "), Contracts (" + _journal.credits_history.credits_earn_contract + "), Ship sales (" + _journal.credits_history.credits_earn_ship_sale + ")");
	console.log("  Credits spent: " + _journal.creditsSpent() + " UEC");
	console.log("    Ship purchases (" + _journal.credits_history.credits_spent_ship + "), Debt repaid (" + _journal.credits_history.credits_spent_debt + ")");
	console.log("  Debt added: " + _journal.debtAdded() + " UEC");
	console.log("    Loan (" + _journal.debt_history.debt_initial + "), Lost cargo (" + _journal.debt_history.debt_add_contract + "), Ships (" + _journal.debt_history.debt_add_ship + "), Interest (" + _journal.debt_history.debt_add_interest + ")");
	console.log("");
}

var startGameDialog = function() {
	clearScreen();

	breakConsole.log("\nCrusader, Stanton System, " + data.player.journal.dateStringShort());
	console.log();
	console.log('------------------');
	console.log();
	keyInPause();
	clearScreen();

	breakConsole.log("\n\"After a particularly deadly quarter in Crusader, with an unprecedented degree of ship collisions, suspected " +
		"terrorism, and piracy, major insurer 'LifeTime Intergalactic' has declared Crusader 'too dangerous' for coverage under their basic " +
		"corporate transport policies. Starting next month, all policyholders operating in Crusader will need to purchase supplementary high risk " +
		"coverage or risk voiding their policies.\"");
	console.log("\n  - Spectrum Dispatch, 4/24/2947");
	console.log();
	console.log('------------------');
	console.log();
	keyInPause();
	clearScreen();

	breakConsole.log("\n\"Covalex Shipping today declared an indefinite pause on operations at Crusader, citing the fallout from the " +
		"catastrophic industrial accident at their 'Gundo' shipping hub. However, many suspect this pause is due to the heavy losses that their " +
		"shipping fleet has sustained due to piracy in recent months, chiefly from the Nine Tails organization.\"");
	console.log("\n  - Spectrum Dispatch, 5/16/2947");
	console.log();
	console.log('------------------');
	console.log();
	keyInPause();
	clearScreen();

	breakConsole.log("\n\"More bad news for Crusader Industries, which experienced their second-deadliest day in 2947 today. " +
		"A fully loaded Starfarer collided with Port Olisar's troubled \'D\' strut, " +
		"shearing off its starboard fuel tanks and pinning four RSI Auroras from a local vintage ship meetup group under the wreckage. Seventeen pilots and a " +
		"group of twenty Orison students on a classroom field trip were among the 39 deaths due to decompression, fire, and major trauma. The last transmission " +
		"Olisar Traffic Control received before the accident suggests pilot error was a factor. \'Left... left, alrght, brake... NO [garbled], " +
		"that's BOOST you idiot! [loud noise] I hope there there\'s nobody in that Freelancer-[End of transmission]\'.\"");
	console.log("\n  - Spectrum Dispatch, 5/27/2947");
	console.log();
	console.log('------------------');
	console.log();
	keyInPause();
	clearScreen();

	breakConsole.log("\n\"Representatives from Crusader Security acknowledged today that their response to the piracy boom near Crusader has " +
		"been lacking, but that once their 'Kareah' post is fully staffed and operational, they will once again guarantee pre-crisis response " + 
		"times. 'Citizens clamoring for UEE intervention are misguided. Calls such as these threaten our freedom from government interference " + 
		"in the Stanton system. I would like to reiterate that further violent acts will be met by the swiftest possible response from Crusader " +
		"Security.'\"");
	console.log("\n  - Spectrum Dispatch, 6/05/2947");
	console.log();
	console.log('------------------');
	console.log();
	keyInPause();
	clearScreen();

	breakConsole.log("\n\"Food shortages on Orison, Crusader's largest floating city, have reached critical levels this week, as the last major " +
		"Stanton-based shipper operating in Crusader, United Priority Solutions, has halted shipments to and from the planet citing fleet-wide maintenance issues. " +
		"When pressed for comment, the chief executive expressed sympathy for those undergoing the seventh straight week of rationing.\"");
	console.log("\n  - Spectrum Dispatch, 06/10/2947");
	console.log();
	console.log('------------------');
	console.log();
	keyInPause();
	clearScreen();

	breakConsole.log("\nAfter spending several years as the first officer on an ore freighter, you're still short several hundred thousand " +
		"credits for the Trade and Development Division operating permits needed to start your own hauling company.");
	console.log();
	console.log('------------------');
	console.log();
	keyInPause();
	clearScreen();

	breakConsole.log("\nToday, in the G-LOC bar on ArcCorp, you were propositioned by a representative of NebTech, a small mining subsidiary of Crusader " +
		"Industries that you've worked with in the past. With the sudden disappearance of the major shipping companies in the face of the worsening security situation, " +
		"Crusader's citizens are experiencing worsening food and " +
		"supply shortages. With countless canceled, destroyed, and intercepted shipments, Crusader Industries has delayed all deliveries of Genesis Starliners indefinitely. " +
		"\n\nCiting the current emergency, the representative has offered to assign you a temporary hauling permit and loan you enough " +
		"credits to afford a cargo ship, but only until Crusader Industries and Crusader Security stabilize the situation.");
	console.log();
	console.log('------------------');
	console.log();
	keyInPause();
	clearScreen();
	
	breakConsole.log("\nYour task will be to transport cargo to and from the planetary system's ports, as well as ships meeting you at rendezvous points. Most " +
		"other large corporations and carriers are prevented from transiting Crusader for insurance coverage reasons, so you'll have the task of shuttling their cargo " +
		"to the destinations.");
	console.log();
	console.log('------------------');
	console.log();
	keyInPause();
	clearScreen();

	breakConsole.log("\nIf you can pay off your loan on time and demonstrate that you've helped the situation on Crusader, Crusader Industries " +
		"will grant you a permanent TDD hauling license for the Stanton system. Your performance will be graded based on your net worth, the number of Crusader Industries contracts " +
		"completed, and the total number of SCU delivered to and from Crusader itself. You were warned, however, that without any companies " +
		"providing cargo insurance coverage, if any cargo you're hauling is stolen or destroyed, you'll have to pay for it yourself.");
	console.log();
	console.log("Good luck, Captain.\n");
	console.log('------------------');
	console.log();
	keyInPause();
}

var victoryDialog = function() {
	clearScreen();
	breakConsole.log("\nCongratulations! Through your hauling efforts, the situation of Crusader's citizenry is more stable. As promised, Crusader Industries " +
		"has granted you a permanent Stanton Trade Development Division permit, and you are now operating your own independent, legal hauling operation. " + 
		"Great work, Captain!\n");
	console.log('------------------');
	console.log();
	keyInPause();
}

var defeatDialog = function() {
	clearScreen();
	breakConsole.log("\nUnfortunately, you were not able to deliver on your end of the bargain with Crusader Industries, and your temporary Trade " + 
		"Development Division permit has been revoked. Luckily, your old ore freighter's captain is willing to hire you back on for another year-long tour.\n");
	console.log('THE END');
	console.log('------------------');
	console.log();
	keyInPause();
}

var incrementTickBy = function(incrementBy = 1) {
	for (var i = 0; i < incrementBy; i++) {
		incrementTick();
	};
}

var incrementTick = function(initialTick = false) {
	if (!initialTick) {
		data.player.journal.incrementTick();
		// At hours mod 24 = 0 (every day), increase debt by calculated interest
		if (data.player.journal.tick % 24 == 0) {
			data.player.journal.addDebt(data.player.journal.getDebtDailyInterest(), journal.history_debt_add_interest);
		}

		// At hours mod 24 = 0 (every day), show the day end screen
		if (data.player.journal.tick % 24 == 0) {
			clearScreen();
			console.log("Company Report: End of " + data.player.journal.previousDayString(false).toLowerCase() + "\n");
			keyInPause();
			clearScreen();
			if (data.player.journal.isSandbox || (!data.player.journal.isSandbox && (!data.player.journal.hasEnded() || data.player.journal.isEndTick()))) {
				data.player.journal.score = data.player.journal.updatedScore();
			}
			showCompanyLog(data.player.journal);
			keyInPause();

			if (!data.player.journal.isSandbox) {
				if (data.player.journal.hasEnded()) {
					if (data.player.journal.isEndTick()) {
						if (data.player.journal.isVictory()) {
							data.player.journal.setVictory(true);
							scores.add(data.player.journal.saveForScore());
							victoryDialog();
							return;
						} else {
							scores.add(data.player.journal.saveForScore());
							defeatDialog();
							endGame();
							return;
						}
					}
				}
			}
		}
	}

	jobboard.jobBoardIds().forEach(function(jobboardId) {
		var board = jobboard.jobBoardIdToJobBoard(jobboardId);

		board.expireContracts(data.player.journal.getTick());

		var numContractsToAdd = board.needsContracts();

		if (numContractsToAdd > 0) {
			for (var i = 0; i < numContractsToAdd; i++) {
				var _contract = metacontract.generateContractForEmployerId(board.employer_ids[Math.floor(Math.random()*board.employer_ids.length)], data.player.journal.getTick());
				board.addContractId(_contract.id);
			}
			// console.log("Added " + numContractsToAdd + " contracts to " + jobboardId);
		}
	});
}

var menuSplash = function() {
	console.log('');
	logo.showLogo();
	console.log('');
	console.log('------------------');
	console.log('Crusader Transport Simulator v' + CTS_VERSION_NAME);
	console.log('');
	console.log('Text-based hauling companion for Star Citizen v' + STAR_CITIZEN_VERSION_NAME);
	console.log('------------------');
	console.log('');
	keyInPause();
	clearScreen();
	breakConsole.log('Note: Use window dimensions of 80x24 for the best experience.\n\n(If your terminal is taller, run CTS with --height as the first argument, eg, \'.\/cts_osx --height 50\')\n');
	keyInPause();
	pushMenu(menu.main);
}

var menuMain = function() {
	console.log('Crusader Transport Simulator v' + CTS_VERSION_NAME + " for Star Citizen v" + STAR_CITIZEN_VERSION_NAME + " by SteveCC");

	var files = store.list();

	var hasSavedFiles = files.length > 0;
	
	var choices = [];
	choices = choices.concat(menu.main_new);

	if (hasSavedFiles) {
		choices = choices.concat(menu.main_load);
	}
	
	choices = choices.concat(menu.main_scores);

	choices = choices.concat(menu.main_credits);

	var index = readlineSync.keyInSelect(choices, 'Select a menu option ', {cancel:'Exit', guide:false});
	if (index == -1) {
		console.log();
		var confirmExit = readlineSync.keyInYNStrict("Exit?", {guide:true})
		if (confirmExit) {
			return false;
		}
	} else {
		pushMenu(choices[index]);
	}
	return true;
}

var menuMainNew = function() {
	// option for new career or sandbox game, with description
	breakConsole.log("Start a career game, or a sandbox game?\n\nIn a career game, ships cost UEC, and you start in debt. You will have limited time to pay your debt back, or your game will end. In a sandbox game, all ships are free, and you do not start in debt.");
	var isSandbox = false;

	var choices = [];
	choices = choices.concat(menu.main_new_career);
	choices = choices.concat(menu.main_new_sandbox);
	var index = readlineSync.keyInSelect(choices, 'Select a game type ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
		return;
	} else if (choices[index].id == menu.main_new_career.id) {
		isSandbox = false;
	} else if (choices[index].id == menu.main_new_sandbox.id) {
		isSandbox = true;
	}

	// Force player to delete a save if over max
	var files = store.list().filter(function(fileObj) {
		return fileObj.version_ordinal >= CTS_MIN_SAVE_VERSION_ORDINAL;
	});
	if (files.length >= MAX_SAVES) {
		clearScreen();
		console.log('Maximum of ' + MAX_SAVES + ' saved games reached. You must overwrite a saved game to continue.');
		var choices = [];
		files.forEach(function(fileObj) {
			var dateString = moment().year(fileObj.year).month(fileObj.month).date(fileObj.date).hours(0).minutes(0).seconds(0).add(fileObj.tick, 'hours').format('MM/DD/YYYY, HH:mm');
			var startMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0);
			var endMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(fileObj.tick, 'hours');
			var endGameMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(fileObj.endTick, 'hours');
			var elapsedString = "Day " + (endMoment.diff(startMoment, 'days') + 1) + (fileObj.isSandbox ? "" : ("/" + (endGameMoment.diff(startMoment, 'days'))));
			choices = choices.concat(new menu.Menu(fileObj.id, "" + fileObj.name + (fileObj.isSandbox ? " - SANDBOX, " : ", ") + dateString + " (" + fileObj.credits + " UEC, " + fileObj.ship_ids.length + " ships, " + elapsedString + ')'));
		});

		var index = readlineSync.keyInSelect(choices, 'Select a saved game to overwrite ', {cancel:CANCEL_STRING, guide:false});
		if (index == -1) {
			popMenu();
			return;
		} else {
			store.remove(choices[index].id);
			console.log('------------------');
			console.log("Overwriting saved game...")
			displayTimeout(3);
		}
	}
	clearScreen();
	var start = moment().add(930, 'years').hours(0).minutes(0).seconds(0);
	data.player.journal.year = start.year();
	data.player.journal.month = start.month()
	data.player.journal.date = start.date();

	if (!isSandbox) {
		startGameDialog();
		clearScreen();
	}

	data.player.journal.name = readlineSync.question('What is your company\'s name? ');
	data.player.journal.isSandbox = isSandbox;
	data.player.journal.version_ordinal = CTS_VERSION_ORDINAL;
	data.player.journal.version_name = CTS_VERSION_NAME;
	if (!isSandbox) {
		var choices = [];
		choices = choices.concat(new menu.Menu("small", "25,000 UEC (Repay 25,000 UEC in 7 days)"));
		choices = choices.concat(new menu.Menu("medium", "50,000 UEC (Repay 62,500 UEC in 15 days)"));
		choices = choices.concat(new menu.Menu("large", "100,000 UEC (Repay 150,000 UEC in 30 days)"));
		clearScreen();
		var index = readlineSync.keyInSelect(choices, 'Select a loan ', {cancel:false, guide:false});
		if (choices[index].id == "small") {
			data.player.journal.addCredits(25000, journal.history_credits_initial);
			data.player.journal.addDebt(25000, journal.history_debt_initial);
			data.player.journal.setGameEndTick(24 * 7);
		} else if (choices[index].id == "medium") {
			data.player.journal.addCredits(50000, journal.history_credits_initial);
			data.player.journal.addDebt(62500, journal.history_debt_initial);
			data.player.journal.setGameEndTick(24 * 15);
		} else if (choices[index].id == "large") {
			data.player.journal.addCredits(100000, journal.history_credits_initial);
			data.player.journal.addDebt(150000, journal.history_debt_initial);
			data.player.journal.setGameEndTick(24 * 30);
		}
	}
	data.player.journal.id = store.add(data.player.journal.save()).id;

	clearScreen();
	breakConsole.log("WARNING: Save game support is only partially implemented. When you EXIT and SAVE, your ships and company history " +
		"will be saved, but all CONTRACTS will be ABANDONED.\n\nYou will be FINED for any cargo that has not been delivered when you SAVE. " +
		"Make sure to deliver your cargo and complete your contracts before you EXIT and SAVE!\n");
	keyInPause();

	pushMenu(menu.spawn);
}

var menuMainLoad = function() {
	var allFiles = store.list();

	// list of savegames from files
	var files = store.list().filter(function(fileObj) {
		return fileObj.version_ordinal >= CTS_MIN_SAVE_VERSION_ORDINAL;
	});
	var choices = [];
	files.forEach(function(fileObj) {
		var dateString = moment().year(fileObj.year).month(fileObj.month).date(fileObj.date).hours(0).minutes(0).seconds(0).add(fileObj.tick, 'hours').format('MM/DD/YYYY, HH:mm');
		var startMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0);
		var endMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(fileObj.tick, 'hours');
		var endGameMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(fileObj.endTick, 'hours');
		var elapsedString = "Day " + (endMoment.diff(startMoment, 'days') + 1) + (fileObj.isSandbox ? "" : ("/" + (endGameMoment.diff(startMoment, 'days'))));
		choices = choices.concat(new menu.Menu(fileObj.id, "" + fileObj.name + (fileObj.isSandbox ? " - SANDBOX, " : ", ") + dateString + " (" + fileObj.credits + " UEC, " + fileObj.ship_ids.length + " ships, " + elapsedString + ')'));
	});

	if (files.length < allFiles.length) {
		console.log("(" + (allFiles.length - files.length) + " saves from incompatible versions not displayed.)");
	}

	if (files.length == 0) {
		choices = choices.concat("[No saved games]");
	}

	var index = readlineSync.keyInSelect(choices, 'Select a saved game ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1 || files.length == 0) {
		popMenu();
	} else {
		clearScreen();
		console.log(choices[index].display_name);
		var subChoices = [menu.main_load_load, menu.main_load_delete];
		var subIndex = readlineSync.keyInSelect(subChoices, 'Select an operation ', {cancel:CANCEL_STRING, guide:false});
		if (subIndex == -1) {
			return;
		} else if (subChoices[subIndex].id == menu.main_load_load.id) {
			var saveData = store.load(choices[index].id);
			data.player.journal.load(saveData);
			pushMenu(menu.spawn);
		} else if (subChoices[subIndex].id == menu.main_load_delete.id) {
			console.log('------------------');
			var confirmDelete = readlineSync.keyInYNStrict("Delete save?", {guide:true})
			if (confirmDelete) {
				console.log('------------------');
				store.remove(choices[index].id);
				console.log("Save deleted\n");
				keyInPause();
			}
			return;
		}
	}
}

var menuScores = function() {
	console.log("Top Companies")

	var allFiles = scores.list();

	// list of savegames from files
	var files = scores.list().filter(function(fileObj) {
		return fileObj.version_ordinal >= CTS_MIN_SAVE_VERSION_ORDINAL;
	}).sort(function(fileObjA, fileObjB) {
		return fileObjB.score.totalScore - fileObjA.score.totalScore;
	});

	if (files.length < allFiles.length) {
		console.log("\n(" + (allFiles.length - files.length) + " reports from incompatible versions not displayed.)");
	}

	files = files.slice(0, MAX_HIGH_SCORES);

	var choices = [];
	var scoreIndex = 1;
	files.forEach(function(fileObj) {
		var dateString = moment().year(fileObj.year).month(fileObj.month).date(fileObj.date).hours(0).minutes(0).seconds(0).add(fileObj.tick, 'hours').format('MM/DD/YYYY');
		var startMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0);
		var endMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(fileObj.tick, 'hours');
		var endGameMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(fileObj.endTick, 'hours');
		var elapsedString = "Day " + (endMoment.diff(startMoment, 'days') + 1) + (fileObj.isSandbox ? "" : ("/" + (endGameMoment.diff(startMoment, 'days'))));
		choices = choices.concat(new menu.Menu(fileObj.id, " #" + scoreIndex + " " +fileObj.score.totalScore +  " pts, " + fileObj.name + ", " + dateString + " (" + (fileObj.victory ? "SUCCESS" : "FAILURE") + ')'));
		scoreIndex = scoreIndex + 1;
	});

	if (files.length == 0) {
		choices.push("[No company reports]");
	} 

	var index = readlineSync.keyInSelect(choices, 'Select a report ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1 || files.length == 0) {
		popMenu();
	} else {
		var saveData = scores.load(choices[index].id);
		var tempJournal = new journal.Journal();
		tempJournal.load(saveData);
		clearScreen();
		showCompanyLog(tempJournal);
		keyInPause();
	}
}

var menuCredits = function() {
	console.log('Crusader Transport Simulator v' + CTS_VERSION_NAME);
	console.log();
	console.log('by Steve Caires (RSI: SteveCC)');
	console.log();
	console.log("Feedback and updates: https://github.com/firstrobotica/crusader-transport-sim");
	console.log();
	keyInPause();
	clearScreen();
	console.log("Thanks to:");
	console.log();
	console.log("  Alysianah Noire\'s World of Star Citizen");
	console.log("  Anseki's readline-sync")
	console.log("  AstroNavis Merchant Advanced board game");
	console.log("  Drake Interplanetary Ship Designer Josh C.");
	console.log("  Elijah Rockseeker");
	console.log("  Harlock Space Pirate");
	console.log("  Litauen's Star Citizen Blueprints");
	console.log("  Nintendoskeleton");
	console.log("  /r/starcitizen");
	console.log("  Roberts Space Industries");
	console.log("  SCS Software");
	console.log("  Shoklar\'s Starmaps");
	console.log("  StarCitizenDB");
	console.log("  StarCitizen.tools");
	console.log("  The fine folks of the (now retired) Drake Caterpillar Shipyard subforums");
	console.log("  Xena and Ichi <3");
	console.log();
	keyInPause();
	clearScreen();
	breakConsole.log("This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.")
	console.log();
	keyInPause();
	popMenu();
}

var menuSpawn = function() {
	var index = readlineSync.keyInSelect(quantum.quantumIdsToLocations(quantum.spawn_location_ids), 'Where did you spawn? ', {cancel:false, guide:false});

	var location = quantum.quantumIdsToLocations(quantum.spawn_location_ids)[index];

	data.player.spawn_location_quantum_id = location.id;
	data.player.quantum_location_id = data.player.spawn_location_quantum_id;
	data.player.disembarked = true;
	clearScreen();

	if (location.portDestinations().length == 1) {
		var portDestination = location.portDestinations()[0];
		var portLocation = port.portIdToLocation(portDestination.id)
		data.player.port_location_id = portLocation.id;
	} else {
		var choices = [];
		choices = choices.concat(location.portDestinations());
		var index = readlineSync.keyInSelect(choices, 'Which port did you spawn at? ', {cancel:false, guide:false});
		var portDestination = location.portDestinations()[index];
		var portLocation = port.portIdToLocation(portDestination.id);
		data.player.port_location_id = portLocation.id;
		console.log('------------------');
	}

	console.log('Spawning at ' + location);
	displayTimeout(3);

	var elapsedTime = random.randomIntInRange(15,30);

	for (var i = 0; i < elapsedTime; i++) {
		data.player.journal.decrementTick();
	};

	incrementTick(true);

	// Elapse some time for the initial contracts
	for (var i = 0; i < elapsedTime; i++) {
		data.player.journal.incrementTick();
		incrementTick(true);
	};

	pushMenu(menu.port, data.player.port_location_id);
}

// 'In Port' option
var menuPort = function(portLocationId) {
	console.log('' + data.player.journal.name + (data.player.journal.isSandbox ? " (SANDBOX): " : ": ") + data.player.journal.dateString() + " (" + data.player.journal.elapsedDayString() + ")");
	console.log('Your location: ' + port.portIdToLocation(data.player.port_location_id));
	if (data.ship.hasShip()) {
		console.log('Your ship: ' + data.ship.name + ', ' + shipType.shipIdToShip(data.ship.type_id).manufacturer_name + ' ' + shipType.shipIdToShip(data.ship.type_id).display_name)		
	} else {
		console.log('Your ship: None');
	}

	console.log('Your credits: ' + data.player.journal.creditsString());

	var portLocation = port.portIdToLocation(portLocationId)
	var choices = [];

	choices.push(menu.port_navigation);
	choices.push(menu.port_contracts);
	
	choices.push(new menu.Menu(menu.port_ship_terminals.id, data.player.journal.ownedShips().length > 0 ? "Ship terminals (" + (data.player.journal.ownedShips().length == 1 ? "1 ship)" : data.player.journal.ownedShips().length + " ships)") : "Ship terminals"));
	if (data.ship.hasShip() && data.ship.landing_pad_location_id != null) {
		var landingPadLocation = landingPad.landingPadIdToLocation(data.ship.landing_pad_location_id);
		if (landingPadLocation.port_id === portLocationId) {
			choices.push(new menu.Menu(menu.port_enter_ship.id, "Enter ship (" + landingPadLocation.display_name + ")"));
		}
	}
	if (portLocation.hasConnectedPorts()) {
		choices.push(menu.port_connected_ports);
	}
	if (portLocation.has_ship_terminals) {
		choices.push(menu.port_debt_repay);
	}
	choices.push(menu.port_company_log);
	choices.push(menu.port_respawn);

	var index = readlineSync.keyInSelect(choices, 'Select a menu option ', {cancel:'Exit', guide:false});
	if (index == -1) {
		var confirmExit = exitDialog();
		// Return false to break the loop.
		return !confirmExit
	} else if (choices[index].id == menu.port_enter_ship.id) {
		console.log('------------------');
		console.log('Entering ship...');
		data.player.disembarked = false;
		displayTimeout(3);
		popMenuTo(menu.spawn);
		pushMenu(menu.ship);
	} else if (choices[index].id == menu.port_ship_terminals.id) {
		pushMenu(menu.port_ship_terminals, portLocationId);
	} else if (choices[index].id == menu.port_connected_ports.id) {
		pushMenu(menu.port_connected_ports, portLocationId);
	} else {
		pushMenu(choices[index])
	}
	return true;
}

var menuPortShipTerminals = function(portLocationId) {
	var portLocation = port.portIdToLocation(portLocationId);

	var _ownedShips = data.player.journal.ownedShips().filter(function(_shipObject) {
		var _shipType = shipType.shipIdToShip(_shipObject.ship_id);
		return portLocation.hasNonTenderLandingPadDestinationForSize(_shipType.size);
	});

	var choices = [];
	if (_ownedShips.length > 0) {
		choices = choices.concat(_ownedShips);
	} else {
		choices.push("[No owned ships]");
	} 

	choices.push(menu.port_ship_purchase_list);

	var index = readlineSync.keyInSelect(choices, 'Request a ship ', {cancel:CANCEL_STRING, guide:false});

	if (index == -1) {
		popMenu();
		return;
	} else if (choices[index].id == menu.port_ship_purchase_list.id) {
		pushMenu(menu.port_ship_purchase_list, portLocationId)
	} else {
		if (_ownedShips.length > 0) {
			var _shipObject = _ownedShips[index];
			pushMenu(menu.port_ship_terminal_details, portLocationId, choices[index].id)
		} else {
			popMenu();
		}
	}
}

var menuPortShipTerminalDetails = function(portLocationId, shipObjectId) {
	var portLocation = port.portIdToLocation(portLocationId);
	var shipObject = data.player.journal.shipObjectIdToShipObject(shipObjectId);
	var ship_type = shipType.shipIdToShip(shipObject.ship_id);

	// Ship name
	// Ship manufacturer
	// Ship type
	console.log(shipObject.name + ', ' + ship_type.manufacturer_name + ' ' + ship_type.display_name);
	console.log("Size: " + ship_type.size);
	// Ship SCU
	console.log("Cargo capacity: " + ship_type.cargo_hold_size + " SCU" + (ship_type.cargo_is_external ? " (External)" : ""));
	// Ship sell cost
	console.log("Selling price: " + ship_type.salePrice() + " UEC" + (data.player.journal.isSandbox ? " (SANDBOX: 0 UEC)" : ""));
	// Ship description
	breakConsole.log("\n" + ship_type.description);
	var choices = [];
	if (data.ship.hasShip() && data.ship.id === shipObject.id) {
		choices.push(menu.port_ship_terminal_details_hangar);
	} else {
		choices.push(menu.port_ship_terminal_details_request);
	}
	choices.push(menu.port_ship_terminal_details_sell);

	var index = readlineSync.keyInSelect(choices, 'Select a ship option ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
	} else if (choices[index].id == menu.port_ship_terminal_details_request.id) {
		var requestedShip = requestShipDialog(portLocationId, shipObjectId);
		if (requestedShip) {
			popMenuTo(menu.port);
		}
	} else if (choices[index].id == menu.port_ship_terminal_details_hangar.id) {
		var confirmMove = true;
		if (data.ship.loadedCargoSize() > 0) {
			confirmMove = readlineSync.keyInYNStrict("Move cargo to port? If you move your ship to the hangar, your cargo will be moved to the port. ", {guide:true});	
			if (confirmMove) {
				var scuTransferred = 0;
				data.ship.cargo.forEach(function(hold) {
					var containersToTransfer = [];
					hold.containers().forEach(function(container) {
						containersToTransfer.push(container);
					});
					containersToTransfer.forEach(function(container) {
						scuTransferred = scuTransferred + container.size;
						hold.unloadContainer(_container);
						portLocation.cargo.loadContainer(_container);
					});
				});
				if (scuTransferred > 0) {
					console.log('------------------');
					console.log('Transferring ' + scuTransferred + " SCU to port...")
					displayTimeout(3);
				}
			}
		}
		if (confirmMove) {
			data.ship.clear();
			console.log('------------------');
			console.log('Moving ' + shipObject + ' to hangar...');
			displayTimeout(3);
			popMenuTo(menu.port);
		}
	} else if (choices[index].id == menu.port_ship_terminal_details_sell.id) {
		var confirmSell = true;
		console.log('------------------');
		confirmSell = readlineSync.keyInYNStrict("Sell " + shipObject.name + "?" + (!data.player.journal.isSandbox ? " You will earn " + ship_type.salePrice() + " UEC" : ""), {guide:true});
		if (confirmSell) {
			if (data.ship.hasShip() && data.ship.id === shipObject.id) {
				if (data.ship.loadedCargoSize() > 0) {
					confirmSell = readlineSync.keyInYNStrict("Move cargo to port? If you sell your ship, your cargo will be moved to the port. ", {guide:true});	
					if (confirmSell) {
						var scuTransferred = 0;
						data.ship.cargo.forEach(function(hold) {
							var containersToTransfer = [];
							hold.containers().forEach(function(container) {
								containersToTransfer.push(container);
							});
							containersToTransfer.forEach(function(container) {
								scuTransferred = scuTransferred + container.size;
								hold.unloadContainer(_container);
								portLocation.cargo.loadContainer(_container);
							});
						});
						if (scuTransferred > 0) {
							console.log('------------------');
							console.log('Transferring ' + scuTransferred + " SCU to port...")
							displayTimeout(3);
						}
					}
				}
				if (confirmSell) {
					data.ship.clear();
				}
			}
		}
		if (confirmSell) {
			if (!data.player.journal.isSandbox) {
				data.player.journal.addCredits(ship_type.salePrice(), journal.history_credits_earn_ship_sale);
			}
			data.player.journal.removeShip(shipObject.id)
			console.log('------------------');
			console.log('Selling ' + shipObject + '...');
			displayTimeout(3);
			popMenuTo(menu.port_ship_terminals);
		}
	}
}

var menuPortShipPurchaseList = function(portLocationId) {
	var portLocation = port.portIdToLocation(portLocationId);

 	var shipTypes = shipType.shipIdsToShips(shipType.ship_ids).filter(function(_shipType) {
		return portLocation.hasNonTenderLandingPadDestinationForSize(_shipType.size);
	});

	var choices = [];
	if (shipTypes.length > 0) {
		choices = choices.concat(shipTypes);
	} else {
		choices.push("[No ships available for purchase]");
	} 

	var index = readlineSync.keyInSelect(choices, 'Purchase a ship ', {cancel:CANCEL_STRING, guide:false});

	if (index == -1) {
		popMenu();
		return;
	} else {
		pushMenu(menu.port_ship_purchase_details, portLocationId, choices[index].id)
	}
}

var menuPortShipPurchaseDetails = function(portLocationId, shipTypeId) {
	var portLocation = port.portIdToLocation(portLocationId);

	var ship_type = shipType.shipIdToShip(shipTypeId);

	// Ship name
	// Ship manufacturer
	// Ship type
	console.log(ship_type.manufacturer_name + ' ' + ship_type.display_name);
	console.log("Size: " + ship_type.size);
	// Ship SCU
	console.log("Cargo capacity: " + ship_type.cargo_hold_size + " SCU" + (ship_type.cargo_is_external ? " (External)" : ""));
	// Ship sell cost
	console.log("Purchase price: " + ship_type.purchasePrice() + " UEC" + (data.player.journal.isSandbox ? " (SANDBOX: 0 UEC)" : " (Down payment: " + ship_type.downPayment() + " UEC)"));
	console.log('Your credits: ' + data.player.journal.creditsString());
	// Ship description
	breakConsole.log("\n" + ship_type.description);
	var choices = [];
	choices.push(menu.port_ship_purchase_details_purchase);

	var index = readlineSync.keyInSelect(choices, 'Select a ship option ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
	} else if (choices[index].id == menu.port_ship_purchase_details_purchase.id) {
		console.log('------------------');
		var confirmBuy;
		var selectedPayment;
		var selectedDebt;
		if (data.player.journal.isSandbox) {
			clearScreen();
			confirmBuy = readlineSync.keyInYNStrict("Purchase " + ship_type.manufacturer_name + ' ' + ship_type.display_name + "?", {guide:true});
		} else if (data.player.journal.getCredits() < ship_type.downPayment()) {
			console.log('You need at least ' + ship_type.downPayment() + ' UEC to purchase a ' + ship_type.manufacturer_name + ' ' + ship_type.display_name);
			displayTimeout(3)
			confirmBuy = false;
		} else {
			clearScreen();
			console.log('Your credits: ' + data.player.journal.creditsString());
			console.log('\nAmount of down payment for ' + ship_type.manufacturer_name + ' ' + ship_type.display_name + '?');
			selectedPayment = financingDialog(shipTypeId);
			selectedDebt = ship_type.purchasePrice() - selectedPayment;
			clearScreen();
			console.log("You will pay " + selectedPayment + " UEC and add " + selectedDebt + " UEC in debt.\n");
			confirmBuy = readlineSync.keyInYNStrict("Purchase " + ship_type.manufacturer_name + ' ' + ship_type.display_name + "?", {guide:true});
		}
		if (confirmBuy) {
			if (data.player.journal.ownedShips().length >= MAX_SHIPS) {
				console.log('------------------');
				console.log("Can't store more than " + MAX_SHIPS + " ships in your hangar.")
				displayTimeout(3);
				popMenu();
			} else {
				console.log('------------------');
				var shipName = readlineSync.question('What is your ship\'s name? ');
				if (!data.player.journal.isSandbox) {
					data.player.journal.removeCredits(selectedPayment, journal.history_credits_spent_ship);
					data.player.journal.addDebt(selectedDebt, journal.history_debt_add_ship);
				}
				var newShip = data.player.journal.addShip(ship_type.id, shipName)
				console.log('------------------');
				console.log('Purchasing ' + ship_type.manufacturer_name + ' ' + ship_type.display_name + '...');
				displayTimeout(3);
				popMenuTo(menu.port_ship_terminals);
				pushMenu(menu.port_ship_terminal_details, portLocationId, newShip.id)
			}
		}
	}
}

var menuConnectedPorts = function(portLocationId) {
	var portLocation = port.portIdToLocation(portLocationId);	

	var choices = [];
	if (portLocation.hasConnectedPorts()) {
		choices = choices.concat(port.portIdsToLocations(portLocation.connectedPortIds()));
	} else {
		choices.push("[No connected ports]");
	}

	var index = readlineSync.keyInSelect(choices, 'Select a port ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
	} else {
		console.log('------------------');
		console.log('Traveling to port...');
		displayTimeout(3);
		popMenuTo(menu.spawn);
		data.player.disembarked = true;
		data.player.port_location_id = choices[index].id;
		pushMenu(menu.port, choices[index].id);
	}
}

var menuDebtRepay = function() {
	if (data.player.journal.getDebt() == 0) {
		console.log("You have no debt to repay.");
		console.log('------------------');
		keyInPause();
		popMenu();
	} else if (data.player.journal.getCredits() == 0) {
		console.log("You have no UEC with which to repay your debt.");
		console.log('------------------');
		keyInPause();
		popMenu();
	} else {
		console.log('Your credits: ' + data.player.journal.creditsString());
		console.log('\nAmount of debt to repay?');
		var selectedRepayment = debtRepaymentDialog();
		if (selectedRepayment > 0) {
			clearScreen();
			var confirmRepay = readlineSync.keyInYNStrict("Repay " + selectedRepayment + " UEC of your debt?", {guide:true});
			if (confirmRepay) {
				console.log('------------------');
				console.log('Repaying debt ...');
				displayTimeout(3);
				data.player.journal.removeCredits(selectedRepayment, journal.history_credits_spent_debt);
				data.player.journal.removeDebt(selectedRepayment);
			}
		}
		popMenu();
	}
}

// 'In Space' option
var menuSpace = function() {
	console.log('' + data.player.journal.name + (data.player.journal.isSandbox ? " (SANDBOX): " : ": ") + data.player.journal.dateString() + " (" + data.player.journal.elapsedDayString() + ")");
	console.log('Your location: ' + quantum.quantumIdToLocation(data.player.quantum_location_id).toDisplayString(data.ship.isLanded()));
	console.log('Your ship: ' + data.ship.name + ', ' + shipType.shipIdToShip(data.ship.type_id).manufacturer_name + ' ' + shipType.shipIdToShip(data.ship.type_id).display_name)
	console.log('Your credits: ' + data.player.journal.creditsString());

	var choices = [];

	// TODO: reenable comms?
	// choices.push(menu.ship_comms);
	choices.push(menu.ship_navigation);
	choices.push(menu.ship_contracts);
	choices.push(menu.ship_cargo);

	var travelActive = false;

	if (data.player.destination != null) {
		travelActive = true;
		if (data.player.destination.type == "quantum") {
			var destinationId = data.player.destination.id;
			var quantumLocation = quantum.quantumIdToLocation(destinationId);
			if (data.player.destination.distance_km < 1000) {
				choices.push(new menu.Menu("menu_destination", "Travel to " + quantumLocation.display_name + " (Time: 0H)"));	
			} else {
				choices.push(new menu.Menu("menu_destination", "Quantum Travel to " + quantumLocation.display_name));
			}
			console.log('Your destination: ' + data.player.destination)
		} else if (data.player.destination.type == "landingpad") {
			if (data.ship.landing_pad_location_id != null) {
				var destinationId = data.player.destination.id;
				var landingPadLocation = landingPad.landingPadIdToLocation(data.ship.landing_pad_location_id);
				var portLocation = port.portIdToLocation(landingPadLocation.port_id);
				choices.push(new menu.Menu("menu_destination", "Take off from " + landingPadLocation.display_name));
				console.log('Landed at: ' + landingPadLocation.display_name + ", " + portLocation.display_name);
				choices.push(menu.ship_visit_port);
			} else {
				var destinationId = data.player.destination.id;
				var landingPadLocation = landingPad.landingPadIdToLocation(destinationId);
				choices.push(new menu.Menu("menu_destination", "Land at " + landingPadLocation.display_name));
				console.log('Your destination: ' + data.player.destination)
			}
		} else if (data.player.destination.type == "tender") {
			if (data.ship.landing_pad_location_id != null) {
				var destinationId = data.player.destination.id;
				var landingPadLocation = landingPad.landingPadIdToLocation(data.ship.landing_pad_location_id);
				var portLocation = port.portIdToLocation(landingPadLocation.port_id);
				choices.push(new menu.Menu("menu_destination", "Undock from " + landingPadLocation.display_name));
				console.log('Docked with: ' + landingPadLocation.display_name + ", " + portLocation.display_name);
				if (portLocation.has_ship_terminals) {
					choices.push(menu.ship_visit_port);
				}
			} else {
				var destinationId = data.player.destination.id;
				var landingPadLocation = landingPad.landingPadIdToLocation(destinationId);
				choices.push(new menu.Menu("menu_destination", "Dock with " + landingPadLocation.display_name));
				console.log('Your destination: ' + data.player.destination)
			}
		} else if (data.player.destination.type == "shipcontact") {
			if (data.ship.docked_shipcontact_id != null) {
				var destinationId = data.player.destination.id;
				var selectedShipContact = shipcontact.shipContactIdToShipContact(data.ship.docked_shipcontact_id);
				choices.push(new menu.Menu("menu_destination", "Undock from " + selectedShipContact));
				console.log('Docked to: ' + selectedShipContact)
			} else {
				var destinationId = data.player.destination.id;
				var selectedShipContact = shipcontact.shipContactIdToShipContact(destinationId);
				choices.push(new menu.Menu("menu_destination", "Dock with " + selectedShipContact));
				console.log('Your target: ' + data.player.destination)
			}
		} else if (data.player.destination.type == "rendezvous") {
				var rendezvous = data.player.destination;
				var selectedShipContact = shipcontact.shipContactIdToShipContact(rendezvous.shipcontact_id);
				choices.push(new menu.Menu("menu_destination", "Rendezvous with " + selectedShipContact));
				console.log('Rendezvous: ' + rendezvous)
		}
	} else {
		console.log('Your destination: None')
	}

	choices.push(menu.ship_company_log);
	choices.push(menu.ship_respawn);
	
	var index = readlineSync.keyInSelect(choices, 'Select a menu option ', {cancel:'Exit', guide:false});
	if (index == -1) {
		var confirmExit = exitDialog();
		// Return false to break the loop.
		return !confirmExit
	} else if (choices[index].id == "menu_destination") {
		if (travelActive) {
			travelToDestination(data.player.destination);
		}
	} else if (choices[index].id == menu.ship_visit_port.id) {
		console.log('------------------');
		console.log('Visiting port...');
		displayTimeout(3);
		popMenuTo(menu.spawn);
		data.player.disembarked = true;
		data.player.port_location_id = landingPadLocation.port_id;
		var landingPadLocation = landingPad.landingPadIdToLocation(data.ship.landing_pad_location_id);
		pushMenu(menu.port, landingPadLocation.port_id);
	} else {
		pushMenu(choices[index])
	}
	return true;
}

// Comms option
var menuComms = function() {
	console.log('Your location: ' + quantum.quantumIdToLocation(data.player.quantum_location_id));
	console.log('');
	console.log('Comms:');

	var shipcontacts = shipcontact.shipContactsForQuantumLocationId(data.player.quantum_location_id);

	var choices = null;

	if (shipcontacts.length == 0) {
		choices = ["[No contacts]"];
	} else {
		choices = shipcontacts;
	}

	var index = readlineSync.keyInSelect(choices, 'Select a contact ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
	} else {
		if (shipcontacts.length == 0) {
			popMenu();
		} else {
			console.log('------------------');
			console.log('No response from ' + choices[index].name);
			displayTimeout(3);
			popMenu();
		}
	}
}

// Navigation option
var menuNavigation = function(isShipMenu) {
	var location = quantum.quantumIdToLocation(data.player.quantum_location_id);
	console.log('Your location: ' + location);
	console.log('');
	console.log('Navigation:');
	var choices = [];

	if (isShipMenu) {
		var shipcontacts = shipcontact.shipContactsForQuantumLocationId(data.player.quantum_location_id);

		var shipcontacts_filtered = shipcontacts.filter(function(_shipcontact) {
			if (shipcontact.hasContractIdForShipContactId(_shipcontact.id)) {
				var _contract = contract.contractIdToContract(shipcontact.getContractIdForShipContactId(_shipcontact.id));
				var isAccepted = data.player.journal.contractIdIsAccepted(_contract.id);
				var isShipContactPickupType = _contract.pickup.pickup_type == "shipcontact";
				var isShipContactPickupId = _contract.pickup.pickupContactOrLocation().id == _shipcontact.id;
				var hasExpired = _contract.hasExpired(data.player.journal.tick);
				// Don't show ship contacts if they're the contract pickup and it's expired.
				return isAccepted &&
					(!isShipContactPickupType || 
						(isShipContactPickupType && 
							(!isShipContactPickupId ||
								(isShipContactPickupId && !hasExpired))));
			} else {
				return false;
			}
		});

		if (shipcontacts_filtered.length > 0) {
			for (var i = shipcontacts_filtered.length - 1; i >= 0; i--) {
				var rendezvous;
				if (data.player.journal.hasRendezvous(shipcontacts_filtered[i].id)) {
					rendezvous = data.player.journal.getRendezvous(shipcontacts_filtered[i].id);
				} else {
					rendezvous = location.rendezvousDestinationForShipContact(shipcontacts_filtered[i].id);
					data.player.journal.addRendezvous(rendezvous);
				}
				choices = choices.concat(rendezvous);
			}
		}

		if (location.portDestinations().length > 0) {
			if (location.portDestinations().length == 1) {
				var portDestination = location.portDestinations()[0];
				var portLocation = port.portIdToLocation(portDestination.id)
				choices = choices.concat(new menu.Menu("ship_navigation_landing_pad_destinations", portLocation.display_name));
			} else {
				choices = choices.concat(new menu.Menu("ship_navigation_port_destinations", location.display_name + ' [...]'));
			}
		}

		choices = choices.concat([menu.ship_navigation_quantum]);
	}

	choices = choices.concat([menu.navigation_map_crusader, menu.navigation_map_stanton, menu.navigation_map_starmap]);

	if (isShipMenu) {
		if (data.player.destination != null && !data.ship.isDocked() && !data.ship.isLanded()) {
			choices.push(menu.ship_navigation_clear);
		}
	}

	var index = readlineSync.keyInSelect(choices, 'Select a destination ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
	} else if (choices[index].id == menu.navigation_map_crusader.id ||
		choices[index].id == menu.navigation_map_stanton.id ||
		choices[index].id == menu.navigation_map_starmap.id ||
		choices[index].id == menu.ship_navigation_quantum.id) {
		pushMenu(choices[index])
	} else if (choices[index].id == menu.ship_navigation_port_destinations.id) {
		pushMenu(menu.ship_navigation_port_destinations, location)
	} else if (choices[index].id == menu.ship_navigation_landing_pad_destinations.id) {
		pushMenu(menu.ship_navigation_landing_pad_destinations, location.portDestinations()[0])
	} else if (choices[index].id == menu.ship_navigation_clear.id) {	
		if (!data.ship.isDocked() && !data.ship.isLanded()) {
			data.player.destination = null;
		}
		popMenuTo(menu.ship);
	} else {
		if (data.ship.isLanded()) {
			console.log('------------------');
			console.log('Cannot rendezvous with ' + shipcontact.shipContactIdToShipContact(choices[index].shipcontact_id).name + ", ship is landed.");
			displayTimeout(3);
			clearScreen();
			popMenuTo(menu.ship);
		} else if (data.ship.isDocked()) {
			console.log('------------------');
			if (choices[index].shipcontact_id == data.ship.docked_shipcontact_id) {
				console.log('Already docked with ' + shipcontact.shipContactIdToShipContact(choices[index].shipcontact_id).name);
			} else {
				console.log('Cannot rendezvous with ' + shipcontact.shipContactIdToShipContact(choices[index].shipcontact_id).name + ", ship is docked.");
			}
			displayTimeout(3);
			clearScreen();
			popMenuTo(menu.ship);
		} else {
			console.log('------------------');
			var confirmDistance = readlineSync.keyInYNStrict("Are you within 5km of " + location + "?", {guide:true});

			if (!confirmDistance) {
				console.log('------------------');
				console.log('You must be within 5km of ' + location + ' to rendezvous with ' + shipcontact.shipContactIdToShipContact(choices[index].shipcontact_id).name);
				displayTimeout(3);
				clearScreen();
			} else {
				var rendezvousQuantumLocation = quantum.quantumIdToLocation(choices[index].quantum_destination_id);
				console.log('------------------');
				console.log("To rendezvous with " + shipcontact.shipContactIdToShipContact(choices[index].shipcontact_id).name + ":\n\n" +
					'1) Align to quantum location' + rendezvousQuantumLocation + ".\n" + 
					'2) Move towards it until you are ' + choices[index].distance_from_dest + 'km away.\n' +
					'3) Stop your ship.\n' + 
					'4) Select "Rendezvous with..."\n' +
					'5) Enter your current distance in km to the quantum location.\n');
				keyInPause();
				clearScreen();
				setDestination(choices[index]);
				popMenuTo(menu.ship);
			}
		}
	}
}

// Navigation option
var menuNavigationPortDestinations = function(location) {
	var location = quantum.quantumIdToLocation(data.player.quantum_location_id);
	console.log('Your location: ' + location);

	var choices = [];
	if (location.portDestinations().length > 0) {
		choices = choices.concat(location.portDestinations());
	}

	var index = readlineSync.keyInSelect(choices, 'Select a port destination ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
	} else {
		var portDestination = location.portDestinations()[index];
		var portLocation = port.portIdToLocation(portDestination.id);
		if (portLocation.haslandingPadDestinations()) {
			pushMenu(menu.ship_navigation_landing_pad_destinations, portDestination)
		} else {
			popMenuTo(menu.ship);
		}
	}
}

// Navigation option
var menuNavigationLandingPadDestinations = function(destination) {
	var location = quantum.quantumIdToLocation(data.player.quantum_location_id);

	var portLocation = port.portIdToLocation(destination.id);	

	var choices = [];
	if (portLocation.haslandingPadDestinations()) {
		choices = choices.concat(portLocation.landingPadDestinations());
	} else {
		choices.push("[No landing pads]");
	}

	var confirmAssign;
	var autoAssign;

	if (portLocation.landingPadDestinations().length == 1) {
		// Always assign if there's only one total landing pad/tender.
		confirmAssign = true;
		autoAssign = true;
	} else {
		confirmAssign = readlineSync.keyInYNStrict("Request landing pad assignment? (If no, choose a pad manually.) ", {guide:true});	
		autoAssign = false;
	}

	if (confirmAssign) {
		if (!portLocation.hasLandingPadDestinationForSize(shipType.shipIdToShip(data.ship.type_id).size)) {
			console.log("No landing pads of size " + shipType.shipIdToShip(data.ship.type_id).size + " available.");
			displayTimeout(3);
			clearScreen();
			popMenu();
		} else {
			var assignedLandingPadDest = portLocation.randomLandingPadDestinationForSize(shipType.shipIdToShip(data.ship.type_id).size);

			if (data.ship.isLanded()) {
				console.log('------------------');
				if (assignedLandingPadDest.id == data.ship.landing_pad_location_id) {
					console.log('Already landed at ' + landingPad.landingPadIdToLocation(assignedLandingPadDest.id));
				} else {
					if (assignedLandingPadDest.type === "tender") {
						console.log('Cannot dock with ' + landingPad.landingPadIdToLocation(assignedLandingPadDest.id) + ", ship is landed.");
					} else {
						console.log('Cannot land at ' + landingPad.landingPadIdToLocation(assignedLandingPadDest.id) + ", ship is already landed.");
					}
				}
				displayTimeout(3);
				clearScreen();
				popMenuTo(menu.ship);
			} else if (data.ship.isDocked()) {
				console.log('------------------');
				if (assignedLandingPadDest.type === "tender" && assignedLandingPadDest.id == data.ship.landing_pad_location_id) {
					console.log('Already docked with ' + landingPad.landingPadIdToLocation(assignedLandingPadDest.id));
				} else {
					console.log('Cannot land at ' + landingPad.landingPadIdToLocation(assignedLandingPadDest.id) + ", ship is docked.");
				}
				displayTimeout(3);
				clearScreen();
				popMenuTo(menu.ship);
			} else {
				if (!autoAssign) {
					// If we auto assigned, don't show the divider as one was already shown when we cleared the screen.
					console.log('------------------');
				}
				console.log("Assigned " + assignedLandingPadDest);
				if (assignedLandingPadDest.type === "tender") {
					displayTimeout(3);
					console.log('------------------');
					var confirmDistance = readlineSync.keyInYNStrict("Are you within 5km of " + portLocation + "?", {guide:true});

					if (!confirmDistance) {
						console.log('------------------');
						console.log('You must be within 5km of ' + portLocation + ' to dock with ' + assignedLandingPadDest);
						displayTimeout(3);
						clearScreen();
						popMenuTo(menu.ship);
					} else {
						setDestination(assignedLandingPadDest);
						popMenuTo(menu.ship);
					}
				} else {
					displayTimeout(3);
					clearScreen();
					setDestination(assignedLandingPadDest);
					popMenuTo(menu.ship);
				}
			}
		}
	} else {
		clearScreen();
		console.log('Your location: ' + location);
		console.log('Your ship: ' + shipType.shipIdToShip(data.ship.type_id).manufacturer_name + ' ' + shipType.shipIdToShip(data.ship.type_id).display_name + ' (Size ' + shipType.shipIdToShip(data.ship.type_id).size + ')')
		console.log('');
		console.log(portLocation.display_name + ':');

		var index = readlineSync.keyInSelect(choices, 'Select a landing pad ', {cancel:CANCEL_STRING, guide:false});
		if (index == -1) {
			popMenu();
		} else {
			if (data.ship.isLanded()) {
				console.log('------------------');
				if (choices[index].id == data.ship.landing_pad_location_id) {
					console.log('Already landed at ' + landingPad.landingPadIdToLocation(choices[index].id));
				} else {
					if (choices[index].type === "tender") {
						console.log('Cannot dock with ' + landingPad.landingPadIdToLocation(choices[index].id) + ", ship is landed.");
					} else {
						console.log('Cannot land at ' + landingPad.landingPadIdToLocation(choices[index].id) + ", ship is already landed.");
					}
				}
				displayTimeout(3);
				clearScreen();
				popMenuTo(menu.ship);
			} else if (data.ship.isDocked()) {
				console.log('------------------');
				if (choices[index].type === "tender" && choices[index].id == data.ship.landing_pad_location_id) {
					console.log('Already docked with ' + landingPad.landingPadIdToLocation(choices[index].id));
				} else {
					console.log('Cannot land at ' + landingPad.landingPadIdToLocation(choices[index].id) + ", ship is docked.");
				}
				displayTimeout(3);
				clearScreen();
				popMenuTo(menu.ship);
			} else {
				var _landingPadDest = choices[index];
				var _landingPad = landingPad.landingPadIdToLocation(choices[index].id);
				if (_landingPad.type === "tender" && !_landingPad.canAcceptSize(shipType.shipIdToShip(data.ship.type_id).size)) {
					console.log('------------------');
					if (_landingPad.min_size == _landingPad.max_size) {
						console.log('Cannot dock with ' + landingPad.landingPadIdToLocation(choices[index].id) + ", tender is reserved for ships of size " + _landingPad.min_size + ".");
					} else {
						console.log('Cannot dock with ' + landingPad.landingPadIdToLocation(choices[index].id) + ", tender is reserved for ships between size " + _landingPad.min_size + " and " + _landingPad.max_size + ".");
					}
					displayTimeout(3);
					clearScreen();
					popMenuTo(menu.ship);
				} else {
					console.log('------------------');
					if (_landingPadDest.type === "tender") {
						var confirmDistance = readlineSync.keyInYNStrict("Are you within 5km of " + portLocation + "?", {guide:true});

						if (!confirmDistance) {
							console.log('------------------');
							console.log('You must be within 5km of ' + portLocation + ' to dock with ' + _landingPadDest);
							displayTimeout(3);
							clearScreen();
						} else {
							setDestination(_landingPadDest);
							popMenuTo(menu.ship);
						}
					} else {
						setDestination(_landingPadDest);
						popMenuTo(menu.ship);
					}
				}
			}
		}
	}
}

// Map option
var menuCrusaderMap = function() {
	map.showCrusaderMap(data.player.quantum_location_id);
	keyInPause();
	popMenu();
}

// Map option
var menuStantonMap = function() {
	map.showStantonMap();
	keyInPause();
	popMenu();
}

// Map option
var menuStarMap = function() {
	map.showStarMap();
	keyInPause();
	popMenu();
}

// Quantum Travel option
var menuQuantum = function() {
	console.log('Your location: ' + quantum.quantumIdToLocation(data.player.quantum_location_id));
	console.log('');
	console.log('Quantum destinations:');
	
	var choices = quantum.quantumIdToLocation(data.player.quantum_location_id).quantumDestinations();
	
	var index = readlineSync.keyInSelect(choices, 'Select a travel destination ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
	} else {
		if (data.ship.isLanded()) {
			console.log('------------------');
			console.log('Cannot travel to ' + quantum.quantumIdToLocation(choices[index].id) + ", ship is landed.");
			displayTimeout(3);
			clearScreen();
			popMenuTo(menu.ship);
		} else if (data.ship.isDocked()) {
			console.log('------------------');
			console.log('Cannot travel to ' + quantum.quantumIdToLocation(choices[index].id) + ", ship is docked.");
			displayTimeout(3);
			clearScreen();
			popMenuTo(menu.ship);
		} else if (choices[index].is_blocked) {
			console.log('------------------');
			console.log('Cannot travel to ' + quantum.quantumIdToLocation(choices[index].id) + ", route is obstructed.\n\nTravel to a different location first.");
			displayTimeout(3);
			clearScreen();
			menuQuantum();
		} else {
			setDestination(choices[index]);
			popMenuTo(menu.ship);
		}
	}
}

// Contracts option
var menuContracts = function(menuId, jobBoardId) {
	console.log('Your location: ' + quantum.quantumIdToLocation(data.player.quantum_location_id));
	console.log('Your credits: ' + data.player.journal.creditsString());
	console.log('');

	var _acceptedContracts = data.player.journal.acceptedContracts();
	var _abandonedContracts = data.player.journal.abandonedContracts();
	var _completedContracts = data.player.journal.completedContracts();
	var _totalAvailableContracts = [];
	var _jobBoards = [];

	if (data.player.disembarked) {
		var _portLocation = port.portIdToLocation(data.player.port_location_id);
		if (_portLocation.hasJobBoard()) {
			var _jobBoardIds = _portLocation.jobBoardIds();
			_jobBoardIds.forEach(function(jobboardId) {
				var board = jobboard.jobBoardIdToJobBoard(jobboardId);
				board.allContracts().forEach(function(contract) {
					_totalAvailableContracts.push(contract);
				});
				_jobBoards.push(board);
			});
		}
	} else if (data.ship.isLanded() || data.ship.isDockedWithTender()) {
		var _landingPad = landingPad.landingPadIdToLocation(data.ship.landing_pad_location_id);
		var _portLocation = port.portIdToLocation(_landingPad.port_id);
		if (_portLocation.hasJobBoard()) {
			var _jobBoardIds = _portLocation.jobBoardIds();
			_jobBoardIds.forEach(function(jobboardId) {
				var board = jobboard.jobBoardIdToJobBoard(jobboardId);
				board.allContracts().forEach(function(contract) {
					_totalAvailableContracts.push(contract);
				});
				_jobBoards.push(board);
			});
		}
	}

	var _availableContracts = [];

	var choices = [];

	var contractMenuItemFunction = function(contract) {
		return new menu.Menu(contract.id, contract.toActiveString(data.player.journal.tick));
	}

	if (menuId === menu.ship_contracts.id || menuId === menu.port_contracts.id) {
		console.log('Accepted contracts:');

		if (_acceptedContracts.length == 0) {
			choices = ["[No contracts]"];
		} else {
			choices = choices.concat(_acceptedContracts.map(contractMenuItemFunction));
		}

		if (_abandonedContracts.length > 0) {
			choices.push(new menu.Menu("ship_contracts_abandoned", "Abandoned contracts (" + _abandonedContracts.length + ")"));
		}

		if (_completedContracts.length > 0) {
			choices.push(new menu.Menu("ship_contracts_completed", "Completed contracts (" + _completedContracts.length + ")"));
		}

		if (_totalAvailableContracts.length > 0) {
			if (_jobBoards.length == 1) {
				choices.push(new menu.Menu("ship_contracts_available", "Available contracts (" + _totalAvailableContracts.length + ")"));				
			} else if (_jobBoards.length > 1) {
				choices.push(new menu.Menu("ship_contracts_jobboards", "Available contracts (" + _totalAvailableContracts.length + ")"));
			}

		}
	} else if (menuId === menu.ship_contracts_completed.id) {
		if (data.player.journal.olderCompletedContractCount() > 0) {
			console.log("(" + data.player.journal.olderCompletedContractCount() + " older contracts not displayed)\n");
		}
		console.log('Recently completed contracts:');
		choices = choices.concat(data.player.journal.recentCompletedContracts());
	} else if (menuId === menu.ship_contracts_abandoned.id) {
		if (data.player.journal.olderAbandonedContractCount() > 0) {
			console.log("(" + data.player.journal.olderAbandonedContractCount() + " older contracts not displayed)\n");
		}
		console.log('Recently abandoned contracts:');
		choices = choices.concat(data.player.journal.recentAbandonedContracts());
	} else if (menuId === menu.ship_contracts_available.id) {
		var _jobBoard = jobboard.jobBoardIdToJobBoard(jobBoardId);
		console.log('Available contracts, ' + _jobBoard.display_name + ':');
		_availableContracts = _jobBoard.allContracts().sort(function(contract_a, contract_b) {
				return contract_a.details.expireTick - contract_b.details.expireTick;
			});

		if (_availableContracts.length == 0) {
			choices = ["[No contracts]"];
		} else {
			choices = choices.concat(_availableContracts.map(contractMenuItemFunction));
		}
	}

	var index = readlineSync.keyInSelect(choices, 'Select a contract ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
	} else {
		if (choices[index].id === menu.ship_contracts_abandoned.id) {
			pushMenu(menu.ship_contracts_abandoned)
		} else if (choices[index].id === menu.ship_contracts_completed.id) {
			pushMenu(menu.ship_contracts_completed)
		} else if (choices[index].id === menu.ship_contracts_jobboards.id) {
			pushMenu(menu.ship_contracts_jobboards)
		} else if (choices[index].id === menu.ship_contracts_available.id) {
			// Load the first job board
			pushMenu(menu.ship_contracts_available, _jobBoards[0].id)
		} else if (menuId === menu.ship_contracts.id && _acceptedContracts.length == 0) {
			popMenu();
		} else if (menuId === menu.ship_contracts_available.id && _availableContracts.length == 0) {
			popMenu();
		} else {
			// Load details for specific contract
			if (menuId === menu.ship_contracts_available.id) {
				// If available, show the available contracts menu which loads the correct job board
				pushMenu(menu.ship_contracts_details_available, choices[index].id, jobBoardId);	
			} else {
				// If abandoned, completed, or accepted, the details will show the right status
				pushMenu(menu.ship_contracts_details, choices[index].id)
			}
		}
	}
}

// Contract boards
var menuContractBoards = function() {
	var location = quantum.quantumIdToLocation(data.player.quantum_location_id);
	console.log('Your location: ' + location);

	var _jobBoards = [];

	if (data.player.disembarked) {
		var _portLocation = port.portIdToLocation(data.player.port_location_id);
		if (_portLocation.hasJobBoard()) {
			var _jobBoardIds = _portLocation.jobBoardIds();
			_jobBoardIds.forEach(function(jobboardId) {
				var board = jobboard.jobBoardIdToJobBoard(jobboardId);
				_jobBoards.push(board);
			});
		}
	} else if (data.ship.isLanded() || data.ship.isDockedWithTender()) {
		var _landingPad = landingPad.landingPadIdToLocation(data.ship.landing_pad_location_id);
		var _portLocation = port.portIdToLocation(_landingPad.port_id);
		if (_portLocation.hasJobBoard()) {
			var _jobBoardIds = _portLocation.jobBoardIds();
			_jobBoardIds.forEach(function(jobboardId) {
				var board = jobboard.jobBoardIdToJobBoard(jobboardId);
				_jobBoards.push(board);
			});
		}
	}

	var choices = [];
	if (_jobBoards.length > 0) {
		choices = choices.concat(_jobBoards);
	}

	var index = readlineSync.keyInSelect(choices, 'Select a contract board ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
	} else {
		pushMenu(menu.ship_contracts_available, _jobBoards[index].id)
	}
}

// Contracts option
var menuContractsDetails = function(contractId) {
	var _contract = contract.contractIdToContract(contractId);
	console.log('Your location: ' + quantum.quantumIdToLocation(data.player.quantum_location_id));
	console.log('');
	console.log('Contract details:');
	console.log('');
	console.log(_contract.toDetailsString(true, data.player.journal.contractIdIsAccepted(contractId), data.player.journal.tick, data.player.journal.currentMoment()));

	if (!data.player.journal.contractIdIsAccepted(contractId)) {
		// Nothing to do unless the contract has been accepted.
		console.log('');
		keyInPause();
		popMenu();
	} else {
		var choices = [];
		if (_contract.canBeCompleted()) {
			if (_contract.hasExpired(data.player.journal.tick)) {
				choices.push(menu.ship_contracts_details_complete_late);
			} else {
				choices.push(menu.ship_contracts_details_complete);
			}
		} else {
			choices.push(menu.ship_contracts_details_abandon);
		}

		var index = readlineSync.keyInSelect(choices, 'Select a contract option ', {cancel:CANCEL_STRING, guide:false});
		if (index == -1) {
			popMenu();
		} else {
			if (choices[index].id === menu.ship_contracts_details_complete.id || choices[index].id === menu.ship_contracts_details_complete_late.id) {
				var confirmComplete;

				if (_contract.scuLost() > 0) {
					if (choices[index].id === menu.ship_contracts_details_complete.id) {
						console.log('------------------');
						breakConsole.log("You will earn the base payout plus the on-time completion bonus, and pay a " + _contract.lostSCUPenalty() + " UEC penalty for " + _contract.scuLost() + " lost SCU.");
						confirmComplete = readlineSync.keyInYNStrict("Complete contract?", {guide:true});
					} else if (choices[index].id === menu.ship_contracts_details_complete_late.id) {
						console.log('------------------');
						breakConsole.log("You will earn the base payout, but not the on-time completion bonus, and pay a " + _contract.lostSCUPenalty() + " UEC penalty for " + _contract.scuLost() + " lost SCU.");
						confirmComplete = readlineSync.keyInYNStrict("Complete contract?", {guide:true});
					}
				} else {
					if (choices[index].id === menu.ship_contracts_details_complete.id) {
						console.log('------------------');
						breakConsole.log('You will earn the base payout plus the on-time completion bonus.');
						confirmComplete = readlineSync.keyInYNStrict("Complete contract?", {guide:true});
					} else if (choices[index].id === menu.ship_contracts_details_complete_late.id) {
						console.log('------------------');
						breakConsole.log('You will earn the base payout, but not the on-time completion bonus.');
						confirmComplete = readlineSync.keyInYNStrict("Complete contract?", {guide:true});
					}
				}

				if (confirmComplete) {
					if (choices[index].id === menu.ship_contracts_details_complete.id) {
						console.log('------------------');
						console.log('Payout (on-time): ' + _contract.completionOnTimePayout() + ' UEC (~' + Math.round(_contract.payoutPerSCUDistanceOnly()) + ' UEC per SCU plus ' + _contract.payoutPerSCUBase() + ' UEC per SCU bonus)');
						data.player.journal.addCredits(_contract.completionOnTimePayout(), journal.history_credits_earn_contract);
						
					} else if (choices[index].id === menu.ship_contracts_details_complete_late.id) {
						console.log('------------------');
						console.log('Payout (late): ' + _contract.completionLatePayout() + ' UEC (~' + Math.round(_contract.payoutPerSCUDistanceOnly()) + ' UEC per SCU, without ' + _contract.payoutPerSCUBase() + ' UEC per SCU bonus)');
						data.player.journal.addCredits(_contract.completionLatePayout(), journal.history_credits_earn_contract);			
					}

					if (_contract.scuLost() > 0) {
						console.log('Lost cargo penalty: ' + _contract.lostSCUPenalty() + ' UEC (~' + Math.round(Math.abs(_contract.penaltyPerSCU())) + ' UEC per SCU)');
						data.player.journal.addDebt(_contract.lostSCUPenalty(), journal.history_debt_add_contract);
					}

					data.player.journal.completeContractId(contractId);
					displayTimeout(3);
					keyInPause();
				}

				if (peekMenuTo(menu.ship_contracts)) {
					popMenuTo(menu.ship_contracts);
				} else if (peekMenuTo(menu.port_contracts)) {
					popMenuTo(menu.port_contracts);
				} else {
					popMenu();
				}
			} else if (choices[index].id === menu.ship_contracts_details_abandon.id) {
				var confirmAbandon;

				if (_contract.scuLost() > 0) {
					console.log('------------------');
					breakConsole.log("You will earn 50% of the payout for your delivered SCU, and pay a " + _contract.lostSCUPenalty() + " UEC penalty for " + _contract.scuLost() + " lost SCU.");
					confirmAbandon = readlineSync.keyInYNStrict("Abandon contract?", {guide:true});
				} else {
					console.log('------------------');
					console.log("You will earn 50% of the payout for your delivered SCU.");
					confirmAbandon = readlineSync.keyInYNStrict("Abandon contract?", {guide:true});
				}

				if (confirmAbandon) {
					console.log('------------------');
					breakConsole.log('Payout: ' + _contract.abandonedPayout() + ' UEC (50% of ~' + Math.round(_contract.payoutPerSCUDistanceOnly()) + ' UEC per SCU, without ' + _contract.payoutPerSCUBase() + ' UEC per SCU bonus)');
					data.player.journal.addCredits(_contract.abandonedPayout(), journal.history_credits_earn_contract);

					if (_contract.scuLost() > 0) {
						console.log('Lost cargo penalty: ' + _contract.lostSCUPenalty() + ' UEC (~' + Math.round(Math.abs(_contract.penaltyPerSCU())) + ' UEC per SCU)');
						data.player.journal.addDebt(_contract.lostSCUPenalty(), journal.history_debt_add_contract);
					}

					data.player.journal.abandonContractId(contractId);
					displayTimeout(3);
					keyInPause();
				}

				if (peekMenuTo(menu.ship_contracts)) {
					popMenuTo(menu.ship_contracts);
				} else if (peekMenuTo(menu.port_contracts)) {
					popMenuTo(menu.port_contracts);
				} else {
					popMenu();
				}
			} else {
				popMenu();
			}
		}
	}
}

// Contracts option
var menuContractsDetailsAvailable = function(contractId, jobBoardId) {
	var _contract = contract.contractIdToContract(contractId);

	console.log('Your location: ' + quantum.quantumIdToLocation(data.player.quantum_location_id));
	console.log('');
	console.log('Contract details:');
	console.log('');
	console.log(_contract.toDetailsString(false, true, data.player.journal.tick, data.player.journal.currentMoment()));

	var choices = [];
	choices.push(menu.ship_contracts_details_available_accept);

	var index = readlineSync.keyInSelect(choices, 'Select a contract option ', {cancel:CANCEL_STRING, guide:false});

	if (index == -1) {
		popMenu();
	} else if (choices[index].id === menu.ship_contracts_details_available_accept.id) {
		if (data.player.journal.acceptedContracts().length >= MAX_CONTRACTS) {
			console.log('------------------');
			console.log("Can't accept more than " + MAX_CONTRACTS + " contracts.")
			displayTimeout(3);
			popMenu();
		} else {
			var _jobBoard = jobboard.jobBoardIdToJobBoard(jobBoardId);
			_jobBoard.removeContractId(contractId);
			data.player.journal.acceptContractId(contractId);
			if (peekMenuTo(menu.ship_contracts)) {
				popMenuTo(menu.ship_contracts);
			} else if (peekMenuTo(menu.port_contracts)) {
				popMenuTo(menu.port_contracts);
			} else {
				popMenu();
			}
		}
	} else {
		popMenu();
	}
}

// Cargo option
var menuCargo = function() {
	console.log('Your location: ' + quantum.quantumIdToLocation(data.player.quantum_location_id));
	console.log('');
	console.log('Your cargo: ' + data.ship.loadedCargoSize() + ' / ' + data.ship.totalCargoSize() + ' SCU');

	var choices = [];

	if (data.ship.hasMultipleCargoHolds()) {
		data.ship.cargo.forEach(function(hold) {
			choices.push(new menu.Menu("ship_cargo_hold", hold.toString()));
		});
	} else if (data.ship.loadedCargoSize() == 0) {
		choices.push(["[No cargo]"]);
	} else {
		// Show cargo for cargo details; this should be grouped by contract id; show for current loaded contracts
		var _containerGroupByContractId = data.ship.cargoHoldForIndex(0).containerGroupByContractId();

		for (_contractId in _containerGroupByContractId) {
			var _containerGroup = _containerGroupByContractId[_contractId];
			choices.push(_containerGroup);
		}
	}

	if (data.ship.isLanded() || data.ship.isDockedWithTender()) {
		var _landingPad = landingPad.landingPadIdToLocation(data.ship.landing_pad_location_id);
		var _portLocation = port.portIdToLocation(_landingPad.port_id);

		var _cargo = _portLocation.cargo.containersForContractIds(data.player.journal.acceptedContractIds());

		choices.push(new menu.Menu("ship_cargo_available", _portLocation.display_name + " (" + _cargo.length + " containers)"));
	} else if (data.ship.isDocked()) {
		var _shipcontact = shipcontact.shipContactIdToShipContact(data.ship.docked_shipcontact_id);

		var _cargo = _shipcontact.cargo.containersForContractIds(data.player.journal.acceptedContractIds());

		choices.push(new menu.Menu("ship_cargo_available", _shipcontact.name + " (" + _cargo.length + " containers)"));
	}

	var index = readlineSync.keyInSelect(choices, 'Select cargo ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
	} else {
		if (choices[index].id == menu.ship_cargo_available.id) {
			pushMenu(menu.ship_cargo_available);
		} else if (choices[index].id == menu.ship_cargo_hold.id) {
			pushMenu(menu.ship_cargo_hold, index);
		} else {
			if (data.ship.loadedCargoSize() == 0) {
				popMenu();
			} else {
				// Cargo hold 0 is the first cargo hold
				pushMenu(menu.ship_cargo_details_from, choices[index], 0);
			}
		}
	}
}

var menuCargoHold = function(cargoHoldIndex) {
	var hold = data.ship.cargoHoldForIndex(cargoHoldIndex);

	console.log('Your location: ' + quantum.quantumIdToLocation(data.player.quantum_location_id));
	console.log('');
	console.log(hold.toString());

	var choices = [];

	if (hold.loadedCargoSize() == 0) {
		choices.push(["[No cargo]"]);
	} else {
		// Show cargo for cargo details; this should be grouped by contract id; show for current loaded contracts
		var _containerGroupByContractId = hold.containerGroupByContractId();

		for (_contractId in _containerGroupByContractId) {
			var _containerGroup = _containerGroupByContractId[_contractId];
			choices.push(_containerGroup);
		}
	}

	var index = readlineSync.keyInSelect(choices, 'Select cargo ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
	} else {
		if (hold.loadedCargoSize() == 0) {
			popMenu();
		} else {
			pushMenu(menu.ship_cargo_details_from, choices[index], cargoHoldIndex);
		}
	}
}

// Cargo option
var menuCargoAvailable = function(destinationId) {
	console.log('Your location: ' + quantum.quantumIdToLocation(data.player.quantum_location_id));
	console.log('');
	console.log('Your cargo: ' + data.ship.loadedCargoSize() + ' / ' + data.ship.totalCargoSize() + ' SCU');
	console.log('');

	var choices = [];
	var _containers = [];
	var _containerGroups = [];

	if (data.ship.isLanded() || data.ship.isDockedWithTender()) {
		var _landingPad = landingPad.landingPadIdToLocation(data.ship.landing_pad_location_id);
		var _portLocation = port.portIdToLocation(_landingPad.port_id);
		var _containerGroupsForContractIds = _portLocation.cargo.containerGroupsForContractIds(data.player.journal.acceptedContractIds());

		for (_contractId in _containerGroupsForContractIds) {
			var _containerGroup = _containerGroupsForContractIds[_contractId];
			_containerGroups.push(_containerGroup);
		}

		console.log(_portLocation.display_name +  '\'s cargo: ');
	} else if (data.ship.isDocked()) {
		var _shipcontact = shipcontact.shipContactIdToShipContact(data.ship.docked_shipcontact_id);
		var _containerGroupsForContractIds = _shipcontact.cargo.containerGroupsForContractIds(data.player.journal.acceptedContractIds());

		for (_contractId in _containerGroupsForContractIds) {
			var _containerGroup = _containerGroupsForContractIds[_contractId];
			_containerGroups.push(_containerGroup);
		}

		console.log(_shipcontact.name +  '\'s cargo: ');
	}	

	if (_containerGroups.length == 0) {
		choices.push(["[No cargo]"]);
	} else {
		choices = choices.concat(_containerGroups);
	}

	var index = readlineSync.keyInSelect(choices, 'Select cargo ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
	} else {
		if (_containerGroups.length == 0) {
			popMenu();
		} else {
			pushMenu(menu.ship_cargo_details_to, choices[index]);
		}
	}
}

// Cargo details menu (transfer to port/ship contact)
// Show details about the cargo: the SCU, containers, manufacturer, commodity, etc.
// For cargo on your ship, you can transfer it to the port/ship contact
// For cargo in the port/shipcontact, you can transfer it to your ship

var menuCargoDetails = function(containerGroup, fromCargoHoldIndex, isFromShip) {
	console.log('Your location: ' + quantum.quantumIdToLocation(data.player.quantum_location_id));
	console.log('');
	console.log('Selected cargo: ' + containerGroup);

	var commodity = commodities.commodityIdToCommodity(containerGroup.groupedCargo()[0].commodity_id);

	console.log('Origin: ' + commodity.manufacturer_name);
	if (containerGroup.contractId() != null) {
		console.log('Destination: ' + contract.contractIdToContract(containerGroup.contractId()).dropoff);
	}
	console.log('');
	breakConsole.log(commodity.description);

	var choices = [];

	if (data.ship.isLanded() || data.ship.isDockedWithTender()) {
		var _landingPad = landingPad.landingPadIdToLocation(data.ship.landing_pad_location_id);
		var _portLocation = port.portIdToLocation(_landingPad.port_id);
		if (isFromShip) {
			choices.push(new menu.Menu("ship_cargo_details_transfer_to_port", "Transfer to " + _portLocation.display_name));
		} else {
			choices.push(new menu.Menu("ship_cargo_details_transfer_from_port", "Transfer from " + _portLocation.display_name));
		}
	} else if (data.ship.isDocked()) {
		var _shipcontact = shipcontact.shipContactIdToShipContact(data.ship.docked_shipcontact_id);
		if (isFromShip) {
			choices.push(new menu.Menu("ship_cargo_details_transfer_to_shipcontact", "Transfer to " + _shipcontact));
		} else {
			choices.push(new menu.Menu("ship_cargo_details_transfer_from_shipcontact", "Transfer from " + _shipcontact));
		}
	} else {
		choices.push(menu.ship_cargo_details_jettison);
	}

	var index = readlineSync.keyInSelect(choices, 'Select cargo option ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		popMenu();
	} else {
		if (choices[index].id == menu.ship_cargo_details_jettison.id) {
			console.log('------------------');
			console.log('Number of containers to jettison?');
			var numContainersToJettison = cargoChoiceDialog(containerGroup, cargohold.HOLD_SIZE_UNLIMITED, cargohold.HOLD_SIZE_UNLIMITED);
			clearScreen();
			if (numContainersToJettison > 0) {
				if (!confirmDoorOrLocksDialog(data.ship.cargoHoldForIndex(fromCargoHoldIndex))) {
					clearScreen();
					return;
				}

				var _shipType = shipType.shipIdToShip(data.ship.type_id);
				var _secondsPerContainer = _shipType.cargoTransferDelay(containerGroup.groupedCargo()[0].size);
				var confirmJettison = readlineSync.keyInYNStrict("Jettison " + numContainersToJettison + 
					" containers of " + containerGroup.groupedCargo()[0] + 
					"?\nYou will not be able to retrieve them.\n" + 
					"This will take " + (_secondsPerContainer * numContainersToJettison) + " seconds.", {guide:true});
				if (confirmJettison) {
					console.log('------------------');
					for (var i = 0; i < numContainersToJettison; i++) {
						var _container = containerGroup.groupedCargo()[i];
						console.log("Jettisoning " + _container + ", " + (i + 1) + "/" + numContainersToJettison);
						var _shipType = shipType.shipIdToShip(data.ship.type_id);
						displayTimeout(_secondsPerContainer);
						data.ship.cargoHoldForIndex(fromCargoHoldIndex).unloadContainer(_container);
					}
				}
			}
			popMenuTo(menu.ship_cargo);
		} else if (choices[index].id == menu.ship_cargo_details_transfer_to_port.id ||
				choices[index].id == menu.ship_cargo_details_transfer_from_port.id) {
			
			var toCargoHoldIndex = -1;
			if (!isFromShip) {
				if (data.ship.hasMultipleCargoHolds()) {
					toCargoHoldIndex = cargoHoldChoiceDialog();
					if (toCargoHoldIndex == -1) {
						clearScreen();
						return;
					}
				} else {
					toCargoHoldIndex = 0;
				}
			}
	
			// if not from ship, and hold with toCargoHoldIndex's id does not contain container group id, 
			// and total count of container groups exceeds max, throw error.
			if (!isFromShip) {
				var cargoHold = data.ship.cargoHoldForIndex(toCargoHoldIndex);
				if (!cargoHold.hasContainerGroupForContractId(containerGroup.contractId()) && 
					cargoHold.uniqueContractIds().length >= MAX_CARGO_CONTRACTS) {
					console.log('------------------');
					console.log("Can't store cargo from more than " + MAX_CARGO_CONTRACTS + " contracts in your hold.")
					displayTimeout(3);
					popMenu();
					return;
				}
			}

			console.log('------------------');
			console.log('Number of containers to transfer? ');

			var numContainersToTransfer = 0;
			if (isFromShip) {
				numContainersToTransfer = cargoChoiceDialog(containerGroup, _portLocation.cargo.freeSpace(), _portLocation.cargo.size);
			} else {
				numContainersToTransfer = cargoChoiceDialog(containerGroup, data.ship.cargoHoldForIndex(toCargoHoldIndex).freeSpace(), data.ship.cargoHoldForIndex(toCargoHoldIndex).size);
			}

			clearScreen();
			if (numContainersToTransfer > 0) {
				if (!confirmDoorOrLocksDialog(isFromShip ? data.ship.cargoHoldForIndex(fromCargoHoldIndex) : data.ship.cargoHoldForIndex(toCargoHoldIndex))) {
					clearScreen();
					return;
				}

				var _landingPad = landingPad.landingPadIdToLocation(data.ship.landing_pad_location_id);
				var _portLocation = port.portIdToLocation(_landingPad.port_id);
				var _shipType = shipType.shipIdToShip(data.ship.type_id);
				var _secondsPerContainer = _shipType.cargoTransferDelay(containerGroup.groupedCargo()[0].size);
				var confirmTransfer = readlineSync.keyInYNStrict("Transfer " + numContainersToTransfer + 
					" containers of " + containerGroup.groupedCargo()[0] + 
					"?\nThis will take " + _secondsPerContainer * numContainersToTransfer + " seconds.", {guide:true});
				if (confirmTransfer) {
					console.log('------------------');
					for (var i = 0; i < numContainersToTransfer; i++) {
						var _container = containerGroup.groupedCargo()[i];
						if (isFromShip) {
							data.ship.cargoHoldForIndex(fromCargoHoldIndex).unloadContainer(_container);
							_portLocation.cargo.loadContainer(_container);
							console.log("Transferring " + _container + ", " + (i + 1) + "/" + numContainersToTransfer);
							displayTimeout(_secondsPerContainer);
						} else {
							if (data.ship.cargoHoldForIndex(toCargoHoldIndex).canLoadContainer(_container)) {
								_portLocation.cargo.unloadContainer(_container)
								data.ship.cargoHoldForIndex(toCargoHoldIndex).loadContainer(_container);
								console.log("Transferring " + _container + ", " + (i + 1) + "/" + numContainersToTransfer);
								displayTimeout(_secondsPerContainer);
							} else {
								console.log("Cannot transfer " + _container + ", not enough room on ship.");
								displayTimeout(3);
								break;
							}
						}
					}
				}
			}
			popMenuTo(menu.ship_cargo);
		} else if (choices[index].id == menu.ship_cargo_details_transfer_to_shipcontact.id ||
				choices[index].id == menu.ship_cargo_details_transfer_from_shipcontact.id) {
			
			var toCargoHoldIndex = -1;
			if (!isFromShip) {
				if (data.ship.hasMultipleCargoHolds()) {
					toCargoHoldIndex = cargoHoldChoiceDialog();
					if (toCargoHoldIndex == -1) {
						clearScreen();
						return;
					}
				} else {
					toCargoHoldIndex = 0;
				}
			}

			// if not from ship, and hold with toCargoHoldIndex's id does not contain container group id, 
			// and total count of container groups exceeds max, throw error.
			if (!isFromShip) {
				var cargoHold = data.ship.cargoHoldForIndex(toCargoHoldIndex);
				if (!cargoHold.hasContainerGroupForContractId(containerGroup.contractId()) && 
					cargoHold.uniqueContractIds().length >= MAX_CARGO_CONTRACTS) {
					console.log('------------------');
					console.log("Can't store cargo from more than " + MAX_CARGO_CONTRACTS + " contracts in your hold.")
					displayTimeout(3);
					popMenu();
					return;
				}
			}

			console.log('------------------');
			console.log('Number of containers to transfer? ');

			var numContainersToTransfer= 0;
			if (isFromShip) {
				numContainersToTransfer = cargoChoiceDialog(containerGroup, _shipcontact.cargo.freeSpace(), _shipcontact.cargo.size);
			} else {
				numContainersToTransfer = cargoChoiceDialog(containerGroup, data.ship.cargoHoldForIndex(toCargoHoldIndex).freeSpace(), data.ship.cargoHoldForIndex(toCargoHoldIndex).size);
			}

			clearScreen();
			if (numContainersToTransfer > 0) {
				if (!confirmDoorOrLocksDialog(isFromShip ? data.ship.cargoHoldForIndex(fromCargoHoldIndex) : data.ship.cargoHoldForIndex(toCargoHoldIndex))) {
					clearScreen();
					return;
				}

				var _shipcontact = shipcontact.shipContactIdToShipContact(data.ship.docked_shipcontact_id);
				var _shipType = shipType.shipIdToShip(data.ship.type_id);
				var _secondsPerContainer = _shipType.cargoTransferDelay(containerGroup.groupedCargo()[0].size);
				var confirmTransfer = readlineSync.keyInYNStrict("Transfer " + numContainersToTransfer + 
					" containers of " + containerGroup.groupedCargo()[0] + 
					"?\nThis will take " + _secondsPerContainer * numContainersToTransfer + " seconds.", {guide:true});
				if (confirmTransfer) {
					console.log('------------------');
					for (var i = 0; i < numContainersToTransfer; i++) {
						var _container = containerGroup.groupedCargo()[i];
						if (isFromShip) {
							if (_shipcontact.cargo.canLoadContainer(_container)) {
								data.ship.cargoHoldForIndex(fromCargoHoldIndex).unloadContainer(_container);
								_shipcontact.cargo.loadContainer(_container);
								console.log("Transferring " + _container + ", " + (i + 1) + "/" + numContainersToTransfer);
								displayTimeout(_secondsPerContainer);
							} else {
								console.log("Cannot transfer " + _container + ", not enough room on ship.");
								displayTimeout(3);
								break;
							}
						} else {
							if (data.ship.cargoHoldForIndex(toCargoHoldIndex).canLoadContainer(_container)) {
								_shipcontact.cargo.unloadContainer(_container)
								data.ship.cargoHoldForIndex(toCargoHoldIndex).loadContainer(_container);
								console.log("Transferring " + _container + ", " + (i + 1) + "/" + numContainersToTransfer);
								displayTimeout(_secondsPerContainer);
							} else {
								console.log("Cannot transfer " + _container + ", not enough room on ship.");
								displayTimeout(3);
								break;
							}
						}
					}
				}
			}
			popMenuTo(menu.ship_cargo);
		} else {
			popMenu();
		}
	}
}

var menuCompanyLog = function() {
	showCompanyLog(data.player.journal);
	keyInPause();
	popMenu();
}

var menuRespawn = function() {
	breakConsole.log('Your ship will be returned to your hangar, but your accepted contracts will be abandoned and cargo on your ship will be lost. 24 hours will pass. You will pay a penalty for lost cargo.\n');
	confirmRespawn = readlineSync.keyInYNStrict("Respawn?", {guide:true});

	if (confirmRespawn) {
		var totalAbandonedContracts = 0;
		var totalAbandonedPayout = 0;
		var totalAbandonedPenalty = 0;

		data.player.journal.acceptedContracts().forEach(function(_contract) {
			totalAbandonedPayout = totalAbandonedPayout + _contract.abandonedPayout();
			if (_contract.scuLost() > 0) {
				totalAbandonedPenalty = totalAbandonedPenalty + _contract.lostSCUPenalty();
			}
			data.player.journal.abandonContractId(_contract.id);
			totalAbandonedContracts = totalAbandonedContracts + 1;
		});

		if (totalAbandonedContracts > 0) {
			console.log('------------------');
			console.log('Abandoned: ' + totalAbandonedContracts + " contracts");
			if (totalAbandonedPayout > 0) {
				data.player.journal.addCredits(totalAbandonedPayout, journal.history_credits_earn_contract);
				console.log('Payout: ' + totalAbandonedPayout + ' UEC');
			}
			if (totalAbandonedPenalty > 0) {
				data.player.journal.addDebt(totalAbandonedPenalty, journal.history_debt_add_contract);
				console.log('Lost cargo penalty: ' + totalAbandonedPenalty + ' UEC');
			}
		}

		data.ship.clear();
		console.log('------------------');
		console.log('Respawning...')
		displayTimeout(3);
		if (totalAbandonedContracts > 0) {
			keyInPause();
		}

		incrementTickBy(24);

		popMenuTo(menu.spawn);
	} else {
		popMenu();
	}
}

var requestShipDialog = function(portLocationId, shipObjectId) {
	var portLocation = port.portIdToLocation(portLocationId);
	var shipObject = data.player.journal.shipObjectIdToShipObject(shipObjectId);
	var ship_type = shipType.shipIdToShip(shipObject.ship_id);
	var confirmMove = false;
	clearScreen();

	if (data.ship.hasShip() && data.ship.loadedCargoSize() > 0) {
		confirmMove = readlineSync.keyInYNStrict("Move cargo to port? If you request a new ship, your cargo will be moved to the port. ", {guide:true});	
	}

	if (confirmMove) {
		var scuTransferred = 0;
		data.ship.cargo.forEach(function(hold) {
			var containersToTransfer = [];
			hold.containers().forEach(function(container) {
				containersToTransfer.push(container);
			});
			containersToTransfer.forEach(function(container) {
				scuTransferred = scuTransferred + container.size;
			});
		});
		if (scuTransferred > 0) {
			console.log('------------------');
			console.log("" + scuTransferred + " SCU will be transferred to port when ship is requested.")
			displayTimeout(3);
			clearScreen();
		}
	}
	var choices = [];
	choices = choices.concat(portLocation.landingPadDestinations().filter(function(landingPadDestination) {
		var landing_pad = landingPad.landingPadIdToLocation(landingPadDestination.id);
		return landing_pad.canAcceptSize(ship_type.size);
	}));
	var index = readlineSync.keyInSelect(choices, 'Which landing pad did it arrive at? ', {cancel:CANCEL_STRING, guide:false});
	if (index == -1) {
		return false;
	}
	console.log('------------------');
	if (confirmMove) {
		var scuTransferred = 0;
		data.ship.cargo.forEach(function(hold) {
			var containersToTransfer = [];
			hold.containers().forEach(function(container) {
				containersToTransfer.push(container);
			});
			containersToTransfer.forEach(function(container) {
				scuTransferred = scuTransferred + container.size;
				hold.unloadContainer(_container);
				portLocation.cargo.loadContainer(_container);
			});
		});
		if (scuTransferred > 0) {
			console.log('Transferring ' + scuTransferred + " SCU to port...")
			displayTimeout(3);
			console.log('------------------');
		}
	}
	data.ship.id = shipObject.id;
	data.ship.setType(ship_type.id);
	var _landingPadDest = choices[index];
	setDestination(_landingPadDest);
	data.ship.landing_pad_location_id = _landingPadDest.id;
	data.ship.name = shipObject.name;
	console.log('Requesting ' + shipObject + '...');
	displayTimeout(3);
	return true;
}

var confirmDoorOrLocksDialog = function(cargoHold) {
	var confirmDoorOrLocks;

	if (cargoHold.is_external) {
		confirmDoorOrLocks = readlineSync.keyInYNStrict("Disengage external cargo locks?", {guide:true});
	} else {
		confirmDoorOrLocks = readlineSync.keyInYNStrict("Confirm that " + cargoHold.door_name + " is open?", {guide:true});
	}

	console.log('------------------');

	return confirmDoorOrLocks;
}

var cargoHoldChoiceDialog = function() {
	console.log('------------------');
	console.log('Transfer to cargo hold? ');

	var choices = [];
	data.ship.cargo.forEach(function(hold) {
		choices.push(new menu.Menu("ship_cargo_hold", hold.toString()));
	});

	var index = readlineSync.keyInSelect(choices, 'Select cargo hold ', {cancel:CANCEL_STRING, guide:false});
	return index;
}

var debtRepaymentDialog = function() {
	var selectedPrice;
	var _maxDebt = data.player.journal.getDebt(), _min = 0, value = 0, key, _debtString, _targetMaxSize, _targetMaxPayment, _targetMinPayment, targetFreeSpace, step, maxPaymentWithStep;

	var MAX_STEPS = 20;

	_targetMaxPayment = Math.min(_maxDebt, data.player.journal.getCredits());
	_targetMinPayment = 0;

	if (_targetMaxPayment == 0) {
		return 0;
	}

	step = Math.ceil(_targetMaxPayment / MAX_STEPS);
	maxPaymentWithStep = _targetMaxPayment % step == 0 ? Math.floor(_targetMaxPayment / step) : Math.floor(_targetMaxPayment / step) + 1;
	console.log('\n' + (new Array(20)).join(' ') + '[A] <- -> [D]  Confirm: [SPACE]\n\n');
	while (true) {
		var selectedPayment;

		if (value == maxPaymentWithStep && _targetMaxPayment % step > 0) {
			selectedPayment = _targetMaxPayment;
		} else {
			selectedPayment = value * step;
		}

		if (selectedPayment < (_maxDebt)) {
			_debtString = " (Debt: " + ((_maxDebt) - selectedPayment) + " UEC, +" + Math.floor(((_maxDebt) - selectedPayment) * 0.01) + " UEC/day)";
		} else {
			_debtString = "";
		}
		
		console.log('\x1B[1A\x1B[K|' +
			(new Array(value + 1)).join('X') + '>' +
			(new Array(maxPaymentWithStep - value + 1)).join('-') + '| ' + (selectedPayment) + "/" + _maxDebt + " UEC" + _debtString);
		key = readlineSync.keyIn('', {
			hideEchoBack: true, 
			mask: '', 
			limit: 'aAdD '
		});
		if (key === 'a' || key === 'A') {
			if (value > _min) {
			 value--;
			}
		} else if (key === 'd' || key === 'D') {
			if (value < maxPaymentWithStep) {
				value++;
			}
		} else { 
			break;
		}
	}
	return selectedPayment;
}

var financingDialog = function(shipTypeId) {
	var ship_type = shipType.shipIdToShip(shipTypeId);

	var selectedPrice;
	var _maxPrice = ship_type.purchasePrice(), _min = 0, value = 0, key, _debtString, _targetMaxSize, _targetMaxPayment, _targetMinPayment, targetFreeSpace, step, maxPaymentWithStep;

	var MAX_STEPS = 20;

	_targetMaxPayment = Math.min(_maxPrice - ship_type.downPayment(), data.player.journal.getCredits() - ship_type.downPayment());
	_targetMinPayment = 0;

	if (_targetMaxPayment == 0) {
		return ship_type.downPayment();
	}

	step = Math.ceil(_targetMaxPayment / MAX_STEPS);
	maxPaymentWithStep = _targetMaxPayment % step == 0 ? Math.floor(_targetMaxPayment / step) : Math.floor(_targetMaxPayment / step) + 1;
	console.log('\n' + (new Array(20)).join(' ') + '[A] <- -> [D]  Confirm: [SPACE]\n\n');
	while (true) {
		var selectedPayment;

		if (value == maxPaymentWithStep && _targetMaxPayment % step > 0) {
			selectedPayment = _targetMaxPayment;
		} else {
			selectedPayment = value * step;
		}

		if (selectedPayment < (_maxPrice - ship_type.downPayment())) {
			_debtString = " (Debt: +" + ((_maxPrice - ship_type.downPayment()) - selectedPayment) + " UEC, +" + Math.floor(((_maxPrice - ship_type.downPayment()) - selectedPayment) * 0.01) + " UEC/day)";
		} else {
			_debtString = "";
		}
		
		console.log('\x1B[1A\x1B[K|' +
			(new Array(value + 1)).join('X') + '>' +
			(new Array(maxPaymentWithStep - value + 1)).join('-') + '| ' + (selectedPayment + ship_type.downPayment()) + "/" + _maxPrice + " UEC" + _debtString);
		key = readlineSync.keyIn('', {
			hideEchoBack: true, 
			mask: '', 
			limit: 'aAdD '
		});
		if (key === 'a' || key === 'A') {
			if (value > _min) {
			 value--;
			}
		} else if (key === 'd' || key === 'D') {
			if (value < maxPaymentWithStep) {
				value++;
			}
		} else { 
			break;
		}
	}
	return selectedPayment + ship_type.downPayment();
}

var cargoChoiceDialog = function(containerGroup, targetFreeSpace, targetSize) {
	var _maxIncoming = containerGroup.groupedCargo().length, _min = 0, value = 0, key, _calculatedSCU, _holdSizeString, _targetMaxSize, _targetMaxContainers, step, maxIncomingWithStep;
	
	var MAX_STEPS = 30;

	if (targetFreeSpace != cargohold.HOLD_SIZE_UNLIMITED) {
		_targetMaxSize = Math.min(containerGroup.containerSize() * _maxIncoming, targetFreeSpace);
		_targetMaxContainers = Math.min(_maxIncoming, Math.floor(targetFreeSpace / containerGroup.containerSize()));
	} else {
		_targetMaxSize = containerGroup.containerSize() * _maxIncoming;
		_targetMaxContainers = _maxIncoming;
	}

	if (_targetMaxContainers > MAX_STEPS) {
		step = Math.ceil(_targetMaxContainers / MAX_STEPS);
		maxIncomingWithStep = _targetMaxContainers % step == 0 ? Math.floor(_targetMaxContainers / step) : Math.floor(_targetMaxContainers / step) + 1;
	} else {
		step = 1;
		maxIncomingWithStep = _targetMaxContainers;
	}

	console.log('\n' + (new Array(20)).join(' ') + '[A] <- -> [D]  Confirm: [SPACE]\n\n');
	while (true) {
		var numContainers;

		if (value == maxIncomingWithStep && _targetMaxContainers % step > 0) {
			numContainers = _targetMaxContainers;
		} else {
			numContainers = value * step;
		}

		if (targetFreeSpace != cargohold.HOLD_SIZE_UNLIMITED) {
			_calculatedSCU = (targetSize - targetFreeSpace) + (numContainers * containerGroup.containerSize());
			_holdSizeString = " (" + _calculatedSCU + "/" + targetSize + " SCU in hold)";
		} else {
			_holdSizeString = " (" + (numContainers * containerGroup.containerSize()) + " SCU)";
		}
		
		console.log('\x1B[1A\x1B[K|' +
			(new Array(value + 1)).join('X') + '>' +
			(new Array(maxIncomingWithStep - value + 1)).join('-') + '| ' + numContainers + "/" + _maxIncoming + " containers" + _holdSizeString);
		key = readlineSync.keyIn('', {
			hideEchoBack: true, 
			mask: '', 
			limit: 'aAdD '
		});
		if (key === 'a' || key === 'A') {
			if (value > _min) {
			 value--;
			}
		} else if (key === 'd' || key === 'D') {
			if (value < maxIncomingWithStep) {
				value++;
			}
		} else { 
			break;
		}
	}
	return numContainers;
}

var exitDialog = function() {
	clearScreen();
	breakConsole.log('If you save, your ship, credits, and contract history will be saved, but your accepted contracts and cargo will be abandoned.\n');
	var confirmSave = keyInYNBack("Save before exiting?")
	if (confirmSave == -1) {
		return false;
	}
	console.log('------------------');
	var confirmExit = readlineSync.keyInYNStrict("Exit?", {guide:true})
	if (confirmExit) {		
		if (confirmSave) {
			var totalPayout = 0;
			var totalPenalty = 0;
			var totalAbandoned = 0;
			data.player.journal.acceptedContracts().forEach(function (_contract) {
				totalAbandoned = totalAbandoned + 1;
				data.player.journal.addCredits(_contract.abandonedPayout(), journal.history_credits_earn_contract)
				totalPayout = totalPayout + _contract.abandonedPayout();
				data.player.journal.abandonContractId(_contract.id);
				if (_contract.scuLost() > 0) {
					data.player.journal.addDebt(_contract.lostSCUPenalty(), journal.history_debt_add_contract);
					totalPenalty = totalPenalty + _contract.lostSCUPenalty();
				}
			});
			if (totalAbandoned > 0) {
				console.log('------------------');
				console.log("Abandoned " + totalAbandoned + " contracts for " + totalPayout + " UEC payout and " + totalPenalty + " UEC penalty for lost cargo.");
			}
			store.add(data.player.journal.save());
			console.log("\nGame saved.")
		} else {
			console.log("\nGame not saved.")
		}
		return true;
	} else {
		return false;
	}
}

var endGame = function() {
	gameEnded = true;
}

var gameEnded = false;

var pushMenu = function(_item, _data, _data2) {
	menuStack.unshift(
		{
			item: _item,
			data: _data,
			data2: _data2
		}
	)
}

var popMenuTo = function(targetMenu) {
	while (peekMenu().item.id != targetMenu.id) {
		menuStack.shift();
	}
	return peekMenu();
}

var popMenu = function() {
	return menuStack.shift();
}

var peekMenuTo = function(targetMenu) {
	var i = menuStack.length;
    while (i--) {
        if (menuStack[i].item.id === targetMenu.id) {
            return true;
        }
    }
    return false;
}

var peekMenu = function() {
	return menuStack[0];
}

var menuStack = [];

////////////////////////////////

// Test Distance to
// var crusader = quantum.quantumIdToLocation("crusader");
// var comm625 = quantum.quantumIdToLocation("comm625");
// var crusader_via_comm625 = quantum.quantumIdToLocation("crusader_via_comm625");
// var yela = quantum.quantumIdToLocation("yela");
// var comm126 = quantum.quantumIdToLocation("comm126");
// var yela_via_comm126 = quantum.quantumIdToLocation("yela_via_comm126");
// var yela_via_crusader = quantum.quantumIdToLocation("yela_via_crusader");
// var crusader_via_yela = quantum.quantumIdToLocation("crusader_via_yela");

// console.log("Distance from comm126 to comm625: " + comm126.distanceTo("comm625"));
// console.log("Distance from comm126 to crusader_via_comm625: " + comm126.distanceTo("crusader_via_comm625"));
// console.log("Distance from crusader_via_comm625 to comm126: " + crusader_via_comm625.distanceTo("comm126"));
// console.log("Distance from crusader_via_comm625 to comm625: " + crusader_via_comm625.distanceTo("comm625"));
// console.log("Distance from yela_via_comm126 to comm625: " + yela_via_comm126.distanceTo("comm625"));
// console.log("Distance from comm625 to yela_via_comm126: " + comm625.distanceTo("yela_via_comm126"));
// console.log("Distance from yela_via_comm126 to comm126: " + yela_via_comm126.distanceTo("comm126"));
// console.log("Distance from crusader_via_comm625 to yela_via_comm126: " + crusader_via_comm625.distanceTo("yela_via_comm126"));
// console.log("Distance from crusader_via_yela to yela_via_crusader: " + crusader_via_yela.distanceTo("yela_via_crusader"));

// clearScreen();

// data.player.name = readlineSync.question('What is your name? ');

// clearScreen();

// var index = readlineSync.keyInSelect(quantum.quantumIdsToLocations(quantum.spawn_location_ids), 'Where did you spawn? ', {cancel:false, guide:false});

// data.player.spawn_location_id = quantum.quantumIdsToLocations(quantum.spawn_location_ids)[index].id;
// data.player.quantum_location_id = data.player.spawn_location_id;
// console.log('------------------');
// // console.log('Ok, you spawned at ' + quantum.quantumIdsToLocations(quantum.spawn_location_ids)[index]);
// displayTimeout(3);

// clearScreen();

// // var index = readlineSync.keyInSelect(shipType.shipIdsToShips(shipType.ship_ids), 'Which ship are you flying? ', {cancel:false, guide:false});

// // data.ship.setType(shipType.shipIdsToShips(shipType.ship_ids)[index].id);
// // console.log('------------------');
// // console.log('Ok, your ship is a ' + shipType.shipIdToShip(data.ship.type_id));
// // console.log('------------------');
// // data.ship.name = readlineSync.question('What is your ship\'s name? ');

// incrementTick();

// for (var i = 0; i < 10; i++) {
// 	var _contract = metacontract.generateContractForEmployerId("icc");
// 	data.player.journal.acceptContractId(_contract.id);
// }

// displayTimeout(3);

// clearScreen();

pushMenu(menu.splash);

var looping = true;
while (looping) {
	clearScreen();
	var menuItem = peekMenu().item;
	var menuData = peekMenu().data;
	var menuData2 = peekMenu().data2;
	switch (menuItem.id) {
		case menu.splash.id:
			menuSplash();
			break;
		case menu.main.id:
			looping = menuMain();
			break;
		case menu.main_new.id:
			menuMainNew();
			break;
		case menu.main_load.id:
			menuMainLoad();
			break;
		case menu.main_scores.id:
			menuScores();
			break;
		case menu.main_credits.id:
			menuCredits();
			break;
		case menu.spawn.id:
			menuSpawn();
			break;
		case menu.port.id:
			looping = menuPort(menuData);
			break;
		case menu.port_navigation.id:
			menuNavigation(false);
			break;
		case menu.port_contracts.id:
			menuContracts(menu.port_contracts.id);
			break;
		case menu.port_ship_terminals.id:
			menuPortShipTerminals(menuData);
			break;
		case menu.port_ship_terminal_details.id:
			menuPortShipTerminalDetails(menuData, menuData2);
			break;
		case menu.port_ship_purchase_list.id:
			menuPortShipPurchaseList(menuData);
			break;
		case menu.port_ship_purchase_details.id:
			menuPortShipPurchaseDetails(menuData, menuData2);
			break;
		case menu.port_connected_ports.id:
			menuConnectedPorts(menuData);
			break;
		case menu.port_debt_repay.id:
			menuDebtRepay();
			break;
		case menu.navigation_map_crusader.id:
			menuCrusaderMap();
			break;
		case menu.navigation_map_stanton.id:
			menuStantonMap();
			break;
		case menu.navigation_map_starmap.id:
			menuStarMap();
			break;
		case menu.ship.id:
			// Allow breaking out of the loop
			looping = menuSpace();
			break;
		case menu.ship_comms.id:
			menuComms();
			break;
		case menu.ship_navigation.id:
			menuNavigation(true);
			break;
		case menu.ship_navigation_port_destinations.id:
			menuNavigationPortDestinations(menuData);
			break;
		case menu.ship_navigation_landing_pad_destinations.id:
			menuNavigationLandingPadDestinations(menuData);
			break;
		case menu.ship_navigation_quantum.id:
			menuQuantum();
			break;
		case menu.ship_contracts.id:
			menuContracts(menu.ship_contracts.id);
			break;
		case menu.ship_contracts_completed.id:
			menuContracts(menu.ship_contracts_completed.id);
			break;
		case menu.ship_contracts_abandoned.id:
			menuContracts(menu.ship_contracts_abandoned.id);
			break;
		case menu.ship_contracts_jobboards.id:
			menuContractBoards(menu.ship_contracts_jobboards.id);
			break;
		case menu.ship_contracts_available.id:
			menuContracts(menu.ship_contracts_available.id, menuData);
			break;
		case menu.ship_contracts_details.id:
			menuContractsDetails(menuData);
			break;
		case menu.ship_contracts_details_available.id:
			menuContractsDetailsAvailable(menuData, menuData2);
			break;
		case menu.ship_cargo.id:
			menuCargo();
			break;
		case menu.ship_cargo_hold.id:
			menuCargoHold(menuData);
			break;
		case menu.ship_cargo_details_from.id:
			menuCargoDetails(menuData, menuData2, true);
			break;
		case menu.ship_cargo_available.id:
			menuCargoAvailable();
			break;
		case menu.ship_cargo_details_to.id:
			menuCargoDetails(menuData, -1, false);
			break;
		case menu.ship_company_log.id:
		case menu.port_company_log.id:
			menuCompanyLog();
			break;
		case menu.ship_respawn.id:
		case menu.port_respawn.id:
			menuRespawn();
			break;
	}

	if (gameEnded) {
		looping = false;
	}
}
console.log('------------------');
console.log("Thank you for playing Crusader Transport Simulator");
console.log();

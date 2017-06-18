// journal.js

var contract = require('./contract');
var shipType = require('./shiptype');
var moment = require('moment');

var CREDITS_INITIAL = "credits_initial";
var CREDITS_EARN_CONTRACT = "credits_earn_contract";
var CREDITS_EARN_SHIP_SALE = "credits_earn_ship_sale";
var CREDITS_SPENT_SHIP = "credits_spent_ship";
var CREDITS_SPENT_DEBT = "credits_spent_debt";
var DEBT_INITIAL = "debt_initial";
var DEBT_ADD_CONTRACT = "debt_add_contract";
var DEBT_ADD_SHIP = "debt_add_ship";
var DEBT_ADD_INTEREST = "debt_add_interest";

var SCORE_MULTIPLIER_CREDITS = 1;
var SCORE_MULTIPLIER_SCU = 10;
var SCORE_MULTIPLIER_CONTRACTS = 500;

var MAX_RECENT_COMPLETED_CONTRACTS = 12;
var MAX_RECENT_ABANDONED_CONTRACTS = 12;

function Journal() {
	this.version_name = null;
	this.version_ordinal = null;
	this.name = null;
	this.credits = 0;
	this.credits_history = {
		credits_initial: 0,
		credits_earn_contract: 0,
		credits_earn_ship_sale: 0,
		credits_spent_ship: 0,
		credits_spent_debt: 0,
	},
	this.debt = 0;
	this.debt_history = {
		debt_initial: 0,
		debt_add_contract: 0,
		debt_add_ship: 0,
		debt_add_interest: 0,
	},
	this.tick = 0;
	this.endTick = 0;
	this.month = 0;
	this.date = 0;
	this.year = 0;
	this.isSandbox = false;
	this.accepted_contract_ids = [];
	this.abandoned_contract_ids = [];
	this.completed_contract_ids = [];
	this.abandoned_contract_count = 0;
	this.completed_contract_count = 0;
	this.completed_crusader_contract_count = 0;
	this.delivered_scu_count = 0;
	this.delivered_crusader_scu_count = 0;
	this.rendezvous = {};
	this.ships = {};
	this.ship_ids = [];
	this.unique_ship_id = 0;
	this.victory = false;
	this.score = {
		credits_spent_debt: 0,
		debt_initial: 0,
		ownedShips: 0,
		netWorthScore: 0,
		credits: 0,
		shipSellValue: 0,
		debt: 0,
		crusaderScuScore: 0,
		crusaderScu: 0,
		crusaderContractsScore: 0,
		crusaderContracts: 0,
		totalScore: 0,
	};
}

Journal.prototype.load = function(savedJournal) {
	this.id = savedJournal.id;
	this.version_name = savedJournal.version_name;
	this.version_ordinal = savedJournal.version_ordinal;
	this.name = savedJournal.name;
	this.credits = savedJournal.credits;
	this.credits_history = savedJournal.credits_history;
	this.debt = savedJournal.debt;
	this.debt_history = savedJournal.debt_history;
	this.tick = savedJournal.tick;
	this.endTick = savedJournal.endTick;
	this.month = savedJournal.month;
	this.date = savedJournal.date;
	this.year = savedJournal.year;
	this.isSandbox = savedJournal.isSandbox;
	this.abandoned_contract_count = savedJournal.abandoned_contract_count;
	this.completed_contract_count = savedJournal.completed_contract_count;
	this.completed_crusader_contract_count = savedJournal.completed_crusader_contract_count;
	this.delivered_scu_count = savedJournal.delivered_scu_count;
	this.delivered_crusader_scu_count = savedJournal.delivered_crusader_scu_count;
	this.victory = savedJournal.victory;
	this.score = savedJournal.score;
	var context = this;
	savedJournal.ship_ids.forEach(function(ship_id) {
		var shipObject = savedJournal.ships[ship_id];
		context.addShip(shipObject.ship_id, shipObject.name)
	});
}

Journal.prototype.save = function() {
	var savedJournal = {};
	savedJournal.id = this.id;
	savedJournal.version_name = this.version_name;
	savedJournal.version_ordinal = this.version_ordinal;
	savedJournal.name = this.name;
	savedJournal.credits = this.credits;
	savedJournal.credits_history = this.credits_history;
	savedJournal.debt = this.debt;
	savedJournal.debt_history = this.debt_history;
	savedJournal.tick = this.tick;
	savedJournal.endTick = this.endTick;
	savedJournal.month = this.month;
	savedJournal.date = this.date;
	savedJournal.year = this.year;
	savedJournal.isSandbox = this.isSandbox;
	savedJournal.abandoned_contract_count = this.abandoned_contract_count;
	savedJournal.completed_contract_count = this.completed_contract_count;
	savedJournal.completed_crusader_contract_count = this.completed_crusader_contract_count;
	savedJournal.delivered_scu_count = this.delivered_scu_count;
	savedJournal.delivered_crusader_scu_count = this.delivered_crusader_scu_count;
	savedJournal.ships = this.ships;
	savedJournal.ship_ids = this.ship_ids;
	savedJournal.victory = this.victory;
	savedJournal.score = this.score;

	return savedJournal;
}

Journal.prototype.saveForScore = function() {
	var savedJournal = this.save();

	delete savedJournal.id;

	return savedJournal;
}

Journal.prototype.updatedScore = function() {
	return {
		credits_spent_debt: this.credits_history.credits_spent_debt,
		debt_initial: this.debt_history.debt_initial,
		ownedShips: this.ownedShips().length,
		netWorthScore: this.netWorthScore(),
		credits: this.credits,
		shipSellValue: this.shipSellValue(),
		debt: this.debt,
		crusaderScuScore: this.crusaderScuScore(),
		crusaderScu: this.crusaderScu(),
		crusaderContractsScore: this.crusaderContractsScore(),
		crusaderContracts: this.crusaderContracts(),
		totalScore: this.totalScore(),
	};
}

Journal.prototype.currentMoment = function(t) {
	return moment().year(this.year).month(this.month).date(this.date).hours(0).minutes(0).seconds(0).add(this.tick, 'hours');
}

Journal.prototype.dateString = function() {
	return this.currentMoment().format('MM/DD/YYYY HH:mm');
}

Journal.prototype.dateStringShort = function() {
	return this.currentMoment().format('MM/DD/YYYY');
}

Journal.prototype.elapsedDayString = function() {
	var startMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0);
	var endMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(this.tick, 'hours');
	var endGameMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(this.endTick, 'hours');
	return "Day " + (endMoment.diff(startMoment, 'days') + 1) + ((this.isSandbox || this.hasEnded())? "" : "/" + (endGameMoment.diff(startMoment, 'days')));
}

Journal.prototype.previousDayString = function(showTotal = true) {
	var startMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0);
	var endMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(this.tick, 'hours');
	var endGameMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(this.endTick, 'hours');
	return "Day " + (endMoment.diff(startMoment, 'days')) + ((!showTotal || this.isSandbox) ? "" : "/" + (endGameMoment.diff(startMoment, 'days')));
}

Journal.prototype.endDay = function() {
	var startMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0);
	var endGameMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(this.endTick, 'hours');
	return endGameMoment.diff(startMoment, 'days');
}

Journal.prototype.isBeforeTick = function(tick) {
	return this.tick < tick;
}

Journal.prototype.isAfterTick = function(tick) {
	return this.tick > tick;
}

Journal.prototype.setGameEndTick = function(tick) {
	this.endTick = tick;
}

Journal.prototype.isEndTick = function() {
	return this.tick == this.endTick;
}

Journal.prototype.hasEnded = function(tick) {
	return this.tick >= this.endTick;
}

Journal.prototype.setVictory = function(victory) {
	this.victory = victory;
}

Journal.prototype.isVictory = function() {
	return this.victory || 
		(this.credits_history.credits_spent_debt >= this.debt_history.debt_initial &&
			this.ownedShips().length >= 1 && this.totalScore() >= 0);
}

Journal.prototype.totalScore = function() {
	return this.netWorthScore() + this.crusaderScuScore() + this.crusaderContractsScore();
}

Journal.prototype.shipSellValue = function() {
	var sellValue = 0;

	if (!this.isSandbox) {
		this.ownedShips().forEach(function(shipObject) {
			var ship_type = shipType.shipIdToShip(shipObject.ship_id);
			sellValue = sellValue + ship_type.salePrice();
		});
	}
	return sellValue;
}

Journal.prototype.netWorth = function() {
	return (this.credits + this.shipSellValue()) - this.debt;
}

Journal.prototype.netWorthScore = function() {
	return this.netWorth() * SCORE_MULTIPLIER_CREDITS;
}

Journal.prototype.crusaderScu = function() {
	return this.delivered_crusader_scu_count;
}

Journal.prototype.crusaderScuScore = function() {
	return this.crusaderScu() * SCORE_MULTIPLIER_SCU;
}

Journal.prototype.crusaderContracts = function() {
	return this.completed_crusader_contract_count;
}

Journal.prototype.crusaderContractsScore = function() {
	return this.crusaderContracts() * SCORE_MULTIPLIER_CONTRACTS;
}

Journal.prototype.generateShipId = function(ship_id, name) {
	var id_to_return = this.unique_ship_id;
	this.unique_ship_id = this.unique_ship_id + 1;
	return name + "_" + ship_id + "_" + id_to_return;
}

Journal.prototype.addShip = function(ship_id, name) {
	var ship = new JournalShip(this.generateShipId(ship_id, name), ship_id, name);
	this.ship_ids.push(ship.id)
	this.ships[ship.id] = ship;
	return ship;
}

Journal.prototype.removeShip = function(shipObjectId) {
	_shipObject = this.ships[shipObjectId];
	delete this.ships[_shipObject.id];
	var index = this.ship_ids.indexOf(_shipObject.id);
    this.ship_ids.splice(index, 1);
}

Journal.prototype.ownedShips = function() {
	return this.shipObjectIdsToShipObjects(this.ship_ids);
}

Journal.prototype.shipObjectIdToShipObject = function(shipObjectId) {
	return Object.freeze(this.ships[shipObjectId]);
}

Journal.prototype.shipObjectIdsToShipObjects = function(shipObjectIds) {
	array = [];
	for (var i = this.ship_ids.length - 1; i >= 0; i--) {
		array[i] = Object.freeze(this.ships[shipObjectIds[i]]);
	};
	return array;
}

Journal.prototype.decrementTick = function() {
	this.tick = this.tick - 1;
}

Journal.prototype.incrementTick = function() {
	this.tick = this.tick + 1;
}

Journal.prototype.getTick = function() {
	return this.tick;
}

Journal.prototype.clearRendezvous = function() {
	this.rendezvous = {};
}

Journal.prototype.addRendezvous = function(rendezvous) {
	if (!this.hasRendezvous(rendezvous.shipcontact_id)) {
		this.rendezvous[rendezvous.shipcontact_id] = rendezvous;
	}
}

Journal.prototype.hasRendezvous = function(shipcontact_id) {
	return this.rendezvous.hasOwnProperty(shipcontact_id);
}

Journal.prototype.getRendezvous = function(shipcontact_id) {
	return this.rendezvous[shipcontact_id];
}

Journal.prototype.creditsString = function() {
	return "" + this.credits + " UEC" + (this.hasDebt() ? ", Debt: " + this.debt + " UEC (+" + this.getDebtDailyInterest() + " UEC/day)": "");
}

Journal.prototype.addCredits = function(creditsToAdd, source) {
	this.credits = this.credits + creditsToAdd;
	this.credits_history[source] = this.credits_history[source] + creditsToAdd;
}

Journal.prototype.removeCredits = function(creditsToRemove, source) {
	if (this.credits >= creditsToRemove) {
		this.credits = this.credits - creditsToRemove;
		this.credits_history[source] = this.credits_history[source] + creditsToRemove;
		return true;
	} else {
		this.credits_history[source] = this.credits_history[source] + this.credits;
		this.credits = 0;
		return false;
	}
}

Journal.prototype.getCredits = function() {
	return this.credits;
}

Journal.prototype.creditsEarned = function() {
	return this.credits_history.credits_initial + this.credits_history.credits_earn_contract + this.credits_history.credits_earn_ship_sale;
}

Journal.prototype.creditsSpent = function() {
	return this.credits_history.credits_spent_ship + this.credits_history.credits_spent_debt;
}

Journal.prototype.debtAdded = function() {
	return this.debt_history.debt_initial + this.debt_history.debt_add_contract + this.debt_history.debt_add_ship + this.debt_history.debt_add_interest;
}

Journal.prototype.addDebt = function(debtToAdd, source) {
	this.debt = this.debt + debtToAdd;
	this.debt_history[source] = this.debt_history[source] + debtToAdd;
}

Journal.prototype.removeDebt = function(debtToRemove) {
	if (this.debt >= debtToRemove) {
		this.debt = this.debt - debtToRemove;
		return true;
	} else {
		this.debt = 0;
		return false;
	}
}

Journal.prototype.getDebt = function() {
	return this.debt;
}

Journal.prototype.hasDebt = function() {
	return this.debt > 0;
}

Journal.prototype.getDebtDailyInterest = function() {
	return Math.floor(this.debt * 0.01);
}

Journal.prototype.acceptContractId = function(contractId) {
	if (!this.contractIdIsAccepted(contractId) && 
		!this.contractIdIsAbandoned(contractId) &&
		!this.contractIdIsCompleted(contractId)) {
		this.accepted_contract_ids.push(contractId);
		return true;
	} else {
		return false;
	}
}

Journal.prototype.logDeliveredSCU = function(contractId) {
	var _contract = contract.contractIdToContract(contractId);
	this.delivered_scu_count = this.delivered_scu_count + _contract.scuDelivered();
	if (_contract.pickup.quantum_location.id.includes("crusader_via") || _contract.dropoff.quantum_location.id.includes("crusader_via")) {
		this.delivered_crusader_scu_count = this.delivered_crusader_scu_count + _contract.scuDelivered();
	}
}

Journal.prototype.abandonContractId = function(contractId) {
	if (this.contractIdIsAccepted(contractId)) {
		this.accepted_contract_ids.splice(this.accepted_contract_ids.indexOf(contractId), 1);
		this.abandoned_contract_ids.push(contractId);
		this.abandoned_contract_count = this.abandoned_contract_count + 1;
		this.logDeliveredSCU(contractId);
		return true;
	} else {
		return false;
	}
}

Journal.prototype.completeContractId = function(contractId) {
	if (this.contractIdIsAccepted(contractId)) {
		this.accepted_contract_ids.splice(this.accepted_contract_ids.indexOf(contractId), 1);
		this.completed_contract_ids.push(contractId);
		this.completed_contract_count = this.completed_contract_count + 1;;
		this.logDeliveredSCU(contractId);
		var _contract = contract.contractIdToContract(contractId);
		if (_contract.details.employerId === "crusader_industries" || _contract.details.employerId === "crusader_security") {
			this.completed_crusader_contract_count = this.completed_crusader_contract_count + 1;
		}
		return true;
	} else {
		return false;
	}
}

Journal.prototype.acceptedContractIds = function() {
	return Array.from(this.accepted_contract_ids);
}

Journal.prototype.acceptedContracts = function() {
	return contract.contractIdsToContracts(this.accepted_contract_ids);
}

Journal.prototype.abandonedContracts = function() {
	return contract.contractIdsToContracts(this.abandoned_contract_ids);
}

Journal.prototype.completedContracts = function() {
	return contract.contractIdsToContracts(this.completed_contract_ids);
}

Journal.prototype.olderAbandonedContractCount = function() {
	// last elements in the array to prevent overflow
	return Math.max(0, this.abandoned_contract_ids.length - MAX_RECENT_ABANDONED_CONTRACTS);
}

Journal.prototype.recentAbandonedContracts = function() {
	// last elements in the array to prevent overflow
	return contract.contractIdsToContracts(this.abandoned_contract_ids.slice(0 - MAX_RECENT_ABANDONED_CONTRACTS));
}

Journal.prototype.olderCompletedContractCount = function() {
	return Math.max(0, this.completed_contract_ids.length - MAX_RECENT_COMPLETED_CONTRACTS);
}

Journal.prototype.recentCompletedContracts = function() {
	// last elements in the array to prevent overflow
	return contract.contractIdsToContracts(this.completed_contract_ids.slice(0 - MAX_RECENT_COMPLETED_CONTRACTS));
}

Journal.prototype.contractIdIsAccepted = function(contract_id) {
	return this.acceptedContracts().some(function(_contract) {
		if (_contract.id === contract_id) {
			return true;
		}
	});
}

Journal.prototype.contractIdIsAbandoned = function(contract_id) {
	return this.abandonedContracts().some(function(_contract) {
		if (_contract.id === contract_id) {
			return true;
		}
	});
}

Journal.prototype.contractIdIsCompleted = function(contract_id) {
	return this.completedContracts().some(function(_contract) {
		if (_contract.id === contract_id) {
			return true;
		}
	});
}

function JournalShip(unique_id, ship_id, name) {
	this.id = unique_id;
	this.name = name;
	this.ship_id = ship_id;
}

JournalShip.prototype.toString = function() {
	var ship_type = shipType.shipIdToShip(this.ship_id);
	return this.name + ', ' + ship_type.manufacturer_name + ' ' + ship_type.display_name
}

module.exports = {
	Journal: Journal,
	JournalShip: JournalShip,
	history_credits_initial: CREDITS_INITIAL,
	history_credits_earn_contract: CREDITS_EARN_CONTRACT,
	history_credits_earn_ship_sale: CREDITS_EARN_SHIP_SALE,
	history_credits_spent_ship: CREDITS_SPENT_SHIP,
	history_credits_spent_debt: CREDITS_SPENT_DEBT,
	history_debt_initial: DEBT_INITIAL,
	history_debt_add_contract: DEBT_ADD_CONTRACT,
	history_debt_add_ship: DEBT_ADD_SHIP,
	history_debt_add_interest: DEBT_ADD_INTEREST,
	multiplier_score_credits: SCORE_MULTIPLIER_CREDITS,
	multiplier_score_scu: SCORE_MULTIPLIER_SCU,
	multiplier_score_contracts: SCORE_MULTIPLIER_CONTRACTS,
}
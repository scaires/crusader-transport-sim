// contract.js

var quantum = require('./quantum')
var commodities = require('./commodities');
var container = require('./container');
var shipcontact = require('./shipcontact');
var port = require('./port');
var data = require('./data');
var moment = require('moment');

var unique_contract_id = 0;
var _contract_ids = [];
var _contracts = {};

// Penalty should only count against you as 1 for 1
var PENALTY_MODIFIER = 1;
var ABANDONED_MODIFIER = 0.5;

var _contractIdToContract = function(id) {
	return Object.freeze(_contracts[id]);
}

var _contractIdsToContracts = function(ids) {
	array = [];
	for (var i = ids.length - 1; i >= 0; i--) {
		array[i] = Object.freeze(_contracts[ids[i]]);
	};
	return array;
}

var generateContractId = function(pickupQuantumId, dropoffQuantumId) {
	var id_to_return = unique_contract_id;
	unique_contract_id = unique_contract_id + 1;
	return pickupQuantumId + "_" + dropoffQuantumId + "_" + id_to_return;
}

function Contract(details, cargo, pickup, dropoff) {
	this.id = generateContractId(pickup.quantum_location.id, dropoff.quantum_location.id);
	this.details = details;
	this.cargo = cargo;
	this.pickup = pickup;
	this.dropoff = dropoff;
	_contract_ids.push(this.id);
	_contracts[this.id] = this;
} 

Contract.prototype.toActiveString = function(tick) {
	return this.cargo.totalSCU() + " SCU, " + this.pickup.quantum_location.display_name + 
		" to " + this.dropoff.quantum_location.display_name + " (" + this.totalPossiblePayout() + " UEC, " + 
		this.details.priorityStringShort() + ", " + this.details.expiresStringShort(tick) + ")";
}

Contract.prototype.toString = function() {
	return this.cargo.totalSCU() + " SCU, " + this.pickup.quantum_location.display_name + 
		" to " + this.dropoff.quantum_location.display_name + " (" + this.totalPossiblePayout() + " UEC, " +
		this.details.priorityStringShort() + ")";
}

Contract.prototype.toDetailsString = function(wasAccepted, isActive, currentTick, currentMoment) {
	return "" +
	"Employer: " + this.details.employer + "\n" +
	"Cargo origin: " + this.details.origin + "\n" +
	"Cargo destination: " + this.details.destination + "\n" +
	"Priority: " + this.details.priorityString() + "\n" +
	"Payout: " + this.totalPossiblePayout() + " UEC (" + this.distancePossiblePayout() + " UEC + " + this.bonusPossiblePayout() + " UEC on-time completion bonus)" +
	(isActive ? ("\nDeliver by: " + this.details.dateString(currentTick, currentMoment) + " (" + this.details.expiresString(currentTick) + ")") : "") + "\n\n" +

	"Cargo: " + this.cargo + "\n" + 
	"Cargo Volume: " + this.cargo.toVolumeString() + "\n" + 
	"Pickup: " + this.pickup.pickupContactOrLocation() + " at " + this.pickup.quantum_location + (this.pickup.pickup_type == "shipcontact" ? (" (" + this.departedString(currentTick) +")") : "") + "\n" +
	(wasAccepted && isActive ? "Remaining: " + this.scuRemaining() + "/" + this.cargo.totalSCU() + " SCU\n" : "") +
	"Dropoff: " + this.dropoff.dropoffContactOrLocation + " at " + this.dropoff.quantum_location +
	(wasAccepted ? ("\nDelivered: " + this.scuDelivered() + "/" + this.cargo.totalSCU() + " SCU") : "");
}


Contract.prototype.distanceInKm = function() {
	return this.pickup.quantum_location.distanceTo(this.dropoff.quantum_location.id);
}

Contract.prototype.totalPossiblePayout = function() {
	return Math.ceil(this.payoutPerSCU() * this.cargo.totalSCU());
}

Contract.prototype.distancePossiblePayout = function() {
	return Math.ceil(this.payoutPerSCUDistanceOnly() * this.cargo.totalSCU());
}

Contract.prototype.bonusPossiblePayout = function() {
	return Math.ceil(this.payoutPerSCUBase() * this.cargo.totalSCU());
}

Contract.prototype.payoutPerSCU = function() {
	var distance100kkm = this.distanceInKm() / 100000;

	return this.details.base_rate_per_scu + (distance100kkm * this.details.rate_per_scu_per_100kkm);
}

Contract.prototype.payoutPerSCUBase = function() {
	return this.details.base_rate_per_scu;
}

Contract.prototype.payoutPerSCUDistanceOnly = function() {
	var distance100kkm = this.distanceInKm() / 100000;

	return distance100kkm * this.details.rate_per_scu_per_100kkm;
}

Contract.prototype.penaltyPerSCU = function() {
	return PENALTY_MODIFIER * this.payoutPerSCUDistanceOnly();
}

Contract.prototype.completionOnTimePayout = function() {
	return Math.ceil(this.payoutPerSCU() * this.scuDelivered());
}

Contract.prototype.completionLatePayout = function() {
	return Math.ceil(this.payoutPerSCUDistanceOnly() * this.scuDelivered());
}

Contract.prototype.abandonedPayout = function() {
	return Math.ceil(ABANDONED_MODIFIER * this.payoutPerSCUDistanceOnly() * this.scuDelivered());
}

Contract.prototype.lostSCUPenalty = function() {
	return Math.ceil(this.penaltyPerSCU() * this.scuLost());
}

Contract.prototype.generateCargo = function() {
	containers = [];

	for (var i = 0; i < this.cargo.num_containers; i++) {
		containers.push(new container.Container(this.cargo.commodity_id, this.cargo.container_size, this.id));
	}

	return Object.freeze(containers);
}

Contract.prototype.scuRemaining = function() {
	var cargo;

	if (this.pickup.pickup_type == "shipcontact") {
		cargo = this.pickup.pickupContactOrLocation().cargo;
	} else if (this.pickup.pickup_type == "port") {
		cargo = this.pickup.pickupContactOrLocation().cargo;
	}

	var cargoGroup = cargo.containerGroupForContractId(this.id);

	return cargoGroup.groupedCargoSize();
}

Contract.prototype.scuDelivered = function() {
	var cargo;

	if (this.dropoff.dropoff_type == "shipcontact") {
		cargo = this.dropoff.dropoffContactOrLocation.cargo;
	} else if (this.dropoff.dropoff_type == "port") {
		cargo = this.dropoff.dropoffContactOrLocation.cargo;
	}

	var cargoGroup = cargo.containerGroupForContractId(this.id);

	return cargoGroup.groupedCargoSize();
}

Contract.prototype.scuLost = function() {
	return this.cargo.totalSCU() - (this.scuDelivered() + this.scuRemaining());
}

Contract.prototype.canBeCompleted = function() {
	return this.scuRemaining() == 0 && this.scuDelivered() > 0;
}

Contract.prototype.hasExpired = function(currentTick) {
	return this.details.hasExpired(currentTick);
}

Contract.prototype.departedString = function(currentTick) {
	if (this.details.hasExpired(currentTick)) {
		return "DEPARTED";
	} else {
		var currentMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(currentTick, 'hours');
		var expiresMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(this.details.expireTick, 'hours');
		var hours = (expiresMoment.diff(currentMoment, 'hours'));
		if (hours == 0) {
			return "Departing now";
		} else {
			return "Departs in " + hours + "H";
		}
	}
}

function ContractDetails(employerId, employer, origin, destination, rate_per_scu_per_100kkm, base_rate_per_scu, expireTick, priority) {
	this.employerId = employerId;
	this.employer = employer;
	this.origin = origin;
	this.destination = destination;
	this.rate_per_scu_per_100kkm = rate_per_scu_per_100kkm;
	this.base_rate_per_scu = base_rate_per_scu;
	this.expireTick = expireTick;
	this.priority = priority;
}

ContractDetails.prototype.toString = function() {
	return this.employer;
}

ContractDetails.prototype.dateString = function(currentTick, currentMoment) {
	return currentMoment.subtract(currentTick, 'hours').add(this.expireTick, 'hours').format('MM/DD/YYYY HH:mm');
}

ContractDetails.prototype.expiresStringShort = function(currentTick) {
	if (this.hasExpired(currentTick)) {
		return "LATE";
	} else {
		var currentMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(currentTick, 'hours');
		var expiresMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(this.expireTick, 'hours');
		return "" + (expiresMoment.diff(currentMoment, 'hours')) + "H";
	}
}

ContractDetails.prototype.expiresString = function(currentTick) {
	var currentMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(currentTick, 'hours');
	var expiresMoment = moment().year(0).month(0).date(0).hours(0).minutes(0).seconds(0).add(this.expireTick, 'hours');
	if (this.hasExpired(currentTick)) {
		return "" + (currentMoment.diff(expiresMoment, 'hours')) + "H LATE";
	} else {
		return "" + (expiresMoment.diff(currentMoment, 'hours')) + "H left";
	}

}

ContractDetails.prototype.hasExpired = function(currentTick) {
	return currentTick > this.expireTick;
}

ContractDetails.prototype.priorityStringShort = function() {
	if (this.priority < 0.25) {
		return "LOW";
	} else if (this.priority < 0.5) {
		return "MED";
	} else if (this.priority < 0.75) {
		return "HIGH";
	} else {
		return "CRIT";
	}
}

ContractDetails.prototype.priorityString = function() {
	if (this.priority < 0.25) {
		return "LOW";
	} else if (this.priority < 0.5) {
		return "MEDIUM";
	} else if (this.priority < 0.75) {
		return "HIGH";
	} else {
		return "CRITICAL";
	}
}

function ContractCargo(num_containers, container_size, commodity_id) {
	this.num_containers = num_containers;
	this.container_size = container_size;
	this.commodity_id = commodity_id;
}

ContractCargo.prototype.toString = function() {
	_commodity = commodities.commodityIdToCommodity(this.commodity_id);
	return _commodity.display_name + " (" + _commodity.manufacturer_name + ")";
}

ContractCargo.prototype.toVolumeString = function() {
	return this.totalSCU() + " SCU (" + this.num_containers + " x " + this.container_size + " SCU containers)";
}

ContractCargo.prototype.totalSCU = function() {
	return this.num_containers * this.container_size;
}

function ContractPickup(quantum_location_id, pickup_type, pickup_id) {
	this.quantum_location = quantum.quantumIdToLocation(quantum_location_id);
	this.pickup_type = pickup_type;
	this.pickup_id = pickup_id;
}

ContractPickup.prototype.toString = function() {
	return this.pickupContactOrLocation() + " - " + this.quantum_location;
}

ContractPickup.prototype.pickupContactOrLocation = function() {
	if (this.pickup_type == "shipcontact") {
		return shipcontact.shipContactIdToShipContact(this.pickup_id);
	} else if (this.pickup_type == "port") {
		return port.portIdToLocation(this.pickup_id);
	}
}

function ContractDropoff(quantum_location_id, dropoff_type, dropoff_id) {
	this.quantum_location = quantum.quantumIdToLocation(quantum_location_id);
	this.dropoff_type = dropoff_type;
	if (dropoff_type == "shipcontact") {
		this.dropoffContactOrLocation = shipcontact.shipContactIdToShipContact(dropoff_id);
	} else if (dropoff_type == "port") {
		this.dropoffContactOrLocation = port.portIdToLocation(dropoff_id);
	}
}

ContractDropoff.prototype.toString = function() {
	return this.dropoffContactOrLocation + " - " + this.quantum_location;
}

module.exports = {
	Contract: Contract,
	ContractPickup: ContractPickup,
	ContractDropoff: ContractDropoff,
	ContractCargo: ContractCargo,
	ContractDetails: ContractDetails,
	contractIdToContract: _contractIdToContract,
	contractIdsToContracts: _contractIdsToContracts,
}

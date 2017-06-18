// jobboard.js

var contract = require('./contract');

function JobBoard(id, display_name, max_contracts, employer_ids) {
	this.id = id;
	this.display_name = display_name;
	this.max_contracts = max_contracts;
	this.employer_ids = employer_ids;
	this.available_contract_ids = [];
}

JobBoard.prototype.toString = function() {
	return this.display_name + ' (' + this.numContracts() + ' contracts)';
};

JobBoard.prototype.numContracts = function() {
	return this.available_contract_ids.length;
}

JobBoard.prototype.needsContracts = function() {
	if (this.max_contracts == 1 && this.numContracts() == 0) {
		// console.log(this.id + " Needs contracts; num: " + this.numContracts() + " max: " + this.max_contracts + " max/2: " + this.max_contracts / 2.0 + " Needs: " + 1)
		return 1; 
	} else if (this.numContracts() < this.max_contracts / 2.0) {
		// console.log(this.id + " Needs contracts; num: " + this.numContracts() + " max: " + this.max_contracts + " max/2: " + this.max_contracts / 2.0 + " Needs: " + Math.floor(this.max_contracts - this.numContracts()))
		return Math.floor(this.max_contracts - this.numContracts());
	} else {
		// console.log(this.id + " Doesn\'t need contracts; num: " + this.numContracts() + " max: " + this.max_contracts + " max/2: " + this.max_contracts / 2.0)
		return 0;
	}
}

JobBoard.prototype.expireContracts = function(tick) {
	var contractIdsToRemove = [];

	// console.log("Contracts: " + this.available_contract_ids);

	for (var i = 0; i < this.available_contract_ids.length; i++) {
		var _contract = contract.contractIdToContract(this.available_contract_ids[i]);
		// console.log('Testing contract' + _contract + " at tick " + _contract.details.expireTick + " against " + tick);
		if (_contract.details.expireTick <= tick) {
			contractIdsToRemove.push(_contract.id);
			// console.log("Expiring contract " + contract);
		}
	}

	for (var i = 0; i < contractIdsToRemove.length; i++) {
		this.removeContractId(contractIdsToRemove[i]);
	}

	// console.log("Expired " + contractIdsToRemove.length + " contracts from " + this.id);
	// console.log("Updated contracts: " + this.available_contract_ids);
}

JobBoard.prototype.addContractId = function(contractId) {
	if (!this.isContractIdInJobBoard(contractId) && this.canAddContractId()) {
		this.available_contract_ids.push(contractId);
		// console.log("Updated contracts: " + this.available_contract_ids);
		return true;
	} else {
		return false;
	}
}

JobBoard.prototype.removeContractId = function(contractId) {
	if (this.isContractIdInJobBoard(contractId)) {
		this.available_contract_ids.splice(this.available_contract_ids.indexOf(contractId), 1);
		return true;
	} else {
		return false;
	}
}

JobBoard.prototype.isContractIdInJobBoard = function(contractId) {
	return this.allContracts().some(function(_contract) {
		if (_contract.id === contractId) {
			return true;
		}
	});
}

JobBoard.prototype.allContracts = function() {
	return contract.contractIdsToContracts(this.available_contract_ids);
}

JobBoard.prototype.canAddContractId = function() {
	return this.available_contract_ids.length < (this.max_contracts);
}

var _job_boards = {
	port_olisar_admin_jobboard: new JobBoard("port_olisar_admin_jobboard", "Port Olisar Admin Office", 8, [
		"port_olisar_admin", "port_olisar_admin", "covalex_shipping", "cryastro_admin", "live_fire_weapons", "dumpers_depot_admin", "icc", "stanton_mining_collective_admin" // Crusader
		]),
	crusader_jobboard: new JobBoard("crusader_jobboard", "Crusader Industries", 6, [
		"crusader_industries", "crusader_industries", "crusader_security" // Crusader
		]),
	port_olisar_tdd_jobboard: new JobBoard("port_olisar_tdd_jobboard", "Trade Development Division", 12, [
		"drake", "origin", "uee", "terra_mills", // Extrasolar
		"hurston", "arccorp", "microtech", "dumpers_depot_tdd", // Solar
		"port_olisar_tdd",  "cryastro_tdd", "stanton_mining_collective_tdd" // Crusader
		]),
	kareah_jobboard: new JobBoard("kareah_jobboard", "Kareah", 5, ["crusader_security"]),
	grim_hex_jobboard: new JobBoard("grim_hex_jobboard", "Grim Hex", 12, ["drake", "grim_hex_cooperative", "grim_hex_cooperative", "nine_tails", "corner_four_research", "stanton_mining_collective_admin", "stanton_mining_collective_admin"]),
	cryastro_jobboard: new JobBoard("cryastro_jobboard", "Cry Astro", 5, ["cryastro_admin", "cryastro_tdd"]),
	covalex_jobboard: new JobBoard("covalex_jobboard", "Covalex", 3, ["covalex_shipping"]),
	icc849_jobboard: new JobBoard("icc849_jobboard", "ICC", 1, ["icc"]),
}

var _job_board_ids = [];

for (var jobBoardId in _job_boards) {
	if (_job_boards.hasOwnProperty(jobBoardId)) {
		_job_board_ids.push(_job_boards[jobBoardId].id)
	}
}

var _jobBoardIds = function() {
	return Object.freeze(_job_board_ids);
}

var _jobBoardIdToJobBoard = function(jobBoardId) {
	return Object.freeze(_job_boards[jobBoardId]);
}

var _jobBoardIdsToJobBoards = function(jobBoardIds) {
	array = [];
	for (var i = jobBoardIds.length - 1; i >= 0; i--) {
		array[i] = Object.freeze(_job_boards[jobBoardIds[i]]);
	};
	return array;
}

module.exports = {
	JobBoard: JobBoard,
	jobBoardIds: _jobBoardIds,
	jobBoardIdToJobBoard: _jobBoardIdToJobBoard,
	jobBoardIdsToJobBoards: _jobBoardIdsToJobBoards,
}
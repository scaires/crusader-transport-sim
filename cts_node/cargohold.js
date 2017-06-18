// cargohold.js

var container = require('./container');

var HOLD_SIZE_UNLIMITED = -1;

function CargoHold(size, is_external=false, display_name = "Cargo", door_name = "cargo hold door") {
	this.size = size;
	this.is_external = is_external;
	this.display_name = display_name;
	this.door_name = door_name;
	this.container_ids = [];
}

CargoHold.prototype.toString = function() {
	return this.display_name + " (" + this.container_ids.length + " containers, " + this.loadedCargoSize() + "/" + this.size + " SCU)";
};

CargoHold.prototype.canLoadContainer = function(container) {
	if (this.size == HOLD_SIZE_UNLIMITED) {
		return true;
	} else {
		return ((this.loadedCargoSize() + container.size) <= this.size);
	}
};

CargoHold.prototype.loadContainer = function(container) {
	if (this.canLoadContainer(container)) {
		this.container_ids.push(container.id);
		return true;
	} else {
		return false;
	}
};

CargoHold.prototype.unloadContainer = function(container) {
	if (this.containerIsLoaded(container)) {
		this.container_ids.splice(this.container_ids.indexOf(container.id), 1);
		return true;
	} else {
		return false;
	}
};

CargoHold.prototype.loadedCargoSize = function() {
	size = 0;

	this.containers().forEach(function(_loaded_container) {
		size = size + _loaded_container.size;
	});

	return size;
};

CargoHold.prototype.freeSpace = function() {
	if (this.size == HOLD_SIZE_UNLIMITED) {
		return HOLD_SIZE_UNLIMITED;
	} else {
		return this.size - this.loadedCargoSize();
	}
};

CargoHold.prototype.containerIsLoaded = function(container) {
	return this.containers().some(function(_loaded_container) {
		if (_loaded_container.uniqueId === container.uniqueId) {
			return true;
		}
	});
}

CargoHold.prototype.indexOfContainer = function(container) {
	for (var i = 0; i < this.container_ids.length; i++) {
		_loaded_container = this.containers()[i];
		if (_loaded_container.uniqueId === container.uniqueId) {
			return i;
		}
	}

	return -1;
}

CargoHold.prototype.containers = function() {
	return container.containerIdsToContainers(this.container_ids);
}

CargoHold.prototype.containersForContractIds = function(contract_ids) {
	return this.containers().filter(function(container) {
		return contract_ids.some(function(contract_id) {
			return container.contract_id == contract_id;
		});
	});
}

CargoHold.prototype.containerGroupByContractId = function() {
	var cargoByContractId = {};

	this.containers().forEach(function(_loaded_container) {
		if (!cargoByContractId.hasOwnProperty(_loaded_container.contract_id)) {
			cargoByContractId[_loaded_container.contract_id] = new container.ContainerGroup();
		}
		cargoByContractId[_loaded_container.contract_id].addContainer(_loaded_container);
	});

	return Object.freeze(cargoByContractId);
};

CargoHold.prototype.hasContainerGroupForContractId = function(id) {
	var cargoByContractId = this.containerGroupByContractId();
	return cargoByContractId.hasOwnProperty(id);
};

CargoHold.prototype.uniqueContractIds = function() {
	var cargoByContractId = {};
	var cargoByContractIdArray = [];

	this.containers().forEach(function(_loaded_container) {
		if (!cargoByContractId.hasOwnProperty(_loaded_container.contract_id)) {
			cargoByContractId[_loaded_container.contract_id] = new container.ContainerGroup();
			cargoByContractIdArray.push(cargoByContractId[_loaded_container.contract_id]);
		}
		cargoByContractId[_loaded_container.contract_id].addContainer(_loaded_container);
	});

	return Object.freeze(cargoByContractIdArray);
}


CargoHold.prototype.containerGroupForContractId = function(id) {
	var cargoByContractId = this.containerGroupByContractId();
	if (cargoByContractId.hasOwnProperty(id)) {
		return Object.freeze(cargoByContractId[id]);
	} else {
		return new container.ContainerGroup();
	}
};

CargoHold.prototype.containerGroupsForContractIds = function(contract_ids) {
	var cargoByContractId = {};

	this.containersForContractIds(contract_ids).forEach(function(_loaded_container) {
		if (!cargoByContractId.hasOwnProperty(_loaded_container.contract_id)) {
			cargoByContractId[_loaded_container.contract_id] = new container.ContainerGroup();
		}
		cargoByContractId[_loaded_container.contract_id].addContainer(_loaded_container);
	});

	return Object.freeze(cargoByContractId);
}

module.exports = {
	CargoHold: CargoHold,
	HOLD_SIZE_UNLIMITED: HOLD_SIZE_UNLIMITED
}
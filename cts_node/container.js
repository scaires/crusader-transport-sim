// container.js

var commodities = require('./commodities');

var unique_id = 0;

function Container(commodity_id, size, contract_id) {
	this.commodity_id = commodity_id;
	this.size = size;
	this.contract_id = contract_id;
	this.id = generateContainerId(commodity_id);
	_container_ids.push(this.id);
	_containers[this.id] = this;
}

var generateContainerId = function(commodity_id) {
	var id_to_return = unique_id;
	unique_id = unique_id + 1;
	return commodity_id + "_" + id_to_return;
}

Container.prototype.toString = function() {
	commodity = commodities.commodityIdToCommodity(this.commodity_id);
	return commodity.display_name + ' (' + this.size + ' SCU)';
}

Container.prototype.commodity = function() {
	return commodities.commodityIdToCommodity(this.commodity_id);
}

var _containerIdToContainer = function(id) {
	return Object.freeze(_containers[id]);
}

var _containerIdsToContainers = function(ids) {
	array = [];
	for (var i = ids.length - 1; i >= 0; i--) {
		array[i] = Object.freeze(_containers[ids[i]]);
	};
	return array;
}

var _container_ids = [];
var _containers = [];

function ContainerGroup() {
	this.container_ids = [];
}

ContainerGroup.prototype.toString = function() {
	_groupedCargo = this.groupedCargo();
	if (_groupedCargo.length > 0) {
		_commodity_id = _groupedCargo[0].commodity_id;
		_commodity = commodities.commodityIdToCommodity(_commodity_id);
		// TODO: This only shows the first container type
		if (_groupedCargo.length == 1) {
			return _groupedCargo.length + " container of " + _commodity + ", " + this.groupedCargoSize() + " SCU";
		} else {
			return _groupedCargo.length + " containers of " + _commodity + ", " + this.groupedCargoSize() + " SCU (" + _groupedCargo.length + " x " + this.containerSize() + " SCU)";
		}
	} else {
		return "0 containers, 0 SCU";
	}
}

ContainerGroup.prototype.addContainer = function(containerToAdd) {
	this.container_ids.push(containerToAdd.id);
}

ContainerGroup.prototype.groupedCargoSize = function() {
	size = 0;

	this.container_ids.forEach(function(_grouped_container_id) {
		_container = _containers[_grouped_container_id];
		size = size + _container.size;
	});

	return size;
};

ContainerGroup.prototype.groupedCargo = function() {
	return _containerIdsToContainers(this.container_ids);
}

ContainerGroup.prototype.contractId = function() {
	if (this.groupedCargoSize() > 0) {
		return this.groupedCargo()[0].contract_id;
	} else {
		return null;
	}
}

ContainerGroup.prototype.containerSize = function() {
	if (this.groupedCargoSize() > 0) {
		return this.groupedCargo()[0].size;
	} else {
		return null;
	}
}

module.exports = {
	Container: Container,
	ContainerGroup: ContainerGroup,
	containerIdToContainer: _containerIdToContainer,
	containerIdsToContainers: _containerIdsToContainers,
}
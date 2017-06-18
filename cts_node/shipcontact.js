// shipcontact.js

var shipType = require('./shiptype');
var cargohold = require('./cargohold');

function ShipContact(location_id, type_id, name, originString, destinationString) {
	this.location_id = location_id;
	this.type_id = type_id;
	this.name = name;
	this.originString = originString;
	this.destinationString = destinationString;
	this.id = location_id + "_" + type_id + "_" + _ship_contacts_count;
	_ship_contacts_count = _ship_contacts_count + 1;
	this.shipContactDestination = new ShipContactDestination(this.id);
	ship_type = shipType.shipIdToShip(type_id);
	this.cargo = new cargohold.CargoHold(ship_type.cargo_hold_size, ship_type.cargo_is_external);
}

ShipContact.prototype.toString = function() {
	ship_type = shipType.shipIdToShip(this.type_id);

	return this.name + ' (' + ship_type.display_name + ')';
};

function ShipContactDestination(id) {
	this.id = id;
	this.type = "shipcontact";
}

ShipContactDestination.prototype.toString = function() {
	ship_contact = _ship_contacts[this.id];

	ship_type = shipType.shipIdToShip(ship_contact.type_id);

	return ship_contact.name + ' (' + ship_type.display_name + ')';
};

ShipContactDestination.prototype.shipType = function() {
	ship_contact = _ship_contacts[this.id];
	return shipType.shipIdToShip(ship_contact.type_id);
};

var _ship_contacts_count = 0;

var _ship_contacts = {};

var _ship_contact_ids = [];

var _ship_contacts_to_contract_ids = {};

var _shipContactIdToShipContact = function(shipContactId) {
	return Object.freeze(_ship_contacts[shipContactId]);
}

var _shipContactIdsToShipContacts = function(shipContactIds) {
	array = [];
	for (var i = shipContactIds.length - 1; i >= 0; i--) {
		array[i] = Object.freeze(_ship_contacts[shipContactIds[i]]);
	};
	return array;
}

var _shipContactsForQuantumLocationId = function(quantumLocationId) {
	array = [];
	for (var i = _ship_contact_ids.length - 1; i >= 0; i--) {
		_shipContact = _ship_contacts[_ship_contact_ids[i]];
		if (_shipContact.location_id == quantumLocationId) {
			array.push(Object.freeze(_shipContact));
		}
	};
	return array;
}

var _addShipContact = function(_shipContact) {
	_ship_contacts[_shipContact.id] = _shipContact;
	_ship_contact_ids.push(_shipContact.id);
}

var _removeShipContact = function(_shipContactId) {
	_shipContact = _ship_contacts[_shipContactId];
	delete _ship_contacts[_shipContact.id];
	var index = _ship_contact_ids.indexOf(_shipContact.id);
    _ship_contact_ids.splice(index, 1);
}

var _setContractIdForShipContactId = function(_shipContactId, _contractId) {
	_ship_contacts_to_contract_ids[_shipContactId] = _contractId;
}

var _deleteContractIdForShipContactId = function(_shipContactId) {
	delete _ship_contacts_to_contract_ids[_shipContactId];
}

var _getContractIdForShipContactId = function(_shipContactId) {
	return _ship_contacts_to_contract_ids[_shipContactId];
}

var _hasContractIdForShipContactId = function(_shipContactId) {
	return _shipContactId in _ship_contacts_to_contract_ids;
}

module.exports = {
	ShipContact: ShipContact,
	ShipContactDestination: ShipContactDestination,
	shipContactIdToShipContact: _shipContactIdToShipContact,
	shipContactIdsToShipContacts: _shipContactIdsToShipContacts,
	shipContactsForQuantumLocationId: _shipContactsForQuantumLocationId,
	addShipContact: _addShipContact,
	removeShipContact: _removeShipContact,
	setContractIdForShipContactId: _setContractIdForShipContactId,
	deleteContractIdForShipContactId: _deleteContractIdForShipContactId,
	getContractIdForShipContactId: _getContractIdForShipContactId,
	hasContractIdForShipContactId: _hasContractIdForShipContactId,
}
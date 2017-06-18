// quantum.js

var port = require('./port');
var shipcontact = require('./shipcontact');
var random = require('./random');

var MIN_RENDEZVOUS_DIST = 25;
var MED_RENDEZVOUS_DIST = 50;
var MAX_RENDEZVOUS_DIST = 100;

function QuantumLocation(id, display_name, port_destinations, quantum_destinations, rendezvous_destination_ids, via_id = null) {
	this.id = id;
	this.display_name = display_name;
	this.port_destinations = port_destinations;
	this.quantum_destinations = quantum_destinations;
	this.rendezvous_destination_ids = rendezvous_destination_ids;
	this.via_id = via_id;
}

QuantumLocation.prototype.portDestinations = function() {
	return Object.freeze(this.port_destinations);
};

QuantumLocation.prototype.quantumDestinations = function() {
	var _dests = Array.from(Object.freeze(this.quantum_destinations));
	_dests.sort(function(dest_a, dest_b) {
			if (dest_a.is_blocked && !dest_b.is_blocked) {
				return 1;
			} else if (!dest_a.is_blocked && dest_b.is_blocked) {
				return -1;
			} else {
				return dest_a.distance_km - dest_b.distance_km;
			}
		});
	return _dests;
};

QuantumLocation.prototype.quantumDestinationById = function(quantum_location_id) {
	for (var i = 0; i < this.quantum_destinations.length; i++) {
		_destination = this.quantum_destinations[i];
		if (_destination.id === quantum_location_id) {
			return Object.freeze(_destination);
		}
	}
	return null;
}

QuantumLocation.prototype.hasViaLocationId = function() {
	return this.via_id != null;
}

QuantumLocation.prototype.rendezvousDestinationForShipContact = function(shipcontact_id) {
	var rendezvous_dest_id = random.randomElementFromArray(this.rendezvous_destination_ids);
	// Crudely skew rendezvous distances towards the shorter distances and give a longer tail.
	var rendezvous_distance_km = random.randomElementFromArray(
		[random.randomIntInRange(MIN_RENDEZVOUS_DIST, MED_RENDEZVOUS_DIST), 
			random.randomIntInRange(MED_RENDEZVOUS_DIST, MAX_RENDEZVOUS_DIST)]);
	return new RendezvousDestination(shipcontact_id, this.id, rendezvous_dest_id, rendezvous_distance_km);
}

QuantumLocation.prototype.toString = function() {
	return this.display_name;
};

QuantumLocation.prototype.toDisplayString = function(isLanded) {
	if (!isLanded && this.port_destinations.length > 0) {
		return this.display_name + " (Space)";
	} else {
		return this.display_name;
	}
};

QuantumLocation.prototype.distanceTo = function(toQuantumLocationId) {
	if (this.id === toQuantumLocationId) {
		// console.log("this.id " + this.id + " toQuantumLocationId " + toQuantumLocationId);
		return 0;
	} else {
		var cumulativeDistance = 0;
		var fromQuantumLocation;
		if (this.hasViaLocationId() && this.via_id != toQuantumLocationId) {
			cumulativeDistance = cumulativeDistance + this.quantumDestinationById(this.via_id).distance_km;
			fromQuantumLocation = _quantumIdToLocation(this.via_id);
		} else {
			fromQuantumLocation = this;
		}
		var toQuantumLocation = _quantumIdToLocation(toQuantumLocationId);
		if (toQuantumLocation.hasViaLocationId()) {
			var originalToQuantumLocation = _quantumIdToLocation(toQuantumLocationId);
			cumulativeDistance = cumulativeDistance + originalToQuantumLocation.quantumDestinationById(originalToQuantumLocation.via_id).distance_km;
			toQuantumLocation = _quantumIdToLocation(originalToQuantumLocation.via_id);
		}
		// console.log("fromQuantumLocation: " + fromQuantumLocation.id);
		// console.log("toQuantumLocation: " + toQuantumLocation.id);
		if (fromQuantumLocation.id != toQuantumLocation.id) {
			cumulativeDistance = cumulativeDistance + fromQuantumLocation.quantumDestinationById(toQuantumLocation.id).distance_km;
		}
		return cumulativeDistance;
	}
	
}

function QuantumDestination(id, distance_km, is_blocked) {
	this.id = id;
	this.distance_km = distance_km;
	this.is_blocked = is_blocked;
	this.type = "quantum";
}

QuantumDestination.prototype.toString = function() {
	var location = _quantum_locations[this.id];
	return location.display_name + (this.is_blocked ? " - BLOCKED" : "") + " (" + this.distance_km + "km" + (this.distance_km < 1000 ? ", Time: 0H" : "") + ")";
};

function RendezvousDestination(shipcontact_id, quantum_location_id, quantum_destination_id, distance_km) {
	this.shipcontact_id = shipcontact_id;
	this.quantum_location_id = quantum_location_id;
	this.quantum_destination_id = quantum_destination_id;
	this.distance_km = distance_km;
	this.type = "rendezvous";
	var _location = _quantumIdToLocation(this.quantum_location_id);
	var _destination = _location.quantumDestinationById(this.quantum_destination_id);
	this.distance_from_dest = _destination.distance_km - this.distance_km;
}

RendezvousDestination.prototype.toString = function() {
	var _loc = _quantumIdToLocation(this.quantum_location_id);
	var _dest = _loc.quantumDestinationById(this.quantum_destination_id);
	var _dest_loc = _quantumIdToLocation(this.quantum_destination_id);
	var _shipcontact = shipcontact.shipContactIdToShipContact(this.shipcontact_id);
	return _shipcontact.name + ", " + this.distance_km + "km (" + this.distance_from_dest + "km from " + _dest_loc.display_name + ")";
};

var _quantum_locations = {
	/*
	 * YELA
	 */
	yela_via_grim_hex: new QuantumLocation("yela_via_grim_hex", "Yela (via Grim Hex)",
		[],
		[
			new QuantumDestination("grim_hex", 5, false),
			new QuantumDestination("crusader_via_yela", 173852, true),
			new QuantumDestination("port_olisar", 153706, true),
			new QuantumDestination("covalex", 295238, true),
			new QuantumDestination("kareah", 325932, false),
			new QuantumDestination("cryastro42", 185931, false),
			new QuantumDestination("cryastro151", 338715, true),
			new QuantumDestination("cryastro262", 175443, false),
			new QuantumDestination("icc849", 450358, false),
			new QuantumDestination("comm275", 210798, false),
			new QuantumDestination("comm306", 97942, false),
			new QuantumDestination("comm730", 86598, false),
			new QuantumDestination("comm625", 171271, true),
			new QuantumDestination("comm556", 286322, true),
			new QuantumDestination("comm472", 253331, true),
			new QuantumDestination("comm126", 167575, false),
		],
		[
			"comm275", "comm306", "comm730", "comm625", "comm556", "comm126"
		],
		"grim_hex"
	),
	yela_via_crusader: new QuantumLocation("yela_via_crusader", "Yela",
		[],
		[
			new QuantumDestination("grim_hex", 426, false),
			new QuantumDestination("crusader_via_yela", 173427, false),
			new QuantumDestination("port_olisar", 153283, false),
			new QuantumDestination("covalex", 294877, false),
			new QuantumDestination("kareah", 325528, false),
			new QuantumDestination("cryastro42", 184644, false),
			new QuantumDestination("cryastro151", 338290, false),
			new QuantumDestination("cryastro262", 175186, false),
			new QuantumDestination("icc849", 450422, false),
			new QuantumDestination("comm275", 210425, false),
			new QuantumDestination("comm306", 97541, false),
			new QuantumDestination("comm730", 86363, false),
			new QuantumDestination("comm625", 170866, false),
			new QuantumDestination("comm556", 285920, false),
			new QuantumDestination("comm472", 252902, true),
			new QuantumDestination("comm126", 167379, false),
		],
		[
			"cryastro262", "icc849", "comm730", "comm556", "comm126"
		],
		"crusader_via_yela"
	),
	yela_via_port_olisar: new QuantumLocation("yela_via_port_olisar", "Yela (via Port Olisar)",
		[],
		[
			new QuantumDestination("grim_hex", 426, false),
			new QuantumDestination("crusader_via_yela", 173427, false),
			new QuantumDestination("port_olisar", 153283, false),
			new QuantumDestination("covalex", 294877, false),
			new QuantumDestination("kareah", 325528, false),
			new QuantumDestination("cryastro42", 184644, false),
			new QuantumDestination("cryastro151", 338290, false),
			new QuantumDestination("cryastro262", 175186, false),
			new QuantumDestination("icc849", 450422, false),
			new QuantumDestination("comm275", 210425, false),
			new QuantumDestination("comm306", 97541, false),
			new QuantumDestination("comm730", 86363, false),
			new QuantumDestination("comm625", 170866, false),
			new QuantumDestination("comm556", 285920, false),
			new QuantumDestination("comm472", 252902, true),
			new QuantumDestination("comm126", 167379, false),
		],
		[
			"cryastro262", "icc849", "comm730", "comm556", "comm126"
		],
		"port_olisar"
	),
	yela_via_covalex: new QuantumLocation("yela_via_covalex", "Yela (via Covalex)",
		[],
		[
			new QuantumDestination("grim_hex", 424, false),
			new QuantumDestination("crusader_via_yela", 173482, false),
			new QuantumDestination("port_olisar", 153345, false),
			new QuantumDestination("covalex", 294813, false),
			new QuantumDestination("kareah", 325616, false),
			new QuantumDestination("cryastro42", 185791, false),
			new QuantumDestination("cryastro151", 338300, false),
			new QuantumDestination("cryastro262", 175071, false),
			new QuantumDestination("icc849", 450582, false),
			new QuantumDestination("comm275", 210535, false),
			new QuantumDestination("comm306", 97628, false),
			new QuantumDestination("comm730", 86241, false),
			new QuantumDestination("comm625", 170842, false),
			new QuantumDestination("comm556", 285894, false),
			new QuantumDestination("comm472", 252944, true),
			new QuantumDestination("comm126", 167538, false),
		],
		[
			"cryastro42", "icc849", "comm306", "comm730", "comm126"
		],
		"covalex"
	),
	yela_via_kareah: new QuantumLocation("yela_via_kareah", "Yela (via Kareah)",
		[],
		[
			new QuantumDestination("grim_hex", 406, false),
			new QuantumDestination("crusader_via_yela", 173432, false),
			new QuantumDestination("port_olisar", 153287, false),
			new QuantumDestination("covalex", 294905, false),
			new QuantumDestination("kareah", 325525, false),
			new QuantumDestination("cryastro42", 185624, false),
			new QuantumDestination("cryastro151", 338304, false),
			new QuantumDestination("cryastro262", 175221, false),
			new QuantumDestination("icc849", 450386, false),
			new QuantumDestination("comm275", 210417, false),
			new QuantumDestination("comm306", 97539, false),
			new QuantumDestination("comm730", 86398, false),
			new QuantumDestination("comm625", 170897, false),
			new QuantumDestination("comm556", 285942, false),
			new QuantumDestination("comm472", 252910, true),
			new QuantumDestination("comm126", 167353, false),
		],
		[
			"covalex", "cryastro262", "icc849", "comm625", "comm730"
		],
		"kareah"
	),
	yela_via_cryastro42: new QuantumLocation("yela_via_cryastro42", "Yela (via Cry-Astro 42)",
		[],
		[
			new QuantumDestination("grim_hex", 334, false),
			new QuantumDestination("crusader_via_yela", 173482, false),
			new QuantumDestination("port_olisar", 153332, false),
			new QuantumDestination("covalex", 295008, false),
			new QuantumDestination("kareah", 325553, false),
			new QuantumDestination("cryastro42", 185597, false),
			new QuantumDestination("cryastro151", 338379, false),
			new QuantumDestination("cryastro262", 175332, false),
			new QuantumDestination("icc849", 450286, false),
			new QuantumDestination("comm275", 210426, false),
			new QuantumDestination("comm306", 97568, false),
			new QuantumDestination("comm730", 86509, false),
			new QuantumDestination("comm625", 170976, false),
			new QuantumDestination("comm556", 286032, false),
			new QuantumDestination("comm472", 252968, true),
			new QuantumDestination("comm126", 167303, false),
		],
		[
			"covalex", "cryastro262", "icc849", "comm730", "comm625"
		],
		"cryastro42"
	),
	yela_via_cryastro151: new QuantumLocation("yela_via_cryastro151", "Yela (via Cry-Astro 151)",
		[],
		[
			new QuantumDestination("grim_hex", 437, false),
			new QuantumDestination("crusader_via_yela", 173434, false),
			new QuantumDestination("port_olisar", 153294, false),
			new QuantumDestination("covalex", 294835, false),
			new QuantumDestination("kareah", 325551, false),
			new QuantumDestination("cryastro42", 185697, false),
			new QuantumDestination("cryastro151", 338278, false),
			new QuantumDestination("cryastro262", 175126, false),
			new QuantumDestination("icc849", 450494, false),
			new QuantumDestination("comm275", 210459, false),
			new QuantumDestination("comm306", 97564, false),
			new QuantumDestination("comm730", 86301, false),
			new QuantumDestination("comm625", 170840, false),
			new QuantumDestination("comm556", 285894, false),
			new QuantumDestination("comm472", 252904, true),
			new QuantumDestination("comm126", 167440, false),
		],
		[
			"cryastro42", "icc849", "comm275", "comm730", "comm126"
		],
		"cryastro151"
	),
	yela_via_cryastro262: new QuantumLocation("yela_via_cryastro262", "Yela (via Cry-Astro 262)",
		[],
		[
			new QuantumDestination("grim_hex", 386, false),
			new QuantumDestination("crusader_via_yela", 173545, false),
			new QuantumDestination("port_olisar", 153411, false),
			new QuantumDestination("covalex", 294828, false),
			new QuantumDestination("kareah", 325689, false),
			new QuantumDestination("cryastro42", 185873, false),
			new QuantumDestination("cryastro151", 338348, false),
			new QuantumDestination("cryastro262", 175056, false),
			new QuantumDestination("icc849", 450632, false),
			new QuantumDestination("comm275", 210612, false),
			new QuantumDestination("comm306", 97700, false),
			new QuantumDestination("comm730", 86222, false),
			new QuantumDestination("comm625", 170875, false),
			new QuantumDestination("comm556", 285926, false),
			new QuantumDestination("comm472", 253003, true),
			new QuantumDestination("comm126", 167614, false),
		],
		[
			"kareah", "cryastro42", "icc849", "comm275", "comm126"
		],
		"cryastro262"
	),
	yela_via_icc849: new QuantumLocation("yela_via_icc849", "Yela (via ICC 849)",
		[],
		[
			new QuantumDestination("grim_hex", 157, false),
			new QuantumDestination("crusader_via_yela", 173660, false),
			new QuantumDestination("port_olisar", 153506, false),
			new QuantumDestination("covalex", 295194, false),
			new QuantumDestination("kareah", 325710, false),
			new QuantumDestination("cryastro42", 185681, false),
			new QuantumDestination("cryastro151", 338571, false),
			new QuantumDestination("cryastro262", 175488, false),
			new QuantumDestination("icc849", 450201, false),
			new QuantumDestination("comm275", 210560, false),
			new QuantumDestination("comm306", 97722, false),
			new QuantumDestination("comm730", 86660, true),
			new QuantumDestination("comm625", 171173, false),
			new QuantumDestination("comm556", 286229, false),
			new QuantumDestination("comm472", 253153, true),
			new QuantumDestination("comm126", 167336, false),
		],
		[
			"covalex", "cryastro262", "comm730", "comm556", "comm625"
		],
		"icc849"
	),
	yela_via_comm275: new QuantumLocation("yela_via_comm275", "Yela (via Comm 275)",
		[],
		[
			new QuantumDestination("grim_hex", 385, false),
			new QuantumDestination("crusader_via_yela", 173443, false),
			new QuantumDestination("port_olisar", 153296, false),
			new QuantumDestination("covalex", 294935, false),
			new QuantumDestination("kareah", 325529, false),
			new QuantumDestination("cryastro42", 185610, false),
			new QuantumDestination("cryastro151", 338324, false),
			new QuantumDestination("cryastro262", 175256, false),
			new QuantumDestination("icc849", 450349, false),
			new QuantumDestination("comm275", 210413, false),
			new QuantumDestination("comm306", 97541, false),
			new QuantumDestination("comm730", 86436, false),
			new QuantumDestination("comm625", 170914, false),
			new QuantumDestination("comm556", 285970, false),
			new QuantumDestination("comm472", 252924, true),
			new QuantumDestination("comm126", 167328, false),
		],
		[
			"covalex", "cryastro262", "icc849", "comm556", "comm730"
		],
		"comm275"
	),
	yela_via_comm306: new QuantumLocation("yela_via_comm306", "Yela (via Comm 306)",
		[],
		[
			new QuantumDestination("grim_hex", 405, false),
			new QuantumDestination("crusader_via_yela", 173433, false),
			new QuantumDestination("port_olisar", 153287, false),
			new QuantumDestination("covalex", 294903, false),
			new QuantumDestination("kareah", 325527, false),
			new QuantumDestination("cryastro42", 185626, false),
			new QuantumDestination("cryastro151", 338304, false),
			new QuantumDestination("cryastro262", 175218, false),
			new QuantumDestination("icc849", 450385, false),
			new QuantumDestination("comm275", 210416, false),
			new QuantumDestination("comm306", 97538, false),
			new QuantumDestination("comm730", 86399, false),
			new QuantumDestination("comm625", 170889, false),
			new QuantumDestination("comm556", 285945, false),
			new QuantumDestination("comm472", 252912, true),
			new QuantumDestination("comm126", 167350, false),
		],
		[
			"covalex", "cryastro262", "icc849", "comm730", "comm126"
		],
		"comm306"
	),
	yela_via_comm730: new QuantumLocation("yela_via_comm730", "Yela (via Comm 730)",
		[],
		[
			new QuantumDestination("grim_hex", 378, false),
			new QuantumDestination("crusader_via_yela", 173559, false),
			new QuantumDestination("port_olisar", 153425, false),
			new QuantumDestination("covalex", 294835, false),
			new QuantumDestination("kareah", 325704, false),
			new QuantumDestination("cryastro42", 185886, false),
			new QuantumDestination("cryastro151", 338360, false),
			new QuantumDestination("cryastro262", 175059, false),
			new QuantumDestination("icc849", 450641, true),
			new QuantumDestination("comm275", 210629, false),
			new QuantumDestination("comm306", 97717, false),
			new QuantumDestination("comm730", 86220, false),
			new QuantumDestination("comm625", 170882, false),
			new QuantumDestination("comm556", 285932, false),
			new QuantumDestination("comm472", 253015, true),
			new QuantumDestination("comm126", 167633, false),
		],
		[
			"kareah", "cryastro42", "icc849", "comm306", "comm126"
		],
		"comm730"
	),
	yela_via_comm625: new QuantumLocation("yela_via_comm625", "Yela (via Comm 625)",
		[],
		[
			new QuantumDestination("grim_hex", 437, false),
			new QuantumDestination("crusader_via_yela", 173452, false),
			new QuantumDestination("port_olisar", 153314, false),
			new QuantumDestination("covalex", 294821, false),
			new QuantumDestination("kareah", 325578, false),
			new QuantumDestination("cryastro42", 185739, false),
			new QuantumDestination("cryastro151", 338284, false),
			new QuantumDestination("cryastro262", 175097, false),
			new QuantumDestination("icc849", 450540, false),
			new QuantumDestination("comm275", 210493, false),
			new QuantumDestination("comm306", 97592, false),
			new QuantumDestination("comm730", 86267, false),
			new QuantumDestination("comm625", 170834, false),
			new QuantumDestination("comm556", 185886, false),
			new QuantumDestination("comm472", 252918, true),
			new QuantumDestination("comm126", 167490, false),
		],
		[
			"cryastro42", "icc849", "comm275", "comm306", "comm126"
		],
		"comm625"
	),
	yela_via_comm556: new QuantumLocation("yela_via_comm556", "Yela (via Comm 556)",
		[],
		[
			new QuantumDestination("grim_hex", 437, false),
			new QuantumDestination("crusader_via_yela", 173454, false),
			new QuantumDestination("port_olisar", 153316, false),
			new QuantumDestination("covalex", 294821, false),
			new QuantumDestination("kareah", 325581, false),
			new QuantumDestination("cryastro42", 185742, false),
			new QuantumDestination("cryastro151", 338285, false),
			new QuantumDestination("cryastro262", 175096, false),
			new QuantumDestination("icc849", 450543, false),
			new QuantumDestination("comm275", 210497, false),
			new QuantumDestination("comm306", 97596, false),
			new QuantumDestination("comm730", 86265, false),
			new QuantumDestination("comm625", 170834, false),
			new QuantumDestination("comm556", 285886, false),
			new QuantumDestination("comm472", 252919, true),
			new QuantumDestination("comm126", 167495, false),
		],
		[
			"kareah", "cryastro42", "cryastro262", "icc849", "comm126"
		],
		"comm556"
	),
	/* UNREACHABLE */
	yela_via_comm472: new QuantumLocation("yela_via_comm472", "Yela (via Comm 472)",
		[],
		[
			new QuantumDestination("grim_hex", 193, false),
			new QuantumDestination("crusader_via_yela", 173659, false),
			new QuantumDestination("port_olisar", 153513, false),
			new QuantumDestination("covalex", 295044, false),
			new QuantumDestination("kareah", 325756, false),
			new QuantumDestination("cryastro42", 185827, false),
			new QuantumDestination("cryastro151", 338509, false),
			new QuantumDestination("cryastro262", 175287, false),
			new QuantumDestination("icc849", 450432, false),
			new QuantumDestination("comm275", 210643, false),
			new QuantumDestination("comm306", 97768, false),
			new QuantumDestination("comm730", 86450, false),
			new QuantumDestination("comm625", 171064, false),
			new QuantumDestination("comm556", 286116, false),
			new QuantumDestination("comm472", 253130, true),
			new QuantumDestination("comm126", 167520, false),
		],
		[
			"comm275", "comm306", "comm730", "comm625", "comm556", "comm126"
		],
		"comm472"
	),
	yela_via_comm126: new QuantumLocation("yela_via_comm126", "Yela (via Comm 126)",
		[],
		[
			new QuantumDestination("grim_hex", 284, false),
			new QuantumDestination("crusader_via_yela", 173525, false),
			new QuantumDestination("port_olisar", 153373, false),
			new QuantumDestination("covalex", 295060, false),
			new QuantumDestination("kareah", 325588, false),
			new QuantumDestination("cryastro42", 185609, false),
			new QuantumDestination("cryastro151", 338428, false),
			new QuantumDestination("cryastro262", 175380, false),
			new QuantumDestination("icc849", 450247, false),
			new QuantumDestination("comm275", 210450, false),
			new QuantumDestination("comm306", 97597, false),
			new QuantumDestination("comm730", 86562, false),
			new QuantumDestination("comm625", 171034, false),
			new QuantumDestination("comm556", 286091, false),
			new QuantumDestination("comm472", 253015, true),
			new QuantumDestination("comm126", 167290, false),
		],
		[
			"covalex", "cryastro151", "cryastro262", "comm556", "comm730"
		],
		"comm126"
	),
	grim_hex: new QuantumLocation("grim_hex", "Grim Hex",
		[
			new port.PortDestination("grim_hex_pads"),
		],
		[
			new QuantumDestination("yela_via_grim_hex", 5, false),
			new QuantumDestination("crusader_via_grim_hex", 173852, true),
			new QuantumDestination("port_olisar", 153706, true),
			new QuantumDestination("covalex", 295238, true),
			new QuantumDestination("kareah", 325932, false),
			new QuantumDestination("cryastro42", 185931, false),
			new QuantumDestination("cryastro151", 338715, true),
			new QuantumDestination("cryastro262", 175443, false),
			new QuantumDestination("icc849", 450358, false),
			new QuantumDestination("comm275", 210798, false),
			new QuantumDestination("comm306", 97942, false),
			new QuantumDestination("comm730", 86598, false),
			new QuantumDestination("comm625", 171271, true),
			new QuantumDestination("comm556", 286322, true),
			new QuantumDestination("comm472", 253331, true),
			new QuantumDestination("comm126", 167575, false),
		],
		[
			"comm275", "comm306", "comm730", "comm126"
		]
	),

	/*
	 * CRUSADER
	 */
	crusader_via_yela: new QuantumLocation("crusader_via_yela", "Crusader", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 149032, false),
			new QuantumDestination("grim_hex", 149225, true),
			new QuantumDestination("port_olisar", 8233, false),
			new QuantumDestination("covalex", 205817, false),
			new QuantumDestination("kareah", 183012, true),
			new QuantumDestination("cryastro42", 120978, false),
			new QuantumDestination("cryastro151", 198489, true),
			new QuantumDestination("cryastro262", 165850, false),
			new QuantumDestination("icc849", 476315, false),
			new QuantumDestination("comm275", 91309, false),
			new QuantumDestination("comm306", 58319, false),
			new QuantumDestination("comm730", 136671, false),
			new QuantumDestination("comm625", 78712, false),
			new QuantumDestination("comm556", 170961, false),
			new QuantumDestination("comm472", 105508, true),
			new QuantumDestination("comm126", 146961, false),
		],
		[
			"kareah", "cryastro151", "comm472"
		],
		"yela_via_crusader"
	),
	/* UNREACHABLE */
	crusader_via_grim_hex: new QuantumLocation("crusader_via_grim_hex", "Crusader (via Grim Hex)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 173659, false),
			new QuantumDestination("grim_hex", 173852, true),
			new QuantumDestination("port_olisar", 5, false),
			new QuantumDestination("covalex", 198120, false),
			new QuantumDestination("kareah", 326446, false),
			new QuantumDestination("cryastro42", 125000, false),
			new QuantumDestination("cryastro151", 176777, false),
			new QuantumDestination("cryastro262", 176777, false),
			new QuantumDestination("icc849", 484890, false),
			new QuantumDestination("comm275", 81609, false),
			new QuantumDestination("comm306", 81609, false),
			new QuantumDestination("comm730", 157500, false),
			new QuantumDestination("comm625", 81609, false),
			new QuantumDestination("comm556", 157500, false),
			new QuantumDestination("comm472", 81609, false),
			new QuantumDestination("comm126", 157500, false),
		],
		[
			"comm275", "comm306", "comm730", "comm625", "comm556", "comm472", "comm126"
		],
		"grim_hex"
	),
	crusader_via_port_olisar: new QuantumLocation("crusader_via_port_olisar", "Crusader (via Port Olisar)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 153513, false),
			new QuantumDestination("grim_hex", 153706, true),
			new QuantumDestination("port_olisar", 5, false),
			new QuantumDestination("covalex", 210860, true),
			new QuantumDestination("kareah", 176408, true),
			new QuantumDestination("cryastro42", 114362, false),
			new QuantumDestination("cryastro151", 197909, true),
			new QuantumDestination("cryastro262", 173985, false),
			new QuantumDestination("icc849", 471209, false),
			new QuantumDestination("comm275", 83260, false),
			new QuantumDestination("comm306", 60480, false),
			new QuantumDestination("comm730", 144225, false),
			new QuantumDestination("comm625", 85503, false),
			new QuantumDestination("comm556", 173938, true),
			new QuantumDestination("comm472", 102884, true),
			new QuantumDestination("comm126", 142411, false),
		],
		[
			"covalex", "kareah", "cryastro151", "comm556", "comm472"
		],
		"port_olisar"
	),
	crusader_via_covalex: new QuantumLocation("crusader_via_covalex", "Crusader (via Covalex)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 181538, false),
			new QuantumDestination("grim_hex", 181731, true),
			new QuantumDestination("port_olisar", 40716, true),
			new QuantumDestination("covalex", 173495, false),
			new QuantumDestination("kareah", 166973, false),
			new QuantumDestination("cryastro42", 149625, true),
			new QuantumDestination("cryastro151", 160367, false),
			new QuantumDestination("cryastro262", 160258, false),
			new QuantumDestination("icc849", 509129, true),
			new QuantumDestination("comm275", 103124, true),
			new QuantumDestination("comm306", 95901, true),
			new QuantumDestination("comm730", 153139, false),
			new QuantumDestination("comm625", 62437, false),
			new QuantumDestination("comm556", 134830, false),
			new QuantumDestination("comm472", 73047, false),
			new QuantumDestination("comm126", 180683, true),
		],
		[
			"port_olisar", "cryastro42", "icc849", "comm275", "comm306", "comm126"
		],
		"covalex"
	),
	crusader_via_kareah: new QuantumLocation("crusader_via_kareah", "Crusader (via Kareah)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 196118, true),
			new QuantumDestination("grim_hex", 196311, true),
			new QuantumDestination("port_olisar", 42633, true),
			new QuantumDestination("covalex", 204238, false),
			new QuantumDestination("kareah", 135906, false),
			new QuantumDestination("cryastro42", 122792, false),
			new QuantumDestination("cryastro151", 164203, false),
			new QuantumDestination("cryastro262", 197629, true),
			new QuantumDestination("icc849", 483868, false),
			new QuantumDestination("comm275", 68273, false),
			new QuantumDestination("comm306", 101601, true),
			new QuantumDestination("comm730", 182033, true),
			new QuantumDestination("comm625", 99357, true),
			new QuantumDestination("comm556", 157470, false),
			new QuantumDestination("comm472", 64885, false),
			new QuantumDestination("comm126", 161334, false),
		],
		[
			"yela_via_crusader", "port_olisar", "cryastro262", "comm306", "comm730", "comm625"
		],
		"kareah"
	),
	crusader_via_cryastro42: new QuantumLocation("crusader_via_cryastro42", "Crusader (via Cry-Astro 42)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 168958, false),
			new QuantumDestination("grim_hex", 169151, true),
			new QuantumDestination("port_olisar", 21799, false),
			new QuantumDestination("covalex", 222745, true),
			new QuantumDestination("kareah", 157783, false),
			new QuantumDestination("cryastro42", 100375, false),
			new QuantumDestination("cryastro151", 194969, true),
			new QuantumDestination("cryastro262", 194969, true),
			new QuantumDestination("icc849", 460686, false),
			new QuantumDestination("comm275", 64490, false),
			new QuantumDestination("comm306", 72983, false),
			new QuantumDestination("comm730", 165384, false),
			new QuantumDestination("comm625", 103092, true),
			new QuantumDestination("comm556", 180693, true),
			new QuantumDestination("comm472", 95950, true),
			new QuantumDestination("comm126", 134816, false),
		],
		[
			"covalex", "cryastro151", "cryastro262", "comm625", "comm556", "comm472"
		],
		"cryastro42"
	),
	crusader_via_cryastro151: new QuantumLocation("crusader_via_cryastro151", "Crusader (via Cry-Astro 151)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 195375, true),
			new QuantumDestination("grim_hex", 195568, true),
			new QuantumDestination("port_olisar", 45896, true),
			new QuantumDestination("covalex", 181598, false),
			new QuantumDestination("kareah", 148096, false),
			new QuantumDestination("cryastro42", 143473, true),
			new QuantumDestination("cryastro151", 152152, false),
			new QuantumDestination("cryastro262", 178484, false),
			new QuantumDestination("icc849", 504337, true),
			new QuantumDestination("comm275", 90672, false),
			new QuantumDestination("comm306", 105357, true),
			new QuantumDestination("comm730", 171288, true),
			new QuantumDestination("comm625", 79445, false),
			new QuantumDestination("comm556", 137388, false),
			new QuantumDestination("comm472", 58591, false),
			new QuantumDestination("comm126", 178745, true),
		],
		[
			"yela_via_crusader", "port_olisar", "cryastro42", "icc849", "comm306", "comm730", "comm126"
		],
		"cryastro151"
	),
	crusader_via_cryastro262: new QuantumLocation("crusader_via_cryastro262", "Crusader (via Cry-Astro 262)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 162755, false),
			new QuantumDestination("grim_hex", 162948, true),
			new QuantumDestination("port_olisar", 29446, true),
			new QuantumDestination("covalex", 181491, false),
			new QuantumDestination("kareah", 181426, true),
			new QuantumDestination("cryastro42", 143473, true),
			new QuantumDestination("cryastro151", 178484, false),
			new QuantumDestination("cryastro262", 152152, false),
			new QuantumDestination("icc849", 500316, true),
			new QuantumDestination("comm275", 105192, true),
			new QuantumDestination("comm306", 78590, false),
			new QuantumDestination("comm730", 136907, false),
			new QuantumDestination("comm625", 58887, false),
			new QuantumDestination("comm556", 147359, false),
			new QuantumDestination("comm472", 91414, false),
			new QuantumDestination("comm126", 170618, false),
		],
		[
			"port_olisar", "kareah", "cryastro42", "icc849", "comm275"
		],
		"cryastro262"
	),
	crusader_via_icc849: new QuantumLocation("crusader_via_icc849", "Crusader (via ICC 849)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 166117, false),
			new QuantumDestination("grim_hex", 166310, true),
			new QuantumDestination("port_olisar", 19494, false),
			new QuantumDestination("covalex", 222385, true),
			new QuantumDestination("kareah", 160774, false),
			new QuantumDestination("cryastro42", 100872, false),
			new QuantumDestination("cryastro151", 196594, true),
			new QuantumDestination("cryastro262", 192811, true),
			new QuantumDestination("icc849", 460264, false),
			new QuantumDestination("comm275", 63871, false),
			new QuantumDestination("comm306", 69799, false),
			new QuantumDestination("comm730", 162769, false),
			new QuantumDestination("comm625", 102243, true),
			new QuantumDestination("comm556", 181748, true),
			new QuantumDestination("comm472", 98291, true),
			new QuantumDestination("comm126", 133390, false),
		],
		[
			"covalex", "cryastro151", "cryastro262", "comm625", "comm556", "comm472"
		],
		"icc849"
	),
	crusader_via_comm275: new QuantumLocation("crusader_via_comm275", "Crusader (via Comm 275)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 181776, false),
			new QuantumDestination("grim_hex", 181969, true),
			new QuantumDestination("port_olisar", 31790, true),
			new QuantumDestination("covalex", 219168, true),
			new QuantumDestination("kareah", 145781, false),
			new QuantumDestination("cryastro42", 105274, false),
			new QuantumDestination("cryastro151", 184188, false),
			new QuantumDestination("cryastro262", 200213, true),
			new QuantumDestination("icc849", 465606, false),
			new QuantumDestination("comm275", 56984, false),
			new QuantumDestination("comm306", 85261, false),
			new QuantumDestination("comm730", 175783, true),
			new QuantumDestination("comm625", 106234, true),
			new QuantumDestination("comm556", 175772, true),
			new QuantumDestination("comm472", 85226, false),
			new QuantumDestination("comm126", 141173, false),
		],
		[
			"port_olisar", "covalex", "cryastro262", "comm730", "comm625", "comm556"
		],
		"comm275"
	),
	crusader_via_comm306: new QuantumLocation("crusader_via_comm306", "Crusader (via Comm 306)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 150126, false),
			new QuantumDestination("grim_hex", 150319, true),
			new QuantumDestination("port_olisar", 4762, false),
			new QuantumDestination("covalex", 211056, false),
			new QuantumDestination("kareah", 179969, true),
			new QuantumDestination("cryastro42", 115153, false),
			new QuantumDestination("cryastro151", 200401, true),
			new QuantumDestination("cryastro262", 171741, false),
			new QuantumDestination("icc849", 470635, false),
			new QuantumDestination("comm275", 85261, false),
			new QuantumDestination("comm306", 56984, false),
			new QuantumDestination("comm730", 141158, false),
			new QuantumDestination("comm625", 85226, false),
			new QuantumDestination("comm556", 175771, true),
			new QuantumDestination("comm472", 106234, true),
			new QuantumDestination("comm126", 141173, false),
		],
		[
			"kareah", "cryastro151", "comm556", "comm472"
		],
		"comm306"
	),
	crusader_via_comm730: new QuantumLocation("crusader_via_comm730", "Crusader (via Comm 730)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 152768, false),
			new QuantumDestination("grim_hex", 152961, true),
			new QuantumDestination("port_olisar", 19221, false),
			new QuantumDestination("covalex", 193368, false),
			new QuantumDestination("kareah", 185064, true),
			new QuantumDestination("cryastro42", 133306, false),
			new QuantumDestination("cryastro151", 190431, true),
			new QuantumDestination("cryastro262", 156112, false),
			new QuantumDestination("icc849", 488930, false),
			new QuantumDestination("comm275", 100546, true),
			new QuantumDestination("comm306", 66508, false),
			new QuantumDestination("comm730", 132875, false),
			new QuantumDestination("comm625", 66509, false),
			new QuantumDestination("comm556", 159414, false),
			new QuantumDestination("comm472", 100546, true),
			new QuantumDestination("comm126", 159413, false),
		],
		[
			"kareah", "cryastro151", "comm275", "comm472"
		],
		"comm730"
	),
	crusader_via_comm625: new QuantumLocation("crusader_via_comm625", "Crusader (via Comm 625)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 168771, false),
			new QuantumDestination("grim_hex", 168964, true),
			new QuantumDestination("port_olisar", 33539, true),
			new QuantumDestination("covalex", 177993, false),
			new QuantumDestination("kareah", 177486, true),
			new QuantumDestination("cryastro42", 146220, true),
			new QuantumDestination("cryastro151", 172592, false),
			new QuantumDestination("cryastro262", 153712, false),
			new QuantumDestination("icc849", 504639, true),
			new QuantumDestination("comm275", 106235, true),
			new QuantumDestination("comm306", 85226, false),
			new QuantumDestination("comm730", 141158, false),
			new QuantumDestination("comm625", 56984, false),
			new QuantumDestination("comm556", 141173, false),
			new QuantumDestination("comm472", 85261, false),
			new QuantumDestination("comm126", 175771, true),
		],
		[
			"port_olisar", "kareah", "cryastro42", "icc849", "comm275", "comm126"
		],
		"comm625"
	),
	crusader_via_comm556: new QuantumLocation("crusader_via_comm556", "Crusader (via Comm 556)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 187000, true),
			new QuantumDestination("grim_hex", 187193, true),
			new QuantumDestination("port_olisar", 42982, true),
			new QuantumDestination("covalex", 175382, false),
			new QuantumDestination("kareah", 160465, false),
			new QuantumDestination("cryastro42", 148241, true),
			new QuantumDestination("cryastro151", 156586, false),
			new QuantumDestination("cryastro262", 166451, false),
			new QuantumDestination("icc849", 509100, true),
			new QuantumDestination("comm275", 100536, true),
			new QuantumDestination("comm306", 100536, true),
			new QuantumDestination("comm730", 159413, false),
			new QuantumDestination("comm625", 66524, false),
			new QuantumDestination("comm556", 132875, false),
			new QuantumDestination("comm472", 66524, false),
			new QuantumDestination("comm126", 182125, true),
		],
		[
			"yela_via_crusader", "port_olisar", "cryastro42", "icc849", "comm275", "comm306", "comm126"
		],
		"comm556"
	),
	crusader_via_comm472: new QuantumLocation("crusader_via_comm472", "Crusader (via Comm 472)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 197454, true),
			new QuantumDestination("grim_hex", 197647, true),
			new QuantumDestination("port_olisar", 45966, true),
			new QuantumDestination("covalex", 187539, false),
			new QuantumDestination("kareah", 142705, false),
			new QuantumDestination("cryastro42", 138574, false), //blocked?
			new QuantumDestination("cryastro151", 153468, false),
			new QuantumDestination("cryastro262", 184980, false),
			new QuantumDestination("icc849", 499952, true),
			new QuantumDestination("comm275", 85227, false),
			new QuantumDestination("comm306", 106234, true),
			new QuantumDestination("comm730", 175783, true),
			new QuantumDestination("comm625", 85260, false),
			new QuantumDestination("comm556", 141172, false),
			new QuantumDestination("comm472", 56984, false),
			new QuantumDestination("comm126", 175772, true),
		],
		[
			"yela_via_crusader", "port_olisar", "icc849", "comm306", "comm730", "comm126"
		],
		"comm472"
	),
	crusader_via_comm126: new QuantumLocation("crusader_via_comm126", "Crusader (via Comm 126)", 
		[],
		[
			new QuantumDestination("yela_via_crusader", 162964, false),
			new QuantumDestination("grim_hex", 163157, true),
			new QuantumDestination("port_olisar", 16973, false),
			new QuantumDestination("covalex", 221263, true),
			new QuantumDestination("kareah", 164330, false),
			new QuantumDestination("cryastro42", 102408, false),
			new QuantumDestination("cryastro151", 197974, true),
			new QuantumDestination("cryastro262", 189755, false),
			new QuantumDestination("icc849", 460723, false),
			new QuantumDestination("comm275", 66524, false),
			new QuantumDestination("comm306", 66524, false),
			new QuantumDestination("comm730", 159414, false),
			new QuantumDestination("comm625", 100536, true),
			new QuantumDestination("comm556", 182125, true),
			new QuantumDestination("comm472", 100536, true),
			new QuantumDestination("comm126", 132875, false),
		],
		[
			"covalex", "cryastro151", "comm625", "comm556", "comm472"
		],
		"comm126"
	),
	port_olisar: new QuantumLocation("port_olisar", "Port Olisar", 
		[
			new port.PortDestination("port_olisar_strut_a"),
			new port.PortDestination("port_olisar_strut_b"),
			new port.PortDestination("port_olisar_strut_c"),
			new port.PortDestination("port_olisar_strut_d"),
		],
		[
			new QuantumDestination("yela_via_port_olisar", 153513, false),
			new QuantumDestination("grim_hex", 153706, true),
			new QuantumDestination("crusader_via_port_olisar", 5, false),
			new QuantumDestination("covalex", 210860, true),
			new QuantumDestination("kareah", 176408, true),
			new QuantumDestination("cryastro42", 114362, false),
			new QuantumDestination("cryastro151", 197909, true),
			new QuantumDestination("cryastro262", 173985, false),
			new QuantumDestination("icc849", 471209, false),
			new QuantumDestination("comm275", 83260, false),
			new QuantumDestination("comm306", 60480, false),
			new QuantumDestination("comm730", 144225, false),
			new QuantumDestination("comm625", 85503, false),
			new QuantumDestination("comm556", 173938, true),
			new QuantumDestination("comm472", 102884, true),
			new QuantumDestination("comm126", 142411, false),
		],
		[
			"comm275", "comm306", "comm730", "comm625", "comm126"
		]
	),
	covalex: new QuantumLocation("covalex", "Covalex Shipping Hub",
		[
			new port.PortDestination("covalex_pads"),
		],
		[
			new QuantumDestination("yela_via_covalex", 295044, false),
			new QuantumDestination("grim_hex", 295238, true),
			new QuantumDestination("crusader_via_covalex", 198120, false),
			new QuantumDestination("port_olisar", 210856, true),
			new QuantumDestination("kareah", 277698, false),
			new QuantumDestination("cryastro42", 323120, true),
			new QuantumDestination("cryastro151", 145300, false),
			new QuantumDestination("cryastro262", 144331, false),
			new QuantumDestination("icc849", 680689, false),
			new QuantumDestination("comm275", 270203, false),
			new QuantumDestination("comm306", 247880, false),
			new QuantumDestination("comm730", 219729, false),
			new QuantumDestination("comm625", 137164, false),
			new QuantumDestination("comm556", 76554, false),
			new QuantumDestination("comm472", 174296, false),
			new QuantumDestination("comm126", 349650, false),
		],
		[
			"comm275", "comm306", "comm730", "comm625", "comm556", "comm472", "comm126"
		]
	),
	kareah: new QuantumLocation("kareah", "Security Post Kareah", 
		[
			new port.PortDestination("kareah_pads"),
		],
		[
			new QuantumDestination("yela_via_kareah", 325756, false),
			new QuantumDestination("grim_hex", 326446, false),
			new QuantumDestination("crusader_via_kareah", 160531, false),
			new QuantumDestination("port_olisar", 176407, true),
			new QuantumDestination("covalex", 277698, false),
			new QuantumDestination("cryastro42", 184055, false),
			new QuantumDestination("cryastro151", 158484, false),
			new QuantumDestination("cryastro262", 322431, false),
			new QuantumDestination("icc849", 500485, false),
			new QuantumDestination("comm275", 124286, false),
			new QuantumDestination("comm306", 228811, false),
			new QuantumDestination("comm730", 317687, true),
			new QuantumDestination("comm625", 222292, false),
			new QuantumDestination("comm556", 215782, false),
			new QuantumDestination("comm472", 111830, false),
			new QuantumDestination("comm126", 233648, false),
		],
		[
			"comm275", "comm306", "comm625", "comm556", "comm472", "comm126"
		]
	),
	cryastro42: new QuantumLocation("cryastro42", "Cry-Astro Service 042",
		[
			new port.PortDestination("cryastro42_pads"),
		],
		[
			new QuantumDestination("yela_via_cryastro42", 185827, false),
			new QuantumDestination("grim_hex", 185931, false),
			new QuantumDestination("crusader_via_cryastro42", 125000, false),
			new QuantumDestination("port_olisar", 114361, false),
			new QuantumDestination("covalex", 323120, true),
			new QuantumDestination("kareah", 184055, false),
			new QuantumDestination("cryastro151", 279509, false),
			new QuantumDestination("cryastro262", 279509, false),
			new QuantumDestination("icc849", 362620, false),
			new QuantumDestination("comm275", 72262, false),
			new QuantumDestination("comm306", 111525, false),
			new QuantumDestination("comm730", 224221, false),
			new QuantumDestination("comm625", 198364, false),
			new QuantumDestination("comm556", 277793, false),
			new QuantumDestination("comm472", 179255, false),
			new QuantumDestination("comm126", 60776, false),
		],
		[
			"comm275", "comm306", "comm730", "comm625", "comm556", "comm472", "comm126"
		]
	),
	cryastro151: new QuantumLocation("cryastro151", "Cry-Astro Service 151",
		[
			new port.PortDestination("cryastro151_pads"),
		],
		[
			new QuantumDestination("yela_via_cryastro151", 338509, false),
			new QuantumDestination("grim_hex", 338715, true),
			new QuantumDestination("crusader_via_cryastro151", 176777, false),
			new QuantumDestination("port_olisar", 197908, true),
			new QuantumDestination("covalex", 145300, false),
			new QuantumDestination("kareah", 158484, false),
			new QuantumDestination("cryastro42", 279509, false),
			new QuantumDestination("cryastro262", 250000, false),
			new QuantumDestination("icc849", 632549, false),
			new QuantumDestination("comm275", 211579, false),
			new QuantumDestination("comm306", 255793, true),
			new QuantumDestination("comm730", 290251, false),
			new QuantumDestination("comm625", 176223, false),
			new QuantumDestination("comm556", 95540, false),
			new QuantumDestination("comm472", 101932, false),
			new QuantumDestination("comm126", 320912, false),
		],
		[
			"comm275", "comm730", "comm625", "comm556", "comm472", "comm126"
		]
	),	
	cryastro262: new QuantumLocation("cryastro262", "Cry-Astro Service 262",
		[
			new port.PortDestination("cryastro262_pads"),
		],
		[
			new QuantumDestination("yela_via_cryastro262", 175287, false),
			new QuantumDestination("grim_hex", 175443, false),
			new QuantumDestination("crusader_via_cryastro262", 176777, false),
			new QuantumDestination("port_olisar", 173986, false),
			new QuantumDestination("covalex", 144331, false),
			new QuantumDestination("kareah", 322431, false),
			new QuantumDestination("cryastro42", 279509, false),
			new QuantumDestination("cryastro151", 250000, false),
			new QuantumDestination("icc849", 609195, false),
			new QuantumDestination("comm275", 255306, true),
			new QuantumDestination("comm306", 173450, false),
			new QuantumDestination("comm730", 90439, false),
			new QuantumDestination("comm625", 103147, false),
			new QuantumDestination("comm556", 171785, false),
			new QuantumDestination("comm472", 213859, false),
			new QuantumDestination("comm126", 287407, false),
		],
		[
			"comm306", "comm730", "comm625", "comm556", "comm472", "comm126"
		]
	),
	icc849: new QuantumLocation("icc849", "ICC Probe 849",
		[
			new port.PortDestination("icc849_pads"),
		],
		[
			new QuantumDestination("yela_via_icc849", 450432, false),
			new QuantumDestination("grim_hex", 450358, false),
			new QuantumDestination("crusader_via_icc849", 484890, false),
			new QuantumDestination("port_olisar", 471208, false),
			new QuantumDestination("covalex", 680688, false),
			new QuantumDestination("kareah", 500484, false),
			new QuantumDestination("cryastro42", 362620, false),
			new QuantumDestination("cryastro151", 632549, false),
			new QuantumDestination("cryastro262", 609195, false),
			new QuantumDestination("comm275", 423112, false),
			new QuantumDestination("comm306", 441167, false),
			new QuantumDestination("comm730", 530295, false),
			new QuantumDestination("comm625", 551845, false),
			new QuantumDestination("comm556", 640282, false),
			new QuantumDestination("comm472", 537520, false),
			new QuantumDestination("comm126", 331492, false),
		],
		[
			"comm275", "comm306", "comm730", "comm625", "comm556", "comm472", "comm126"
		]
	),
	comm275: new QuantumLocation("comm275", "Comm Array 275",
		[],
		[
			new QuantumDestination("yela_via_comm275", 210643, false),
			new QuantumDestination("grim_hex", 210798, false),
			new QuantumDestination("crusader_via_comm275", 81609, false),
			new QuantumDestination("port_olisar", 83259, false),
			new QuantumDestination("covalex", 270203, false),
			new QuantumDestination("kareah", 124286, false),
			new QuantumDestination("cryastro42", 72262, false),
			new QuantumDestination("cryastro151", 211579, false),
			new QuantumDestination("cryastro262", 255306, true),
			new QuantumDestination("icc849", 423112, false),
			new QuantumDestination("comm306", 115455, false),
			new QuantumDestination("comm730", 222824, false),
			new QuantumDestination("comm625", 163218, true),
			new QuantumDestination("comm556", 222794, false),
			new QuantumDestination("comm472", 115371, false),
			new QuantumDestination("comm126", 115306, false),
		],
		[
			"comm306", "comm730", "comm556", "comm472", "comm126"
		]
	),
	comm306: new QuantumLocation("comm306", "Comm Array 306",
		[],
		[
			new QuantumDestination("yela_via_comm306", 97768, false),
			new QuantumDestination("grim_hex", 97942, false),
			new QuantumDestination("crusader_via_comm306", 81609, false),
			new QuantumDestination("port_olisar", 60481, false),
			new QuantumDestination("covalex", 247880, false),
			new QuantumDestination("kareah", 228811, false),
			new QuantumDestination("cryastro42", 111525, false),
			new QuantumDestination("cryastro151", 255793, true),
			new QuantumDestination("cryastro262", 173450, false),
			new QuantumDestination("icc849", 441167, false),
			new QuantumDestination("comm275", 115455, false),
			new QuantumDestination("comm730", 115249, false),
			new QuantumDestination("comm625", 115371, false),
			new QuantumDestination("comm556", 222794, false),
			new QuantumDestination("comm472", 163219, true),
			new QuantumDestination("comm126", 115305, false),
		],
		[
			"comm275", "comm730", "comm625", "comm556", "comm126"
		]
	),
	comm730: new QuantumLocation("comm730", "Comm Array 730",
		[],
		[
			new QuantumDestination("yela_via_comm730", 86450, false),
			new QuantumDestination("grim_hex", 86598, false),
			new QuantumDestination("crusader_via_comm730", 157500, false),
			new QuantumDestination("port_olisar", 144226, false),
			new QuantumDestination("covalex", 219729, false),
			new QuantumDestination("kareah", 317687, true),
			new QuantumDestination("cryastro42", 224221, false),
			new QuantumDestination("cryastro151", 290251, false),
			new QuantumDestination("cryastro262", 90439, false),
			new QuantumDestination("icc849", 530294, false),
			new QuantumDestination("comm275", 222824, false),
			new QuantumDestination("comm306", 115248, false),
			new QuantumDestination("comm625", 115248, false),
			new QuantumDestination("comm556", 222739, false),
			new QuantumDestination("comm472", 222824, false),
			new QuantumDestination("comm126", 222739, false),
		],
		[
			"comm275", "comm306", "comm625", "comm556", "comm472", "comm126"
		]
	),
	comm625: new QuantumLocation("comm625", "Comm Array 625",
		[],
		[
			new QuantumDestination("yela_via_comm625", 171064, false),
			new QuantumDestination("grim_hex", 171271, true),
			new QuantumDestination("crusader_via_comm625", 81609, false),
			new QuantumDestination("port_olisar", 85503, false),
			new QuantumDestination("covalex", 137164, false),
			new QuantumDestination("kareah", 222292, false),
			new QuantumDestination("cryastro42", 198364, false),
			new QuantumDestination("cryastro151", 176223, false),
			new QuantumDestination("cryastro262", 103147, false),
			new QuantumDestination("icc849", 551844, false),
			new QuantumDestination("comm275", 163218, true),
			new QuantumDestination("comm306", 115370, false),
			new QuantumDestination("comm730", 115248, false),
			new QuantumDestination("comm556", 115306, false),
			new QuantumDestination("comm472", 115455, false),
			new QuantumDestination("comm126", 222794, false),
		],
		[
			"comm306", "comm730", "comm556", "comm472", "comm126"
		]
	),
	comm556: new QuantumLocation("comm556", "Comm Array 556",
		[],
		[
			new QuantumDestination("yela_via_comm556", 286116, false),
			new QuantumDestination("grim_hex", 286322, true),
			new QuantumDestination("crusader_via_comm556", 157500, false),
			new QuantumDestination("port_olisar", 173938, true),
			new QuantumDestination("covalex", 76554, false),
			new QuantumDestination("kareah", 215781, false),
			new QuantumDestination("cryastro42", 277792, false),
			new QuantumDestination("cryastro151", 95540, false),
			new QuantumDestination("cryastro262", 171784, false),
			new QuantumDestination("icc849", 640282, false),
			new QuantumDestination("comm275", 222794, false),
			new QuantumDestination("comm306", 222794, false),
			new QuantumDestination("comm730", 222739, false),
			new QuantumDestination("comm625", 115306, false),
			new QuantumDestination("comm472", 115306, false),
			new QuantumDestination("comm126", 315000, true),
		],
		[
			"comm275", "comm306", "comm730", "comm625", "comm472"
		]
	),
	comm472: new QuantumLocation("comm472", "Comm Array 472",
		[],
		[
			new QuantumDestination("yela_via_comm472", 253130, true),
			new QuantumDestination("grim_hex", 253331, true),
			new QuantumDestination("crusader_via_comm472", 81610, false),
			new QuantumDestination("port_olisar", 102883, true),
			new QuantumDestination("covalex", 174296, false),
			new QuantumDestination("kareah", 111830, false),
			new QuantumDestination("cryastro42", 179255, false),
			new QuantumDestination("cryastro151", 101932, false),
			new QuantumDestination("cryastro262", 213858, false),
			new QuantumDestination("icc849", 537521, false),
			new QuantumDestination("comm275", 115371, false),
			new QuantumDestination("comm306", 163219, true),
			new QuantumDestination("comm730", 222824, false),
			new QuantumDestination("comm625", 115455, false),
			new QuantumDestination("comm556", 115305, false),
			new QuantumDestination("comm126", 222795, false),
		],
		[
			"comm275", "comm730", "comm625", "comm556", "comm126"
		]
	),
	comm126: new QuantumLocation("comm126", "Comm Array 126",
		[],
		[
			new QuantumDestination("yela_via_comm126", 167520, false),
			new QuantumDestination("grim_hex", 167575, false),
			new QuantumDestination("crusader_via_comm126", 157500, false),
			new QuantumDestination("port_olisar", 142411, false),
			new QuantumDestination("covalex", 349650, false),
			new QuantumDestination("kareah", 233648, false),
			new QuantumDestination("cryastro42", 60776, false),
			new QuantumDestination("cryastro151", 320912, false),
			new QuantumDestination("cryastro262", 287407, false),
			new QuantumDestination("icc849", 331492, false),
			new QuantumDestination("comm275", 115305, false),
			new QuantumDestination("comm306", 115305, false),
			new QuantumDestination("comm730", 222738, false),
			new QuantumDestination("comm625", 222794, false),
			new QuantumDestination("comm556", 315000, true),
			new QuantumDestination("comm472", 222794, false),
		],
		[
			"comm275", "comm306", "comm730", "comm625", "comm472"
		]
	),
}

var _quantumIdToLocation = function(locationId) {
	return Object.freeze(_quantum_locations[locationId]);
}

var _quantumIdsToLocations = function(locationIds) {
	array = [];
	for (var i = locationIds.length - 1; i >= 0; i--) {
		array[i] = Object.freeze(_quantum_locations[locationIds[i]]);
	};
	return array;
}

module.exports = {
	spawn_location_ids: ["port_olisar", "grim_hex"],
	quantumIdToLocation: _quantumIdToLocation,
	quantumIdsToLocations: _quantumIdsToLocations
}
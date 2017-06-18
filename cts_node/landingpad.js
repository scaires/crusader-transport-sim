// landingpad.js

function LandingPadLocation(id, display_name, min_size, max_size, port_id, type) {
	this.id = id;
	this.display_name = display_name;
	this.min_size = min_size;
	this.max_size = max_size;
	this.port_id = port_id;
	this.type = type;
}

LandingPadLocation.prototype.toString = function() {
	return this.display_name;
};

LandingPadLocation.prototype.canAcceptSize = function(size) {
	return size >= this.min_size && size <= this.max_size;
}

function LandingPadDestination(id) {
	this.id = id;
	var landingPad = _landingPadIdToLocation(id);
	this.type = landingPad.type;
}

LandingPadDestination.prototype.toString = function() {
	var location = _landing_pad_locations[this.id];
	if (location.min_size == location.max_size) {
		return location.display_name + ' (Size ' + location.min_size + ')';
	} else {
		return location.display_name + ' (Size ' + location.min_size + '-' + location.max_size + ')';
	}
};

var _landing_pad_locations = {
	// Olisar Strut A
	port_olisar_strut_a_pad_00: new LandingPadLocation("port_olisar_strut_a_pad_00", "Pad A-00", 5, 5, "port_olisar_strut_a", "landingpad"),
	port_olisar_strut_a_pad_01: new LandingPadLocation("port_olisar_strut_a_pad_01", "Pad A-01", 1, 3, "port_olisar_strut_a", "landingpad"),
	port_olisar_strut_a_pad_02: new LandingPadLocation("port_olisar_strut_a_pad_02", "Pad A-02", 1, 3, "port_olisar_strut_a", "landingpad"),
	port_olisar_strut_a_pad_03: new LandingPadLocation("port_olisar_strut_a_pad_03", "Pad A-03", 1, 3, "port_olisar_strut_a", "landingpad"),
	port_olisar_strut_a_pad_04: new LandingPadLocation("port_olisar_strut_a_pad_04", "Pad A-04", 1, 3, "port_olisar_strut_a", "landingpad"),
	port_olisar_strut_a_pad_05: new LandingPadLocation("port_olisar_strut_a_pad_05", "Pad A-05", 1, 3, "port_olisar_strut_a", "landingpad"),
	port_olisar_strut_a_pad_06: new LandingPadLocation("port_olisar_strut_a_pad_06", "Pad A-06", 1, 3, "port_olisar_strut_a", "landingpad"),
	port_olisar_strut_a_pad_07: new LandingPadLocation("port_olisar_strut_a_pad_07", "Pad A-07", 1, 3, "port_olisar_strut_a", "landingpad"),
	port_olisar_strut_a_pad_08: new LandingPadLocation("port_olisar_strut_a_pad_08", "Pad A-08", 1, 3, "port_olisar_strut_a", "landingpad"),
	port_olisar_strut_a_pad_09: new LandingPadLocation("port_olisar_strut_a_pad_09", "Pad A-09", 4, 4, "port_olisar_strut_a", "landingpad"),
	port_olisar_strut_a_pad_10: new LandingPadLocation("port_olisar_strut_a_pad_10", "Pad A-10", 4, 4, "port_olisar_strut_a", "landingpad"),

	// Olisar Strut B
	port_olisar_strut_b_pad_00: new LandingPadLocation("port_olisar_strut_b_pad_00", "Pad B-00", 5, 5, "port_olisar_strut_b", "landingpad"),
	port_olisar_strut_b_pad_01: new LandingPadLocation("port_olisar_strut_b_pad_01", "Pad B-01", 1, 3, "port_olisar_strut_b", "landingpad"),
	port_olisar_strut_b_pad_02: new LandingPadLocation("port_olisar_strut_b_pad_02", "Pad B-02", 1, 3, "port_olisar_strut_b", "landingpad"),
	port_olisar_strut_b_pad_03: new LandingPadLocation("port_olisar_strut_b_pad_03", "Pad B-03", 1, 3, "port_olisar_strut_b", "landingpad"),
	port_olisar_strut_b_pad_04: new LandingPadLocation("port_olisar_strut_b_pad_04", "Pad B-04", 1, 3, "port_olisar_strut_b", "landingpad"),
	port_olisar_strut_b_pad_05: new LandingPadLocation("port_olisar_strut_b_pad_05", "Pad B-05", 1, 3, "port_olisar_strut_b", "landingpad"),
	port_olisar_strut_b_pad_06: new LandingPadLocation("port_olisar_strut_b_pad_06", "Pad B-06", 1, 3, "port_olisar_strut_b", "landingpad"),
	port_olisar_strut_b_pad_07: new LandingPadLocation("port_olisar_strut_b_pad_07", "Pad B-07", 1, 3, "port_olisar_strut_b", "landingpad"),
	port_olisar_strut_b_pad_08: new LandingPadLocation("port_olisar_strut_b_pad_08", "Pad B-08", 1, 3, "port_olisar_strut_b", "landingpad"),
	port_olisar_strut_b_pad_09: new LandingPadLocation("port_olisar_strut_b_pad_09", "Pad B-09", 4, 4, "port_olisar_strut_b", "landingpad"),
	port_olisar_strut_b_pad_10: new LandingPadLocation("port_olisar_strut_b_pad_10", "Pad B-10", 4, 4, "port_olisar_strut_b", "landingpad"),

	// Olisar Strut C
	port_olisar_strut_c_pad_00: new LandingPadLocation("port_olisar_strut_c_pad_00", "Pad C-00", 5, 5, "port_olisar_strut_c", "landingpad"),
	port_olisar_strut_c_pad_01: new LandingPadLocation("port_olisar_strut_c_pad_01", "Pad C-01", 1, 3, "port_olisar_strut_c", "landingpad"),
	port_olisar_strut_c_pad_02: new LandingPadLocation("port_olisar_strut_c_pad_02", "Pad C-02", 1, 3, "port_olisar_strut_c", "landingpad"),
	port_olisar_strut_c_pad_03: new LandingPadLocation("port_olisar_strut_c_pad_03", "Pad C-03", 1, 3, "port_olisar_strut_c", "landingpad"),
	port_olisar_strut_c_pad_04: new LandingPadLocation("port_olisar_strut_c_pad_04", "Pad C-04", 1, 3, "port_olisar_strut_c", "landingpad"),
	port_olisar_strut_c_pad_05: new LandingPadLocation("port_olisar_strut_c_pad_05", "Pad C-05", 1, 3, "port_olisar_strut_c", "landingpad"),
	port_olisar_strut_c_pad_06: new LandingPadLocation("port_olisar_strut_c_pad_06", "Pad C-06", 1, 3, "port_olisar_strut_c", "landingpad"),
	port_olisar_strut_c_pad_07: new LandingPadLocation("port_olisar_strut_c_pad_07", "Pad C-07", 1, 3, "port_olisar_strut_c", "landingpad"),
	port_olisar_strut_c_pad_08: new LandingPadLocation("port_olisar_strut_c_pad_08", "Pad C-08", 1, 3, "port_olisar_strut_c", "landingpad"),
	port_olisar_strut_c_pad_09: new LandingPadLocation("port_olisar_strut_c_pad_09", "Pad C-09", 4, 4, "port_olisar_strut_c", "landingpad"),
	port_olisar_strut_c_pad_10: new LandingPadLocation("port_olisar_strut_c_pad_10", "Pad C-10", 4, 4, "port_olisar_strut_c", "landingpad"),

	// Olisar Strut D
	port_olisar_strut_d_pad_00: new LandingPadLocation("port_olisar_strut_d_pad_00", "Pad D-00", 5, 5, "port_olisar_strut_d", "landingpad"),
	port_olisar_strut_d_pad_01: new LandingPadLocation("port_olisar_strut_d_pad_01", "Pad D-01", 1, 3, "port_olisar_strut_d", "landingpad"),
	port_olisar_strut_d_pad_02: new LandingPadLocation("port_olisar_strut_d_pad_02", "Pad D-02", 1, 3, "port_olisar_strut_d", "landingpad"),
	port_olisar_strut_d_pad_03: new LandingPadLocation("port_olisar_strut_d_pad_03", "Pad D-03", 1, 3, "port_olisar_strut_d", "landingpad"),
	port_olisar_strut_d_pad_04: new LandingPadLocation("port_olisar_strut_d_pad_04", "Pad D-04", 1, 3, "port_olisar_strut_d", "landingpad"),
	port_olisar_strut_d_pad_05: new LandingPadLocation("port_olisar_strut_d_pad_05", "Pad D-05", 1, 3, "port_olisar_strut_d", "landingpad"),
	port_olisar_strut_d_pad_06: new LandingPadLocation("port_olisar_strut_d_pad_06", "Pad D-06", 1, 3, "port_olisar_strut_d", "landingpad"),
	port_olisar_strut_d_pad_07: new LandingPadLocation("port_olisar_strut_d_pad_07", "Pad D-07", 1, 3, "port_olisar_strut_d", "landingpad"),
	port_olisar_strut_d_pad_08: new LandingPadLocation("port_olisar_strut_d_pad_08", "Pad D-08", 1, 3, "port_olisar_strut_d", "landingpad"),
	port_olisar_strut_d_pad_09: new LandingPadLocation("port_olisar_strut_d_pad_09", "Pad D-09", 4, 4, "port_olisar_strut_d", "landingpad"),
	port_olisar_strut_d_pad_10: new LandingPadLocation("port_olisar_strut_d_pad_10", "Pad D-10", 4, 4, "port_olisar_strut_d", "landingpad"),

	// Kareah pads
	kareah_pads_pad_01: new LandingPadLocation("kareah_pads_pad_01", "Pad 01", 1, 4, "kareah_pads", "landingpad"),
	kareah_pads_pad_02: new LandingPadLocation("kareah_pads_pad_02", "Pad 02", 1, 3, "kareah_pads", "landingpad"),
	kareah_pads_pad_03: new LandingPadLocation("kareah_pads_pad_03", "Pad 03", 1, 3, "kareah_pads", "landingpad"),
	kareah_pads_pad_04: new LandingPadLocation("kareah_pads_pad_04", "Pad 04", 1, 3, "kareah_pads", "landingpad"),
	kareah_pads_pad_05: new LandingPadLocation("kareah_pads_pad_05", "Pad 05", 1, 4, "kareah_pads", "landingpad"),
	kareah_pads_pad_06: new LandingPadLocation("kareah_pads_pad_06", "Pad 06", 1, 3, "kareah_pads", "landingpad"),
	kareah_pads_pad_07: new LandingPadLocation("kareah_pads_pad_07", "Pad 07", 1, 3, "kareah_pads", "landingpad"),
	kareah_pads_pad_08: new LandingPadLocation("kareah_pads_pad_08", "Pad 08", 1, 3, "kareah_pads", "landingpad"),
	kareah_pads_tender: new LandingPadLocation("kareah_pads_tender", "Tender (MPUV-C)", 5, 5, "kareah_pads", "tender"),

	// Grim Hex Pads
	grim_hex_pads_pad_01: new LandingPadLocation("grim_hex_pads_pad_01", "Pad 01", 3, 3, "grim_hex_pads", "landingpad"),
	grim_hex_pads_pad_02: new LandingPadLocation("grim_hex_pads_pad_02", "Pad 02", 4, 4, "grim_hex_pads", "landingpad"),
	grim_hex_pads_pad_03: new LandingPadLocation("grim_hex_pads_pad_03", "Pad 03", 1, 2, "grim_hex_pads", "landingpad"),
	grim_hex_pads_pad_04: new LandingPadLocation("grim_hex_pads_pad_04", "Pad 04", 1, 2, "grim_hex_pads", "landingpad"),
	grim_hex_pads_pad_05: new LandingPadLocation("grim_hex_pads_pad_05", "Pad 05", 1, 2, "grim_hex_pads", "landingpad"),
	grim_hex_pads_pad_06: new LandingPadLocation("grim_hex_pads_pad_06", "Pad 06", 3, 3, "grim_hex_pads", "landingpad"),
	grim_hex_pads_tender: new LandingPadLocation("grim_hex_pads_tender", "Tender (MPUV-C)", 5, 5, "grim_hex_pads", "tender"),

	// Cry-Astro pads
	cryastro42_pad_small: new LandingPadLocation("cryastro42_pad_small", "Small Pad", 1, 3, "cryastro42_pads", "landingpad"),
	cryastro42_pad_large: new LandingPadLocation("cryastro42_pad_large", "Large Pad", 4, 5, "cryastro42_pads", "landingpad"),
	cryastro151_pad_small: new LandingPadLocation("cryastro151_pad_small", "Small Pad", 1, 3, "cryastro151_pads", "landingpad"),
	cryastro151_pad_large: new LandingPadLocation("cryastro151_pad_large", "Large Pad", 4, 5, "cryastro151_pads", "landingpad"),
	cryastro262_pad_small: new LandingPadLocation("cryastro262_pad_small", "Small Pad", 1, 3, "cryastro262_pads", "landingpad"),
	cryastro262_pad_large: new LandingPadLocation("cryastro262_pad_large", "Large Pad", 4, 5, "cryastro262_pads", "landingpad"),

	// Covalex
	covalex_pads_tender: new LandingPadLocation("covalex_pads_tender", "Tender (MPUV-C)", 1, 5, "covalex_pads", "tender"),

	// ICC-849
	icc849_pads_tender: new LandingPadLocation("icc849_pads_tender", "Tender (MPUV-C)", 1, 5, "icc849_pads", "tender"),
}

var _landing_pad_location_ids = [];

for (var landing_pad_location_id in _landing_pad_locations) {
	if (_landing_pad_locations.hasOwnProperty(landing_pad_location_id)) {
		_landing_pad_location_ids.push(landing_pad_location_id)
	}
}

var _landingPadIdToLocation = function(locationId) {
	return Object.freeze(_landing_pad_locations[locationId]);
}

var _landingPadIdsToLocations = function(locationIds) {
	var array = [];
	for (var i = locationIds.length - 1; i >= 0; i--) {
		array[i] = Object.freeze(_landing_pad_locations[locationIds[i]]);
	};
	return array;
}

module.exports = {
	LandingPadLocation: LandingPadLocation,
	LandingPadDestination: LandingPadDestination,
	landing_pad_location_ids: Object.freeze(_landing_pad_location_ids),
	landingPadIdToLocation: _landingPadIdToLocation,
	landingPadIdsToLocations: _landingPadIdsToLocations
}
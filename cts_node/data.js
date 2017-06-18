var journal = require('./journal');
var shiptype = require('./shiptype');
var cargohold = require('./cargohold');
var landingPad = require('./landingpad');

module.exports = {
	player: {
		spawn_location_quantum_id:null,
		port_location_id:null,
		quantum_location_id:null,
		destination:null,
		journal: new journal.Journal(),
		disembarked: false,
		load: function(savedPlayer) {
			this.journal.load(savedPlayer.journal);
		},
	},
	ship: {
		id:null,
		type_id:null,
		name:null,
		quantum_location_id:null,
		landing_pad_location_id:null,
		docked_shipcontact_id:null,
		cargo:null,
		clear: function() {
			this.id = null;
			this.type_id = null;
			this.name = null;
			this.quantum_location_id = null;
			this.landing_pad_location_id = null;
			this.docked_shipcontact_id = null;
			this.cargo = null;
		},
		hasShip: function() {
			return this.id != null;
		},
		cargoHoldForIndex: function(index) {
			return this.cargo[index];
		},
		hasMultipleCargoHolds: function() {
			return this.cargo.length > 1;
		},
		totalCargoSize: function() {
			var totalCargoSize = 0;
			this.cargo.forEach(function(hold) {
				totalCargoSize = totalCargoSize + hold.size;
			});
			return totalCargoSize;
		},
		loadedCargoSize: function() {
			var loadedCargoSize = 0;
			this.cargo.forEach(function(hold) {
				loadedCargoSize = loadedCargoSize + hold.loadedCargoSize();
			});
			return loadedCargoSize;
		},
		isLanded: function() {
			if (this.landing_pad_location_id == null) {
				return false;
			} else {
				var _landingpad = landingPad.landingPadIdToLocation(this.landing_pad_location_id);
				return _landingpad.type == "landingpad";
			}
		},
		isDocked: function() {
			if (this.docked_shipcontact_id != null) {
				return true;
			} else if (this.landing_pad_location_id != null) {
				var _landingpad = landingPad.landingPadIdToLocation(this.landing_pad_location_id);
				return _landingpad.type == "tender";
			} else {
				return false;
			}
		},
		isDockedWithTender: function() {
			if (this.landing_pad_location_id != null) {
				var _landingpad = landingPad.landingPadIdToLocation(this.landing_pad_location_id);
				return _landingpad.type == "tender";
			} else {
				return false;
			}
		},
		setType: function(type_id) {
			this.type_id = type_id;
			_shiptype = shiptype.shipIdToShip(type_id);
			switch(type_id) {
				case "drak_caterpillar":
					this.cargo = [
						new cargohold.CargoHold(92, false, "Module 01 cargo", "module 01 cargo hold door"),
						new cargohold.CargoHold(92, false, "Module 02 cargo", "module 02 cargo hold door"),
						new cargohold.CargoHold(92, false, "Module 03 cargo", "module 03 cargo hold door"),
						new cargohold.CargoHold(92, false, "Module 04 cargo", "module 04 cargo hold door"),
						new cargohold.CargoHold(144, false, "Front module cargo", "front module cargo hold door"),
					]
					break;
				case "misc_freelancer":
					this.cargo = [
						new cargohold.CargoHold(51, false, "Main cargo", "cargo hold door"),
						new cargohold.CargoHold(8, false, "Auxiliary cargo", "cargo hold door")
					]
					break;
				case "aegs_starfarer_gemini":
				case "misc_starfarer":
					this.cargo = [
						new cargohold.CargoHold(160, false, "Left cargo pad", "cargo hold door"),
						new cargohold.CargoHold(320, false, "Center cargo pad", "cargo hold door"),
						new cargohold.CargoHold(160, false, "Right cargo pad", "cargo hold door")
					]
					break;
				default:
					this.cargo = [
						new cargohold.CargoHold(_shiptype.cargo_hold_size, _shiptype.cargo_is_external)
					]
					break;
			}
		},
	}
}
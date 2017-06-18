// commodities.js

function Commodity(id, display_name, manufacturer_name, description) {
	this.id = id;
	this.display_name = display_name;
	this.manufacturer_name = manufacturer_name;
	this.description = description;
}

Commodity.prototype.toString = function() {
	return this.display_name;
};

var _commodities = {
	// solar imports
	ship_guns_qcl_from_hurston: new Commodity("ship_guns_qcl_from_hurston", "Quantum Cascade Lasers", "Hurston Dynamics", "Poor grade versions of Hurston's popular \'Spectrum\' quantum cascade lasers designed for export."), // kareah, arccorp, pyro, grimhex, cryastro
	ship_guns_elec_from_hurston: new Commodity("ship_guns_elec_from_hurston", "Electron Guns", "Hurston Dynamics", "Poor grade versions of Hurston's popular \'Magnitude\' electron guns designed for export."), // kareah, arccorp, pyro, grimhex, cryastro
	fusion_engines_from_arccorp: new Commodity("fusion_engines_from_arccorp", "Fusion Engines", "ArcCorp", "High quality, affordable ship fusion engines produced by ArcCorp."), // olisar (crusader?), cryastro
	personal_weapons_from_arccorp: new Commodity("personal_weapons_from_arccorp", "Personal Weapons", "ArcCorp", "An assortment of ballistic and energy personal weapons distributed by ArcCorp."), // kareah, pyro, grimhex
	mining_parts_from_arccorp: new Commodity("mining_parts_from_arccorp", "Mining Equipment Parts", "ArcCorp", "Refurbished parts for specialty asteroid mining equipment."), // yela
	ship_electronics_from_microtech: new Commodity("ship_electronics_from_microtech", "Ship Electronics", "microTech", "A wide variety of microTech\'s electronics, used in ship systems and components."), // olisar (crusader industries), magnus (drake), terra (origin, anvil), cryastro
	mobiglas_from_microtech: new Commodity("mobiglas_from_microtech", "mobiGlas", "microTech", "MicroTech\'s signature personal digital assistive technology used by nearly everyone in the Empire."),

	// extrasolar imports
	platinum_from_terra_ii: new Commodity("platinum_from_terra_ii", "Platinum", "UEE", "Platinum extracted by automated cities on Terra II. Sales moderated by the UEE."), // magnus, hurston
	mercury_from_terra_ii: new Commodity("mercury_from_terra_ii", "Mercury", "UEE", "Mercury extracted by automated cities on Terra II. Sales moderated by the UEE."), // magnus, hurston
	iron_from_terra_ii: new Commodity("iron_from_terra_ii", "Iron", "UEE", "Iron extracted by automated cities on Terra II. Sales moderated by the UEE."), // magnus, hurston
	gold_from_terra_ii: new Commodity("gold_from_terra_ii", "Gold", "UEE", "Gold extracted by automated cities on Terra II. Sales moderated by the UEE."), // magnus, hurston
	processed_food_from_terra_iii: new Commodity("processed_food_from_terra_iii", "Processed Food", "Terra Mills", "Popular processed food items, including Big Benny'\s, produced on Rytif and distributed throughout the Empire."), // basically everywhere
	origin_300_series_parts_from_terra_iii: new Commodity("origin_300_series_parts_from_terra_iii", "300 Series Parts", "Origin Jumpworks GmbH", "Specialty ship parts for the Origin Jumpworks 300 series ships, produced at the headquarters on Terra III."),
	diamonds_from_magnus_i: new Commodity("diamonds_from_magnus_i", "Diamonds", "UEE", "High grade diamonds used in gemstones and factory operations. Sales moderated by the UEE."), // arccorp
	caterpillar_parts_from_borea: new Commodity("caterpillar_parts_from_borea", "Caterpillar Parts", "Drake Interplanetary", "Replacement and service parts for the Drake Interplanetary Caterpillar produced in the old UEE shipyards."), // ArcCorp, Terra, Olisar
	unlicensed_medicine_from_pyro_vi: new Commodity("unlicensed_medicine_from_pyro_vi", "Unlicensed Medicine", "Corner Four Research Lab", "Unlicensed medicine produced by a defunct, repurposed research lab."), // hurston, grim hex
	illegal_narcotics_from_pyro_vi: new Commodity("illegal_narcotics_from_pyro_vi", "Illegal Narcotics", "Corner Four Research Lab", "Illegal narcotics produced by a defunct, repurposed research lab."), // arccorp, grim hex

	// crusader exports
	hydrogen_fuel_from_crusader: new Commodity("hydrogen_fuel_from_crusader", "Hydrogen Fuel", "Crusader Industries", "Hydrogen fuel, collected on Crusader, purchased and refined by CryAstro."), // Cryastro
	genesis_parts_from_crusader: new Commodity("genesis_parts_from_crusader", "Starliner Parts", "Crusader Industries", "Spare and replacement parts for the Genesis-class Starliner."), // arccorp, terra (platinum bay on terra III)
	salvage_from_covalex: new Commodity("salvage_from_covalex", "Salvage", "Covalex Shipping Hub", "After a catastrophic accident, Covalex is collecting salvage from the abandoned station."), // crusader (olisar?)
	salvage_equip_from_crusader: new Commodity("salvage_equip_from_crusader", "Salvage Equipment", "Covalex Shipping", "After a catastrophic accident, Covalex is delivering this salvage equipment from Orison to collect and analyze salvage from the abandoned station."), // crusader (olisar?)
	prisoners_from_kareah: new Commodity("prisoners_from_kareah", "Prisoners", "Security Post Kareah", "These prisoners are being transported in stasis pods."),
	discount_goods_from_grim_hex: new Commodity("discount_goods_from_grim_hex", "Discount goods", "Grim Hex", "These goods have been stripped of identifying information and are offered for sale at a low price."), // random outlaws in Crusader at comm arrays?
	prisoners_from_grim_hex: new Commodity("prisoners_from_grim_hex", "Prisoners", "Grim Hex", "These prisoners are being transported in stasis pods."),
	stolen_goods_from_nine_tails: new Commodity("stolen_goods_from_nine_tails", "Stolen goods", "Nine Tails", "These goods were probably stolen from cargo ships."), // random outlaws in Crusader at comm arrays?
	ship_scrap_from_cryastro: new Commodity("ship_scrap_from_cryastro", "Ship scrap", "CryAstro", "Scrap metal and other salvage stripped from ships during the repair process."),
	platinum_from_yela: new Commodity("platinum_from_yela", "Platinum", "Stanton Mining Collective", "Ore containing traces of platinum, mined by the Stanton Mining Collective from the asteroids orbiting Yela."), // magnus, hurston
	iron_from_yela: new Commodity("iron_from_yela", "Iron", "Stanton Mining Collective", "Iron ore mined by the Stanton Mining Collective from the asteroids orbiting Yela."), // magnus, hurston
	scan_data_from_icc: new Commodity("scan_data_from_icc", "Cartography Data", "Imperial Cartography Center", "Deep space scan data collected by the ICC-849 station."), // terra
}

var _commodityIdToCommodity = function(id) {
	return Object.freeze(_commodities[id]);
}

var _commodityIdsToCommodities = function(ids) {
	array = [];
	for (var i = ids.length - 1; i >= 0; i--) {
		array[i] = Object.freeze(_commodities[ids[i]]);
	};
	return array;
}

var _commodity_ids = [];

for (var commodityId in _commodities) {
	if (_commodities.hasOwnProperty(commodityId)) {
		_commodity_ids.push(commodityId)
	}
}

module.exports = {
	commodity_ids: _commodity_ids,
	commodityIdToCommodity: _commodityIdToCommodity,
	commodityIdsToCommodities: _commodityIdsToCommodities
}
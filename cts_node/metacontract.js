// metacontract.js

// Contract generation
// ContractEmployer
//   name
//   ship_contacts_id
//   array of CommoditySchedules

// ContractCommoditySchedule
//   array of ContractOrigins
//   array of ContractDemandSchedules
//   array of container sizes in SCU
//   commodity id
//   max priority bonus per SCU (UEC)
//   price per SCU per kkm min (UEC)
//   price per SCU per kkm max (UEC)
//   minJumpsToBeAvailable
//   maxJumpsToBeAvailable

// ContractDemandSchedule
//   contract destination
//   priority min (0-1)
//   priority max (0-1)
//   demand min (0-1)
//   demand max (0-1)
//   volume min (SCU)
//   volume max (SCU)

// ContractOrigin
//   name
//   id
//   array of ContractLocations

// ContractDestination
//   name
//   id
//   array of ContractLocations



// Does it change depending on whether the employer is the seller or buyer of the goods?
// Effectively the price is passed on to the consumer anyway

// how to factor demand in?
// A destination has a demand level range for a good, the higher the demand the more willing they are to pay for shipping
// A destination also has a quantity demanded where they are willing to pay the normal freight rate.
// As the demand level varies, the freight rate will increase and decrease within its range.
// As when the demand increases, the cheap and local versions become unavailable
// A manufacturer might have a relatively constant demand level for item inputs it uses in manufacturing.

// The quantity demanded at demand levels seems like it would change. Eg, it's more likely that someone needs a rush shipment 
// of a single fusion engine than they need 100 SCU of iron. 
// This could influence the priority of the job, eg, "LOW", "MEDIUM", "HIGH", "CRITICAL"

// What variables are we talking about here?
// Job priority - a reflection of how much a client is willing to pay to get the good delivered 
//   (possibly influencing the base rate?)
// Commodity demand - a reflection of the relative value of that good and how much more folks are willing to pay for it 
//   (influencing the price per kkm?)
// Commodity amount - The higher the total volume of commodity, I'm going to pay less per SCU than in a lower volume, because
//   the people shipping it can do it for much cheaper as they're shipping in bulk.
// Container sizes - smaller containers are less efficient, but if you're already paying for a rush, you don't care as much about
//   container inefficiency. Also, if you're only demanding a small shipment, you can't afford to pay for a large ship to come out.
//   Therefore, you probably want containers that can be hauled efficiently by the smaller ships.
//   For example, a Cutlass can only carry two 12 SCU containers (70% efficient), but can carry 32 1 SCU containers (42% efficient)
//   The 12 SCU containers have 16.84 SCU, while the 32 1 SCU containers have 13.44 SCU. Four 8 SCU containers can haul 21.4 SCU.
//   Two 16 SCU containers can haul 22.96 SCU, making that the most internal cargo a Cutlass can carry.

// The efficiency level of the containers suggests, inversely, the relative importance of getting the goods shipped.
// Eg, if I'm getting 1 SCU containers, I'm okay with a 30% loss of efficiency vs. the 16 SCU container which means I'm
// effectively paying a 30% premium already.

// ContractCommoditySchedule
//   Container size array - range of possible container sizes
//   Max priority bonus - anywhere from 0 to max based on the priority level of the shipment (fixed per SCU)
//   Price per kkm min-max - min-max of price per kkm

// ContractDestination
//   Contract priority min-max - the min and max priority ranges for wanting the good, which influence the max priority bonus
//   Contract demand min-max - the min and max demand levels (between 0 and 1) the destination wants, influencing price per kkm
//   Contract volume min-max - the min and max values that destination wants in SCU of the good per shipment, 
//     final value derived from intersection of priority and demand.

// Interim contract values: 
//   total scu (contract volume in range of (priority + demand / 2)) - or inverse priority?
//   container size (find volume value within volume range and pick that container size)
//   num containers (total scu / container size, ceiling)
//   price per kkm (pick from min-max in commodity schedule based on random destination demand value)
//   priority bonus (with 1.0 as max bonus, picked from destination range, from commodity schedule)
//   priority level (floating value determined from destination random priority value)
//   num jumps available (expires) is inverse with the priority rating

// Final contract values: num containers, scu per container, price per kkm, base price per scu, expires

// Notes on pricing: min distance is 60kkm, max is 680kkm, avg is 225kkm.
// A ship is anywhere from 20000 to 340000.
// Ships should generally be 'purchased' at 20% down, so anywhere from 4000 to 68000 credits.
// Players should be able to afford 43000 for a constellation down payment after how many 12 SCU trips in an aurora? 200?
// That gives 225 UEC for an average 12 SCU trip, of 225kkm (22.5 x kkm). 225 / 22.5 = 10 UEC. 10 UEC / 12 SCU = 0.83 UEC/SCU/kkm
// Perhaps the rates should move from per kkm to per kkm?
// Is this the payout before fees are deducted? Ideally, profit minus fees is something reasonable, but the gross profit is exciting.

// Current rates are per SCU per 100kkm. 1 credit, for 1 SCU for 100kkm. Bonuses are per SCU for the contract.

// 1 SCU (1x1x1), 0.42 SCU internal (42%)
// 2 SCU (2x1x1), 0.98 SCU internal (49%)
// 4 SCU (2x2x1), 2.29 SCU internal (57%)
// 8 SCU (2x2x2), 5.35 SCU internal (67%)
// 12 SCU (2x2x3), 8.42 SCU internal (70%)
// 16 SCU (2x2x4), 11.48 SCU internal (72%)
// 20 SCU (2x2x5), 14.54 SCU internal (73%)
// 27 SCU (3x3x3), 20.79 SCU internal (77%)
// 64 SCU (4x4x4), 52.73 SCU internal (82%)

var contract = require('./contract');
var port = require('./port');
var shiptype = require('./shiptype');
var shipcontact = require('./shipcontact');
var random = require('./random');

var CONTRACT_BASE_PAYOUT_MODIFIER = 0.2;
var CONTRACT_DISTANCE_PAYOUT_MODIFIER = 2.0;

function MetaContractEmployer(id, name, commodity_schedule_ids, demand_schedule_ids) {
	this.id = id;
	this.name = name;
	this.commodity_schedule_ids = commodity_schedule_ids;
	this.demand_schedule_ids = demand_schedule_ids;
}

function MetaContractLocation(id, name, sub_locations) {
	this.id = id;
	this.name = name;
	this.sub_locations = sub_locations;
}

function MetaContractSubLocation(quantum_id, type, port_id) {
	this.quantum_id = quantum_id;
	this.type = type;
	this.port_id = port_id;
}

var _meta_contract_employers = {
	/*
	 * Extrasolar Imports/Exports
	 */
	drake: new MetaContractEmployer("drake", "Drake Interplanetary",
		// Exports: Caterpillar parts
		[
			"caterpillar_parts_from_borea"
		],
		// Imports: Ship guns (qcl/elec), fusion engines, ship electronics, iron
		[
			"ship_guns_qcl_to_borea",
			"ship_guns_elec_to_borea",
			"fusion_engines_to_borea",
			"ship_electronics_to_borea",
			"iron_to_borea"
		]
	),

	origin: new MetaContractEmployer("origin", "Origin Jumpworks GmbH",
		// Exports: 300i parts
		[
			"origin_300_series_parts_from_terra_iii",
		],
		// Imports: Ship guns (qcl/elec), fusion engines, ship electronics
		[
			"ship_guns_qcl_to_terra_iii",
			"ship_guns_elec_to_terra_iii",
			"fusion_engines_to_terra_iii",
			"ship_electronics_to_terra_iii"
		]
	),

	uee: new MetaContractEmployer("uee", "United Earth Empire",
		// Exports: Platinum, mercury, iron, gold, diamonds
		[
			"diamonds_from_magnus_i",
			"gold_from_terra_ii",
			"iron_from_terra_ii",
			"mercury_from_terra_ii",
			"platinum_from_terra_ii",
		],
		// Imports: Nothing
		[]
	),

	terra_mills: new MetaContractEmployer("terra_mills", "Terra Mills",
		// Exports: Processed food
		[
			"processed_food_from_terra_iii",
		],
		// Imports: Nothing
		[]
	),

	corner_four_research: new MetaContractEmployer("corner_four_research", "Corner Four Research Lab",
		// Exports: Unlicensed medicine, illegal narcotics
		[
			"illegal_narcotics_from_pyro_vi",
			"unlicensed_medicine_from_pyro_vi"
		],
		// Imports: Stolen goods, personal weapons
		[
			"stolen_goods_to_pyro_vi",
			"personal_weapons_to_pyro_vi"
		]
	),

	/*
	 * Solar Imports/Exports
	 */
	hurston: new MetaContractEmployer("hurston", "Hurston Dynamics",
		// Exports: Ship guns (qcl/elec)
		[
			"ship_guns_qcl_from_hurston",
			"ship_guns_elec_from_hurston"
		],
		// Imports: Prisoners (grim hex, kareah), platinum, iron, diamonds, hydrogen fuel, mobiglas
		[
			"prisoners_to_hurston",
			"platinum_to_hurston",
			"iron_to_hurston",
			"diamonds_to_hurston",
			"hydrogen_fuel_to_hurston",
			"mobiglas_to_hurston",
		]
	),

	arccorp: new MetaContractEmployer("arccorp", "ArcCorp",
		// Exports: Fusion engines, personal weapons
		[
			"fusion_engines_from_arccorp",
			"personal_weapons_from_arccorp",
			"mining_parts_from_arccorp"
		],
		// Imports: mobiGlas, Diamonds, discount goods (not on the arccorp board), starliner parts, caterpillar parts, 300i parts, 
		//   hydrogen fuel, platinum, iron, mercury, gold
		[
			"mobiglas_to_arccorp",
			"diamonds_to_arccorp",
			"genesis_parts_to_arccorp",
			"caterpillar_parts_to_arccorp",
			"origin_300_series_parts_to_arccorp",
			"hydrogen_fuel_to_arccorp",
			"platinum_to_arccorp",
			"mercury_to_arccorp",
			"iron_to_arccorp",
			"gold_to_arccorp",
		]
	),

	microtech: new MetaContractEmployer("microtech", "microTech",
		// Exports: Ship electronics, mobiGlas
		[
			"mobiglas_from_microtech",
			"ship_electronics_from_microtech",
		],
		// Imports: Gold, platinum, hydrogen fuel, mercury
		[
			"gold_to_microtech",
			"platinum_to_microtech",
			"hydrogen_fuel_to_microtech",
			"mercury_to_microtech",
		]
	),

	/*
	 * Crusader Imports/Exports
	 */
	port_olisar_admin: new MetaContractEmployer("port_olisar_admin", "Port Olisar (Admin Office)",
		// Exports: Nothing
		[],
		// Imports: Processed food, mobiGlas
		[
			"processed_food_to_port_olisar",
			"mobiglas_to_port_olisar"
		]
	),

	port_olisar_tdd: new MetaContractEmployer("port_olisar_tdd", "Port Olisar",
		// Exports: Nothing
		[],
		// Imports: Hydrogen fuel
		[
			"hydrogen_fuel_to_port_olisar"
		]
	),

	crusader_industries: new MetaContractEmployer("crusader_industries", "Crusader Industries",
		// Exports: Hydrogen fuel, starliner parts
		[
			"hydrogen_fuel_from_crusader",
			"hydrogen_fuel_from_crusader_admin",
			"genesis_parts_from_crusader"
		],
		// Imports: Mobiglas, iron, platinum, fusion engines, ship electronics, processed food
		[
			"mobiglas_to_crusader",
			"iron_to_crusader",
			"iron_to_crusader_admin",
			"platinum_to_crusader",
			"platinum_to_crusader_admin",
			"fusion_engines_to_crusader",
			"ship_electronics_to_crusader",
			"processed_food_to_crusader"
		]
	),

	crusader_security: new MetaContractEmployer("crusader_security", "Crusader Security",
		// Exports: Prisoners
		[
			"prisoners_from_kareah",
		],
		// Imports: Personal weapons, processed food
		[
			"hydrogen_fuel_to_kareah_admin",
			"personal_weapons_to_kareah",
			"processed_food_to_kareah"
		]
	),

	cryastro_admin: new MetaContractEmployer("cryastro_admin", "Cry-Astro Service",
		// Exports: Ship scrap
		[
			"ship_scrap_from_cryastro_admin",
		],
		// Imports: 300i parts, ship guns (qcl/elec)
		[
			"origin_300_series_parts_to_cryastro",
			"ship_guns_qcl_to_cryastro",
			"ship_guns_elec_to_cryastro"
		]
	),

	cryastro_tdd: new MetaContractEmployer("cryastro_tdd", "Cry-Astro Service",
		// Exports: Ship scrap
		[
			"ship_scrap_from_cryastro_tdd",
		],
		// Imports: Hydrogen fuel, caterpillar parts, starliner parts
		[
			"hydrogen_fuel_to_cryastro",
			"caterpillar_parts_to_cryastro",
			"genesis_parts_to_cryastro",
		]
	),

	covalex_shipping: new MetaContractEmployer("covalex_shipping", "Covalex Shipping",
		// Exports: Salvage (from shipping hub)
		[
			"salvage_from_covalex",
			"salvage_equip_from_crusader"
		],
		// Imports: Salvage (to Olisar), Salvage equipment
		[
			"salvage_to_crusader",
			"salvage_equip_to_covalex"
		]
	),

	dumpers_depot_admin: new MetaContractEmployer("dumpers_depot_admin", "Dumper\'s Depot",
		// Exports: Nothing
		[],
		// Imports: Ship guns (qcl/elec), ship scrap (arccorp, olisar), fusion engines, ship electronics, iron
		[
			"ship_guns_qcl_to_port_olisar",
			"ship_guns_elec_to_port_olisar",
			"ship_scrap_to_port_olisar",
			"fusion_engines_to_port_olisar",
			"ship_electronics_to_port_olisar",
			"iron_to_port_olisar"
		]
	),

	dumpers_depot_tdd: new MetaContractEmployer("dumpers_depot_tdd", "Dumper\'s Depot",
		// Exports: Nothing
		[],
		// Imports: ship scrap (arccorp)
		[
			"ship_scrap_to_arccorp"
		]
	),

	live_fire_weapons: new MetaContractEmployer("live_fire_weapons", "Live Fire Weapons",
		// Exports: Nothing
		[],
		// Imports: Personal weapons, discount goods (not on the live fire board)
		[
			"personal_weapons_to_live_fire",
		]
	),

	grim_hex_cooperative: new MetaContractEmployer("grim_hex_cooperative", "Grim Hex Cooperative",
		// Exports: Prisoners, discounted goods
		[
			"prisoners_from_grim_hex",
			"discount_goods_from_grim_hex",
		],
		// Imports: Personal weapons, unlicensed medicine, illegal narcotics, stolen goods, processed food
		[
			"personal_weapons_to_grim_hex",
			"unlicensed_medicine_to_grim_hex",
			"illegal_narcotics_to_grim_hex",
			"stolen_goods_to_grim_hex",
			"processed_food_to_grim_hex"
		]
	),

	icc: new MetaContractEmployer("icc", "Imperial Cartography Center",
		// Exports: Scan data
		[
			"scan_data_from_icc"
		],
		// Imports: Processed food
		[
			"processed_food_to_icc"
		]
	),

	nine_tails: new MetaContractEmployer("nine_tails", "Nine Tails",
		// Exports: Stolen goods
		[
			"stolen_goods_from_nine_tails",
		],
		// Imports: Unlicensed medicine, illegal narcotics, prisoners (grim hex)
		[
			"unlicensed_medicine_to_nine_tails",
			"illegal_narcotics_to_nine_tails",
			"prisoners_to_nine_tails"
		]
	),

	stanton_mining_collective_admin: new MetaContractEmployer("stanton_mining_collective_admin", "Stanton Mining Collective",
		// Exports: Iron, Platinum
		[
			"iron_from_yela_admin",
			"platinum_from_yela_admin"
		],
		// Imports: Hydrogen fuel, mining parts, processed food
		[
			"hydrogen_fuel_to_yela_admin",
			"mining_parts_to_yela_admin",
			"processed_food_to_yela_admin"
		]
	),

	stanton_mining_collective_tdd: new MetaContractEmployer("stanton_mining_collective_tdd", "Stanton Mining Collective",
		// Exports: Iron, Platinum
		[
			"iron_from_yela_tdd",
			"platinum_from_yela_tdd"
		],
		// Imports: Nothing
		[]
	)
}

// Producers of commodities
var _meta_contract_commodity_schedules = {
	/*
	 * * * * * * * * * * * *
	 * Extrasolar Producers
	 * * * * * * * * * * * *
	 */

	/*
	 * Caterpillar Parts
	 */
	caterpillar_parts_from_borea: {
		commodity_id: "caterpillar_parts_from_borea",
		origin_ids: ["loc_borea", "loc_port_olisar"],
		origin_ships: "ships_drake",
		demand_schedule_ids: ["caterpillar_parts_to_cryastro"],
		container_sizes: [12, 20],
		min_base_rate_per_scu: 24,
		max_base_rate_per_scu: 49,
		min_rate_per_scu_per_100kkm: 2.54,
		max_rate_per_scu_per_100kkm: 5.08,
		min_ticks_available: 6,
		max_ticks_available: 12,
	},

	/*
	 * 300i Series Parts
	 */
	origin_300_series_parts_from_terra_iii: {
		commodity_id: "origin_300_series_parts_from_terra_iii",
		origin_ids: ["loc_terra_iii", "loc_port_olisar"],
		origin_ships: "ships_origin",
		demand_schedule_ids: ["origin_300_series_parts_to_cryastro", "origin_300_series_parts_to_arccorp"],
		container_sizes: [4, 12],
		min_base_rate_per_scu: 24,
		max_base_rate_per_scu: 98,
		min_rate_per_scu_per_100kkm: 2.54,
		max_rate_per_scu_per_100kkm: 10.16,
		min_ticks_available: 6,
		max_ticks_available: 12,
	},

	/*
	 * Gold from Terra II
	 */
	gold_from_terra_ii: {
		commodity_id: "gold_from_terra_ii",
		origin_ids: ["loc_terra_ii", "loc_port_olisar"],
		origin_ships: "ships_uee",
		demand_schedule_ids: ["gold_to_microtech", "gold_to_arccorp"],
		container_sizes: [12],
		min_base_rate_per_scu: 24,
		max_base_rate_per_scu: 49,
		min_rate_per_scu_per_100kkm: 2.54,
		max_rate_per_scu_per_100kkm: 5.08,
		min_ticks_available: 6,
		max_ticks_available: 12,
	},

	/*
	 * Iron from Terra II
	 */
	iron_from_terra_ii: {
		commodity_id: "iron_from_terra_ii",
		origin_ids: ["loc_terra_ii", "loc_port_olisar"],
		origin_ships: "ships_uee",
		demand_schedule_ids: ["iron_to_crusader", "iron_to_arccorp", "iron_to_hurston", "iron_to_borea"],
		container_sizes: [12],
		min_base_rate_per_scu: 20,
		max_base_rate_per_scu: 81,
		min_rate_per_scu_per_100kkm: 1.95,
		max_rate_per_scu_per_100kkm: 7.81,
		min_ticks_available: 6,
		max_ticks_available: 12,
	},

	/*
	 * Mercury from Terra II
	 */
	mercury_from_terra_ii: {
		commodity_id: "mercury_from_terra_ii",
		origin_ids: ["loc_terra_ii", "loc_port_olisar"],
		origin_ships: "ships_uee",
		demand_schedule_ids: ["mercury_to_microtech", "mercury_to_arccorp"],
		container_sizes: [12],
		min_base_rate_per_scu: 20,
		max_base_rate_per_scu: 40,
		min_rate_per_scu_per_100kkm: 1.95,
		max_rate_per_scu_per_100kkm: 3.91,
		min_ticks_available: 6,
		max_ticks_available: 12,
	},

	/*
	 * Platinum from Terra II
	 */
	platinum_from_terra_ii: {
		commodity_id: "platinum_from_terra_ii",
		origin_ids: ["loc_terra_ii", "loc_port_olisar"],
		origin_ships: "ships_uee",
		demand_schedule_ids: ["platinum_to_crusader", "platinum_to_microtech", "platinum_to_arccorp", "platinum_to_hurston"],
		container_sizes: [12],
		min_base_rate_per_scu: 24,
		max_base_rate_per_scu: 49,
		min_rate_per_scu_per_100kkm: 2.54,
		max_rate_per_scu_per_100kkm: 5.08,
		min_ticks_available: 6,
		max_ticks_available: 12,
	},

	/*
	 * Diamonds from Magnus I
	 */
	diamonds_from_magnus_i: {
		commodity_id: "diamonds_from_magnus_i",
		origin_ids: ["loc_magnus_i", "loc_port_olisar"],
		origin_ships: "ships_uee",
		demand_schedule_ids: ["diamonds_to_arccorp", "diamonds_to_hurston"],
		container_sizes: [8],
		min_base_rate_per_scu: 86,
		max_base_rate_per_scu: 173,
		min_rate_per_scu_per_100kkm: 10.16,
		max_rate_per_scu_per_100kkm: 20.32,
		min_ticks_available: 6,
		max_ticks_available: 12,
	},

	/*
	 * Processed food from Terra
	 */
	processed_food_from_terra_iii: {
		commodity_id: "processed_food_from_terra_iii",
		origin_ids: ["loc_terra_iii", "loc_port_olisar"],
		origin_ships: "ships_covalex",
		demand_schedule_ids: ["processed_food_to_port_olisar", "processed_food_to_icc", "processed_food_to_kareah", "processed_food_to_crusader", "processed_food_to_grim_hex"],
		container_sizes: [1, 4, 12],
		min_base_rate_per_scu: 27,
		max_base_rate_per_scu: 219,
		min_rate_per_scu_per_100kkm: 2.93,
		max_rate_per_scu_per_100kkm: 23.47,
		min_ticks_available: 6,
		max_ticks_available: 12,
	},

	/*
	 * Illegal narcotics from Corner Four
	 */
	illegal_narcotics_from_pyro_vi: {
		commodity_id: "illegal_narcotics_from_pyro_vi",
		origin_ids: ["loc_pyro_vi", "loc_grim_hex"],
		origin_ships: "ships_smugglers",
		demand_schedule_ids: ["illegal_narcotics_to_nine_tails", "illegal_narcotics_to_grim_hex"],
		container_sizes: [1],
		min_base_rate_per_scu: 150,
		max_base_rate_per_scu: 299,
		min_rate_per_scu_per_100kkm: 17.20,
		max_rate_per_scu_per_100kkm: 34.40,
		min_ticks_available: 6,
		max_ticks_available: 12,
	},

	/*
	 * Unlicensed medicine from Corner Four
	 */
	unlicensed_medicine_from_pyro_vi: {
		commodity_id: "unlicensed_medicine_from_pyro_vi",
		origin_ids: ["loc_pyro_vi", "loc_grim_hex"],
		origin_ships: "ships_smugglers",
		demand_schedule_ids: ["unlicensed_medicine_to_nine_tails", "unlicensed_medicine_to_grim_hex"],
		container_sizes: [1, 2],
		min_base_rate_per_scu: 121,
		max_base_rate_per_scu: 242,
		min_rate_per_scu_per_100kkm: 13.28,
		max_rate_per_scu_per_100kkm: 26.56,
		min_ticks_available: 6,
		max_ticks_available: 12,
	},

	/*
	 * * * * * * * * * 
	 * Solar Producers
	 * * * * * * * * * 
	 */

	/*
	 * Quantum Cascade Lasers
	 */
	ship_guns_qcl_from_hurston: {
		commodity_id: "ship_guns_qcl_from_hurston",
		origin_ids: ["loc_hurston", "loc_port_olisar"],
		origin_ships: "ships_hurston",
		demand_schedule_ids: ["ship_guns_qcl_to_cryastro", "ship_guns_qcl_to_port_olisar", "ship_guns_qcl_to_borea", "ship_guns_qcl_to_terra_iii"],
		container_sizes: [4, 12],
		min_base_rate_per_scu: 23,
		max_base_rate_per_scu: 184,
		min_rate_per_scu_per_100kkm: 2.35,
		max_rate_per_scu_per_100kkm: 18.77,
		min_ticks_available: 8,
		max_ticks_available: 16,
	},

	/*
	 * Electron Guns
	 */
	ship_guns_elec_from_hurston: {
		commodity_id: "ship_guns_elec_from_hurston",
		origin_ids: ["loc_hurston", "loc_port_olisar"],
		origin_ships: "ships_hurston",
		demand_schedule_ids: ["ship_guns_elec_to_cryastro", "ship_guns_elec_to_port_olisar", "ship_guns_elec_to_borea", "ship_guns_elec_to_terra_iii"],
		container_sizes: [2, 8],
		min_base_rate_per_scu: 23,
		max_base_rate_per_scu: 184,
		min_rate_per_scu_per_100kkm: 2.35,
		max_rate_per_scu_per_100kkm: 18.77,
		min_ticks_available: 8,
		max_ticks_available: 16,
	},

	/*
	 * Fusion Engines
	 */
	fusion_engines_from_arccorp: {
		commodity_id: "fusion_engines_from_arccorp",
		origin_ids: ["loc_arccorp", "loc_port_olisar"],
		origin_ships: "ships_arccorp",
		demand_schedule_ids: ["fusion_engines_to_borea", "fusion_engines_to_terra_iii", "fusion_engines_to_crusader", "fusion_engines_to_port_olisar"],
		container_sizes: [8, 12],
		min_base_rate_per_scu: 27,
		max_base_rate_per_scu: 219,
		min_rate_per_scu_per_100kkm: 2.93,
		max_rate_per_scu_per_100kkm: 23.47,
		min_ticks_available: 8,
		max_ticks_available: 16,
	},

	/*
	 * Personal Weapons
	 */
	personal_weapons_from_arccorp: {
		commodity_id: "personal_weapons_from_arccorp",
		origin_ids: ["loc_arccorp", "loc_port_olisar"],
		origin_ships: "ships_arccorp",
		demand_schedule_ids: ["personal_weapons_to_kareah", "personal_weapons_to_grim_hex", "personal_weapons_to_live_fire", "personal_weapons_to_pyro_vi"],
		container_sizes: [1, 4, 12],
		min_base_rate_per_scu: 43,
		max_base_rate_per_scu: 173,
		min_rate_per_scu_per_100kkm: 4.29,
		max_rate_per_scu_per_100kkm: 17.17,
		min_ticks_available: 8,
		max_ticks_available: 16,
	},

	/*
	 * Mining Parts
	 */
	mining_parts_from_arccorp: {
		commodity_id: "mining_parts_from_arccorp",
		origin_ids: ["loc_arccorp", "loc_port_olisar"],
		origin_ships: "ships_arccorp",
		demand_schedule_ids: ["mining_parts_to_yela_admin"],
		container_sizes: [2, 4, 8],
		min_base_rate_per_scu: 86,
		max_base_rate_per_scu: 173,
		min_rate_per_scu_per_100kkm: 8.59,
		max_rate_per_scu_per_100kkm: 17.17,
		min_ticks_available: 8,
		max_ticks_available: 16,
	},

	/*
	 * Ship Electronics
	 */
	ship_electronics_from_microtech: {
		commodity_id: "ship_electronics_from_microtech",
		origin_ids: ["loc_microtech", "loc_port_olisar"],
		origin_ships: "ships_microtech",
		demand_schedule_ids: ["ship_electronics_to_crusader", "ship_electronics_to_borea", "ship_electronics_to_port_olisar", "ship_electronics_to_terra_iii"],
		container_sizes: [4, 12],
		min_base_rate_per_scu: 43,
		max_base_rate_per_scu: 346,
		min_rate_per_scu_per_100kkm: 5.08,
		max_rate_per_scu_per_100kkm: 40.64,
		min_ticks_available: 8,
		max_ticks_available: 16,
	},

	/*
	 * mobiGlas
	 */
	mobiglas_from_microtech: {
		commodity_id: "mobiglas_from_microtech",
		origin_ids: ["loc_microtech", "loc_port_olisar"],
		origin_ships: "ships_microtech",
		demand_schedule_ids: ["mobiglas_to_port_olisar", "mobiglas_to_arccorp", "mobiglas_to_hurston", "mobiglas_to_crusader"],
		container_sizes: [2, 8],
		min_base_rate_per_scu: 75,
		max_base_rate_per_scu: 299,
		min_rate_per_scu_per_100kkm: 8.60,
		max_rate_per_scu_per_100kkm: 34.40,
		min_ticks_available: 8,
		max_ticks_available: 16,
	},

	/*
	 * * * * * * * * * * *
	 * Crusader Producers
	 * * * * * * * * * * *
	 */

	/*
	 * Ship Scrap
	 */
	ship_scrap_from_cryastro_admin: {
		commodity_id: "ship_scrap_from_cryastro",
		origin_ids: ["loc_cryastro"],
		origin_ships: "ships_none",
		demand_schedule_ids: ["ship_scrap_to_port_olisar"],
		container_sizes: [8, 12],
		min_base_rate_per_scu: 46,
		max_base_rate_per_scu: 92,
		min_rate_per_scu_per_100kkm: 4.69,
		max_rate_per_scu_per_100kkm: 9.39,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},
	ship_scrap_from_cryastro_tdd: {
		commodity_id: "ship_scrap_from_cryastro",
		origin_ids: ["loc_cryastro"],
		origin_ships: "ships_none",
		demand_schedule_ids: ["ship_scrap_to_arccorp"],
		container_sizes: [16, 20],
		min_base_rate_per_scu: 23,
		max_base_rate_per_scu: 46,
		min_rate_per_scu_per_100kkm: 2.35,
		max_rate_per_scu_per_100kkm: 4.69,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},

	/*
	 * Hydrogen Fuel
	 */
 	hydrogen_fuel_from_crusader: {
		commodity_id: "hydrogen_fuel_from_crusader",
		origin_ids: ["loc_crusader", "loc_port_olisar"],
		origin_ships: "ships_crusader",
		demand_schedule_ids: ["hydrogen_fuel_to_port_olisar", "hydrogen_fuel_to_cryastro", "hydrogen_fuel_to_arccorp", "hydrogen_fuel_to_hurston", "hydrogen_fuel_to_microtech"],
		container_sizes: [8, 16],
		min_base_rate_per_scu: 27,
		max_base_rate_per_scu: 55,
		min_rate_per_scu_per_100kkm: 2.93,
		max_rate_per_scu_per_100kkm: 5.87,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},

	/*
	 * Hydrogen Fuel (Admin)
	 */
	 hydrogen_fuel_from_crusader_admin: {
		commodity_id: "hydrogen_fuel_from_crusader",
		origin_ids: ["loc_crusader", "loc_port_olisar"],
		origin_ships: "ships_crusader",
		demand_schedule_ids: ["hydrogen_fuel_to_yela_admin", "hydrogen_fuel_to_kareah_admin"],
		container_sizes: [1, 8],
		min_base_rate_per_scu: 109,
		max_base_rate_per_scu: 219,
		min_rate_per_scu_per_100kkm: 11.73,
		max_rate_per_scu_per_100kkm: 23.47,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},

	/*
	 * Genesis Starliner Parts
	 */
 	genesis_parts_from_crusader: {
		commodity_id: "genesis_parts_from_crusader",
		origin_ids: ["loc_crusader", "loc_port_olisar"],
		origin_ships: "ships_crusader",
		demand_schedule_ids: ["genesis_parts_to_cryastro", "genesis_parts_to_arccorp"],
		container_sizes: [8, 16, 20],
		min_base_rate_per_scu: 24,
		max_base_rate_per_scu: 98,
		min_rate_per_scu_per_100kkm: 2.54,
		max_rate_per_scu_per_100kkm: 10.16,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},

	/*
	 * Covalex Salvage
	 */
 	salvage_from_covalex: {
		commodity_id: "salvage_from_covalex",
		origin_ids: ["loc_covalex"],
		origin_ships: "ships_none",
		demand_schedule_ids: ["salvage_to_crusader"],
		container_sizes: [4, 8, 12],
		min_base_rate_per_scu: 92,
		max_base_rate_per_scu: 184,
		min_rate_per_scu_per_100kkm: 9.39,
		max_rate_per_scu_per_100kkm: 18.77,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},

	/*
	 * Covalex Salvage Equipment
	 */
 	salvage_equip_from_crusader: {
		commodity_id: "salvage_equip_from_crusader",
		origin_ids: ["loc_port_olisar"],
		origin_ships: "ships_covalex",
		demand_schedule_ids: ["salvage_equip_to_covalex"],
		container_sizes: [2, 4, 8],
		min_base_rate_per_scu: 98,
		max_base_rate_per_scu: 196,
		min_rate_per_scu_per_100kkm: 10.16,
		max_rate_per_scu_per_100kkm: 20.32,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},

	/*
	 * Stolen Goods
	 */
 	stolen_goods_from_nine_tails: {
		commodity_id: "stolen_goods_from_nine_tails",
		origin_ids: ["loc_yela"],
		origin_ships: "ships_nine_tails",
		demand_schedule_ids: ["stolen_goods_to_grim_hex", "stolen_goods_to_pyro_vi"],
		container_sizes: [1, 2, 4, 8],
		min_base_rate_per_scu: 46,
		max_base_rate_per_scu: 92,
		min_rate_per_scu_per_100kkm: 4.69,
		max_rate_per_scu_per_100kkm: 9.39,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},

	/*
	 * Discount Goods
	 */
	discount_goods_from_grim_hex: {
		commodity_id: "discount_goods_from_grim_hex",
		origin_ids: ["loc_grim_hex"],
		origin_ships: "ships_none",
		demand_schedule_ids: ["discount_goods_to_live_fire", "discount_goods_to_arccorp"],
		container_sizes: [1, 2, 4, 8],
		min_base_rate_per_scu: 23,
		max_base_rate_per_scu: 92,
		min_rate_per_scu_per_100kkm: 2.35,
		max_rate_per_scu_per_100kkm: 9.39,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},

	/*
	 * Prisoners
	 */
	prisoners_from_grim_hex: {
		commodity_id: "prisoners_from_grim_hex",
		origin_ids: ["loc_grim_hex"],
		origin_ships: "ships_none",
		demand_schedule_ids: ["prisoners_to_hurston", "prisoners_to_nine_tails"],
		container_sizes: [2],
		min_base_rate_per_scu: 121,
		max_base_rate_per_scu: 242,
		min_rate_per_scu_per_100kkm: 13.28,
		max_rate_per_scu_per_100kkm: 26.56,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},
	prisoners_from_kareah: {
		commodity_id: "prisoners_from_kareah",
		origin_ids: ["loc_kareah"],
		origin_ships: "ships_none",
		demand_schedule_ids: ["prisoners_to_hurston"],
		container_sizes: [2],
		min_base_rate_per_scu: 121,
		max_base_rate_per_scu: 242,
		min_rate_per_scu_per_100kkm: 13.28,
		max_rate_per_scu_per_100kkm: 26.56,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},

	/*
	 * Iron from Yela (Admin)
	 */
	iron_from_yela_admin: {
		commodity_id: "iron_from_yela",
		origin_ids: ["loc_yela", "loc_yela", "loc_port_olisar"],
		origin_ships: "ships_stanton_mining",
		demand_schedule_ids: ["iron_to_port_olisar", "iron_to_crusader_admin"],
		container_sizes: [1, 4],
		min_base_rate_per_scu: 40,
		max_base_rate_per_scu: 81,
		min_rate_per_scu_per_100kkm: 3.91,
		max_rate_per_scu_per_100kkm: 7.81,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},

	/*
	 * Iron from Yela
	 */
	iron_from_yela_tdd: {
		commodity_id: "iron_from_yela",
		origin_ids: ["loc_yela", "loc_yela", "loc_port_olisar"],
		origin_ships: "ships_stanton_mining",
		demand_schedule_ids: ["iron_to_crusader", "iron_to_arccorp", "iron_to_hurston", "iron_to_borea"],
		container_sizes: [12],
		min_base_rate_per_scu: 20,
		max_base_rate_per_scu: 81,
		min_rate_per_scu_per_100kkm: 1.95,
		max_rate_per_scu_per_100kkm: 7.81,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},

	/*
	 * Platinum from Yela (Admin)
	 */
	platinum_from_yela_admin: {
		commodity_id: "platinum_from_yela",
		origin_ids: ["loc_yela", "loc_yela", "loc_port_olisar"],
		origin_ships: "ships_stanton_mining",
		demand_schedule_ids: ["platinum_to_crusader_admin"],
		container_sizes: [1, 4],
		min_base_rate_per_scu: 49,
		max_base_rate_per_scu: 98,
		min_rate_per_scu_per_100kkm: 5.08,
		max_rate_per_scu_per_100kkm: 10.16,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},

	/*
	 * Platinum from Yela
	 */
	platinum_from_yela_tdd: {
		commodity_id: "platinum_from_yela",
		origin_ids: ["loc_yela", "loc_yela", "loc_port_olisar"],
		origin_ships: "ships_stanton_mining",
		demand_schedule_ids: ["platinum_to_crusader", "platinum_to_microtech", "platinum_to_arccorp", "platinum_to_hurston"],
		container_sizes: [12],
		min_base_rate_per_scu: 24,
		max_base_rate_per_scu: 49,
		min_rate_per_scu_per_100kkm: 2.54,
		max_rate_per_scu_per_100kkm: 5.08,
		min_ticks_available: 10,
		max_ticks_available: 20,
	},

	/*
	 * Scan Data from ICC
	 */
	scan_data_from_icc: {
		commodity_id: "scan_data_from_icc",
		origin_ids: ["loc_icc849", "loc_port_olisar"],
		origin_ships: "ships_none",
		demand_schedule_ids: ["scan_data_to_terra_iii"],
		container_sizes: [1],
		min_base_rate_per_scu: 173,
		max_base_rate_per_scu: 346,
		min_rate_per_scu_per_100kkm: 20.32,
		max_rate_per_scu_per_100kkm: 40.64,
		min_ticks_available: 10,
		max_ticks_available: 20,
	}
}

// Consumers of commodities
var _meta_contract_demand_schedules = {
	/* * * * * * * * * * * * * * * * *
	 * Extrasolar produced commodities
	 * * * * * * * * * * * * * * * * */

	/*
	 * Caterpillar Parts
	 */
	caterpillar_parts_to_cryastro: {
		commodity_schedule_ids: ["caterpillar_parts_from_borea"],
		destination_ids: ["loc_cryastro"],
		destination_ships: "ships_none",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 256
	},
	caterpillar_parts_to_arccorp: {
		commodity_schedule_ids: ["caterpillar_parts_from_borea"],
		destination_ids: ["loc_arccorp", "loc_port_olisar"],
		destination_ships: "ships_arccorp",
		priority_min: 0.4,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 256
	},

	/*
	 * 300i Series Parts
	 */
	origin_300_series_parts_to_cryastro: {
		commodity_schedule_ids: ["origin_300_series_parts_from_terra_iii"],
		destination_ids: ["loc_cryastro"],
		destination_ships: "ships_none",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0.33,
		demand_max: 1,
		scu_min: 12,
		scu_max: 55
	},
	origin_300_series_parts_to_arccorp: {
		commodity_schedule_ids: ["origin_300_series_parts_from_terra_iii"],
		destination_ids: ["loc_arccorp", "loc_port_olisar"],
		destination_ships: "ships_arccorp",
		priority_min: 0.4,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 0.33,
		scu_min: 55,
		scu_max: 256
	},

	/*
	 * Gold from Terra II
	 */
	gold_to_microtech: {
		commodity_schedule_ids: ["gold_from_terra_ii"],
		destination_ids: ["loc_microtech", "loc_port_olisar"],
		destination_ships: "ships_microtech",
		priority_min: 0.4,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 384
	},
	gold_to_arccorp: {
		commodity_schedule_ids: ["gold_from_terra_ii"],
		destination_ids: ["loc_arccorp", "loc_port_olisar"],
		destination_ships: "ships_arccorp",
		priority_min: 0.4,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 384
	},

	/*
	 * Iron from Terra II
	 */	
	iron_to_arccorp: {
		commodity_schedule_ids: ["iron_from_terra_ii", "iron_from_yela_tdd"],
		destination_ids: ["loc_arccorp", "loc_port_olisar"],
		destination_ships: "ships_arccorp",
		priority_min: 0.4,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 0.33,
		scu_min: 55,
		scu_max: 512
	},
	iron_to_hurston: {
		commodity_schedule_ids: ["iron_from_terra_ii", "iron_from_yela_tdd"],
		destination_ids: ["loc_hurston", "loc_port_olisar"],
		destination_ships: "ships_hurston",
		priority_min: 0.4,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 0.33,
		scu_min: 55,
		scu_max: 512
	},
	iron_to_borea: {
		commodity_schedule_ids: ["iron_from_terra_ii", "iron_from_yela_tdd"],
		destination_ids: ["loc_borea", "loc_port_olisar"],
		destination_ships: "ships_drake",
		priority_min: 0.4,
		priority_max: 1,
		demand_min: 0,
		demand_max: 0.33,
		scu_min: 55,
		scu_max: 512
	},
	iron_to_crusader: {
		commodity_schedule_ids: ["iron_from_terra_ii", "iron_from_yela_tdd"],
		destination_ids: ["loc_crusader", "loc_port_olisar"],
		destination_ships: "ships_crusader",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 0.33,
		scu_min: 55,
		scu_max: 384
	},

	/*
	 * Mercury from Terra II
	 */
	mercury_to_microtech: {
		commodity_schedule_ids: ["mercury_from_terra_ii"],
		destination_ids: ["loc_microtech", "loc_port_olisar"],
		destination_ships: "ships_microtech",
		priority_min: 0.4,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 256 
	},
	mercury_to_arccorp: {
		commodity_schedule_ids: ["mercury_from_terra_ii"],
		destination_ids: ["loc_arccorp", "loc_port_olisar"],
		destination_ships: "ships_arccorp",
		priority_min: 0.4,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 256
	},

	/*
	 * Platinum from Terra II
	 */
	platinum_to_crusader: {
		commodity_schedule_ids: ["platinum_from_terra_ii", "platinum_from_yela_tdd"],
		destination_ids: ["loc_crusader", "loc_port_olisar"],
		destination_ships: "ships_crusader",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 256
	},
	platinum_to_microtech: {
		commodity_schedule_ids: ["platinum_from_terra_ii", "platinum_from_yela_tdd"],
		destination_ids: ["loc_microtech", "loc_port_olisar"],
		destination_ships: "ships_microtech",
		priority_min: 0.4,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 384
	},
	platinum_to_arccorp: {
		commodity_schedule_ids: ["platinum_from_terra_ii", "platinum_from_yela_tdd"],
		destination_ids: ["loc_arccorp", "loc_port_olisar"],
		destination_ships: "ships_arccorp",
		priority_min: 0.4,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 384
	},
	platinum_to_hurston: {
		commodity_schedule_ids: ["platinum_from_terra_ii", "platinum_from_yela_tdd"],
		destination_ids: ["loc_hurston", "loc_port_olisar"],
		destination_ships: "ships_hurston",
		priority_min: 0.4,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 384
	},

	/*
	 * Diamonds from Magnus I
	 */
	diamonds_to_arccorp: {
		commodity_schedule_ids: ["diamonds_from_magnus_i"],
		destination_ids: ["loc_arccorp", "loc_port_olisar"],
		destination_ships: "ships_arccorp",
		priority_min: 0.4,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 12,
		scu_max: 55
	},
	diamonds_to_hurston: {
		commodity_schedule_ids: ["diamonds_from_magnus_i"],
		destination_ids: ["loc_hurston", "loc_port_olisar"],
		destination_ships: "ships_hurston",
		priority_min: 0.4,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 12,
		scu_max: 55
	},	

	/*
	 * Processed food from Terra
	 */
	processed_food_to_port_olisar: {
		commodity_schedule_ids: ["processed_food_from_terra_iii"],
		destination_ids: ["loc_port_olisar"],
		destination_ships: "ships_none",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0.15,
		demand_max: 0.45,
		scu_min: 12,
		scu_max: 110
	},
	processed_food_to_icc: {
		commodity_schedule_ids: ["processed_food_from_terra_iii"],
		destination_ids: ["loc_icc849", "loc_port_olisar"],
		destination_ships: "ships_none",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0.45,
		demand_max: 1,
		scu_min: 1,
		scu_max: 12
	},
	processed_food_to_kareah: {
		commodity_schedule_ids: ["processed_food_from_terra_iii"],
		destination_ids: ["loc_kareah"],
		destination_ships: "ships_none",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0.15,
		demand_max: 0.45,
		scu_min: 12,
		scu_max: 110
	},
	processed_food_to_crusader: {
		commodity_schedule_ids: ["processed_food_from_terra_iii"],
		destination_ids: ["loc_crusader", "loc_port_olisar"],
		destination_ships: "ships_crusader",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 0.15,
		scu_min: 55,
		scu_max: 512
	},
	processed_food_to_grim_hex: {
		commodity_schedule_ids: ["processed_food_from_terra_iii"],
		destination_ids: ["loc_grim_hex"],
		destination_ships: "ships_none",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0.15,
		demand_max: 0.45,
		scu_min: 12,
		scu_max: 110
	},
	processed_food_to_yela_admin: {
		commodity_schedule_ids: ["processed_food_from_terra_iii"],
		destination_ids: ["loc_yela", "loc_yela", "loc_grim_hex"],
		destination_ships: "ships_stanton_mining",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0.45,
		demand_max: 1,
		scu_min: 1,
		scu_max: 12
	},

	/*
	 * Illegal narcotics from Corner Four
	 */
	illegal_narcotics_to_nine_tails: {
		commodity_schedule_ids: ["illegal_narcotics_from_pyro_vi"],
		destination_ids: ["loc_yela"],
		destination_ships: "ships_nine_tails",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 1,
		scu_max: 12
	},
	illegal_narcotics_to_grim_hex: {
		commodity_schedule_ids: ["illegal_narcotics_from_pyro_vi"],
		destination_ids: ["loc_grim_hex"],
		destination_ships: "ships_none",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 1,
		scu_max: 12
	},

	/*
	 * Unlicensed medicine from Corner Four
	 */
	unlicensed_medicine_to_nine_tails: {
		commodity_schedule_ids: ["unlicensed_medicine_from_pyro_vi"],
		destination_ids: ["loc_yela"],
		destination_ships: "ships_nine_tails",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 1,
		scu_max: 12
	},
	unlicensed_medicine_to_grim_hex: {
		commodity_schedule_ids: ["unlicensed_medicine_from_pyro_vi"],
		destination_ids: ["loc_grim_hex"],
		destination_ships: "ships_none",
		priority_min: 0.4,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 1,
		scu_max: 12
	},

	/* * * * * * * * * * * * * * *
	 * Solar produced commodities
	 * * * * * * * * * * * * * * */

	/*
	 * Quantum Cascade Lasers
	 */
	ship_guns_qcl_to_cryastro: {
		commodity_schedule_ids: ["ship_guns_qcl_from_hurston"],
		destination_ids: ["loc_cryastro"],
		destination_ships: "ships_none",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0.15,
		demand_max: 0.45,
		scu_min: 12,
		scu_max: 83
	},
	ship_guns_qcl_to_port_olisar: {
		commodity_schedule_ids: ["ship_guns_qcl_from_hurston"],
		destination_ids: ["loc_port_olisar"],
		destination_ships: "ships_none",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0.45,
		demand_max: 1,
		scu_min: 1,
		scu_max: 9
	},
	ship_guns_qcl_to_borea: {
		commodity_schedule_ids: ["ship_guns_qcl_from_hurston"],
		destination_ids: ["loc_borea", "loc_port_olisar"],
		destination_ships: "ships_drake",
		priority_min: 0.2,
		priority_max: 1,
		demand_min: 0,
		demand_max: 0.15,
		scu_min: 55,
		scu_max: 384
	},
	ship_guns_qcl_to_terra_iii: {
		commodity_schedule_ids: ["ship_guns_qcl_from_hurston"],
		destination_ids: ["loc_terra_iii", "loc_port_olisar"],
		destination_ships: "ships_origin",
		priority_min: 0.2,
		priority_max: 1,
		demand_min: 0,
		demand_max: 0.15,
		scu_min: 55,
		scu_max: 384
	},

	/*
	 * Electron Guns
	 */
	ship_guns_elec_to_cryastro: {
		commodity_schedule_ids: ["ship_guns_elec_from_hurston"],
		destination_ids: ["loc_cryastro"],
		destination_ships: "ships_none",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0.15,
		demand_max: 0.45,
		scu_min: 12,
		scu_max: 83
	},
	ship_guns_elec_to_port_olisar: {
		commodity_schedule_ids: ["ship_guns_elec_from_hurston"],
		destination_ids: ["loc_port_olisar"],
		destination_ships: "ships_none",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0.45,
		demand_max: 1,
		scu_min: 1,
		scu_max: 9
	},
	ship_guns_elec_to_borea: {
		commodity_schedule_ids: ["ship_guns_elec_from_hurston"],
		destination_ids: ["loc_borea", "loc_port_olisar"],
		destination_ships: "ships_drake",
		priority_min: 0.2,
		priority_max: 1,
		demand_min: 0,
		demand_max: 0.15,
		scu_min: 55,
		scu_max: 384
	},
	ship_guns_elec_to_terra_iii: {
		commodity_schedule_ids: ["ship_guns_elec_from_hurston"],
		destination_ids: ["loc_terra_iii", "loc_port_olisar"],
		destination_ships: "ships_origin",
		priority_min: 0.2,
		priority_max: 1,
		demand_min: 0,
		demand_max: 0.15,
		scu_min: 55,
		scu_max: 384 
	},

	/*
	 * Fusion Engines
	 */
	fusion_engines_to_borea: {
		commodity_schedule_ids: ["fusion_engines_from_arccorp"],
		destination_ids: ["loc_borea", "loc_port_olisar"],
		destination_ships: "ships_drake",
		priority_min: 0.2,
		priority_max: 1,
		demand_min: 0,
		demand_max: 0.15,
		scu_min: 55,
		scu_max: 384
	},
	fusion_engines_to_terra_iii: {
		commodity_schedule_ids: ["fusion_engines_from_arccorp"],
		destination_ids: ["loc_terra_iii", "loc_port_olisar"],
		destination_ships: "ships_origin",
		priority_min: 0.2,
		priority_max: 1,
		demand_min: 0,
		demand_max: 0.15,
		scu_min: 55,
		scu_max: 384
	},
	fusion_engines_to_crusader: {
		commodity_schedule_ids: ["fusion_engines_from_arccorp"],
		destination_ids: ["loc_crusader", "loc_port_olisar"],
		destination_ships: "ships_crusader",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 0.15,
		scu_min: 55,
		scu_max: 384
	},
	fusion_engines_to_port_olisar: {
		commodity_schedule_ids: ["fusion_engines_from_arccorp"],
		destination_ids: ["loc_port_olisar"],
		destination_ships: "ships_none",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0.45,
		demand_max: 1,
		scu_min: 1,
		scu_max: 9
	},

	/*
	 * Personal Weapons
	 */
	personal_weapons_to_kareah: {
		commodity_schedule_ids: ["personal_weapons_from_arccorp"],
		destination_ids: ["loc_kareah"],
		destination_ships: "ships_none",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 0.33,
		scu_min: 12,
		scu_max: 55
	},
	personal_weapons_to_grim_hex: {
		commodity_schedule_ids: ["personal_weapons_from_arccorp"],
		destination_ids: ["loc_grim_hex"],
		destination_ships: "ships_none",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 0.33,
		scu_min: 12,
		scu_max: 55
	},
	personal_weapons_to_live_fire: {
		commodity_schedule_ids: ["personal_weapons_from_arccorp"],
		destination_ids: ["loc_port_olisar"],
		destination_ships: "ships_none",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0.33,
		demand_max: 1,
		scu_min: 1,
		scu_max: 6
	},
	personal_weapons_to_pyro_vi: {
		commodity_schedule_ids: ["personal_weapons_from_arccorp"],
		destination_ids: ["loc_pyro_vi"],
		destination_ships: "ships_smugglers",
		priority_min: 0.2,
		priority_max: 1,
		demand_min: 0,
		demand_max: 0.33,
		scu_min: 12,
		scu_max: 55
	},

	/*
	 * Mining Parts
	 */
	mining_parts_to_yela_admin: {
		commodity_schedule_ids: ["mining_parts_from_arccorp"],
		destination_ids: ["loc_yela", "loc_yela", "loc_grim_hex"],
		destination_ships: "ships_stanton_mining",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 1,
		scu_max: 9
	},

	/*
	 * Ship Electronics
	 */
 	ship_electronics_to_crusader: {
		commodity_schedule_ids: ["ship_electronics_from_microtech"],
		destination_ids: ["loc_crusader", "loc_port_olisar"],
		destination_ships: "ships_crusader",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0.15,
		demand_max: 0.45,
		scu_min: 12,
		scu_max: 83
	},
	ship_electronics_to_borea: {
		commodity_schedule_ids: ["ship_electronics_from_microtech"],
		destination_ids: ["loc_borea", "loc_port_olisar"],
		destination_ships: "ships_drake",
		priority_min: 0.2,
		priority_max: 1,
		demand_min: 0,
		demand_max: 0.15,
		scu_min: 55,
		scu_max: 384
	},
 	ship_electronics_to_port_olisar: {
		commodity_schedule_ids: ["ship_electronics_from_microtech"],
		destination_ids: ["loc_port_olisar"],
		destination_ships: "ships_none",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0.45,
		demand_max: 1,
		scu_min: 1,
		scu_max: 9
	},
 	ship_electronics_to_terra_iii: {
		commodity_schedule_ids: ["ship_electronics_from_microtech"],
		destination_ids: ["loc_terra_iii", "loc_port_olisar"],
		destination_ships: "ships_origin",
		priority_min: 0.2,
		priority_max: 1,
		demand_min: 0,
		demand_max: 0.15,
		scu_min: 55,
		scu_max: 384
	},

	/*
	 * mobiGlas
	 */
	mobiglas_to_port_olisar: {
		commodity_schedule_ids: ["mobiglas_from_microtech"],
		destination_ids: ["loc_port_olisar"],
		destination_ships: "ships_none",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0.33,
		demand_max: 1,
		scu_min: 1,
		scu_max: 6
	},
	mobiglas_to_crusader: {
		commodity_schedule_ids: ["mobiglas_from_microtech"],
		destination_ids: ["loc_crusader", "loc_port_olisar"],
		destination_ships: "ships_crusader",
		priority_min: 0.2,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 0.33,
		scu_min: 12,
		scu_max: 55
	},
	mobiglas_to_arccorp: {
		commodity_schedule_ids: ["mobiglas_from_microtech"],
		destination_ids: ["loc_arccorp", "loc_port_olisar"],
		destination_ships: "ships_arccorp",
		priority_min: 0.2,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 0.33,
		scu_min: 12,
		scu_max: 55
	},
	mobiglas_to_hurston: {
		commodity_schedule_ids: ["mobiglas_from_microtech"],
		destination_ids: ["loc_hurston", "loc_port_olisar"],
		destination_ships: "ships_hurston",
		priority_min: 0.2,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 0.33,
		scu_min: 12,
		scu_max: 55
	},

	/* * * * * * * * * * * * * * * * 
	 * Crusader produced commodities
	 * * * * * * * * * * * * * * * */

	/*
	 * Ship Scrap
	 */
	ship_scrap_to_port_olisar: {
		commodity_schedule_ids: ["ship_scrap_from_cryastro_admin"],
		destination_ids: ["loc_port_olisar"],
		destination_ships: "ships_none",
		priority_min: 0,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 12,
		scu_max: 83
	},
	ship_scrap_to_arccorp: {
		commodity_schedule_ids: ["ship_scrap_from_cryastro_tdd"],
		destination_ids: ["loc_arccorp", "loc_port_olisar"],
		destination_ships: "ships_covalex",
		priority_min: 0,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 384
	},

	/*
	 * Hydrogen Fuel Admin
	 */
	hydrogen_fuel_to_yela_admin: {
		commodity_schedule_ids: ["hydrogen_fuel_from_crusader_admin"],
		destination_ids: ["loc_yela", "loc_yela", "loc_grim_hex"],
		destination_ships: "ships_stanton_mining",
		priority_min: 0,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 1,
		scu_max: 12
	},
	hydrogen_fuel_to_kareah_admin: {
		commodity_schedule_ids: ["hydrogen_fuel_from_crusader_admin"],
		destination_ids: ["loc_kareah", "loc_port_olisar"],
		destination_ships: "ships_none",
		priority_min: 0,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 1,
		scu_max: 12
	},

	/*
	 * Hydrogen Fuel
	 */
	hydrogen_fuel_to_port_olisar: {
		commodity_schedule_ids: ["hydrogen_fuel_from_crusader"],
		destination_ids: ["loc_port_olisar"],
		destination_ships: "ships_none",
		priority_min: 0,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 512
	},
	hydrogen_fuel_to_cryastro: {
		commodity_schedule_ids: ["hydrogen_fuel_from_crusader"],
		destination_ids: ["loc_cryastro"],
		destination_ships: "ships_none",
		priority_min: 0,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 512
	},
	hydrogen_fuel_to_arccorp: {
		commodity_schedule_ids: ["hydrogen_fuel_from_crusader"],
		destination_ids: ["loc_arccorp", "loc_port_olisar"],
		destination_ships: "ships_arccorp",
		priority_min: 0,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 512
	},
	hydrogen_fuel_to_hurston: {
		commodity_schedule_ids: ["hydrogen_fuel_from_crusader"],
		destination_ids: ["loc_hurston", "loc_port_olisar"],
		destination_ships: "ships_hurston",
		priority_min: 0,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 512
	},
	hydrogen_fuel_to_microtech: {
		commodity_schedule_ids: ["hydrogen_fuel_from_crusader"],
		destination_ids: ["loc_microtech", "loc_port_olisar"],
		destination_ships: "ships_microtech",
		priority_min: 0,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 55,
		scu_max: 512
	},

	/*
	 * Genesis Starliner Parts
	 */
 	genesis_parts_to_cryastro: {
		commodity_schedule_ids: ["genesis_parts_from_crusader"],
		destination_ids: ["loc_cryastro"],
		destination_ships: "ships_none",
		priority_min: 0,
		priority_max: 0.6,
		demand_min: 0.33,
		demand_max: 1,
		scu_min: 12,
		scu_max: 55
	},
	genesis_parts_to_arccorp: {
		commodity_schedule_ids: ["genesis_parts_from_crusader"],
		destination_ids: ["loc_arccorp", "loc_port_olisar"],
		destination_ships: "ships_arccorp",
		priority_min: 0,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 0.33,
		scu_min: 55,
		scu_max: 256
	},

	/*
	 * Covalex Salvage
	 */
	salvage_to_crusader: {
		commodity_schedule_ids: ["salvage_from_covalex"],
		destination_ids: ["loc_crusader", "loc_port_olisar"],
		destination_ships: "ships_covalex",
		priority_min: 0,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 1,
		scu_max: 12
	},

	/*
	 * Covalex Salvage Equipment
	 */
	salvage_equip_to_covalex: {
		commodity_schedule_ids: ["salvage_equip_from_crusader"],
		destination_ids: ["loc_covalex"],
		destination_ships: "ships_none",
		priority_min: 0,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 1,
		scu_max: 12
	},

	/*
	 * Stolen Goods
	 */
	stolen_goods_to_grim_hex: {
		commodity_schedule_ids: ["stolen_goods_from_nine_tails"],
		destination_ids: ["loc_grim_hex"],
		destination_ships: "ships_none",
		priority_min: 0,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 12,
		scu_max: 83
	},
	stolen_goods_to_pyro_vi: {
		commodity_schedule_ids: ["stolen_goods_from_nine_tails"],
		destination_ids: ["loc_pyro_vi"],
		destination_ships: "ships_smugglers",
		priority_min: 0,
		priority_max: 1,
		demand_min: 0,
		demand_max: 1,
		scu_min: 12,
		scu_max: 83
	},

	/*
	 * Discount Goods
	 */
	discount_goods_to_arccorp: {
		commodity_schedule_ids: ["discount_goods_from_grim_hex"],
		destination_ids: ["loc_arccorp"],
		destination_ships: "ships_smugglers",
		priority_min: 0,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 0.33,
		scu_min: 55,
		scu_max: 384
	},
	discount_goods_to_live_fire: {
		commodity_schedule_ids: ["discount_goods_from_grim_hex"],
		destination_ids: ["loc_port_olisar"],
		destination_ships: "ships_none",
		priority_min: 0,
		priority_max: 0.6,
		demand_min: 0.33,
		demand_max: 1,
		scu_min: 12,
		scu_max: 83
	},

	/*
	 * Prisoners
	 */
 	prisoners_to_hurston: {
		commodity_schedule_ids: ["prisoners_from_kareah", "prisoners_from_grim_hex"],
		destination_ids: ["loc_hurston"],
		destination_ships: "ships_hurston",
		priority_min: 0,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 1,
		scu_max: 6
	},
	prisoners_to_nine_tails: {
		commodity_schedule_ids: ["prisoners_from_grim_hex"],
		destination_ids: ["loc_yela"],
		destination_ships: "ships_nine_tails",
		priority_min: 0,
		priority_max: 0.8,
		demand_min: 0,
		demand_max: 1,
		scu_min: 1,
		scu_max: 6
	},


	/*
	 * Iron from Yela
	 */	
	iron_to_port_olisar: {
		commodity_schedule_ids: ["iron_from_yela_admin"],
		destination_ids: ["loc_port_olisar"],
		destination_ships: "ships_none",
		priority_min: 0,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 12,
		scu_max: 83
	},
	iron_to_crusader_admin: {
		commodity_schedule_ids: ["iron_from_yela_admin"],
		destination_ids: ["loc_crusader", "loc_port_olisar"],
		destination_ships: "ships_crusader",
		priority_min: 0,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 12,
		scu_max: 83
	},

	/*
	 * Platinum from Yela
	 */	
	platinum_to_crusader_admin: {
		commodity_schedule_ids: ["platinum_from_yela_admin"],
		destination_ids: ["loc_crusader", "loc_port_olisar"],
		destination_ships: "ships_crusader",
		priority_min: 0,
		priority_max: 0.6,
		demand_min: 0,
		demand_max: 1,
		scu_min: 12,
		scu_max: 55
	},

	/*
	 * Scan Data from ICC
	 */	
	scan_data_to_terra_iii: {
		commodity_schedule_ids: ["scan_data_from_icc"],
		destination_ids: ["loc_terra_iii", "loc_port_olisar"],
		destination_ships: "ships_uee",
		priority_min: 0,
		priority_max: 1,
		demand_min: 0,
		demand_max: 1,
		scu_min: 1,
		scu_max: 6
	},	
}

var _meta_contract_locations = {
	/*
	 * Crusader Locations
	 */
	loc_port_olisar: new MetaContractLocation("loc_port_olisar", "Port Olisar", 
			[
				new MetaContractSubLocation("port_olisar", "port", "port_olisar_strut_a"),
				new MetaContractSubLocation("port_olisar", "port", "port_olisar_strut_b"),
				new MetaContractSubLocation("port_olisar", "port", "port_olisar_strut_c"),
				new MetaContractSubLocation("port_olisar", "port", "port_olisar_strut_d")
			]
		),
	loc_crusader: new MetaContractLocation("loc_crusader", "Crusader", 
			[
				new MetaContractSubLocation("crusader_via_comm275", "shipcontact"),
				new MetaContractSubLocation("crusader_via_comm306", "shipcontact"),
				new MetaContractSubLocation("crusader_via_comm730", "shipcontact"),
				new MetaContractSubLocation("crusader_via_comm625", "shipcontact"),
				new MetaContractSubLocation("crusader_via_comm556", "shipcontact"),
				new MetaContractSubLocation("crusader_via_comm472", "shipcontact"),
				new MetaContractSubLocation("crusader_via_comm126", "shipcontact"),
			]
		),
	loc_grim_hex: new MetaContractLocation("loc_grim_hex", "Grim Hex",
			[
				new MetaContractSubLocation("grim_hex", "port", "grim_hex_pads")
			]
		),
	loc_yela: new MetaContractLocation("loc_yela", "Yela",
			[
				new MetaContractSubLocation("yela_via_icc849", "shipcontact"),
				new MetaContractSubLocation("yela_via_comm126", "shipcontact"),
				new MetaContractSubLocation("yela_via_comm275", "shipcontact"),
				new MetaContractSubLocation("yela_via_comm306", "shipcontact"),
				new MetaContractSubLocation("yela_via_comm625", "shipcontact"),
				new MetaContractSubLocation("yela_via_cryastro262", "shipcontact"),
				new MetaContractSubLocation("yela_via_comm730", "shipcontact"),
			]
		),
	loc_kareah: new MetaContractLocation("loc_kareah", "Security Post Kareah",
			[
				new MetaContractSubLocation("kareah", "port", "kareah_pads")
			]
		),
	loc_covalex: new MetaContractLocation("loc_covalex", "Covalex Shipping Hub",
			[
				new MetaContractSubLocation("covalex", "port", "covalex_pads")
			]
		),
	loc_cryastro: new MetaContractLocation("loc_cryastro", "Cry-Astro Service",
			[
				new MetaContractSubLocation("cryastro42", "port", "cryastro42_pads"),
				new MetaContractSubLocation("cryastro151", "port", "cryastro151_pads"),
				new MetaContractSubLocation("cryastro262", "port", "cryastro262_pads")
			]
		),
	loc_icc849: new MetaContractLocation("loc_icc849", "ICC Probe 849",
			[
				new MetaContractSubLocation("icc849", "port", "icc849_pads"),
			]
		),
	loc_comm_arrays: new MetaContractLocation("loc_comm_arrays", "Unknown",
			[
				new MetaContractSubLocation("comm126", "shipcontact"),
				new MetaContractSubLocation("comm275", "shipcontact"),
				new MetaContractSubLocation("comm306", "shipcontact"),
				new MetaContractSubLocation("comm472", "shipcontact"),
				new MetaContractSubLocation("comm556", "shipcontact"),
				new MetaContractSubLocation("comm625", "shipcontact"),
				new MetaContractSubLocation("comm730", "shipcontact"),
			]
		),

	/*
	 * Solar Locations
	 */
	loc_hurston: new MetaContractLocation("loc_hurston", "Hurston (Stanton I)",
			[
				new MetaContractSubLocation("comm126", "shipcontact"),
				new MetaContractSubLocation("comm275", "shipcontact"),
				new MetaContractSubLocation("comm306", "shipcontact"),
			]
		),
	loc_arccorp: new MetaContractLocation("loc_arccorp", "ArcCorp (Stanton III)",
			[
				new MetaContractSubLocation("comm730", "shipcontact"),
				new MetaContractSubLocation("comm306", "shipcontact"),
				new MetaContractSubLocation("comm625", "shipcontact"),
			]
		),
	loc_microtech: new MetaContractLocation("loc_microtech", "microTech (Stanton IV)",
			[
				new MetaContractSubLocation("comm556", "shipcontact"),
				new MetaContractSubLocation("comm275", "shipcontact"),
				new MetaContractSubLocation("comm472", "shipcontact"),
			]
		),
	
	/*	
	 * Extrasolar Locations
	 */
	loc_magnus_i: new MetaContractLocation("loc_magnus_i", "Magnus I",
			[
				new MetaContractSubLocation("comm306", "shipcontact"),
				new MetaContractSubLocation("comm126", "shipcontact"),
				new MetaContractSubLocation("comm730", "shipcontact"),
			]
		),
	loc_borea: new MetaContractLocation("loc_borea", "Borea (Magnus II)",
			[
				new MetaContractSubLocation("comm306", "shipcontact"),
				new MetaContractSubLocation("comm126", "shipcontact"),
				new MetaContractSubLocation("comm730", "shipcontact"),
			]
		),

	loc_pyro_vi: new MetaContractLocation("loc_pyro_vi", "Pyro VI",
			[
				new MetaContractSubLocation("comm556", "shipcontact"),
				new MetaContractSubLocation("comm625", "shipcontact"),
				new MetaContractSubLocation("comm730", "shipcontact"),
			]
		),

	loc_terra_ii: new MetaContractLocation("loc_terra_ii", "Pike (Terra II)",
			[
				new MetaContractSubLocation("comm472", "shipcontact"),
				new MetaContractSubLocation("comm625", "shipcontact"),
				new MetaContractSubLocation("comm556", "shipcontact"),
			]
		),
	loc_terra_iii: new MetaContractLocation("loc_terra_iii", "Terra (Terra III)",
			[
				new MetaContractSubLocation("comm472", "shipcontact"),
				new MetaContractSubLocation("comm625", "shipcontact"),
				new MetaContractSubLocation("comm556", "shipcontact"),
			]
		),
}

var _meta_contract_employer_shipcontacts = {
	ships_drake: {
		types: ["drak_cutlass_black", "drak_caterpillar"],
		name_prefixes: ["Adventure Galley", "Queen Anne\'s Revenge", "Whydah", "Royal Fortune", "Fancy", "Happy Delivery", "Golden Hind", "Rising Sun", "Speaker", "Revenge"],
		name_suffixes: ["II", "III", "IV", "V"]
	},
	ships_origin: {
		types: ["orig_315p", "rsi_constellation_andromeda", "misc_starfarer"],
		name_prefixes: ["OR-A", "OR-C", "OR-R", "OR-W"],
		name_suffixes: ["30", "299", "1200", "402"]	
	},
	ships_uee: {
		types: ["anvl_hornet_f7c", "aegs_starfarer_gemini"],
		name_prefixes: ["Idris IV", "Centauri", "Jalan", "Ferron"],
		name_suffixes: ["10", "A4", "42", "1003", "690", "C57-A"]	
	},
	ships_smugglers: {
		types: ["orig_315p", "misc_reliant_kore", "misc_freelancer", "rsi_constellation_andromeda", "drak_caterpillar"],
		name_prefixes: ["Wind\'s", "Serene", "Millenium", "Moldy", "Raven\'s"],
		name_suffixes: ["Falcon", "Wind", "Crow", "Claw", "Wing", "Talon"]
	},
	ships_hurston: {
		types: ["rsi_aurora_cl", "rsi_constellation_andromeda", "drak_caterpillar"],
		name_prefixes: ["Marathon", "Syracuse", "Gaugamela", "Metaurus", "Teutoburg", "Chalons", "Tours", "Hastings", "Orleans", "Saratoga", "Valmy", "Waterloo"],
		name_suffixes: ["490", "413", "331", "207", "9", "451", "732", "1066", "1429", "1777", "1792", "1815"]
	},
	ships_arccorp: {
		types: ["misc_freelancer", "rsi_constellation_andromeda", "drak_caterpillar"],
		name_prefixes: ["Light Touch", "Light Heart", "First Light", "Guiding Light"],
		name_suffixes: ["I", "II", "III", "IV", "V"]	
	},
	ships_microtech: {
		types: ["misc_freelancer", "misc_starfarer"],
		name_prefixes: ["RX", "TX", "OT", "XP", "SA"],
		name_suffixes: ["10D", "300F", "219A", "346D"]	
	},
	ships_covalex: {
		types: ["rsi_aurora_cl", "drak_caterpillar"],
		name_prefixes: ["COVALEX"],
		name_suffixes: ["001", "123", "428", "103", "783"]	
	},
	ships_nine_tails: {
		types: ["orig_325a", "drak_cutlass_black", "drak_caterpillar"],
		name_prefixes: ["Fire\'s", "Death\'s", "Night\'s", "Horn\'s"],
		name_suffixes: ["Cowl", "Shadow", "Vengeance", "Blade"]	
	},
	ships_crusader: {
		types: ["misc_freelancer", "misc_starfarer"],
		name_prefixes: ["Centauri", "Croshaw", "Ellis", "Goss", "Kiel", "Killian", "Sol", "Stanton", "Terra", "Vega"],
		name_suffixes: ["I", "II", "III", "VI", "V", "VI"]	
	},
	ships_stanton_mining: {
		types: ["orig_315p", "rsi_aurora_cl", "misc_freelancer", "misc_starfarer"],
		name_prefixes: ["Ceres", "Vesta", "Pallas", "Eros", "Ida", "Juno"],
		name_suffixes: ["II", "III", "IV", "V", "VI", "X"]
	}
}

var _generateContractForEmployerId = function(employer_id, tick) {
	var _employer = Object.freeze(_meta_contract_employers[employer_id]);

	var index = random.randomIntInRange(0, _employer.commodity_schedule_ids.length + _employer.demand_schedule_ids.length);

	if (index < _employer.commodity_schedule_ids.length) {
		var schedule_id = _employer.commodity_schedule_ids[index];
		return _generateContractFromEmployerAndCommoditySchedule(employer_id, tick, schedule_id);
	} else {
		var schedule_id = _employer.demand_schedule_ids[index - _employer.commodity_schedule_ids.length];
		return _generateContractFromEmployerAndDemandSchedule(employer_id, tick, schedule_id);
	}	
}

var _generateContractFromEmployerAndCommoditySchedule = function(employer_id, tick, commodity_schedule_id) {
	// console.log("\nGenerating " + employer_id + " contract " + commodity_schedule_id);
	var _commodity_schedule = Object.freeze(_meta_contract_commodity_schedules[commodity_schedule_id]);
	var _demand_schedule_id = Object.freeze(random.randomElementFromArray(_commodity_schedule.demand_schedule_ids))
	return _generateContractFromEmployerAndScheduleIds(employer_id, tick, commodity_schedule_id, _demand_schedule_id)
}

var _generateContractFromEmployerAndDemandSchedule = function(employer_id, tick, demand_schedule_id) {
	// console.log("\nGenerating " + employer_id + " " + demand_schedule_id);
	var _demand_schedule = Object.freeze(_meta_contract_demand_schedules[demand_schedule_id]);
	var _commodity_schedule_id = Object.freeze(random.randomElementFromArray(_demand_schedule.commodity_schedule_ids))
	return _generateContractFromEmployerAndScheduleIds(employer_id, tick, _commodity_schedule_id, demand_schedule_id)
}

var _generateContractFromEmployerAndScheduleIds = function(employer_id, tick, commodity_schedule_id, demand_schedule_id) {
	var _employer = Object.freeze(_meta_contract_employers[employer_id]);
	var _commodity_schedule = Object.freeze(_meta_contract_commodity_schedules[commodity_schedule_id]);
	var _demand_schedule = Object.freeze(_meta_contract_demand_schedules[demand_schedule_id]);

	var _origin_id = null;
	var _destination_id = null;

	while ((_origin_id == null || _destination_id == null) || _origin_id == _destination_id) {
		_origin_id = random.randomElementFromArray(_commodity_schedule.origin_ids);
		_destination_id = random.randomElementFromArray(_demand_schedule.destination_ids);
		// console.log("Testing " + _origin_id + " to " + _destination_id);
	}

	var _origin = Object.freeze(_meta_contract_locations[_origin_id]);
	var _destination = Object.freeze(_meta_contract_locations[_destination_id]);

	// console.log("Creating contract from " + _origin.name + " to " + _destination.name);

	var _demand = random.randomNumberInRange(_demand_schedule.demand_min, _demand_schedule.demand_max);
	var _priority = random.randomNumberInRange(_demand_schedule.priority_min, _demand_schedule.priority_max);
	var _target_scu = random.randomSqrtNumberInRange(_demand_schedule.scu_min, _demand_schedule.scu_max);
	// TODO: vary with volume
	// TODO: max container size is target SCU if possible
	var _container_size = random.randomElementFromArray(_commodity_schedule.container_sizes);
	var _num_containers = Math.ceil(_target_scu / _container_size);
	var _total_scu = _num_containers * _container_size;

	// 512 is the max SCU a ship contact can hold
	while (_total_scu > 512) {
		// console.log("WARNING _total_scu " + _total_scu + " > 512");
		_num_containers = _num_containers - 1;
		_total_scu = _num_containers * _container_size;
	}

	// derived
	var _expires_delta = _commodity_schedule.max_ticks_available - _commodity_schedule.min_ticks_available;
	var _expires = Math.floor(tick + _commodity_schedule.min_ticks_available + ((1.0 - _priority) * _expires_delta));
	
	var _rate_delta = _commodity_schedule.max_rate_per_scu_per_100kkm - _commodity_schedule.min_rate_per_scu_per_100kkm;
	var _rate_per_scu_per_100kkm = CONTRACT_DISTANCE_PAYOUT_MODIFIER * (_commodity_schedule.min_rate_per_scu_per_100kkm + (_demand * _rate_delta));

	// min rate based on demand 
	var _min_base_rate = _commodity_schedule.min_base_rate_per_scu + (_demand_schedule.demand_min * (_commodity_schedule.max_base_rate_per_scu - _commodity_schedule.min_base_rate_per_scu));
	// max rate based on demand
	var _max_base_rate = _commodity_schedule.max_base_rate_per_scu + (_demand_schedule.demand_max * (_commodity_schedule.max_base_rate_per_scu - _commodity_schedule.min_base_rate_per_scu));
	
	var _base_rate_delta = _max_base_rate - _min_base_rate;
	var _base_rate_per_scu = (random.randomIntInRange(CONTRACT_BASE_PAYOUT_MODIFIER * (_min_base_rate + (_priority * _base_rate_delta)) * 0.5, CONTRACT_BASE_PAYOUT_MODIFIER * (_min_base_rate + (_priority * _base_rate_delta)) * 1.5));
	
	var _pickup_sublocation = null;
	var _dropoff_sublocation = null;

	while ((_pickup_sublocation == null || _dropoff_sublocation == null) || _pickup_sublocation.quantum_id == _dropoff_sublocation.quantum_id) {
		_pickup_sublocation = random.randomElementFromArray(_origin.sub_locations);
		_dropoff_sublocation = random.randomElementFromArray(_destination.sub_locations);
		// console.log("Testing " + _pickup_sublocation.quantum_id + " to " + _dropoff_sublocation.quantum_id);
	}
	// console.log("> Valid contract, " + _pickup_sublocation.quantum_id + " to " + _dropoff_sublocation.quantum_id);

	var _pickup_quantum_id = _pickup_sublocation.quantum_id;
	var _pickup_type = null;
	var _pickup_id = null;
	var _pickup_ship_contact = null;
	if (_pickup_sublocation.type === "port") {
		_pickup_type ="port";
		_pickup_id = _pickup_sublocation.port_id;
	} else if (_pickup_sublocation.type === "shipcontact") {
		_pickup_type = "shipcontact";
		_pickup_ship_contact = _generateShipFromEmployerContactsId(_commodity_schedule.origin_ships, _pickup_quantum_id, 
			_total_scu, _origin.name, null);
		_pickup_id = _pickup_ship_contact.id;
	}

	var _dropoff_quantum_id = _dropoff_sublocation.quantum_id;
	var _dropoff_type = null;
	var _dropoff_id = null;
	var _dropoff_ship_contact = null;
	if (_dropoff_sublocation.type === "port") {
		_dropoff_type ="port";
		_dropoff_id = _dropoff_sublocation.port_id;
	} else if (_dropoff_sublocation.type === "shipcontact") {
		_dropoff_type = "shipcontact";
		_dropoff_ship_contact = _generateShipFromEmployerContactsId(_demand_schedule.destination_ships, _dropoff_quantum_id, 
			_total_scu, null, _destination.name);
		_dropoff_id = _dropoff_ship_contact.id;
	}

	// console.log("Pickup " + _pickup_id + ", dropoff " + _dropoff_id);

	var _contractdetails = new contract.ContractDetails(_employer.id, _employer.name, _origin.name, _destination.name,
		_rate_per_scu_per_100kkm, _base_rate_per_scu, _expires, _priority);
	var _contractcargo = new contract.ContractCargo(_num_containers, _container_size, _commodity_schedule.commodity_id);
	var _contractpickup = new contract.ContractPickup(_pickup_quantum_id, _pickup_type, _pickup_id);
	var _contractdropoff = new contract.ContractDropoff(_dropoff_quantum_id, _dropoff_type, _dropoff_id);

	var _contract = new contract.Contract(_contractdetails, _contractcargo, _contractpickup, _contractdropoff);

	// generate cargo

	var _containers = _contract.generateCargo();

	if (_pickup_type == "port") {
		var _port = port.portIdToLocation(_pickup_id);
		_containers.forEach(function(container) {
			_port.cargo.loadContainer(container);
		});
	} else if (_pickup_type == "shipcontact") {
		_containers.forEach(function(container) {
			_pickup_ship_contact.cargo.loadContainer(container);
		});
		shipcontact.setContractIdForShipContactId(_pickup_ship_contact.id, _contract.id);
	}

	if (_dropoff_type == "shipcontact") {
		shipcontact.setContractIdForShipContactId(_dropoff_ship_contact.id, _contract.id);
	}

	return _contract;
}

var _generateShipFromEmployerContactsId = function(employer_shipcontacts_id, quantum_id, min_scu, origin_string, destination_string) {
	_template = Object.freeze(_meta_contract_employer_shipcontacts[employer_shipcontacts_id]);

	// console.log("ship type ids: " + _template.types);

	var _ship_types = [];

	for (var i = _template.types.length - 1; i >= 0; i--) {
		_ship_types.push(shiptype.shipIdToShip(_template.types[i]));
	}

	_ship_types.sort(function(ship_a, ship_b) {
		return ship_a.cargo_hold_size - ship_b.cargo_hold_size;
	});

	// console.log("sorted ship types: " + _ship_types);

	var _ship_type_id = null;

	// Find the smallest possible ship that still holds the required cargo
	for (var i = _ship_types.length - 1; i >= 0 ; i--) {
		_ship_type = _ship_types[i];
		// console.log("Testing ship type " + _ship_type + " for " + min_scu + " SCU")
		if (_ship_type.cargo_hold_size >= min_scu) {
			_ship_type_id = _ship_type.id;
		}
	}

	if (_ship_type_id == null) {
		// console.log("Error, couldn't generate ship contact from " + employer_shipcontacts_id + " for " + min_scu + " SCU")
		return null;
	} else {
		// console.log("Found ship type " + _ship_type_id + " for " + min_scu + " SCU")
	}

	var _name = random.randomElementFromArray(_template.name_prefixes) + " " + random.randomElementFromArray(_template.name_suffixes);

	var _ship = new shipcontact.ShipContact(quantum_id, _ship_type_id, _name, origin_string, destination_string);

	// console.log("Generating ship " + _ship);
	shipcontact.addShipContact(_ship);
	return _ship;
}

module.exports = {
	generateContractForEmployerId: _generateContractForEmployerId
}
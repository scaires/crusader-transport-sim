// menu.js

function Menu(id, display_name, data) {
	this.id = id;
	this.display_name = display_name;
	this.data = data;
}

Menu.prototype.toString = function() {
	return this.display_name;
};

var _menus = {
	splash: new Menu("splash", "Splash"),
	main: new Menu("main", "Main menu"),
	main_new: new Menu("main_new", "New game"),
	main_new_career: new Menu("main_new_career", "Career"),
	main_new_sandbox: new Menu("main_new_sandbox", "Sandbox"),
	main_load: new Menu("main_load", "Load game"),
	main_load_load: new Menu("main_load_load", "Load"),
	main_load_delete: new Menu("main_load_delete", "Delete"),
	main_scores: new Menu("main_scores", "Top companies"),
	main_credits: new Menu("main_credits", "Credits"),
	spawn: new Menu("spawn", "Spawn"),
	port: new Menu("port", "Port"),
	port_navigation: new Menu("port_navigation", "Navigation"),
	port_enter_ship: new Menu("port_enter_ship", "Enter ship"),
	port_contracts: new Menu("port_contracts", "Contracts"),
	port_ship_terminals: new Menu("port_ship_terminals", "Ship terminals"),
	port_ship_terminal_details: new Menu("port_ship_terminal_details", "Ship details"),
	port_ship_terminal_details_request: new Menu("port_ship_terminal_details_request", "Request ship from hangar"),
	port_ship_terminal_details_hangar: new Menu("port_ship_terminal_details_hangar", "Move ship to hangar"),
	port_ship_terminal_details_sell: new Menu("port_ship_terminal_details_sell", "Sell ship"),
	port_ship_purchase_list: new Menu("port_ship_purchase_list", "Purchase ship..."),
	port_ship_purchase_details: new Menu("port_ship_purchase_details", "Ship details"),
	port_ship_purchase_details_purchase: new Menu("port_ship_purchase_details_purchase", "Purchase ship"),
	port_connected_ports: new Menu("port_connected_ports", "Travel to port..."),
	port_debt_repay: new Menu("port_repay_debt", "Repay debt"),
	port_company_log: new Menu("port_company_log", "Company log"),
	port_respawn: new Menu("port_respawn", "Respawn"),
	navigation_map_crusader: new Menu("navigation_map_crusader", "Crusader map"),
	navigation_map_stanton: new Menu("navigation_map_stanton", "Stanton map"),
	navigation_map_starmap: new Menu("navigation_map_starmap", "Star map"),
	ship: new Menu("ship", "Ship"),
	ship_comms: new Menu("ship_comms", "Comms"),
	ship_docking: new Menu("ship_docking", "Docking"),
	ship_navigation: new Menu("ship_navigation", "Navigation"),
	ship_navigation_port_destinations: new Menu("ship_navigation_port_destinations", "Navigation"),
	ship_navigation_landing_pad_destinations: new Menu("ship_navigation_landing_pad_destinations", "Navigation"),
	ship_navigation_quantum: new Menu("ship_navigation_quantum", "Quantum destinations"),
	ship_navigation_clear: new Menu("ship_navigation_clear", "Clear destination"),
	ship_contracts: new Menu("ship_contracts", "Contracts"),
	ship_contracts_jobboards: new Menu("ship_contracts_jobboards", "Contract boards"),
	ship_contracts_available: new Menu("ship_contracts_available", "Available contracts"),
	ship_contracts_completed: new Menu("ship_contracts_completed", "Completed contracts"),
	ship_contracts_abandoned: new Menu("ship_contracts_abandoned", "Abandoned contracts"),
	ship_contracts_details: new Menu("ship_contracts_details", "Contract details"),
	ship_contracts_details_complete: new Menu("ship_contracts_details_complete", "Complete (on-time)"),
	ship_contracts_details_complete_late: new Menu("ship_contracts_details_complete_late", "Complete (late)"),
	ship_contracts_details_abandon: new Menu("ship_contracts_details_abandon", "Abandon"),
	ship_contracts_details_available: new Menu("ship_contracts_details_available", "Contract details"),
	ship_contracts_details_available_accept: new Menu("ship_contracts_details_available_accept", "Accept"),
	ship_cargo: new Menu("ship_cargo", "Cargo"),
	ship_cargo_hold: new Menu("ship_cargo_hold", "Cargo"),
	ship_cargo_available: new Menu("ship_cargo_available", "Available cargo"),
	ship_cargo_details_from: new Menu("ship_cargo_details_from", "Cargo details"),
	ship_cargo_details_transfer_from_shipcontact: 
		new Menu("ship_cargo_details_transfer_from_shipcontact", "Transfer from "),
	ship_cargo_details_transfer_from_port: 
		new Menu("ship_cargo_details_transfer_from_port", "Transfer from "),
	ship_cargo_details_to: new Menu("ship_cargo_details_to", "Cargo details"),
	ship_cargo_details_transfer_to_port: new Menu("ship_cargo_details_transfer_to_port", "Transfer to "),
	ship_cargo_details_transfer_to_shipcontact: new Menu("ship_cargo_details_transfer_to_shipcontact", "Transfer to "),
	ship_cargo_details_jettison: new Menu("ship_cargo_details_jettison", "Jettison"),
	ship_company_log: new Menu("ship_company_log", "Company log"),
	ship_respawn: new Menu("ship_respawn", "Respawn"),
	ship_visit_port: new Menu("ship_visit_port", "Visit port (Exit ship)"),
}

var _menuIdToMenu = function(menuId) {
	return Object.freeze(_menus[menuId]);
}

var _menuIdsToMenus = function(menuIds) {
	array = [];
	for (var i = menuIds.length - 1; i >= 0; i--) {
		array[i] = Object.freeze(_menus[menuIds[i]]);
	};
	return array;
}

var _menu_ids = [];

for (var menu in _menus) {
	if (_menus.hasOwnProperty(menu)) {
		_menu_ids.push(menu.id)
	}
}

module.exports = {
	Menu: Menu,
	menu_ids: _menu_ids,
	menuIdToMenu: _menuIdToMenu,
	menuIdsToMenus: _menuIdsToMenus,
	splash:_menus.splash,
	main:_menus.main,
	main_new:_menus.main_new,
	main_new_career:_menus.main_new_career,
	main_new_sandbox:_menus.main_new_sandbox,
	main_load:_menus.main_load,
	main_load_load: _menus.main_load_load,
	main_load_delete: _menus.main_load_delete,
	main_scores: _menus.main_scores,
	main_credits: _menus.main_credits,
	spawn:_menus.spawn,
	port:_menus.port,
	port_navigation: _menus.port_navigation,
	port_enter_ship:_menus.port_enter_ship,
	port_contracts:_menus.port_contracts,
	port_ship_terminals:_menus.port_ship_terminals,
	port_ship_terminal_details:_menus.port_ship_terminal_details,
	port_ship_terminal_details_request:_menus.port_ship_terminal_details_request,
	port_ship_terminal_details_hangar: _menus.port_ship_terminal_details_hangar,
	port_ship_terminal_details_sell:_menus.port_ship_terminal_details_sell,
	port_ship_purchase_list:_menus.port_ship_purchase_list,
	port_ship_purchase_details:_menus.port_ship_purchase_details,
	port_ship_purchase_details_purchase:_menus.port_ship_purchase_details_purchase,
	port_connected_ports:_menus.port_connected_ports,
	port_debt_repay:_menus.port_debt_repay,
	port_company_log: _menus.port_company_log,
	port_respawn:_menus.port_respawn,
	navigation_map_crusader: _menus.navigation_map_crusader,
	navigation_map_stanton: _menus.navigation_map_stanton,
	navigation_map_starmap: _menus.navigation_map_starmap,
	ship:_menus.ship,
	ship_comms: _menus.ship_comms,
	ship_docking: _menus.ship_docking,
	ship_navigation: _menus.ship_navigation,
	ship_navigation_port_destinations: _menus.ship_navigation_port_destinations,
	ship_navigation_landing_pad_destinations: _menus.ship_navigation_landing_pad_destinations,
	ship_navigation_quantum: _menus.ship_navigation_quantum,
	ship_navigation_clear: _menus.ship_navigation_clear,
	ship_contracts: _menus.ship_contracts,
	ship_contracts_available: _menus.ship_contracts_available,
	ship_contracts_jobboards: _menus.ship_contracts_jobboards,
	ship_contracts_completed: _menus.ship_contracts_completed,
	ship_contracts_abandoned: _menus.ship_contracts_abandoned,
	ship_contracts_details: _menus.ship_contracts_details,
	ship_contracts_details_complete: _menus.ship_contracts_details_complete,
	ship_contracts_details_complete_late: _menus.ship_contracts_details_complete_late,
	ship_contracts_details_abandon: _menus.ship_contracts_details_abandon,
	ship_contracts_details_available: _menus.ship_contracts_details_available,
	ship_contracts_details_available_accept: _menus.ship_contracts_details_available_accept,
	ship_cargo: _menus.ship_cargo,
	ship_cargo_hold: _menus.ship_cargo_hold,
	ship_cargo_available: _menus.ship_cargo_available,
	ship_cargo_details_from: _menus.ship_cargo_details_from,
	ship_cargo_details_transfer_from_shipcontact: _menus.ship_cargo_details_transfer_from_shipcontact,
	ship_cargo_details_transfer_from_port: _menus.ship_cargo_details_transfer_from_port,
	ship_cargo_details_to: _menus.ship_cargo_details_to,
	ship_cargo_details_transfer_to_port: _menus.ship_cargo_details_transfer_to_port,
	ship_cargo_details_transfer_to_shipcontact: _menus.ship_cargo_details_transfer_to_shipcontact,
	ship_cargo_details_jettison: _menus.ship_cargo_details_jettison,
	ship_company_log: _menus.ship_company_log,
	ship_respawn: _menus.ship_respawn,
	ship_visit_port: _menus.ship_visit_port,
}
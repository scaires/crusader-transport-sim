// map.js

var _showCrusaderMap = function(locationId) {
		console.log("  ___________________________________________  ");
	if (locationId == "icc849") {
		console.log(" |>849<                                      | ");
	} else {
		console.log(" | 849                                       | ");
	}
		console.log(" |                                           | ");
	if (locationId == "kareah") {
		console.log(" |                                 >SPK<_    | ");
	} else {
		console.log(" |                                  SPK__    | ");
	}
	if (locationId == "comm126") {
		console.log(" |      >126<                         |CL|   |      Cellin");
	} else {
		console.log(" |       126                          |CL|   |      Cellin");
	}
		console.log(" |                                     ```   |       Security Post Kareah");
	if (locationId == "comm275") {
		console.log(" |                   >275<                   | ");
	} else {	
		console.log(" |                    275                    | ");
	}
	if (locationId == "cryastro42") {
		console.log(" |            >42<                           | ");
	} else {
		console.log(" |             42                            | ");
	}
		console.log(" |                                           | ");
		console.log(" |                    ___                    |      Crusader");
	if (locationId == "comm306") {
		console.log(" |          >306<  PO|CRU|     472       151 |       Port Olisar");
	} else if (locationId == "port_olisar") {
		console.log(" |           306  >PO<CRU|     472       151 |       Port Olisar");
	} else if (isCrusader(locationId)) {
		console.log(" |           306   PO>CRU<     472       151 |       Port Olisar");
	} else if (locationId == "comm472") {
		console.log(" |           306   PO|CRU|    >472<      151 |       Port Olisar");
	} else if (locationId == "cryastro151") {
		console.log(" |           306   PO|CRU|     472      >151<|       Port Olisar");
	} else {
		console.log(" |           306   PO|CRU|     472       151 |       Port Olisar");
	}
		console.log(" |   __              |   |                   | ");
	if (isYela(locationId)) {
		console.log(" |  >YL<              ````                   |      Yela");
	} else {
		console.log(" |  |YL|              ````                   |      Yela");
	}
	if (locationId == "grim_hex") {
		console.log(" |>GH<``                                     |       Grim Hex");
	} else {
		console.log(" | GH```                                     |       Grim Hex");
	}
	if (locationId == "comm625") {
		console.log(" |                   >625<            556    | ");
	} else if (locationId == "comm556") {
		console.log(" |                    625            >556<   | ");
	} else {
		console.log(" |                    625             556    | ");
	}
		console.log(" |                                           | ");
	if (locationId == "comm730") {
		console.log(" |     >730<                                 | ");
	} else {
		console.log(" |      730                                  | ");
	}
	if (locationId == "covalex") {
		console.log(" |                                 >CSH<_    | ");
	} else {
		console.log(" |                                  CSH__    | ");
	}
	if (locationId == "cryastro262") {
		console.log(" |             >262<                  |DM|   |      Daymar");
	} else {
		console.log(" |              262                   |DM|   |      Daymar");
	}
		console.log(" |                                     ```   |       Covalex Shipping Hub");
		console.log(" |___________________________________________| ");
	console.log();
}

var _showStantonMap = function() {
	console.log("  ___________________________________________  ");
	console.log(" |                                           | ");
	console.log(" |                                  o        | ");
	console.log(" |    Aaron Halo             Microtech       | ");
	console.log(" |       Asteroid Belt                       | ");
	console.log(" |                ` ` ` ` ` `                | ");
	console.log(" |              `             `              | ");
	console.log(" |            `      o          `            | ");
	console.log(" |          `   Hurston|          `          | ");
	console.log(" |         `           |  Stanton  `         | ");
	console.log(" | *       `      ____/ \\____      `    * To | ");
	console.log(" | To Magnus          \\ /          `   Terra | ");
	console.log(" |          `          |       o  `          | ");
	console.log(" |           `         |    > Crusader <     | ");
	console.log(" |            `                 `            | ");
	console.log(" |          o   `             `              | ");
	console.log(" |       Arccorp  ` ` ` ` ` `                | ");
	console.log(" |                                           | ");
	console.log(" |                     * To                  | ");
	console.log(" |                       Pyro                | ");
	console.log(" |___________________________________________| ");
	console.log();
}

var _showStarMap = function() {
	console.log("  ___________________________________________  ");
	console.log(" |              .                            | ");
	console.log(" |            .    PYRO                      | ");
	console.log(" |           . * .   Pyro I   Pyro IV        | ");
	console.log(" |               .   Pyro II  Pyro V         | ");
	console.log(" |             .     Pyro III Pyro VI        | ");
	console.log(" |                                           | ");
	console.log(" |                                           | ");
	console.log(" |                      > STANTON <          | ");
	console.log(" |                    .     Hurston          | ");
	console.log(" |                   . *    Crusader         | ");
	console.log(" | MAGNUS            .  .   Arccorp          | ");
	console.log(" |   Magnus I               Microtech        | ");
	console.log(" |   Borea                                   | ");
	console.log(" |   Magnus III            TERRA       .     | ");
	console.log(" |                           Terra I .   .   | ");
	console.log(" |     .   .                 Pike      *     | ");
	console.log(" |       *                   Terra    .      | ");
	console.log(" |      .                    Terra IV        | ");
	console.log(" |                                           | ");
	console.log(" |___________________________________________| ");
	console.log();
}

var isYela = function(locationId) {
	return locationId.includes("yela_via");
}

var isCrusader = function(locationId) {
	return locationId.includes("crusader_via");	
}

module.exports = {
	showCrusaderMap: _showCrusaderMap,
	showStantonMap: _showStantonMap,
	showStarMap: _showStarMap
}
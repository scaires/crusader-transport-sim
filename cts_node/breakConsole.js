// breakConsole

var LineBreaker = require('linebreak');

module.exports = function(lineLength) {
  	return {
	    log: function(text) {
			var breaker = new LineBreaker(text);
			var last = 0;
			var bk;
			var line = "";
			var lineCount = 0

			while (bk = breaker.nextBreak()) {
				// get the string between the last break and this one
								  
				var word = text.slice(last, bk.position);

				if (lineCount + word.length >= lineLength) {
					console.log(line);
					line = "";
					lineCount = 0;
				}

				line = line.concat(word);
				lineCount = lineCount + word.length;
				  	
				// you can also check bk.required to see if this was a required break...
				if (bk.required) {
					lineCount = 0;
				}
			  
				last = bk.position;
			}

			console.log(line);
	    }
	}
}
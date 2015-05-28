var util = require('util');

function logger(loggingLevel) {
	var that = this;
	var levels = ['DEBUG', 'INFO', 'NOTICE', 'WARNING', 'ERROR', 'CRITICAL'];
	var loggingLevelIndex = levels.indexOf(loggingLevel);
	
	var log = function(levelIndex, args){
		if(loggingLevelIndex > levelIndex) return;
		util.log('%s - %s', levels[levelIndex], util.format.apply(util, args));
	};

	this.debug = function() {log(0, arguments)};
	this.info = function() {log(1, arguments)};
	this.notice = function() {log(2, arguments)};
	this.warning = function() {log(3, arguments)};
	this.error = function() {log(4, arguments)};
	this.critical = function() {log(5, arguments)};
}

module.exports = logger;
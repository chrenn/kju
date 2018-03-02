process.setMaxListeners(0);
require('events').EventEmitter.defaultMaxListeners = 1000;

Number.prototype.pad = function (size) {
	let s = String(this);
	while (s.length < (size || 2)) s = '0' + s;
	return s;
};

const timeout = ms => new Promise(r => setTimeout(r, ms));

module.exports = {
	timeout
};
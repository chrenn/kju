const { version } = require('./package');

const chalk = require('chalk');
const moment = require('moment');
const cp = require('copy-paste');

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

class Logger {

	constructor() {

		this.showLogs = false;
		this.clipboard = {
			toggle: false,
			hmac: '',
			userAgent: ''
		};

		process.stdin.on('keypress', (char, key)  => {
			if (key && key.ctrl && key.name == 'c') {
				process.stdin.setRawMode(false);
				console.log(chalk.red('Press Ctrl+C again to exit.'));
			} else if (key && key.name == 'l') {
				this.toggle();
			} else if (key && key.name == 'c') {
				this.copy();
			}
		});

	}

	toggle() {
		this.showLogs = !this.showLogs;
		console.log(chalk.dim(this.showLogs ? 'Showing Logs...' : 'Hiding logs.'));
	}

	intro(instances) {
		console.log('');
		console.log(chalk.bgBlack.white(' ❯❯❯_ '), chalk.bold('Kju v' + version));
		console.log(chalk.dim(`Loading ${instances} instances...`));
		console.log('');
	}

	info(instance, tab, message) {
		if (this.showLogs) console.log(chalk.bgBlackBright.white(` Instance ${instance}_${tab} `), chalk.dim(message));
	}

	error(instance, error) {
		if (this.showLogs) console.log(chalk.bgRed.white(` Instance ${instance}`), error);
	}

	success(instance, tab, hmacName, hmacVal, userAgent) {
		this.clipboard.hmac = hmacVal;
		this.clipboard.userAgent = userAgent;
		console.log(chalk.bgGreen.white(' ❯❯❯_ '), chalk.green(`Through Splash on Instance ${instance}_${tab}!`), chalk.dim('—'), chalk.dim(moment().format('hh:mm:ss')));
		console.log(hmacName ? hmacName + ' — ' + hmacVal : 'Unknown cookie.');
		console.log(userAgent);
		console.log('');
	}

	copy() {
		this.clipboard.toggle = !this.clipboard.toggle;
		cp.copy(this.clipboard.toggle ? this.clipboard.hmac : this.clipboard.userAgent);
		console.log(chalk.dim('Copied latest', this.clipboard.toggle ? 'HMAC Cookie.' : 'UserAgent.'));
	}

}

module.exports = Logger;
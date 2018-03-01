const path = require('path');
const fs = require('fs');
const debug = require('debug');
const { Chrome } = require('navalia');
const clipboard = require('copy-paste');
const Listr = require('listr');
const Rx = require('rxjs/Rx');
const NotificationCenter = require('node-notifier').NotificationCenter;

const { USER_AGENTS, GOOGLE_COOKIES } = require('./config');
const utils = require('./utils');

const notifier = new NotificationCenter();

async function splash(options) {
	
	let chrome = new Chrome({
		timeout: 60000,
		flags: {
			'headless': options.headless,
			'disableSync': true,
			'disable-infobars': true,
			'disable-web-security': true,
			'window-size': '400,300',
			'user-agent': options.userAgent,
			'user-data-dir': path.resolve('tmp', 'chrome_' + options.index),
			'profile-directory': 'PROFILE_' + options.index
		},
	});

	await chrome.goto('http://www.google.com/404');
	for (let cookie of GOOGLE_COOKIES) {
		await chrome.cookie(cookie.name, cookie.value);
	}

	await chrome.goto(options.splashURL);

	while (!await chrome.exists('.g-recaptcha', { wait: false }) && !await chrome.exists('#g-recaptcha', { wait: false }) && !await chrome.evaluate(() => window.CAPTCHA_KEY)) {
		if (options.debug) {
			console.log('Instance ' + options.index + ': ' + await chrome.evaluate(() => document.title))
		}
		await chrome.wait(20000);
		if (options.reload) await chrome.goto(options.splashURL); //await chrome.reload(true);
	}

	let saveDir = path.resolve('html', Date.now().toString());
	fs.mkdirSync(saveDir);
	await chrome.save(saveDir + '/index.html');

	let cookieJar = await chrome.cookie();
	fs.writeFileSync(saveDir + '/cookies.json', JSON.stringify(cookieJar));
	fs.writeFileSync(saveDir + '/ua.txt', options.userAgent);

	let gceeqs = '';
	for (let cookie of cookieJar) {
		if (cookie.name == 'gceeqs') {
			gceeqs = cookie.value;
		}
	}
	console.log('--------------------------------')
	if (gceeqs) {
		console.log(gceeqs);
	} else {
		console.log('Through splash, unknown cookie.')
	}
	console.log(options.userAgent);
	console.log('--------------------------------')

	notifier.notify({
		title: '🦓 HMAC',
		subtitle: 'gceeqs',
		contentImage: path.join(__dirname, 'icon.png'),
		message: gceeqs || 'Through splash.',
		sound: 'Hero',
		actions: ['Copy'],
		timeout: 600
	}, (err, action, res) => {
		if (!err) clipboard.copy(gceeqs + ' ' + options.userAgent);
	});
	
	if (options.headless) {
		await chrome.end();
		if (options.openInstaCop) insta(options, gceeqs);
	}

}

async function insta(options, gceeqs) {

	let chrome = new Chrome({
		timeout: 60000,
		flags: {
			'headless': false,
			'disableSync': true,
			'disable-infobars': true,
			'disable-web-security': true,
			'window-size': '1400,900',
			'user-agent': options.userAgent,
			'user-data-dir': path.resolve('tmp', 'chrome_' + options.index),
			'profile-directory': 'PROFILE_' + options.index
		},
	});
	await chrome.goto('http://www.google.com/404');
	for (let cookie of GOOGLE_COOKIES) {
		await chrome.cookie(cookie.name, cookie.value);
	}
	await chrome.goto(options.instaCopURL);
	await chrome.cookie('gceeqs', gceeqs);

}

for (let i = 1; i <= 4; i++) {
	splash({
		index: i.pad(),
		debug: true,
		headless: false,
		reload: true,
		openInstaCop: false,
		splashURL: 'http://www.adidas.de/yeezy',
		//splashURL: 'http://w.www.adidas.de/hmac',
		instaCopURL: 'http://w.www.adidas.de',
		userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
	});
}

const tasks = new Listr([], {
	concurrent: true
});

for (let i = 1; i <= 4; i++) {
	tasks.add({
		title: 'Instance ' + i.pad(),
		task: (ctx, task) => {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					task.title = 'ayy';
					task.output = 'wut';
				}, 1000);
				setTimeout(() => {
					task.title = 'lmao';
					task.output = null;
				}, 1500);
				setTimeout(() => {
					return resolve('lolololollololol');
				}, 2000);
			})
		}
	});
}
			

// for (let i = 1; i <= 4; i++) {
// 	tasks.add({
// 		title: 'Instance ' + i.pad(),
// 		task: (ctx, task) => {
// 			return new Rx.Observable(observer => {
// 				observer.next('Foo');
// 				setTimeout(() => {
// 					observer.next('Bar');
// 					task.output = 'ayy';
// 				}, 1000);
// 				setTimeout(() => {
// 					observer.next('asdf');
// 					task.title = 'Done';
// 					task.output = 'lmao';
// 					task.state = 1;
// 				}, 2000);
// 			});
// 		}
// 	});
// }	

tasks.run().catch(err => {
	console.error(err);
});

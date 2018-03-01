const path = require('path');
const fs = require('fs');

const Listr = require('listr');
//const Rx = require('rxjs/Rx');
const { Chrome } = require('navalia');

const clipboard = require('copy-paste');
const { NotificationCenter } = require('node-notifier');

const { USER_AGENTS, GOOGLE_COOKIES } = require('./config');
const utils = require('./utils');

const tasks = new Listr([], {
	concurrent: true
});
const notifier = new NotificationCenter();

const splash = (task, options) => {

	return new Promise(async (resolve, reject) => {

		try {
	
		let userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

		let chrome = new Chrome({
			timeout: 60000,
			flags: {
				'headless': options.headless,
				'disableSync': true,
				'disable-infobars': true,
				'disable-web-security': true,
				'window-size': '400,300',
				'user-agent': userAgent,
				'user-data-dir': path.resolve('tmp', 'chrome_' + options.index),
				'profile-directory': 'PROFILE_' + options.index
			},
		});

		const thruSplash = async () => {
			let captchaClass = await chrome.exists('.g-recaptcha', { wait: false });
			let captchaId = await chrome.exists('#g-recaptcha', { wait: false });
			let captchaKey = await chrome.evaluate(() => window.CAPTCHA_KEY);
			return captchaClass || captchaId || captchaKey;
		}

		await chrome.goto('http://www.google.com/404');
		for (let cookie of GOOGLE_COOKIES) {
			await chrome.cookie(cookie.name, cookie.value);
		}

		await chrome.goto(options.splashURL);

		while (!(await thruSplash())) {
			task.output = await chrome.evaluate(() => document.title);
			await chrome.wait(options.timeout * 1000);
			if (options.reload) await chrome.goto(options.splashURL);
		}

		let cookieJar = await chrome.cookie();
		let gceeqs = '';
		for (let cookie of cookieJar) {
			if (cookie.name == 'gceeqs') {
				gceeqs = cookie.value;
			}
		}

		let saveDir = path.resolve('html', Date.now().toString());
		fs.mkdirSync(saveDir);
		await chrome.save(saveDir + '/index.html');
		fs.writeFileSync(saveDir + '/cookies.json', JSON.stringify(cookieJar));
		fs.writeFileSync(saveDir + '/ua.txt', userAgent);

		task.title = task.title + ': ' + gceeqs || 'Through splash, unknown cookie.'
		task.output = userAgent;
		resolve();

		notifier.notify({
			title: 'KJU',
			subtitle: 'HMAC found.',
			contentImage: path.resolve('icon.png'),
			message: gceeqs || 'Through splash.',
			sound: 'Hero',
			actions: ['Copy'],
			timeout: 600
		}, (err, action, res) => {
			if (!err) clipboard.copy(gceeqs + ' ' + options.userAgent);
		});
	
		} catch (err) { reject(err) }	
		
	});

}

for (let i = 1; i <= 20; i++) {
	tasks.add({
		title: `Instance ${i.pad()}`,
		task: (ctx, task) => {
			return splash(task, {
				index: i.pad(),
				headless: false,
				reload: true,
				timeout: 20,
				//splashURL: 'http://www.adidas.de/yeezy',
				splashURL: 'http://w.www.adidas.de/hmac',
			});
		}
	});
}

tasks.run().catch(err => {
	console.error(err);
});

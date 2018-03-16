const path = require('path');
const fs = require('fs-extra');

const { Chrome } = require('navalia');
const notifier = require('node-notifier');

const Logger = require('./logger');
const utils = require('./utils');
const { CONFIG, USER_AGENTS } = require('./config');
const GOOGLE_COOKIES = require('./cookies');

const logger = new Logger();
logger.intro(CONFIG.instances);

const splash = async (instance, config) => {

	try {
	
		let userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
		let viewportX = Math.floor(400 * (1 + 1.0 * Math.random()));
		let viewportY = Math.floor(400 * (1 + 0.5 * Math.random()));

		let chrome = new Chrome({
			timeout: 60000,
			flags: {
				'headless': config.headless,
				'disableSync': true,
				'disable-infobars': true,
				//'disable-web-security': true,
				'enable-translate-new-ux': true,
				//'disable-translate-new-ux': true,
				'no-default-browser-check': true,
				'window-size': `${viewportX},${viewportY}`,
				'user-agent': userAgent,
				'user-data-dir': path.resolve('tmp', 'chrome_' + instance),
				'profile-directory': 'PROFILE_' + instance
			},
		});

		const thruSplash = async () => {
			// let captchaClass = await chrome.exists('.g-recaptcha', { wait: false });
			// let captchaId = await chrome.exists('#g-recaptcha', { wait: false });
			// let captchaKey = await chrome.evaluate(() => window.CAPTCHA_KEY);
			// return (captchaClass || captchaId || captchaKey);
			return await chrome.evaluate(() => typeof grecaptcha !== "undefined");
		}

		await chrome.goto('http://www.google.com/404');
		for (let cookie of GOOGLE_COOKIES) {
			await chrome.cookie(cookie.name, cookie.value);
		}

		await chrome.goto(config.splashURL);

		while (!(await thruSplash())) {
			logger.info(instance, await chrome.evaluate(() => document.title));
			await chrome.wait(config.timeout * 1000);
			if (config.reload) await chrome.goto(config.splashURL);
		}

		let cookieJar = await chrome.cookie();
		let gceeqs = '';
		for (let cookie of cookieJar) {
			if (cookie.name == 'gceeqs') {
				gceeqs = cookie.value;
			}
		}

		let saveDir = path.resolve('html', Date.now().toString());
		await fs.ensureDir(saveDir);

		await chrome.save(path.resolve(saveDir, 'index.html'));
		await fs.outputFile(path.resolve(saveDir, 'cookies.json'), JSON.stringify(cookieJar));
		await fs.outputFile(path.resolve(saveDir, 'ua.txt'), userAgent);
		await fs.outputFile(path.resolve(saveDir, 'body.png'), await chrome.screenshot('body'));

		logger.success(instance, gceeqs, userAgent);

		notifier.notify({
			title: '❯❯❯_ Kju',
			icon: path.resolve('icon.png'),
			contentImage: path.resolve(saveDir, 'body.png'),
			message: `Through Splash on Instance ${instance}!`,
			sound: 'Hero',
		});
	
	} catch (err) {

		logger.error(instance, err);

	}

}

const main = async () => {
	for (let i = 1; i <= CONFIG.instances; i++) {
		await utils.timeout(500);
		splash(i.pad(), CONFIG);
	}
}

main();

const path = require('path');
const fs = require('fs-extra');

const puppeteer = require('puppeteer');
const notifier = require('node-notifier');

const Logger = require('./logger');
const utils = require('./utils');
const { CONFIG, USER_AGENTS } = require('./config');
const GOOGLE_COOKIES = require('./cookies');

const logger = new Logger();
logger.intro(CONFIG.instances);

const splash = async (browser, instance, config) => {

	try {
	
		let userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
		let viewportX = Math.floor(400 * (1 + 1.0 * Math.random()));
		let viewportY = Math.floor(400 * (1 + 0.5 * Math.random()));

		
		const page = await browser.newPage();
		page.setUserAgent(userAgent);

		// let chrome = new Chrome({
		// 	timeout: 60000,
		// 	flags: {
		// 		'headless': config.headless,
		// 		'disableSync': true,
		// 		'disable-infobars': true,
		// 		//'disable-web-security': true,
		// 		'enable-translate-new-ux': true,
		// 		//'disable-translate-new-ux': true,
		// 		'no-default-browser-check': true,
		// 		'window-size': `${viewportX},${viewportY}`,
		// 		'user-agent': userAgent,
		// 		'user-data-dir': path.resolve('tmp', 'chrome_' + instance),
		// 		'profile-directory': 'PROFILE_' + instance
		// 	},
		// });



		await page.goto(config.splashURL);

		while (!(await page.evaluate(() => typeof grecaptcha !== "undefined"))) {
			logger.info(instance, await page.evaluate(() => document.title));
			await page.waitFor(config.timeout * 1000);
			if (config.reload) await page.goto(config.splashURL);
		}

		//await page.bringToFront();

		let cookieJar = await page.cookies();
		let gceeqs = '';
		for (let cookie of cookieJar) {
			if (cookie.name == 'gceeqs') {
				gceeqs = cookie.value;
			}
		}

		let saveDir = path.resolve('html', Date.now().toString());
		await fs.ensureDir(saveDir);

		await fs.outputFile(path.resolve(saveDir, 'index.html'), await page.content());
		await fs.outputFile(path.resolve(saveDir, 'cookies.json'), JSON.stringify(cookieJar));
		await fs.outputFile(path.resolve(saveDir, 'ua.txt'), userAgent);
		//await fs.outputFile(path.resolve(saveDir, 'body.png'), await page.screenshot('body'));

		logger.success(instance, gceeqs, userAgent);

		notifier.notify({
			title: '❯❯❯_ Kju',
			icon: path.resolve('icon.png'),
			//contentImage: path.resolve(saveDir, 'body.png'),
			message: `Through Splash on Instance ${instance}!`,
			sound: 'Hero',
			timeout: 60000
		}, async (err, res, data) => {
			if (res == 'activate') await page.bringToFront();
		});
	
	} catch (err) {

		logger.error(instance, err);

	}

}

const main = async () => {
	console.log(puppeteer.defaultArgs());
	const browser = await puppeteer.launch({
		headless: false,
		executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		args: [
			'--disable-sync',
			'--disable-infobars',
			'--enable-translate-new-ux',
			'--no-default-browser-check'
		]
	});
	const page = await browser.newPage();
	await page.goto('http://www.google.com/404');
	for (let cookie of GOOGLE_COOKIES) {
		await page.setCookie({
			name: cookie.name,
			value: cookie.value
		});
	}
	await page.close();
	for (let i = 1; i <= CONFIG.instances; i++) {
		await utils.timeout(500);
		splash(browser, i.pad(), CONFIG);
	}
}

main();

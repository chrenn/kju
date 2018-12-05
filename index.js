const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');

const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const notifier = require('node-notifier');

const utils = require('./utils');
const Logger = require('./logger');
const { CONFIG, USER_AGENTS } = require('./config');
const GOOGLE_COOKIES = require('./cookies');

const logger = new Logger();
logger.intro(CONFIG.instances);

const main = async () => {

	await fs.emptyDir(path.resolve('tmp'));

	for (let i = 1; i <= CONFIG.instances; i++) {
		await utils.timeout(1000);
		splash(i.pad(), CONFIG);
	}

}

const splash = async (instance, config) => {

	try {

		const tab = '00';

		const browser = await puppeteer.launch({
			headless: false,
			ignoreHTTPSErrors: true,
			//executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
			userDataDir: path.resolve('tmp', 'chrome_' + instance),
			args: [
				'--no-default-browser-check',
				'--disable-sync',
				'--disable-infobars',
				'--disable-web-security',
				'--reduce-security-for-testing',
				'--unsafely-treat-insecure-origin-as-secure=http://w.www.adidas.de',
				'--enable-translate-new-ux',
				'--window-size=1000,800',
				`--user-agent=${_.sample(USER_AGENTS)}`,
				`--profile-directory=PROFILE_${instance}`,
				`--disable-extensions-except=${path.resolve(__dirname, 'crx/uBlock')},${path.resolve(__dirname, 'crx/ETC')}`,
				`--load-extension=${path.resolve(__dirname, 'crx/uBlock')},${path.resolve(__dirname, 'crx/ETC')}`
			]
		});

		const [defaultPage] = await browser.pages();
		await defaultPage.close();
		
		// const context = await browser.createIncognitoBrowserContext();
		// const cookiePage = await context.newPage();

		const cookiePage = await browser.newPage();
		cookiePage.setDefaultNavigationTimeout(60000);
		
		await cookiePage.goto('http://www.google.com/404');
		for (let cookie of GOOGLE_COOKIES) {
			await cookiePage.setCookie({
				name: cookie.name,
				value: cookie.value
			});
		}
		
		const page = await browser.newPage();
		await cookiePage.close();
		
		page.setDefaultNavigationTimeout(60000);
		//await page.emulate(_.sample(devices));
		//await page.setUserAgent(_.sample(USER_AGENTS));
		await page.setViewport({
			width: _.random(800, 1000),
			height: _.random(600, 800)
		});

		await page.setRequestInterception(true);
		page.on('request', interceptedRequest => {
			if (interceptedRequest.url().endsWith('_bm/_data'))
				interceptedRequest.abort();
			else
				interceptedRequest.continue();
		});

		await page.goto(config.splashURL);
		

		// await page.setCookie({
		// 	name: 'HRPYYU',
		// 	value: 'true',
		// 	domain: 'www.adidas.de'
		// });

		while (!(await page.evaluate(() => typeof grecaptcha !== 'undefined'))) {

			logger.info(instance, tab, await page.evaluate(() => document.title));

			await page.waitFor(config.timeout * 500);
			try {
				await page.hover('.bottom');
				await page.waitFor(1000);
				await page.hover('.top');
			} catch (err) {
				logger.error(instance, err);
			};
			await page.waitFor(config.timeout * 500);

			if (config.reload) await page.reload();

		}

		let cookieJar = await page.cookies();
		let hmac = {};
		for (let cookie of cookieJar) {
			if (cookie.value.includes('hmac')) {
				hmac = cookie;
			}
		}

		let saveDir = path.resolve(__dirname, 'save', Date.now().toString());
		await fs.ensureDir(saveDir);

		let userAgent = await page.evaluate(() => navigator.userAgent);

		await fs.outputFile(path.resolve(saveDir, 'index.html'), await page.content());
		await fs.outputFile(path.resolve(saveDir, 'cookies.json'), JSON.stringify(cookieJar));
		await fs.outputFile(path.resolve(saveDir, 'ua.txt'), userAgent);
		await fs.outputFile(path.resolve(saveDir, 'body.png'), await page.screenshot());

		logger.success(instance, tab, hmac.name, hmac.value, userAgent);

		notifier.notify({
			title: '❯❯❯_ Kju',
			//icon: path.resolve('media', 'icon.png'),
			contentImage: path.resolve(saveDir, 'body.png'),
			message: `Through Splash on Instance ${instance}_${tab}!`,
			sound: 'Hero',
			timeout: 60000
		}, async (err, res, data) => {
			if (res == 'activate') await page.bringToFront();
		});
	
	} catch (err) {

		logger.error(instance, err);

	}

}

main();

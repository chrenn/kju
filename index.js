const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');

const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const notifier = require('node-notifier');

const Logger = require('./logger');
const utils = require('./utils');
const { CONFIG, USER_AGENTS } = require('./config');
const GOOGLE_COOKIES = require('./cookies');

const logger = new Logger();
logger.intro(CONFIG.instances);

const main = async () => {

	await fs.emptyDir(path.resolve('tmp'));

	const browser = await puppeteer.launch({
		headless: CONFIG.headless,
		//executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		userDataDir: path.resolve(__dirname, 'tmp/chrome_0'),
		args: [
			'--no-default-browser-check',
			'--disable-sync',
			'--disable-infobars',
			'--disable-web-security',
			'--enable-translate-new-ux',
			'--window-size=1000,800',
			'--profile-directory=PROFILE_0',
			`--disable-extensions-except=${path.resolve(__dirname, 'crx/uBlock0.chromium')}`,
			`--load-extension=${path.resolve(__dirname, 'crx/uBlock0.chromium')}`
		]
	});

	for (let i = 1; i <= CONFIG.instances; i++) {
		await utils.timeout(1000);
		splash(browser, i.pad(), CONFIG);
	}

	const [ defaultPage ] = await browser.pages();
	await defaultPage.close();

}

const splash = async (browser, instance, config) => {

	try {

		const context = await browser.createIncognitoBrowserContext();
		const cookiePage = await context.newPage();
		
		await cookiePage.goto('http://www.google.com/404');
		for (let cookie of GOOGLE_COOKIES) {
			await cookiePage.setCookie({
				name: cookie.name,
				value: cookie.value
			});
		}
		
		const page = await context.newPage();
		await cookiePage.close();

		page.setDefaultNavigationTimeout(60000);
		await page.emulate(_.sample(devices));
		await page.goto(config.splashURL);

		// await page.setCookie({
		// 	name: 'HRPYYU',
		// 	value: 'true',
		// 	domain: 'www.adidas.de'
		// })

		while (!(await page.evaluate(() => typeof grecaptcha !== "undefined"))) {
			logger.info(instance, await page.evaluate(() => document.title));
			await page.waitFor(config.timeout * 1000);
			if (config.reload) await page.goto(config.splashURL);
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

		logger.success(instance, hmac.name, hmac.value, userAgent);

		notifier.notify({
			title: '❯❯❯_ Kju',
			//icon: path.resolve('media', 'icon.png'),
			contentImage: path.resolve(saveDir, 'body.png'),
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

main();

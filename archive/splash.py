import sys
import time
import threading
import random
from config import *
from selenium import webdriver


def main():

    print(
        """
      __  __       _ _   _  _____       _           _     
     |  \/  |     | | | (_)/ ____|     | |         | |    
     | \  / |_   _| | |_ _| (___  _ __ | | __ _ ___| |__  
     | |\/| | | | | | __| |\___ \| '_ \| |/ _` / __| '_ \ 
     | |  | | |_| | | |_| |____) | |_) | | (_| \__ \ | | |
     |_|  |_|\__,_|_|\__|_|_____/| .__/|_|\__,_|___/_| |_|
                                 | |                      
                                 |_|                      
                       
     @bq            twitter.com/InstaCopV2            v0.2

        """
    )

    print("URL: {}".format(SPLASH_URL))
    print("")
        
    sessions = int(input("Enter number of instances: "))
    print("")

    x_no = int( DISPLAY[0] / ( OVERLAP * WINDOW[0] ) )

    for i in range(sessions):

        x = int((i % x_no) * OVERLAP * WINDOW[0])
        y = int(int(i / x_no) * OVERLAP * WINDOW[1])

        ua = random.choice(USER_AGENTS)

        thread = threading.Thread(target=session, args=(i, WINDOW, x, y, ua))
        thread.daemon = True
        thread.start()
        time.sleep(1)

    while True:
        time.sleep(5)


def session(i, window, x, y, ua):
    options = webdriver.ChromeOptions()
    options.add_argument('--disable-infobars')
    options.add_argument('--headless')
    options.add_argument('--window-size={},{}'.format(*window))
    options.add_argument('--window-position={},{}'.format(x,y))
    options.add_argument('--user-data-dir=/tmp/chrome{}'.format(i))
    options.add_argument('--profile-directory="Profile{}"'.format(i))
    if HEADLESS:
        options.add_argument('--headless')
    if USER_AGENT:
        options.add_argument('--user-agent={}'.format(ua))

    browser = webdriver.Chrome(chrome_options=options)

    browser.get("http://www.google.com/404")

    for cookie in COOKIES:
        browser.add_cookie(cookie)

    time.sleep(1)

    browser.get(SPLASH_URL)

    while True:
            
        if browser.find_elements_by_class_name("g-recaptcha"):

            print(ua)

            for cookie in browser.get_cookies():
                if 'hmac' in cookie['value']:
                    print(cookie['name'], cookie['value'])

            print("")

        time.sleep(20)


if __name__ == '__main__':
    main()
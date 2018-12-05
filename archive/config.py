SPLASH_URL = "https://www.adidas.com/yeezy/" # might change on release
#SPLASH_URL = "http://w.www.adidas.de/hmac" # HMAC and captcha test page

HEADLESS = False
USER_AGENT = True

OVERLAP = 0.75 # spacing between windows, <1 means overlap
WINDOW = (400, 400) # width and height of each chrome window
DISPLAY = (1680, 1050) # your display resolution (only width is relevant for now)

# for easier captcha solving, get all cookies on .google.com with the EditThisCookie extension
# delete everything except, domain, name and value
COOKIES = [
{
    "domain": ".google.com",
    "name": "APISID",
    "value": "-FDMfYpI3aRMF5o8/ACii4573i50sUirRm",
},
{
    "domain": ".google.com",
    "name": "CONSENT",
    "value": "YES+DE.de+20161218-19-0",
},
{
    "domain": ".google.com",
    "name": "HSID",
    "value": "AMVWiYxdOcJqwSLVm",
},
{
    "domain": ".google.com",
    "name": "NID",
    "value": "106=M5BhT-tdJAVDVka3J5EAnbkcntsOdwGf6tLXCOMSYKDt0BIExaZLLPj2saMWKMIXY5iHmJG9UiN3tEXrMguYwpQkS7X1mVRHgIkOYEJDcaoJj3yGTVzS7DKj2B4V9kc4Uck4ENNSUvGUgEuedcRdjKIFXY6kMZ_ajfU5AHS0kS1rmU0gORXqzgVK5-4fUM4XWh4aQzBD0l0_fY2TzgSf8DwbXTQuMJJVBLZOwfs",
},
{
    "domain": ".google.com",
    "name": "SAPISID",
    "value": "Id5PCiNMc_hym_co/A9izeco3LNVUg-6Mh",
},
{
    "domain": ".google.com",
    "name": "SID",
    "value": "owTO5IkZLdloNrzbAiBH5yK0w9N5dAug6cgqASpNC44kEHfhzZUhuLH4RyxaqQqYrxts1w.",
},
{
    "domain": ".google.com",
    "name": "SSID",
    "value": "AI8l8Aj24x88z_Zio",
}
]

USER_AGENTS = [
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36", 
	"Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36", 
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36", 
	"Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36", 
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36", 
	"Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36", 
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36", 
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36", 
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36", 
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393",
	"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36",
	"Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.104 Safari/537.36",
]
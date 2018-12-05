#!/bin/bash
echo ""
echo "Enter UserAgent:"
read UA
echo ""
echo "Launching Chrome with a separate profile."
echo ""
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-agent="$UA" --user-data-dir="/tmp/chrome_tmp"
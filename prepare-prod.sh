#!/bin/bash
if [ -z "`git branch | grep "* staging"`" ]
  then
  echo "Switch to staging branch"
  exit
fi
YUI=~/soft/yuicompressor-2.4.7/build/yuicompressor-2.4.7.jar
java -jar $YUI ./public/js/fitspector.js -o ./public/js/fitspector.min.js
java -jar $YUI ./public/css/fitspector.css -o ./public/css/fitspector.min.css
sed -i 's/fitspector.js/fitspector.min.js/g' ./public/index.html
sed -i 's/fitspector.js/fitspector.min.js/g' ./public/success.html
sed -i 's/fitspector.css/fitspector.min.css/g' ./public/index.html
sed -i 's/fitspector.css/fitspector.min.css/g' ./public/success.html
git add ./public/js/fitspector.min.js
git add ./public/css/fitspector.min.css
git commit -a -m "Minified production-ready version"

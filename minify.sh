#!/bin/bash
YUI=~/soft/yuicompressor-2.4.7/build/yuicompressor-2.4.7.jar
java -jar $YUI ./public/js/fitspector.js -o ./public/js/fitspector.min.js
java -jar $YUI ./public/css/fitspector.css -o ./public/css/fitspector.min.css

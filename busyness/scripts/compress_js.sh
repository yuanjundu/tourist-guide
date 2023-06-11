#! /bin/bash

JS_PATH=/home/aka/app/busyness/webapp/static/js/
JS_PATH_DIST=${JS_PATH}dist/
JS_PATH_SRC=${JS_PATH}src/

find $JS_PATH_SRC -type f -name '*.js' |sort |xargs cat > ${JS_PATH_DIST}webapp.js

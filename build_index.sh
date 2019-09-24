#!/bin/sh
/bin/rm index.html
/bin/rm -rf assets
bundle exec jekyll build
mv _site/index.html .
mv _site/assets .
/bin/rm -rf _site
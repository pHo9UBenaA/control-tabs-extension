#!/bin/zsh

# ja en
locales=(bg cs da de es fr hr hu it lt nb nl nn no pl pt ro ru sk sv uk zh_CN)

for locale in $locales; do
print "create $locale"
    cp -rf "src/merge-window/assets/_locales/en" "src/merge-window/assets/_locales/$locale"
done
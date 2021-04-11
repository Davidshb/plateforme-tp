#!/bin/zsh
if [ -z "$1" ]; then
    echo "il n'y a pas de variable utilisation : npm run sc <script js>"
    exit 0
fi

node "./bin/$1.js" "$2"

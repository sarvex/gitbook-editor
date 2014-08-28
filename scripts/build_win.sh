#!/bin/bash

SOURCE=appbuilds/releases/GitBook/win/
TITLE=GitBook
OUTPUT=appbuilds/releases/gitbook-win.zip

echo "Building Windows Release ZIP file: $OUTPUT"

cd ${SOURCE} && zip -ru ../../gitbook-win.zip ./*
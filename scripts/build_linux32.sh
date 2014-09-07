#!/bin/bash

SOURCE=appbuilds/releases/GitBook/
OUTPUT=appbuilds/releases/gitbook-linux32.tar.gz

echo "Building Linux Tar: $OUTPUT"
tar -zcvf $OUTPUT -C ${SOURCE} linux32
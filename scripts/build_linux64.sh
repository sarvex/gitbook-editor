#!/bin/bash

SOURCE=appbuilds/releases/GitBook/
OUTPUT=appbuilds/releases/gitbook-linux64.tar.gz

echo "Building Linux Tar: $OUTPUT"
tar -zcvf $OUTPUT -C ${SOURCE} linux64

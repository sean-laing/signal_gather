#!/bin/bash

set -e

awk 'seen[$2]++{if(seen[$2]==2){ print $2 }}' ./data/data.tsv |
node transpose_fields.js  ./data/data.tsv > ./data/training_raw.tsv

cat ./data/training_raw.tsv | 
cut -f `node remove_sparse.js ./data/training_raw.tsv` > ./data/_training.tsv

cat columns.tsv ./data/_training.tsv > ./data/training.tsv

awk 'seen[$2]++{if(seen[$2]==2){ print $2 }}' ./data/data.tsv |
node transpose_fields.js ./data/validate_raw.tsv > ./data/validate_transposed.tsv

cat ./data/validate_transposed.tsv | 
cut -f `node remove_sparse.js ./data/training_raw.tsv` > ./data/_validate.tsv
cat columns.tsv ./data/_validate.tsv > ./data/validate.tsv


cd data && cat rfc.R | R --no-save
cd ../

tail -n +2 ./data/predict.tsv | node create_html.js 3 `wc -l data/predict.tsv | awk 'NR==1{print $1}'` > predict.html


#!/bin/bash

rm ./data/training_data_raw.tsv

set -e
echo $@

for var in "$@"
do
    echo $var
    cat $var >> ./data/training_data_raw.tsv
done

awk 'seen[$2]++{if(seen[$2]==2){ print $2 }}' ./data/training_data_raw.tsv |
node transpose_fields.js ./data/training_data_raw.tsv > ./data/training_data_transposed.tsv

cat ./data/training_data_transposed.tsv | 
cut -f `node remove_sparse.js ./data/training_data_transposed.tsv --columnHeader columns.tsv` > ./data/training_data_clean.tsv

cat columns.tsv ./data/training_data_clean.tsv > ./data/training_data.tsv

./train_and_predict.R south north
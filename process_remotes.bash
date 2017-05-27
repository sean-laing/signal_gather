#!/bin/bash

while(true); do ##begin of infinite loop

rm ./data/training_data_raw.tsv

echo $@
##TODO: real parameter parsing
##TODO: remove hard-coded paths
##Take the last trailing 30 minutes of observations from north and south
ls ./remote_data/south | tr ' ' '/n' | tail -n 30 | xargs -I % cat ./remote_data/south/% > ./data/training_data_raw.tsv
ls ./remote_data/north | tr ' ' '/n' | tail -n 30 | xargs -I % cat ./remote_data/north/% >> ./data/training_data_raw.tsv
ls ./remote_data/rumba | tr ' ' '/n' | tail -n 1 | xargs -I %  cat ./remote_data/rumba/% > ./data/rumba_raw.tsv

#awk gets the unique mac address in the training data and pipes it into
#the transpose function - this is used to pivot the row rssi to a mac address column,
#these transposed rows are sent to stdout 
awk 'seen[$2]++{if(seen[$2]==2){ print $2 }}' ./data/training_data_raw.tsv |
node transpose_fields.js ./data/training_data_raw.tsv > ./data/training_data_transposed.tsv

#we make transpose_fields.js ignore columns not found in the column map
#reuses function to process the rumba data
awk 'seen[$2]++{if(seen[$2]==2){ print $2 }}' ./data/training_data_raw.tsv |
node transpose_fields.js ./data/rumba_raw.tsv > ./data/rumba_transposed.tsv

cat ./data/training_data_transposed.tsv | 
cut -f `node remove_sparse.js ./data/training_data_transposed.tsv --columnHeader columns.tsv` > ./data/training_data_clean.tsv

cat ./data/rumba_transposed.tsv | 
cut -f `node remove_sparse.js ./data/training_data_transposed.tsv --noLocation --columnHeader rumba_columns.tsv` > ./data/rumba_data_clean.tsv


cat columns.tsv ./data/training_data_clean.tsv > ./data/training_data.tsv
cat rumba_columns.tsv ./data/rumba_data_clean.tsv > ./data/rumba_data.tsv

./train_and_predict.R ##TODO: take parameters for supporting more than north and south as hard coded area classes

sleep 5

done ##end of infinite loop
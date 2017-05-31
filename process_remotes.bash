#!/bin/bash

rm ./data/rumba_predicition.tsv

while(true); do ##begin of infinite loop

rm ./data/training_data_raw.tsv

echo $@
##TODO: real parameter parsing
##TODO: remove hard-coded paths
##Take the last trailing 60 minutes of observations from north and south
ls ./remote_data/south | tr ' ' '/n' | tail -n 60 | xargs -I % cat ./remote_data/south/% > ./data/training_data_raw.tsv
ls ./remote_data/north | tr ' ' '/n' | tail -n 60 | xargs -I % cat ./remote_data/north/% >> ./data/training_data_raw.tsv
##Only take the last 1 minute of data from the rumba
##Change to N to get predictions for the last N minutes
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

#remove columns that don't have many data points
#remove_sparse.js generates a a set of columns to feed the cut command
cat ./data/training_data_transposed.tsv | 
cut -f `node remove_sparse.js ./data/training_data_transposed.tsv --columnHeader columns.tsv` > ./data/training_data_clean.tsv

#same, but avoid generating the location header
cat ./data/rumba_transposed.tsv | 
cut -f `node remove_sparse.js ./data/training_data_transposed.tsv --noLocation --columnHeader rumba_columns.tsv` > ./data/rumba_data_clean.tsv

#put column headers on everything for R
cat columns.tsv ./data/training_data_clean.tsv > ./data/training_data.tsv
cat rumba_columns.tsv ./data/rumba_data_clean.tsv > ./data/rumba_data.tsv

./train_and_predict.R ##TODO: take parameters for supporting more than north and south as hard coded area classes
./train_and_test.R
#render a animation of all the predicted frames
cat data/rumba_predicition.tsv | node create_html.js `wc -l data/rumba_predicition.tsv` > rumba.html

#new data is only present every 60s
sleep 60

done ##end of infinite loop

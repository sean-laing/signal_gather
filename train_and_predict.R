#!/usr/local/bin/Rscript

locations = commandArgs(trailingOnly=TRUE)

#some basic eval code, taken from Pratical Data Science with R
loglikelihood <- function(y, py) { 
  pysmooth <- ifelse(py==0, 1e-12,
                  ifelse(py==1, 1-1e-12, py))

  sum(y * log(pysmooth) + (1-y)*log(1 - pysmooth))
}

#some basic eval code, taken from Pratical Data Science with R
#modifed to return precision and recall, along with f1, and accuracy
accuracyMeasures <- function(pred, truth, name="model") {  
  dev.norm <- -2*loglikelihood(as.numeric(truth), pred)/length(pred)    
  ctable <- table(truth=truth,pred=(pred>0.5))  
  accuracy <- sum(diag(ctable))/sum(ctable)
  precision <- ctable[2,2]/sum(ctable[,2])
  recall <- ctable[2,2]/sum(ctable[2,])
  f1 <- 2*precision*recall/(precision+recall)
  data.frame(model=name, accuracy=accuracy, f1=f1, dev.norm=dev.norm, precision=precision, recall=recall)
}

#load the sensor sensor_data that has know placements to train our model
sensor_data <- read.table('./data/training_data.tsv', header=T, sep='\t')
#set any missing fields to -200 rssi
#-200 is 2x minimum rssi
sensor_data[is.na(sensor_data)] <- -200
#split into training and test set
#will use the test sets to get accuracy information

#for each row (dim(sensor_data)[1]) set rowgroup to random number
#from uniform distribution 
sensor_data$rowgroup <- runif(dim(sensor_data)[1])
training <- subset(sensor_data, sensor_data$rowgroup > .2)
test <- subset(sensor_data, sensor_data$rowgroup <= .2)

#split out the vars we want to train on
training_columns <- setdiff(colnames(sensor_data), list('rowgroup', 'location'))

#load random forest classifier
library(randomForest)
#use default number of trees and node size for now
#TODO, create an iterative model that finding the 'best' tree
model <- randomForest(x=training[,training_columns],
                      y=training$location,
                      importance=T)
#log the importance of each field for visual inspection
importance(model)

#predict the test data, and check for accuracy of each column
test_prediction <- predict(model, 
                           newdata=test[,training_columns], 
                           type='prob')
write.table(test_prediction,'./data/test_prediction.tsv', sep='\t', col.names = T, row.names = F);
accuracyMeasures(test_prediction[,"north"],test$location=="north","north")
accuracyMeasures(test_prediction[,"south"],test$location=="south","south")





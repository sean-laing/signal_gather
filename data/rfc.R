data <- read.table('training.tsv', header=T, sep='\t')
summary(data)
data[is.na(data)] <- -200
data$rg <- runif(dim(data)[1])
train <- subset(data,data$rg>.1)
test <- subset(data,data$rg<=.1)
vars <- setdiff(colnames(data),list('rg','location'))
vars
library(randomForest)
fmodel <- randomForest(x=train[,vars], y=train$location, ntree=100, nodesize=30, importance=T)

loglikelihood <- function(y, py) { 
  pysmooth <- ifelse(py==0, 1e-12,
                  ifelse(py==1, 1-1e-12, py))

  sum(y * log(pysmooth) + (1-y)*log(1 - pysmooth))
}

accuracyMeasures <- function(pred, truth, name="model") {  
  dev.norm <- -2*loglikelihood(as.numeric(truth), pred)/length(pred)  	
  ctable <- table(truth=truth,pred=(pred>0.5))                                    	
  accuracy <- sum(diag(ctable))/sum(ctable)
  precision <- ctable[2,2]/sum(ctable[,2])
  recall <- ctable[2,2]/sum(ctable[2,])
  f1 <- 2*precision*recall/(precision+recall)
  data.frame(model=name, accuracy=accuracy, f1=f1, dev.norm)
}

p <- predict(fmodel,newdata=train[,vars],type='prob')
summary(p)
accuracyMeasures(p[,'center'],train$location=="center")
accuracyMeasures(p[,'north'],train$location=="north")
accuracyMeasures(p[,'south'],train$location=="south")

p <- predict(fmodel,newdata=test[,vars],type='prob')
summary(p)
accuracyMeasures(p[,'center'],test$location=="center")
accuracyMeasures(p[,'north'],test$location=="north")
accuracyMeasures(p[,'south'],test$location=="south")

v <- read.table('validate.tsv', header=T, sep='\t')
v[is.na(v)] <- -200
summary(v)
p <- predict(fmodel,newdata=v[,vars],type='prob')
summary(p)

accuracyMeasures(p[,'south'],v$location=="south")

importance(fmodel)

output_frame <- data.frame(
  north = as.vector(smooth(p[,'north'])),
  center = as.vector(smooth(p[,'center'])),
  south = as.vector(smooth(p[,'south']))
)

write.table(output_frame,'predict.tsv',sep='\t', col.names = T, row.names = F)




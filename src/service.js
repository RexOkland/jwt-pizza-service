const express = require('express');
const { authRouter, setAuthUser } = require('./routes/authRouter.js');
const orderRouter = require('./routes/orderRouter.js');
const franchiseRouter = require('./routes/franchiseRouter.js');
const version = require('./version.json');
const config = require('./config.js');

//METRICS FOR GRAFANA//
const metrics = require('./metrics.js');

const app = express();
app.use(express.json());
app.use(setAuthUser);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

//req 1//
app.use((req, res, next) => {
  console.log("METHOD = " + req.method)
  console.log("BODY = " + JSON.stringify(req.body))
  //req 6 - start timer//
  const startTime = Date.now()
  
  if(req.method == 'POST'){metrics.incrementPostRequests()}
  else if(req.method == 'GET'){metrics.incrementGetRequests()}
  else if(req.method == 'DELETE'){metrics.incrementDeleteRequests()}
  else if(req.method == 'PUT'){console.log("we got a put request!"); metrics.incrementPutRequests()}

  //req 6 - end timer//
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    metrics.setRequestLatency(duration)
    console.log("- request latency = " + duration)
  });
  


  next();
});

const apiRouter = express.Router();
app.use('/api', apiRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/order', orderRouter);
apiRouter.use('/franchise', franchiseRouter);

apiRouter.use('/docs', (req, res) => {
  res.json({
    version: version.version,
    endpoints: [...authRouter.endpoints, ...orderRouter.endpoints, ...franchiseRouter.endpoints],
    config: { factory: config.factory.url, db: config.db.connection.host },
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'welcome to JWT Pizza',
    version: version.version,
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    message: 'unknown endpoint',
  });
});

// Default error handler for all exceptions and errors.
app.use((err, req, res, next) => {
  res.status(err.statusCode ?? 500).json({ message: err.message, stack: err.stack });
  next();
});

module.exports = app;

const config = require('./grafanaConfig.json');

class Metrics {
  constructor() {
    //1st req//
    this.totalRequests = 0;
    this.getRequests = 0;
    this.postRequests = 0;
    this.deleteRequests = 0;

    //2nd req//
    this.activeUsers = 0;

    //3rd req//
    this.authenticationAttempts = 0;
    this.passedAuth = 0;
    this.failedAuth = 0;

    //4th req// CPU


    //5th req//
    this.pizzasSold = 0;
    this.pizzasCreated = 0;
    this.revenueDone = 0;

    //6th req// LATENCY


    // This will periodically sent metrics to Grafana
    const timer = setInterval(() => {
        //1st req//
        this.sendMetricToGrafana('request', 'all', 'total', this.totalRequests);
        this.sendMetricToGrafana('request', 'all', 'get', this.getRequests);
        this.sendMetricToGrafana('request', 'all', 'post', this.postRequests);
        this.sendMetricToGrafana('request', 'all', 'delete', this.deleteRequests);

        //2nd req//


        //3rd req//
        this.sendMetricToGrafana('request', 'all', 'authentication_attempt', this.authenticationAttempts);
        this.sendMetricToGrafana('request', 'all', 'passed_auth_attempt', this.passedAuth);
        this.sendMetricToGrafana('request', 'all', 'failed_auth_attempts', this.failedAuth);
        
    }, 10000);
    timer.unref();
  }

  //2nd req - keep track of active users//
  incrementActiveUsers(){this.activeUsers++}
  decrementActiveUsers(){this.activeUsers--}

  //3rd req - passed/failed auth attempts//
  incrementPassedAuthAttempts(){
    this.authenticationAttempts++
    this.passedAuth++
  }
  incrementFailedAuthAttempts(){
    this.authenticationAttempts++
    this.failedAuth++
  }
  
  //1st req - post/get/delete and such//
  incrementGetRequests(){
    this.totalRequests++
    this.getRequests++
  }
  incrementPostRequests() {
    this.totalRequests++
    this.postRequests++
  }
  incrementDeleteRequests(){
    this.totalRequests++
    this.deleteRequests++
  }


  sendMetricToGrafana(metricPrefix, httpMethod, metricName, metricValue) {
    const metric = `${metricPrefix},source=${config.source},method=${httpMethod} ${metricName}=${metricValue}`;

    fetch(`${config.url}`, {
      method: 'post',
      body: metric,
      headers: { Authorization: `Bearer ${config.userId}:${config.apiKey}` },
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Failed to push metrics data to Grafana');
        } else {
          console.log(`Pushed ${metric}`);
        }
      })
      .catch((error) => {
        console.error('Error pushing metrics:', error);
      });
  }

}

const metrics = new Metrics();
module.exports = metrics;

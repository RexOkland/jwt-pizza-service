const config = require('./config.json');
const os = require('os');

class Metrics { 
  constructor() {
    //1st req//
    this.totalRequests = 0;
    this.getRequests = 0;
    this.postRequests = 0;
    this.deleteRequests = 0;
    this.putRequests = 0;

    //2nd req//
    this.activeUsers = 0;

    //3rd req//
    this.authenticationAttempts = 0;
    this.passedAuth = 0;
    this.failedAuth = 0;

    //4th req// CPU
    //no private variables here

    //5th req//
    this.pizzasSold = 0;
    this.failedPizzas = 0;
    this.pizzasCreated = 0;
    this.revenueDone = 0;

    //6th req// LATENCY
    this.requestLatency = 0;
    this.pizzaLatency = 0;


    // This will periodically sent metrics to Grafana
    const timer = setInterval(() => {
        //1st req//
        this.sendMetricToGrafana('request', 'TOTAL', 'total', this.totalRequests);
        this.sendMetricToGrafana('request', 'GET', 'get', this.getRequests);
        this.sendMetricToGrafana('request', 'POST', 'post', this.postRequests);
        this.sendMetricToGrafana('request', 'DELETE', 'delete', this.deleteRequests);
        this.sendMetricToGrafana('request', 'PUT', 'put', this.putRequests);

        //2nd req//
        this.sendMetricToGrafana('count', "Active_Users", 'active_users', this.activeUsers);

        //3rd req//
        this.sendMetricToGrafana('request', "Total_Authentication_Attempts", 'authentication_attempt', this.authenticationAttempts);
        this.sendMetricToGrafana('request', "Successful_Authentication_Attempts", 'passed_auth_attempt', this.passedAuth);
        this.sendMetricToGrafana('request', "Failed_Authentication_Attempts", 'failed_auth_attempts', this.failedAuth);

        //4th req//
        this.sendMetricToGrafana('percent', "CPU_Usage", 'CPU', this.getCpuUsagePercentage()) //running function, sending results//
        console.log("CPU = " + this.getCpuUsagePercentage()); //printing this too//

        this.sendMetricToGrafana('percent', "Memory_Usage", 'Memory_Usage', this.getMemoryUsagePercentage()) //running function, sending results//
        console.log("Memory Usage % = " + this.getMemoryUsagePercentage()) //printing this too//

        //5th req//
        this.sendMetricToGrafana('sum', 'Pizzas_Sold', 'Pizzas_Sold', this.pizzasSold);
        this.sendMetricToGrafana('sum', 'Pizzas_Failed', 'Pizzas_Failed', this.failedPizzas);
        this.sendMetricToGrafana('sum', 'Total_Revenue', 'Total_Revenue', this.revenueDone);

        //6th req//
        this.sendMetricToGrafana('value', 'Request_Latency', 'Request_Latency', this.requestLatency);
        this.sendMetricToGrafana('value', 'Pizza_Latency', 'Pizza_Latency', this.pizzaLatency);

        
    }, 10000);
    timer.unref();
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
  incrementPutRequests(){
    this.totalRequests++
    this.putRequests++
  }

  //2nd req - keep track of active users//
  incrementActiveUsers(){this.activeUsers++}
  decrementActiveUsers(){
    if(this.activeUsers <= 0){
      this.activeUsers = 0;
    }
    else{
      this.activeUsers--
    }
  }

  //3rd req - passed/failed auth attempts//
  incrementPassedAuthAttempts(){
    this.authenticationAttempts++
    this.passedAuth++
  }
  incrementFailedAuthAttempts(){
    this.authenticationAttempts++
    this.failedAuth++
  }

  // 4th req - LATENCY / METRICS from instructions //
  getCpuUsagePercentage() {
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    return cpuUsage.toFixed(2) * 100;
  }

  getMemoryUsagePercentage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    return memoryUsage.toFixed(2);
  }

  // 5th req - sales stats//
  incrementPizzasMade(){++this.pizzasCreated}
  incrementPizzasSold(newPizzas){
    this.pizzasSold += newPizzas
  }
  incrementPizzasFailed(pizzas){
    this.failedPizzas += pizzas
  }
  addToTotalRevenue(sale){
    this.revenueDone += sale
  }

  //6th req - timer values//
  setPizzaLatency(value){
    this.pizzaLatency = value
  }
  setRequestLatency(value){
    this.requestLatency = value
  }


  sendMetricToGrafana(metricPrefix, httpMethod, metricName, metricValue) {
    const metric = `${metricPrefix},source=${config.metrics.source},method=${httpMethod} ${metricName}=${metricValue}`;

    fetch(`${config.url}`, {
      method: 'post',
      body: metric,
      headers: { Authorization: `Bearer ${config.metrics.userId}:${config.metrics.apiKey}` },
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Failed to push metrics data to Grafana');
        } else {
          //console.log(`Pushed ${metric}`);
        }
      })
      .catch((error) => {
        console.error('Error pushing metrics:', error);
      });
  }

  getTotalRequests() {
      return "Total requests = " + this.totalRequests;
  }

  getGetRequests() {
      return "GET requests = " + this.getRequests;
  }

  getPostRequests() {
      return "POST requests = " + this.postRequests;
  }

  getDeleteRequests() {
      return "DELETE requests = " + this.deleteRequests;
  }

  // Getter for active users
  getActiveUsers() {
      return "Active users = " + this.activeUsers;
  }

  // Getters for authentication stats
  getAuthenticationAttempts() {
      return "Authentication attempts = " + this.authenticationAttempts;
  }

  getPassedAuth() {
      return "Passed auth attempts = " + this.passedAuth;
  }

  getFailedAuth() {
      return "Failed auth attempts = " + this.failedAuth;
  }

  getTotalRevenue() {
    return "TOTAL REVENUE = " + this.revenueDone
  }

  getFailedPizzas(){
    return "FAILED PIZZAS = " + this.failedPizzas
  }

  getSoldPizzas(){
    return "SOLD PIZZAS = " + this.pizzasSold
  }
}

const metrics = new Metrics();
module.exports = metrics;

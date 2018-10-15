const express = require('express');
const http = require("http");
const socketIo = require("socket.io");
const monitor = require("os-monitor");
const os = require("os");
const Queue = require("./queue");
const createAlert = require('./alert');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const loadDataLog = new Queue();
const memDataLog = new Queue();
const alertData = []; // store
let prevAlert = null; // save the alerts to emit to client

const MAX_DELTA_TIME = monitor.minutes(10);
const LOAD_AVG_CHECK_INTERVAL = monitor.minutes(0.2);

const NUM_CPUS = os.cpus().length;
const PER_CPU_LOAD_THRESHOLD = 2;
const LOAD_ALERT_THRESHOLD = Math.ceil(NUM_CPUS / PER_CPU_LOAD_THRESHOLD);


// connect to '/public/index.html' as root page
app.use('/', express.static('public'));

//
monitor.on('monitor', function(event) {
  const loadDataPoint = {value: event.loadavg[0], timestamp: Date.now()};
  const memDataPoint = {value: 100 - event.freemem / event.totalmem * 100, timestamp: Date.now()};

  // keep only 10 min worth of data
  loadDataLog.enqueue(loadDataPoint); // store object with {load: --, timestamp: --}
  if (checkFull(loadDataLog.toArray(), MAX_DELTA_TIME)) {
    loadDataLog.dequeue();
  }

  memDataLog.enqueue(memDataPoint);
  if (checkFull(memDataLog.toArray(), MAX_DELTA_TIME)) {
    memDataLog.dequeue();
  }

  // emit alert if 2 min avg goes above threshold
  alertData.push(loadDataPoint);
  if (checkFull(alertData, LOAD_AVG_CHECK_INTERVAL)) {
    const alert = createAlert(alertData, prevAlert, LOAD_ALERT_THRESHOLD);


    if (alert) {
      io.emit('alert', alert);
      prevAlert = alert;
    }

    alertData.length = 0;
  }

  io.emit('load-monitor', loadDataLog.toArray());
  io.emit('mem-monitor', memDataLog.toArray());
});

// check if queue is full for a given interval
const checkFull = (log, timeInterval) => {
  const oldest = log[0].timestamp;
  const newest = log[log.length - 1].timestamp;

  return newest - oldest >= timeInterval;
}

const bytesToMegaBytes = (bytes) => {
  return bytes / Math.pow(10, 6);
}


const isAlertNotNull = alert => {
  // if neither fields are null, alert is not null
  if (alert.value && alert.timestamp) {
    return true;
  }

  return false;
}

// // event handler
// const getLoad = async socket => {
//   try {
//     console.log("emitting");
//     socket.emit("GetLoad", );
//   } catch (error) {
//     console.error(`Error: ${error.code}`);
//   }
// };

// start the os-monitor
monitor.start({
  delay: monitor.seconds(5), // interval between monitor cycles
});

// start the server
const port = 3000;
server.listen(port, () => console.log(`Listening on port ${port}`));

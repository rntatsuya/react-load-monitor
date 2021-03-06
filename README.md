# Machine Load Monitor

An exendable simple React web application that monitors load average and memory usage on your machine in real-time.

## Sample Image 
![SampleImage](/public/img/sampleImage.png)

## Usage
### Clone directory and install node modules:
```
git clone https://github.com/rntatsuya/react-load-monitor.git
cd react-load-monitor
npm install
``` 

### Running the app:
```
npm run start
``` 
Then open http://localhost:3000/.

### Testing the alert logic:
```
npm run test
``` 

## Stack
- node.js
- react
- express
- socket.io
- babel
- webpack
- os-monitor
- os
- d3

## Project Organization
This app uses the React framework for the client-side, and is consisted of three components: App, LineChart, and Alert. The App and LineChart components are considered containers, which is a naming convention in the React community for components that modify states. The Alert component on the other hand is a stateless component because it just receives data from the App container. 

The App container also listens and receives data emmited from the server, which uses the express library to set up the server and socket.io to emit data to the client-side every 10 seconds. All calculations for creating alerts and modifying the 10 minute historical data is done on the server-side. 

## Assumptions
- The user is using a browser that supports client-side scripting and has scripting enabled (i.e. browser can run javascript files).
- CPU load is measured every 10 seconds by taking the load average of the past minute. This minute tick is the base unit of load used in this project.
- The CPU load threshold of interest is 1 for the 2 minute average. This value is hardcoded into the project as of now, but it is not difficult to make it a variable value determined by user input.
- The historical data stored on the server-side is small enough for it to be feasible to send the entire array to the client-side and update interface in real-time without lagging. Improvement of this part is discussed below.
- Whenever the load for the past 2 minutes exceeds 1 on average, a high-load alert is triggered. 
- When the load average drops below 1 on average for the past 2 minutes following a high-load alert, a recovery alert is triggered. 

## Parts that can be improved
- For this project, I only needed to store 60 objects in the historical data array because the app only displays a 10 minute history with updates every 10 seconds. However, if the number of these objects were to increase exponentially, it may be more reasonable to cache the historical data array on the client-side and move the array update logic to the client-side instead in order to prevent sending the extremely large array over from the server to the clients-side every 10 seconds.  
- Use Redux for state management rather than keeping a local copy of the state in React components. This change can be justified if we assume this project will be extended, but is rather unnecessary when the number of states to store is so few. 
- In exchange for code complexity on the client-side, I can prevent data duplication of timestamps between the memory array and the load array which is updated every 10 seconds. 
- Store the data in a database in order to have a historical record that can be used in other applications or purposes. 

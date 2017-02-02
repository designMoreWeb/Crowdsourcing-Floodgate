# Crowd Sourcing Hoboken Flood Data - A Citizen Science Project
[@jeffm24 | ](https://github.com/jeffm24) [@kshah73 | ](https://github.com/kshah73)[@Henry12116 | ](https://github.com/Henry12116)[@nishmeni | ](https://github.com/nishmeni)[@designMoreWeb](https://github.com/designMoreWeb)

Partnered with [Stevens Institute of Technology Davidson Labs.](https://www.stevens.edu/research-entrepreneurship/research-centers-labs/davidson-laboratory)

## Intro:
Storms are becoming stronger and rainfall more intense. Davidson Laboratory forecasts water level all over the New York/New Jersey area with more than 200 in water sensors and a high fidelity hydrodynamic model. Our aim with this project is to create a firm real-time system to alert people in Hoboken of areas being impacted by flooding. We hope to eventually take our work even further so that it can be applied anywhere.

## Technical Plan:
| **Category**                 | **Technology Used**              |
|------------------------------|----------------------------------|
| **Communications**           |                                  |
| Text Chat                    | GroupMe, Slack                   |
| Video/Voice Chat             | Hangouts                         |
| Email                        | Gmail                            |
| **Collaboration**            |                                  |
| File Sharing                 | Google Drive                     |
| Hosted Version Control       | Github                           |
| Task Track/Project Mangement | Trello                           |
| **Web Technologies**         |                                  |
| Frameworks                   | Meteor, Bootstrap, MDL                  |
| Libraries                    | Google Maps API v3 |
| Front-end Languages          | JavaScript/JQuery, HTML, CSS (SCSS)     |
| Back-end Language(s)         | Node.js                          |
| Database                     | MongoDB                          |
| Environment                  | Cross-Platform                   |
| Browsers Supported           | Chrome, IE11+, Safari, Firefox   |

## Instructions to run:

### Step 1
- Download our Stuff!

### Step 2
- Make sure you already have node.js installed on your computer. Check with:
```shell
	$ node -v
```

	- If it is not installed go [here](http://blog.teamtreehouse.com/install-node-js-npm-windows) for windows or type:
```shell
	$ sudo apt-get install python-software-properties
	$ curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
	$ sudo apt-get install nodejs
	$ sudo apt-get update
	$ node -v 
```
	- You should see some version pop up (Hopefully 7.3.0)

### Step 3
- Install and start [RabbitMQ Server (Windows)](http://www.rabbitmq.com/install-debian.html)
```shell
	$ sudo apt-get install python-software-properties
	$ curl -sL https://deb.nodesource/setup_7.x | sudo bash -
	$ sudo apt-get install nodejs
	$ sudo apt-get update
	$ sudo apt-get install rabbitmq-server
	$ sudo invoke-rc.d rabbitmq-server start
```

### Step 4
- Install [Meteor (Windows)](https://www.meteor.com/install) (dont forget to add meteor to PATH in enviornment variables for windows) or enter in terminal:
```shell
	$ curl https://install.meteor.com/ | sh
```

- Navigate to where you have downloaded our code in your terminal or console.
```shell
	$ cd /your/path/to/flud/meteor-app/flud
```
### Step 5
- Run 'meteor npm install' and 'npm start' in /meteor-app/flud/ to start the main server

#### For Ubuntu/Debian
```shell
	~/flud/meteor-app/flud$ meteor npm install
	~/flud/meteor-app/flud$ npm start
```

#### For Windows
```shell
	> meteor npm install
	> set MONGO_URL = mongodb://localhost:27017/flud
	> meteor run --settings ./settings.json

### Step 6
- cd into the /worker/ directory and start the service worker
```shell
	$ cd your/path/to/flud/worker
	~/flud/worker$ npm start
```
### Step 7 (last step woohoo)
- Type localhost:3000 in your browser URL

## Current Screenshots
![alt tag](https://github.com/jeffm24/flUd/blob/polylines/Current/Current%20Map%20View.PNG)
 - Our main view. Search locations, view and add data, plus more!





![alt tag](https://github.com/jeffm24/flUd/blob/polylines/Current/Current%20Sidebar%20View.PNG)
 - The navigation bar. Toggle the timeline, filter data, select favorite locations, and sign in!
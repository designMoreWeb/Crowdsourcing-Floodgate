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
- Install and start RabbitMQ server
- Install and start MongoDB server
- Run 'meteor npm install' and 'npm start' in /meteor-app/flud/ to start the main server
- Run 'npm install' and 'npm start' in /worker/ to start the worker
- Go to localhost:3000 in your browser

## Current Screenshots
![alt tag](https://github.com/jeffm24/flUd/blob/polylines/Current/Current%20Map%20View.PNG)
 - Our main view. Search locations, view and add data, plus more!





![alt tag](https://github.com/jeffm24/flUd/blob/polylines/Current/Current%20Sidebar%20View.PNG)
 - The navigation bar. Toggle the timeline, filter data, select favorite locations, and sign in!
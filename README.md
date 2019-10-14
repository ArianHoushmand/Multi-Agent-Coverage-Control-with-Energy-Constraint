# Coverage Control with Energy Constraint

This repository contains JavaScript codes for a web-based simulation platform demonstrating distributed coverage control problem. Here we have multiple agents (i.e. robots) that are trying to maximize their probability of detecting random events in an environment using an online distributed algorithm. Each robot only has information about the agents in its sensing range, and based on that information decides where to move. Moreover, each of them has a limited battery and needs to be recharged before it fully depletes. We have a charging station located at the top left corner of the mission space which can only serve one robot at a time. Using a collaborative scheduling algorithm, robots move toward the charging station and get recharged before running out of battery. It is guaranteed that robots never run out of battery in the mission space, and we only have at most one robot at the charging station at a time. 

 

## Usage

Just clone the repository and open the index.html file. You can use this [link](http://www.bu.edu/codes/simulations/Coverage_ADHS/) to see the simulation in action. 

## Simulation Code Architecture

### 1- index.html
 This is the main html file for running the simulation.
### 2- sketch.js
Includes the main canvas for showing the simulation. We are using [p5.js](https://p5js.org/) in this project. 
### 3- particle.js
Includes the particle class which is the associated class to each agent (robot). This class has multiple functions for calculating direction, speed, remaining battery, and the scheduling of agents for reaching to the charging station.
### 4- sensing.js
Includes the codes for calculating the objective function and probability of detecting a random event at any particular location.
### 5- style.css
Includes the css styling codes for the index.html file.

## Related Publications
* Meng, Xiangyu, Arian Houshmand, and Christos G. Cassandras. "[Hybrid system modeling of multi-agent coverage problems with energy depletion and repletion](https://www.sciencedirect.com/science/article/pii/S2405896318311546)." IFAC-PapersOnLine 51, no. 16 (2018): 223-228.
* Meng, Xiangyu, Arian Houshmand, and Christos G. Cassandras. "[Multi-Agent Coverage Control with Energy Depletion and Repletion](https://ieeexplore.ieee.org/abstract/document/8619594)." In 2018 IEEE Conference on Decision and Control (CDC), pp. 2101-2106. IEEE, 2018.


## Please Cite us
We provide this program in the hope that it may be useful to others, and we would very much like to hear about your experience with it. 

Since a lot of time and effort has been put into development of this software, please cite the following publication if you are using it for your own research:

* Meng, Xiangyu, Arian Houshmand, and Christos G. Cassandras. "[Multi-Agent Coverage Control with Energy Depletion and Repletion](https://ieeexplore.ieee.org/abstract/document/8619594)." In 2018 IEEE Conference on Decision and Control (CDC), pp. 2101-2106. IEEE, 2018.

## License
[MIT](https://choosealicense.com/licenses/mit/)
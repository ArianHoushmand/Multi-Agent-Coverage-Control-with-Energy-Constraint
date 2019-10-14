function Particle(x, y) {


    this.x = x;
    this.y = y;
    this.id;
    this.q = 1;;// Agent's battery level (SOC)
    var r = 12; //radius of the particle's circle
    this.mode = 1;
    this.time = 0;//universal time
    this.requestTime;//time that the agent changes to mode 2
    this.reachTime; //time that the agent reaches the battery station using max speed
    this.speedMode2;
    this.distance = NaN;
    this.T1 = NaN;
    this.T2 = NaN;
    this.T3 = NaN;
    this.SDFpositionX = NaN;//X of the agent from charging sttion in the SDF scheduling when the closer agent goes to mode 2
    this.SDFpositionY = NaN;//Y of the agent from charging sttion in the SDF scheduling when the closer agent goes to mode 2
    this.SDFtime = NaN;
    this.SDFRequestTime = NaN;
    this.SDFreachTime = NaN;
    this.speed = linSpeed;

    //    Choosing the initial value of the battery
    var batteryOption = document.getElementById("InitialBattery").value;
    if (batteryOption == "1"){
        this.q = Math.random();
    }
    else if(batteryOption == "2"){
        this.q = 1;
    }
    else if(batteryOption == "3") {
        this.q = 1- 0.05*particles.length;
    }



    this.update = function(particleNum) {
        this.id = particleNum;
        var v = [];
        v = this.speedCal();
        this.q += this.batteryCal();



        //////////////////////////////////////////////////////////////
        //here we change the mode
        if(this.q < linSpeed * Alpha *sqrt(sq(this.x) + sq(this.y)) && this.mode == 1){
            this.mode=2;

            this.requestTime = this.time;//setting the request time to go to mode 2
            this.SDFRequestT = this.time;
            this.reachTime = sqrt(sq(this.x) + sq(this.y)) / linSpeed + this.time;// time it take to reach the battery station at max speed
            this.distance = sqrt(sq(this.x) + sq(this.y));
            FCFCQueue.push(this.id);//add the agent ID number to the FCFC Queue
            SDFQueue.push({'ID': this.id, 'Distance': this.distance});
            mode2Agents.push(this.id);//add the agent ID number to the array of mode 2 agents

            for (var j = 0; j < mode2Agents.length; j += 1){
                particles[mode2Agents[j]].SDFpositionX = particles[mode2Agents[j]].x;
                particles[mode2Agents[j]].SDFpositionY = particles[mode2Agents[j]].y;
                SDFQueue[j].Distance = sqrt(sq(particles[SDFQueue[j].ID].SDFpositionX) + sq(particles[SDFQueue[j].ID].SDFpositionY));
                particles[mode2Agents[j]].SDFRequestTime = this.time;
                particles[mode2Agents[j]].SDFreachTime = sqrt(sq(particles[mode2Agents[j]].x) + sq(particles[mode2Agents[j]].y)) / linSpeed + this.time;// time it take to reach the battery station at max speed


            }
            this.Mode2speedFun();


        }
        else if ((this.x<r/3 ) && ( this.y<r/3) && this.q<theta  && this.mode==2){
            this.mode=3;
            mode2Agents.splice(0,1); //removing the first agent that requested to mode 2 from the queue
            SDFQueue.splice(0,1);//removing the first agent that requested to mode 2 from the queue
            mode3ExitTime.push((this.time+theta/(particles.length*Alpha*sq(linSpeed))));
        }
        else if ((this.x<r/3 ) && ( this.y<r/3) && this.q >= theta  && this.mode == 3){
            this.mode=1;
            mode3ExitTime.splice(0,1);
        }


        //////////////////////////////////////////////////////
        //finding the speed at each mode

        switch (this.mode){

            case 1:
                this.x += hStep*linSpeed*v[0];
                this.y += hStep*linSpeed*v[1];
                this.speed=linSpeed;
                break;
            case 2:
                if(pauseVal==0){
                    this.x -= hStep * this.speedMode2 * (this.x/sqrt(sq(this.x) + sq(this.y)));
                    this.y -= hStep * this.speedMode2 * (this.y/sqrt(sq(this.x) + sq(this.y)));
                    this.speed = this.speedMode2.toFixed(2);
                }
                else{
                    this.x += 0;
                    this.y += 0;
                    this.speed = 0;
                }
                break;
            case 3:
                this.x = 0;
                this.y = 0;
                this.speed = 0;


        }
        if(timeFlag){
            this.time += hStep;
        }

    }

    // this function change the position of the particle to the mouse location if the particle is dragged
    this.clicked = function() {
        var d = dist(mouseX, mouseY, this.x, this.y);
        if (d < r) {
            this.x = mouseX;
            this.y = mouseY;
        }
    }

    this.show = function(particleNum) {
        stroke(255,215,0);
        strokeWeight(2)
        fill(0);
        ellipse(this.x, this.y, 2*r, 2*r);

        strokeWeight(0)
        fill(255,215,0);
        rectMode(CENTER);
        textAlign(CENTER,CENTER);
        textSize(16);
        text(particleNum+1, this.x+2, this.y, 2*r, 2*r);
    }

    this.neighbor = function() {
        var neighbors=[];

        for (var i = 0; i < particles.length; i++) {
            if(i!=this.id){
                if (dist(this.x, this.y ,particles[i].x, particles[i].y) < 2 * senRange){
                    neighbors.push(i);
                }
            }
        }
        return neighbors;
    }

    this.Mode2speedFun = function(){

        var Beta = particles.length * Alpha*sq(linSpeed);//The assumption made in the paper for beta
        var chargeTime = theta / Beta;//time it takes to get fully charged
        if(schedule == 1){
            if(FCFCQueue.length == 1){
                this.speedMode2 = linSpeed;
                this.T1 = this.reachTime + chargeTime;
            }
            else if(FCFCQueue.length > 1){
                var j = FCFCQueue.length - 1;
                this.T3 = this.reachTime;//T3 is the time that 2nd agent can reach the station at the max speed
                this.T2 = this.requestTime;//time when sensor 2 switches to mode 2
                if(particles[FCFCQueue[j-1]].T1 >= this.T3){
                    this.speedMode2 = sqrt(sq(this.x) + sq(this.y)) / (particles[FCFCQueue[j-1]].T1 - this.T2);
                    this.T1 = particles[FCFCQueue[j-1]].T1 + chargeTime;
                }
                else {
                    this.speedMode2 = linSpeed;
                    this.T1 = this.reachTime + chargeTime;
                }
            }

        }
        else{
            //sorting the SDFQueue based on the distance
            SDFQueue.sort(function(a, b) {
                return ((a.Distance < b.Distance) ? -1 : ((a.Distance == b.Distance) ? 0 : 1));
            });
            if(SDFQueue.length==1){
                if(mode3ExitTime.length == 0){
                    particles[SDFQueue[0].ID].speedMode2 = linSpeed;
                    particles[SDFQueue[0].ID].T1 = particles[SDFQueue[0].ID].SDFreachTime + chargeTime;
                }
                else{
                    if(mode3ExitTime[0] >= particles[SDFQueue[0].ID].SDFreachTime){
                        particles[SDFQueue[0].ID].speedMode2 = sqrt(sq(particles[SDFQueue[0].ID].SDFpositionX) +
                            sq(particles[SDFQueue[0].ID].SDFpositionY)) /
                            (mode3ExitTime[0]-particles[SDFQueue[0].ID].time);
                        particles[SDFQueue[0].ID].T1 = mode3ExitTime[0] + chargeTime;
                    }
                    else{
                        particles[SDFQueue[0].ID].speedMode2 = linSpeed;
                        particles[SDFQueue[0].ID].T1 = particles[SDFQueue[0].ID].SDFreachTime + chargeTime;

                    }


                }
            }
            else{
                if(mode3ExitTime.length == 0){
                    particles[SDFQueue[0].ID].speedMode2 = linSpeed;
                    particles[SDFQueue[0].ID].T1 = particles[SDFQueue[0].ID].SDFreachTime + chargeTime;
                }
                else{
                    if(mode3ExitTime[0] >= particles[SDFQueue[0].ID].SDFreachTime){
                        particles[SDFQueue[0].ID].speedMode2 = sqrt(sq(particles[SDFQueue[0].ID].SDFpositionX) +
                            sq(particles[SDFQueue[0].ID].SDFpositionY)) /
                            (mode3ExitTime[0] - particles[SDFQueue[0].ID].time);
                        particles[SDFQueue[0].ID].T1 = mode3ExitTime[0] + chargeTime;
                    }
                    else{
                        particles[SDFQueue[0].ID].speedMode2 = linSpeed;
                        particles[SDFQueue[0].ID].T1 = particles[SDFQueue[0].ID].SDFreachTime + chargeTime;
                    }

                }

                for (var i = 1; i<SDFQueue.length; i += 1){
                    particles[SDFQueue[i].ID].T3 = particles[SDFQueue[i].ID].SDFreachTime;//T3 is the time that 2nd agent can reach the station at the max speed
                    particles[SDFQueue[i].ID].T2 = particles[SDFQueue[i].ID].SDFRequestTime;//time when sensor 2 switches to mode 2
                    if(particles[SDFQueue[i-1].ID].T1 >= particles[SDFQueue[i].ID].T3){
                        particles[SDFQueue[i].ID].speedMode2 = sqrt(sq(particles[SDFQueue[i].ID].SDFpositionX) +
                            sq(particles[SDFQueue[i].ID].SDFpositionY)) / (particles[SDFQueue[i-1].ID].T1 - particles[SDFQueue[i].ID].T2);
                        particles[SDFQueue[i].ID].T1 = particles[SDFQueue[i-1].ID].T1 + chargeTime;


                    }
                    else {
                        particles[SDFQueue[i].ID].speedMode2 = linSpeed;
                        particles[SDFQueue[i].ID].T1 = particles[SDFQueue[i].ID].SDFreachTime + chargeTime;
                    }
                }
            }

        }



    }

    ////////////////////////Speed Function/////////
    // This function calculates the speed on x axis
    this.speedCal = function(){
    var v = [];
    var der = this.dHdxdy();

    var dHdx = der[0];
    var dHdy = der[1];
    //we do this to prevent having NaN values (zero in denumirator)
    if (sq(dHdx) + sq(dHdy) < 0.00001){
        v[0] = 0;
        v[1] = 0;
    }
    else{
        v[0] = dHdx / sqrt(sq(dHdx) + sq(dHdy));
        v[1] = dHdy / sqrt(sq(dHdx) + sq(dHdy));
    }

    v[2] = this.x;
    v[3]= this.y;

    return v;

}
///////////////////////////////////////////////
this.Hxy = function(x, y){
//function Hxy (x,y,ID){
    var outFun = [];
    var sum = 1;
    var multip = 1;
    if(particles.length == 1){
        sum = 1;
        multip = 1;
    }
    else{

        var neighborAgents = this.neighbor();
        for (var ii = 0; ii < neighborAgents.length; ii++){
            multip = multip * (1 - pointSen(particles[neighborAgents[ii]].x, particles[neighborAgents[ii]].y, x, y, senRange));

        }
    }
    outFun[0] = 2 * (x - this.x) / sq(senRange) * multip;//Hx
    outFun[1] = 2 * (y - this.y) / sq(senRange) * multip;//Hy
    outFun[2] = multip;

    return outFun;
}
////////////////////////
this.dHdxdy = function() {
//function dHdxdy(ID){
    //    var stepsize=senRange/80;
    var stepsize=10;
    //    var stepsize=5;
    var velocity=[];
    var objetiveDerX=0;
    var objetiveDerY=0
    var objective=0;
    var xStart=0;
    var xEnd=0;
    var yStart=0;
    var yEnd=0;

    if (this.x - senRange<=0){
        xStart = 0;
    }
    else {
        xStart = this.x - senRange ;
    }
    if(this.x + senRange >= width){
        xEnd = width;
    }
    else{
        xEnd = this.x + senRange ;
    }

    if (this.y - senRange <=0){
        yStart = 0;
    }
    else {
        yStart = this.y - senRange
    }
    if(this.y + senRange >= height){
        yEnd = height;
    }
    else{
        yEnd = this.y + senRange ;
    }

    for (var x = xStart + 0.5 * stepsize; x <= xEnd - 0.5 * stepsize; x += stepsize){
        for(var y = yStart + 0.5 * stepsize; y <= yEnd - 0.5 * stepsize; y += stepsize){
            if(dist(x, y, this.x, this.y) <= senRange){
                objetiveDerX += sq(stepsize) * this.Hxy(x,y)[0];
                objetiveDerY += sq(stepsize) * this.Hxy(x,y)[1];
            }
        }
    }

    velocity[0] = int(10 * objetiveDerX);
    velocity[1] = int(10 * objetiveDerY);

    return velocity;
}

//This function calculates the remaining battery in different situations for each agent
this.batteryCal = function(){
    //    Due to the numerical errors, we set the position of the charging station as

    if ((this.x < r/3) && (this.y < r/3) &&  this.mode == 3 && this.q <= 1){
        Beta = particles.length * Alpha * sq(linSpeed);//The assumption made in the paper for beta
        dq = hStep * Beta;

    }
    else{
        dq = -hStep * Alpha * sq(this.speed);
    }


    return dq; //change in the battery level
}



}


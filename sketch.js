var particles = [];

var sensitivity=0.1;

var linSpeed=0;

var linSpeedTemp;

var senRange;

var ObjlDisplay;

var cnv;

var boxDis;

var dropdown;

var hStep=0.5;//stepsize for updating the position

var ItterNum=2//itteration numbers for updating the position

var schedule=1; //value for switching between scheduling algorithms: 1:FCFS and 2:SDF

var Alpha=0.0001; //constant for battery charging

//var Beta=0.05; //constant for battery discharging

var theta=1;//battery thereshold for the agent to go out of the charging station

var r=12; //radius of the particle's circle

var FCFCQueue=[]; //Queue containing the agents in order of their request time to mode 2

var SDFQueue=[]; //Queue containing the agents in order of their request time to mode 2 and their distance to charging station

var mode2Agents=[];//array of agents in mode 2

//values used in scheduling
var T1=[];
var T2=[];
var T3=[];

var speedMode2=[];//speed in mode 2

var pauseVal=0;//this value will become zero if we hit the pause button

var timeFlag=false;

mode3ExitTime=[];


function setup() {


    cnv=createCanvas(600, 500);
    cnv.parent('p5Canvas');
    particles[0]=new Particle(20,20);
    frameRate(24);

    var table = document.getElementById("AgentsTable");
    var row = table.insertRow(-1);
    var AgentID = row.insertCell(0);
    var AgentX = row.insertCell(1);
    var AgentY= row.insertCell(2);
    var AgentSOC= row.insertCell(3);
    var AgentSpeed=row.insertCell(4);
    var AgentMode=row.insertCell(5);
    var AgentTime=row.insertCell(6);
    AgentID.innerHTML = 1;
    AgentX.innerHTML = particles[0].x;
    AgentY.innerHTML = particles[0].y;
    AgentSOC.innerHTML = particles[0].q;
    AgentSpeed.innerHTML = 0;
    AgentMode.innerHTML = particles[0].mode;
    AgentTime.innerHTML = 0;


}



function mySelectEvent() {

    var selected = this.selected();
    if (selected == '1') {
        hStep = 0.5;
        ItterNum = 2;
    }

    if (selected == '2') {
        hStep = 0.1;
        ItterNum = 10;
    }

    if (selected == '3') {

        hStep = 1;
        ItterNum = 1;
    }


}



function mySelectSchedule() {


    var selected=document.getElementById("FCFSScheduling").checked;
    if(selected)
    {
        schedule=1;
    }
    else{
        schedule=2;
    }


}


function start (){
    timeFlag=true;
    linSpeed=parseFloat(linSpeedTemp);
    pauseVal=0;

}



function reset (){

    timeFlag=false;
    linSpeed=0;
    Alpha=0.0001;
    theta=1;
    mode3ExitTime=[];

    for (var i = 0; i < particles.length; i++){

        particles[i].x=20*i+20;
        particles[i].y=20*i+20;
        particles[i].q=1;
        particles[i].mode=1;
        particles[i].time=0;
        particles[i].T2=NaN;
        particles[i].T3=NaN;
        particles[i].distance=NaN;
        particles[i].SDFpositionX=NaN;
        particles[i].SDFpositionY=NaN;
        FCFCQueue=[];
        SDFQueue=[];
        mode2Agents=[];
        pauseVal=0;


    }



}

function stopParticle(){
    linSpeed=0;
    pauseVal=1;
    timeFlag=false;

}




function addAgent(){

    particles.push(new Particle(20*particles.length+20, 20*particles.length+20));
    var table = document.getElementById("AgentsTable");
    var row = table.insertRow(-1);
    var AgentID = row.insertCell(0);
    var AgentX = row.insertCell(1);
    var AgentY= row.insertCell(2);
    var AgentSOC= row.insertCell(3);
    var AgentSpeed=row.insertCell(4);
    var AgentMode=row.insertCell(5);
    var AgentTime=row.insertCell(6);
    AgentID.innerHTML = particles.length;
    AgentX.innerHTML = particles[particles.length-1].x;
    AgentY.innerHTML = particles[particles.length-1].y;
    AgentSOC.innerHTML = particles[particles.length-1].q;
    AgentSpeed.innerHTML = 0;
    AgentMode.innerHTML = particles[particles.length-1].mode;
    AgentTime.innerHTML = particles[particles.length-1].time;

}



function removeAgent(){

    particles.splice(particles.length-1,1);
    document.getElementById("AgentsTable").deleteRow(-1);
}



function mouseDragged() {

    for (var i = 0; i < particles.length; i++) {

        particles[i].clicked();

    }

}


function tableFun() {
    var table = document.getElementById("AgentsTable");
    for (var i = 0; i < particles.length; i++) {
        table.rows[i+1].cells[0].innerHTML=particles[i].id+1;
        table.rows[i+1].cells[1].innerHTML=(particles[i].x/10).toFixed(2);
        table.rows[i+1].cells[2].innerHTML=(particles[i].y/10).toFixed(2);
        table.rows[i+1].cells[3].innerHTML=particles[i].q.toFixed(3);
        table.rows[i+1].cells[4].innerHTML=particles[i].speed;
        table.rows[i+1].cells[5].innerHTML=particles[i].mode;
        table.rows[i+1].cells[6].innerHTML=int(particles[i].time);

    }

}

function alphaGet (){


    AlphaTemp=document.getElementById("alphaInput").value;
    if (AlphaTemp!=""){
        Alpha=parseFloat(AlphaTemp);
    }
}

function thetaGet (){

    thetaTemp=document.getElementById("thetaInput").value;

    if (thetaTemp!=""){
        theta=parseFloat(thetaTemp);

    }

}


function preload() {
    img = loadImage('charging_station.png');
}

function draw() {

    background(255);

    strokeWeight(4);

    noFill();

    rect(0,0,width,height);
    mySelectSchedule();

    tableFun();

    var pixlSize=10;

    if (CoverageDensityCheckBox.checked){
        for (var i=0;i<width;i=i+pixlSize){
            for (var j=0;j<height;j=j+pixlSize){
                probPoint=sensing (i,j,senRange);
                colorMode(RGB, 255, 255, 255, 1);
                noStroke();
                fill(105, 156, 239,probPoint);
                rect(i,j,pixlSize,pixlSize);

            }
        }
    }

    image(img, 0, 0, 40, 40);
    for (var i = 0; i < particles.length; i++) {
        for (var j=0; j<ItterNum ;j++){
            particles[i].update(i);
        }
        particles[i].show(i);
        ObjlDisplay=document.getElementById("ObjectiveDisplay");
        ObjlDisplay.innerHTML=int(objective());


    }
}


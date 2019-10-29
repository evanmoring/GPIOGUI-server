var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var express = require('express');
var Gpio = require('onoff').Gpio;
var fs = require('fs');
var util = require('util');

function saveSettings (){
    fs.writeFile('./settings.json',JSON.stringify(pinList),function(err){
        if (err){
            console.log('error');
            return;
        }
    console.log('saved')   
    })
}

function loadSettings(){
    console.log('load')
    function readSettings(){
        var readData = fs.readFileSync('./settings.json'),
        myObj;
        try {
            myObj = JSON.parse(readData);
            pinList=myObj
            }
        
        catch (err) {
          console.log('There has been an error parsing your JSON.')
          console.log(err);
        }
    
    /*pinList = readSettings()
    console.log(pinList)
    matchPins()*/
    }
    readSettings()
    matchPins()
}

function matchPins(){
    console.log(pinList)
    for (i in pinList){
        let cPin = pinList[i]
        if(cPin != false){
            cPin.inOut = new Gpio(cPin.bcmNumber,cPin.direction,'both',{debounceTimeout: 50});
            if(cPin.blink==true){
                console.log ('pin number' +cPin.bcmNumber)
                changePin(cPin,'out',1,true)
            }
            else{
            changePin(cPin,cPin.direction,cPin.voltage)}
            }
        }
    
    }

var bcmDict = {3:2,5:3,7:4,8:14,10:15,11:17,12:18,13:27,15:22,16:23,18:24,19:10,21:9,22:25,23:11,24:8,26:7,29:5,31:6,32:12,33:13,35:19,36:16,37:26,38:20,40:21};

var bcmDictR = {};
blinkDict = {
}

for (var key in bcmDict){
    bcmDictR[bcmDict[key]]=key;
    blinkDict[bcmDict[key]]=false
};

var pinList =[]
function setupPins(){
    for (i=0; i<28; i++){
    if(i in bcmDictR){
        pinList.push({});
        pinList[i].bcmNumber = i;
        pinList[i].boardNumber=bcmDictR[i];
        setIO(pinList[i]);
        }

    else {
        pinList.push(false);
    }
    }
}

function setIO(cPin){
    cPin.inOut = new Gpio(cPin.bcmNumber,'in','both',{debounceTimeout: 50});
    let cIO = cPin.inOut;
    cPin.blink = false;
    cPin.watch == true;
    cPin.inOut.watch((err,value)=>{
        if (err){
                throw err};
            pinWatch()
            
        function pinWatch(){
                /*cPin.voltage = cIO.read();*/
                sendPinData(cPin.bcmNumber);
            }}
        )
    /*
    setInterval(watchDirection,200,pinList[i]);*/
    } 

function sendPinData(pinBCMNumber){
    let cPin = pinList[pinBCMNumber];
    cPin.voltage = cPin.inOut.readSync();
    cPin.direction = cPin.inOut.direction();
    io.sockets.emit('pinData',cPin);
}

function watchDirection (cPin){
    if (cPin.inOut.direction()!=cPin.direction){
        cPin.direction = cPin.inOut.direction();
        sendPinData(cPin.bcmNumber);
    }
}
function changePin(cPin,direction,voltage,blinkBool){
    clearInterval(blinkDict[cPin.bcmNumber]);
    blinkDict[cPin.bcmNumber]=false
    let cIO = cPin.inOut;
    cPin.direction=direction;
    if (blinkBool == true){
        blink(cPin); 
    }
    else{
        if (direction=='in'){
            cIO.setDirection('in')
        }
        else{
            cPin.blink=false
                if(Number(voltage)==0 || 1){
                    cIO.setDirection('out');
                    console.log(cIO);
                    cIO.writeSync(Number(voltage));
                    
                }
        }
        sendPinData(cPin.bcmNumber)
    }
}
   
function blink(currentPin){
    currentPin.inOut.setDirection('out');
    blinkDict[currentPin.bcmNumber]=setInterval(blinkRead,1000);
    function blinkRead(){
        currentPin.inOut.writeSync(currentPin.inOut.readSync()^1);
    }
}

function timeOutWrite(currentPin,value){
    currentPin.inOut.writeSync(value);
    currentPin.voltage = value;
    sendPinData(currentPin.bcmNumber);
}

function setupConnection (){
    
    app.use(express.static('www'));
    app.get('/', function(req, res){
        res.sendFile(__dirname + '/www/index2.html');
    });

    io.sockets.on('connection', function (socket) {
        setupPins()
        loadSettings()
        socket.on('form', function(data){
            if (data.voltage=='Blink'){
                pinList[data.bcmPin].blink=true
                changePin(pinList[data.bcmPin],'out',1,true)
            }
            else{
                
                pinList[data.bcmPin].blink = false;
                if(data.voltage==  'in'){
                    changePin(pinList[data.bcmPin],'in',false,false)
                    return
                }
                else{
                console.log(data.voltage)
                if((data.voltage) === '0' || data.voltage ==='1' ){
                    changePin(pinList[data.bcmPin],'out',Number(data.voltage))
                }
                if (data.voltage == '1 / 0'){
                    console.log('1 / 0')
                    changePin(pinList[data.bcmPin],'out',1)
                    setTimeout(changePin,1000,pinList[data.bcmPin],'out',0)
                }
                if (data.voltage == '0 / 1'){
                    changePin(pinList[data.bcmPin],'out',0)
                    setTimeout(changePin,1000,pinList[data.bcmPin],'out',1)
                }
            }
        }})
        function getAttributes (){
            var voltageCounter = 0;
            for (let i in bcmDictR){
                sendPinData(i); 
                let currentPin = pinList[i];
                }
        }
        socket.on('saveSettings',function(data){
            saveSettings();
        })
        
        socket.on('loadSettings',function(data){
            loadSettings();
        })
        getAttributes();
        console.log('connection');
    }); 

    http.listen(3000, function(request,response){
      console.log('listening on *:3000');
    });
}

setupConnection();
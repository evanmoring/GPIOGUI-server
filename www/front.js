var boardType = [false,0,1,3,1,3,2,3,3,2,3,3,3,3,2,3,3,0,3,3,2,3,3,3,3,2,3,4,4,3,2,3,3,3,2,3,3,3,3,2,3];
var boardType = [false,0,1,3,1,3,2,3,3,2,3,3,3,3,2,3,3,0,3,3,2,3,3,3,3,2,3,4,4,3,2,3,3,3,2,3,3,3,3,2,3];
var pinTypeKey = ['3V3','5v','GND','GPIO','Empty'];
var bcmDict = {3:2,5:3,7:4,8:14,10:15,11:17,12:18,13:27,15:22,16:23,18:24,19:10,21:9,22:25,23:11,24:8,26:7,29:5,31:6,32:12,33:13,35:19,36:16,37:26,38:20,40:21};
var voltageDict = {0:"Low", 1:"High",2:"Pin not set"};
var $ = function( id ) { return document.getElementById( id ); };

function saveData(){
    console.log('sent settings');
    socket.emit('saveSettings','');
}

function loadData() {
    console.log('loaded settings');
    socket.emit('loadSettings','');
}

function readForm(){
    let formDict ={};
    formDict.bcmPin=pinSelect.value;
    formDict.voltage=voltageSelect.value;
    socket.emit('form',formDict);
}

function createPins(pinList) {
    var count = pinList.length;
    for(var i = 1; i < count; i++) { 
        var currentPin = i;
        createPinGrid(i);
    }
}

function populatePinList(){
    for (i in bcmDict){
    let newOption = document.createElement('option');
    
    newOption.innerHTML='pin:'+i+' bcm:'+bcmDict[i];
    newOption.value=bcmDict[i];
    $('pinSelect').appendChild(newOption);
    }
}

function inititalize(){
    populatePinList();
    createPins(boardType);
}

function addAttribute(currentPin,prefix,text) {
    name = prefix+String(currentPin);
    var div = document.createElement("DIV");
    $(String(currentPin)).appendChild(div);
    div.setAttribute('id',name);
    $(name).className=('pinAttribute');
    $(name).innerHTML=text;
}
function bcmNumber(currentPin){
    if (currentPin in bcmDict){
        return(String(bcmDict[currentPin]))}
    else {
        return('');
    }
}

function createPinGrid (currentPin) {
    var div = document.createElement("DIV");
    $('pinGrid').appendChild(div);
    div.setAttribute('id',String(currentPin));
    $(String(currentPin)).className=('gridWrapper');
    
    addAttribute(currentPin,'number',String(currentPin));
    addAttribute(currentPin,'type',String(pinTypeKey[boardType[currentPin]]));
    addAttribute(currentPin,'bcm',bcmNumber(currentPin));
    addAttribute(currentPin,'direction','');
    addAttribute(currentPin,'voltage','') ; 
}

var socket = io.connect();

socket.on('pinData',function(data){
    console.log(data)
    $('voltage'+data.boardNumber).innerHTML=data.voltage;
    if(data.voltage==1){
        $('voltage'+data.boardNumber).style.color='red';
    }
    if(data.voltage==0){
        $('voltage'+data.boardNumber).style.color='blue';
    }
    $('direction'+data.boardNumber).innerHTML=data.direction;
    if(data.direction=='in'){
        $('direction'+data.boardNumber).style.color='green';
    }
    if(data.direction=='out'){
        $('direction'+data.boardNumber).style.color='purple';
    }
});
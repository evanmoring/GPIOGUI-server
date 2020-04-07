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
	console.log('emitted form');
    formDict.bcmPin=pinSelect.value;
    formDict.voltage=voltageSelect.value;
    socket.emit('form',formDict);
}

function showI2C(){
    console.log('function')
    if ($("i2cControls").style.display=="block"){
        $("i2cControls").style.display="none";
        $("showI2CButton").value = "Show I2C"
    }
    else{
        $("i2cControls").style.display="block";
        $("showI2CButton").value = "Hide I2C"
    }
}

function submitI2C(){
    let d = {}
	d.readWriteSelection = document.querySelector('input[name = "readWriteSelector"]:checked').value;
    	d.writeAddress = Number("0x"+writeAddress.value);
	if(checkSub(d.writeAddress,4096)){
		$("i2cReadout").innerHTML="Bad address. It should be 2-3 hexadecimal digits.";
            return;
	}
    	d.readWriteDelay = Number(readWriteDelay.value);
    if ((d.readWriteSelection != 'read') && checkWrite()){
            $("i2cReadout").innerHTML="Bad command input. It should be one or more two-digit hexadecimal bytes separated by a space";
            return;
    }
    if ((d.readWriteSelection != write) && checkRead()){
        $("i2cReadout").innerHTML="Bad data length input. It should be the number of bytes to be returned in decimal notation";
        return;
    }
    if (d.readWriteSelection == "both" && checkSub(d.readWriteDelay,2000)){
        $("i2cReadout").innerHTML="Bad delay input. Choose a integer number of milliseconds below 2000";
        return;
    }
        
    console.log(d);
$("i2cReadout").innerHTML="Data sent";
    socket.emit('i2cForm',d);
    
    function checkWrite(){
            d.writeCommand = writeCommand.value.split(' ');
            for (let i=0; i<d.writeCommand.length; i++){
                d.writeCommand[i]=Number('0x'+d.writeCommand[i]);
                if (checkSub(d.writeCommand[i],256)){
                    return true;
            }
        }
    }
    
    function checkRead(){
        d.readLength = Number(readLength.value);
        return checkSub(d.readLength,20);
    }
    
    function checkSub (input,max){
        if (isNaN(input) || input > max){
            console.log('check was bad');
            return true;  
        }
    }
}

function setupI2C (wA,wC,rL,d){
    let controlList = [
        ['writeAddress',wA,],
        ['writeCommand',wC],
        ['readLength',rL],
        ['readWriteDelay',d]
        ]
    for (let i = 0; i<controlList.length; i++){
        let c = controlList[i]
        /*console.log($(c))*/
        if (c[1]==1){
            $(c[0]).disabled = false;
        }
        else {
            $(c[0]).disabled = true;
        }
    }
}

function createPins(pinList) {
    var count = pinList.length;
    for(let i = 1; i < count; i++) { 
        var currentPin = i;
        createPinGrid(i);
    }
	$("direction3").innerHTML="i2c"
	$("direction3").style.color="brown"
	$("voltage3").innerHTML="SDA"
	$("voltage3").style.color="brown"
	$("direction5").innerHTML="i2c"
	$("direction5").style.color="brown"
	$("voltage5").innerHTML="SCL"
	$("voltage5").style.color="brown"
}

function populatePinList(){
    for (let i in bcmDict){
    let newOption = document.createElement('option');
    newOption.innerHTML='PIN: '+i+'   BCM: '+bcmDict[i];
    newOption.value=bcmDict[i];
    $('pinSelect').appendChild(newOption);
    }
}

function inititalize(){
    setupI2C(1,1,0,0,0);
    populatePinList();
    createPinGridHeader();
    createPinGridHeader();
    createPins(boardType);
}


function bcmNumber(currentPin){
    if (currentPin in bcmDict){
        return(String(bcmDict[currentPin]))}
    else {
        return('');
    }
}

function createPinGrid (currentPin) {
    let div = document.createElement("DIV");
    $('pinGrid').appendChild(div);
    div.setAttribute('id',String(currentPin));
    $(String(currentPin)).className=('gridWrapper');
    
    addAttribute(currentPin,'number',String(currentPin));
    addAttribute(currentPin,'type',String(pinTypeKey[boardType[currentPin]]));
    addAttribute(currentPin,'bcm',bcmNumber(currentPin));
    addAttribute(currentPin,'direction','');
    addAttribute(currentPin,'voltage','') ; 
}

function addAttribute(currentPin,prefix,text) {
    name = prefix+String(currentPin);
    var div = document.createElement("DIV");
    $(String(currentPin)).appendChild(div);
    div.setAttribute('id',name);
    $(name).className=('pinAttribute '+ prefix);
    $(name).innerHTML=text;
}
function createPinGridHeader () {
    var div = document.createElement("DIV");
    $('pinGrid').appendChild(div);
    div.className=('gridWrapper gridHeaderWrapper');
    headerAttributes ('Number');
    headerAttributes ('Type');
    headerAttributes ('BCM');
    headerAttributes ('IN / OUT');
    headerAttributes ('0 / 1');
    
    function headerAttributes (text){
        let numberDiv = document.createElement("Div")
        div.appendChild(numberDiv);
        numberDiv.innerHTML=text;
        numberDiv.className = ('pinAttributeHeaders ' +text)
    }
}

var socket = io.connect();

socket.on('i2cReturn',function(data){
	console.log(data);
	let newString = 'Data received: ';
	for(let i = 0; i < data.length; i++){
		if(i % 2 != 0){newString += (data[i]+' ').toUpperCase();}
		else {newString +=data[i].toUpperCase();}
	}
	
	$("i2cReadout").innerHTML=newString;
});

socket.on('i2cError',function(error){
	console.log(error);
	$("i2cReadout").innerHTML=`<div class="i2cError">Error!</div>    <div class = "i2cError"> Error Code: ${error.code} </div> <div class="i2cError">   Error Number: ${error.errno} </div>  <div class = "i2cError">  System Call: ${error.syscall}</div>`;
})

socket.on('i2cScanReturn',function(scanList){
	console.log(scanList);
	let listString = 'Available i2c addresses: ';
	for (let i =0; i<scanList.length; i++){
		console.log(scanList[i]);
		listString += scanList[i].toString('16');
	}
	$("i2cReadout").innerHTML=`${listString}`
});

socket.on('pinData',function(data){
	console.log('r data');
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

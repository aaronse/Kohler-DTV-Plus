
//(issue- 983) - TF team added variables for the new devices page
var flipSwitchStatus 	 = "00000000000";	
var bakFlipSwitchStatus  = "00000000000";
var switchDisabledStatus = "00000000000";
var devSTATUS = "";


function number_blur(numberfield) {
    if(parseInt(numberfield.value,10) > parseInt(numberfield.max,10))
    {
        numberfield.value=numberfield.max;
    }else if(parseInt(numberfield.value,10) < parseInt(numberfield.min,10))
    {
        numberfield.value=numberfield.min
    }
    if (units_are_f === false) {
        if (numberfield.value === '') {
            return;
        }
        numberfield.setAttribute('type', 'text');
        if (numberfield.value.indexOf('.') === -1) {
            numberfield.value = numberfield.value + '.0';
        }
        numberfield.setAttribute('type', 'number');
    }
}

//(issue- 983) - TF team added to save and handle flip-switches
function flipSwitchStatusUpdate(flipID){
	
	var element = document.getElementById(flipID);		
	
	//6P - v1
	if(flipID=="myonoffswitch0"){			
		saveflipSwitchStatus(element,0);
		handleFlipSwitchState('myonoffswitch2','myonoffswitch4',element);		
	}	
	//6P - v2	
	if(flipID=="myonoffswitch1"){		
		saveflipSwitchStatus(element,1);
		handleFlipSwitchState('myonoffswitch3','myonoffswitch5',element);
	}	
	//3P - V1
	if(flipID=="myonoffswitch2"){
		saveflipSwitchStatus(element,2);
		handleFlipSwitchState('myonoffswitch0','myonoffswitch4',element);
	}
	//3P - V2
	if(flipID=="myonoffswitch3"){
		saveflipSwitchStatus(element,3);
		handleFlipSwitchState('myonoffswitch1','myonoffswitch5',element);
	}
	//2P - V1
	if(flipID=="myonoffswitch4"){
		saveflipSwitchStatus(element,4);
		handleFlipSwitchState('myonoffswitch0','myonoffswitch2',element);
	}	
	//2P - V2
	if(flipID=="myonoffswitch5"){
		saveflipSwitchStatus(element,5);
		handleFlipSwitchState('myonoffswitch1','myonoffswitch3',element);
	}	
	//COLD WATER ONLY
	if(flipID=="myonoffswitch6"){
		saveflipSwitchStatus(element,6);
	}	
	//STEAM
	if(flipID=="myonoffswitch7"){
		saveflipSwitchStatus(element,7);
	}	
	//RP
	if(flipID=="myonoffswitch8"){
		saveflipSwitchStatus(element,8);
	}	
	//LB
	if(flipID=="myonoffswitch9"){
		saveflipSwitchStatus(element,9);
	}	
	//AMP
	if(flipID=="myonoffswitch10"){
		saveflipSwitchStatus(element,10);
	}
}

//(issue - 983)added by TF team - function to handle the state of the flip switch when user simulate valves
function handleFlipSwitchState(flipID1,flipID2,Element){	
	
	if(Element.checked)
	{
		//checked			
		document.getElementById(flipID1).disabled 	    = true;
		document.getElementById(flipID1).checked 	    = false; 	
		document.getElementById(flipID2).disabled 	    = true;
		document.getElementById(flipID2).checked 	    = false; 
		$(document.getElementById(flipID1)).siblings('.onoffswitch-label').children(".onoffswitch-inner").addClass("bgcolor");		
		$(document.getElementById(flipID2)).siblings('.onoffswitch-label').children(".onoffswitch-inner").addClass("bgcolor");		
	}else
	{
		//not-checked
		document.getElementById(flipID1).disabled 	    = false;
		document.getElementById(flipID1).checked 	    = false; 	
		document.getElementById(flipID2).disabled 	    = false;
		document.getElementById(flipID2).checked 	    = false; 
		$(document.getElementById(flipID1)).siblings('.onoffswitch-label').children(".onoffswitch-inner").removeClass("bgcolor");		
		$(document.getElementById(flipID2)).siblings('.onoffswitch-label').children(".onoffswitch-inner").removeClass("bgcolor");		
	}		
}	

//(issue - 983) added by TF team to save flip switch status
function saveflipSwitchStatus(Element,index)
{
	if(Element.checked)
	{
		flipSwitchStatus = flipSwitchStatus.replaceAt(index,"1");
	}else
	{
		flipSwitchStatus = flipSwitchStatus.replaceAt(index,"0");
	}
}
//to replace the character at a given index of the string
String.prototype.replaceAt=function(index, character) 
{
    return this.substr(0, index) + character + this.substr(index+character.length);
}	

//(issue - 983) added by TF team to handle SAVE button and backup flip switch status
function processDeviceStatus(buttonID)
{	
	if(buttonID=="saveButton")
	{		
		$(document).scrollTop();
		updateDevices(flipSwitchStatus);		
		saveSwitchDisabledStatus();
		bakFlipSwitchStatus = flipSwitchStatus; 

	
		//(issue : 983) - TF team added for invoking overlay and spinner
		$("#overlayID").show();					
		$("#spinnerID").show();			
		
		setTimeout(function () {
			$("#spinnerID").hide();			
			$("#overlayID").hide();		
		}, 4500);
	}		
	if(buttonID=="cancelButton")
	{
		revertFlipSwitchesBack();
		flipSwitchStatus = bakFlipSwitchStatus;
	}
}

//(issue - 983) added by TF team to to handle CANCEL button action 
function revertFlipSwitchesBack()
{
	if(flipSwitchStatus==bakFlipSwitchStatus){
		//do nothin		
	}else
	{		
		var flipSwitchID ="";
		for(var index = 0;index<11;index++)
		{
			flipSwitchID = "myonoffswitch" + index;			
			if(bakFlipSwitchStatus.charAt(index)=="0")
			{		
				document.getElementById(flipSwitchID).checked  = false; 			
				if(switchDisabledStatus.charAt(index)=="1"){
					document.getElementById(flipSwitchID).disabled  = true; 																		
					$(document.getElementById(flipSwitchID)).siblings('.onoffswitch-label').children(".onoffswitch-inner").addClass("bgcolor");		
				}else
				{
					document.getElementById(flipSwitchID).disabled  = false; 																		
					$(document.getElementById(flipSwitchID)).siblings('.onoffswitch-label').children(".onoffswitch-inner").removeClass("bgcolor");					
				}					
			}else
			{		
				document.getElementById(flipSwitchID).checked  = true; 	
			}
		}	
	}
}	

//(issue - 983) added by TF team to save the greyed out flipswitch status
function saveSwitchDisabledStatus()
{
	var idCount = 0;
	var flipSwitchID = "";	
	for(;idCount<11;idCount++)
	{
		flipSwitchID = "myonoffswitch" + idCount;				
		if(document.getElementById(flipSwitchID).disabled == true)
		{
			switchDisabledStatus = switchDisabledStatus.replaceAt(idCount,"1");
		}else
		{
			switchDisabledStatus = switchDisabledStatus.replaceAt(idCount,"0");
		}	
	}	
}

//(issue - 983) added by TF team get status of flipswitches and handle the state of them
function getStatusOnStart()
{
	var flipSwitchID= "";
	var element;
	for(var i = 0;i<11;i++)
	{
		flipSwitchID = "myonoffswitch" + i;
		element = document.getElementById(flipSwitchID);				
		saveflipSwitchStatus(element,i);
	}	
	saveSwitchDisabledStatus();
	bakFlipSwitchStatus  = flipSwitchStatus;
}

//function update(indexin,valuein)
function updateDevices(valuein)
{
	$.ajax({
		type: "GET",
		url: "set_device.cgi",
		data: {
			value: valuein
		},
		dataType: "JSON",
		cache: false
	});
	setTimeout(function () {
		load();
	}, 2000);
}	

/*
function dialogOpenDevicesWarning() {
	$('#simDevWarning').dialog({
		closeOnEscape: false,
		height: "auto !important",
		width: "auto !important",
		resizable: false,
		modal: true,
		draggable: false,
		dialogClass: 'main-dialog-class',
	});
}
//Issue 994  : added by TF team  for warning
function dialogCloseDevicesWarning() {
	$('#simDevWarning').dialog("close");
}
*/


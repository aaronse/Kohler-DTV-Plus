function trace(s) {
    try {
        console.log(s);
    } catch (e) { /*alert(s)*/ }
}

$.ajaxSetup({
    cache: false
});

var units_are_f = true;
var hide_things = true;
var discon_string = 'Dis';
var con_string = 'Con';
var user_title = 'User:';
var config_index = 0;
var config_a = 'Configuration A';
var config_a_1 = 'Configuration A Alt 1';
var config_a_2 = 'Configuration A Alt 2';
var config_a_3 = 'Configuration A Alt 3';
var config_b = 'Configuration B';
var config_b_1 = 'Configuration B Alt 1';
var config_b_2 = 'Configuration B Alt 2';
var config_b_3 = 'Configuration B Alt 3';
var config_c = 'Configuration C';
var config_d = 'Configuration D';
var config_d_1 = 'Configuration D Alt 1';
var config_d_2 = 'Configuration D Alt 2';
var config_d_3 = 'Configuration D Alt 3';
var config_unwind = 'Retro Fit | Unwind';
var config_downpour = 'Retro Fit | Downpour';
var config_frontage = 'Retro Fit | Frontage';
var config_surround = 'Retro Fit | Surround';
var config_linear = 'Retro Fit | Linear';
var config_envelop = 'Retro Fit | Envelop';
var configv1_outlets = 0;
var configv2_outlets = 0;
var custom_text = "Custom";
var modules_installed = 0;
var bool_light1_dimmer = true;
var bool_light2_dimmer = true;
var bool_light3_dimmer = true;
var bool_needs_save = false;
var reload = false;

//Issue 994 : Added by TF team for Custom Massage Order patterns,22-04-2015
var bool_gen1UIConnectionStatus = false;
var bool_gen2UIConnectionStatus = false;
var showerConfigurationActive = 0;
var valve1PortType = 0;
var valve2PortType = 0;
var badBit = 0;
var totalFrames = 1; 
var CustomMassage_OrderV1C1=0;
var CustomMassage_OrderV1C2=0;
var CustomMassage_OrderV2C1=0;
var CustomMassage_OrderV2C2=0;
var light_attach_status=0;
var light_remove_status=0;
var light_add_timer;
var light_remove_timer;
//Issue 1256 : Added by TF-Team on 11-5-2016 for scaling balance value acc. to UI range.
var Treble_value = 0;
var Bass_value = 0;
var Balance_value = 0;

var six_three_PortPattern = 
					 [																// index
                      /(^[1-6]$)/,													// 0    -- error 0
					  /(^[1-6][\s|\,]$)/,											// 1    -- error 1
					  /(^[1-6][\s|\,][1-6]$)/,					 					// 2    
					  /(^[1-6][\s|\,][1-6][\s|\,]$)/, 								// 3    -- error 3
					  /(^[1-6][\s|\,][1-6][\s|\,][1-6]$)/, 							// 4    
					  /(^[1-6][\s|\,][1-6][\s|\,][1-6][\s|\,]$)/,     		 		// 5    -- error 5
					  /(^[1-6][\s|\,][1-6][\s|\,][1-6][\s|\,][1-6]$)/,  			// 6
					  /(^[1-6][\s|\,][1-6][\s|\,][1-6][\s|\,][1-6][\s|\,]$)/,  		// 7    -- error 7
					  /(^[1-6][\s|\,][1-6][\s|\,][1-6][\s|\,][1-6][\s|\,][1-6]$)/, 	// 8    
					  /(^[1-6][\s|\,][1-6][\s|\,][1-6][\s|\,][1-6][\s|\,][1-6]\,$)/ // 9    -- error 9
					 ];					 					 
var twoPortPattern = 
					[																// index		
				      /(^[1-3]$)/,													// 0    -- error 
					  /(^[1-3][\s|\,]$)/,											// 1	-- error 
					  /(^[1-3][\s|\,][1-3]$)/,										// 2    
					  /(^[1-3][\s|\,][1-3]\,$)/										// 3    -- error     
					];	
//Issue 994 : added by TF team to give error index  					
var errorIndexConfigSix   = /^(0|1|3|5|7|9)$/;   //error index
var errorIndexConfigThree = /^(0|1|3)$/; 		 //error index

//(issue - 1159) TF team added to hide fatal error occured
var v1_fatalERROR = 0;
var v2_fatalERROR = 0;
var powerclean_On = 0;   //TF Team 07-07


function update_massage(checked,image,valve,outlet){
    if(checked.checked && !($(image).hasClass("outlet_9") || $(image).hasClass("outlet_10") || $(image).hasClass("outlet_0") || $(image).hasClass("outlet_23"))){
        update_value_outlet(const_valve_outlet_massage,1,valve,outlet);
    }else{		
		//Issue 994 : added by TF team to autocorrect the pattern when radio massage button deselected 22-04-2015
		getAutoCorrected(valve,outlet);		
        update_value_outlet(const_valve_outlet_massage,0,valve,outlet);
        checked.checked = false;
    }
			//added by TF team in case all outlets are massage deselected - main massage button also will be deselected
		if((document.getElementById("massage_0").checked == false) &&  (document.getElementById("massage_1").checked == false) 
			&& (document.getElementById("massage_3").checked == false)   && (document.getElementById("massage_3").checked == false) 
			&& (document.getElementById("massage_5").checked == false)   && (document.getElementById("massage_5").checked == false)
			&& (document.getElementById("massage_0v2").checked == false) && (document.getElementById("massage_1v2").checked == false) 
			&& (document.getElementById("massage_2v2").checked == false) && (document.getElementById("massage_3v2").checked == false) 
			&& (document.getElementById("massage_4v2").checked == false) && (document.getElementById("massage_5v2").checked == false))
		  {
			  document.getElementById("massage").checked = false;
			  update_value(const_massage,0);
			  $(".massage_div").hide();
			  $("#custom_massage_block_1").hide();  //Added by TF team 14-08
			  $("#custom_massage_block_2").hide();  //Added by TF team 14-08
		  }
		  //end add by TF team
}

function update_auto_purge(checked,image,valve,outlet)
{
	if(checked.checked && !($(image).hasClass("outlet_0")))
	{
	       update_value_outlet(const_outlet_auto_purge,1,valve,outlet);
	}
	else
	{
        update_value_outlet(const_outlet_auto_purge,0,valve,outlet);
        checked.checked = false;
	}
	//added by TF team in case all outlets are autopurge deselected - main autopurge button also will be deselected
		if((document.getElementById("autopurge_0").checked == false) &&  (document.getElementById("autopurge_1").checked == false) 
			&& (document.getElementById("autopurge_2").checked == false)  && (document.getElementById("autopurge_3").checked == false) 
			&& (document.getElementById("autopurge_4").checked == false) && (document.getElementById("autopurge_5").checked == false)
	  	    && (document.getElementById("autopurge_1v2").checked == false) && (document.getElementById("autopurge_2v2").checked == false)
		    && (document.getElementById("autopurge_3v2").checked == false) && (document.getElementById("autopurge_4v2").checked == false) 
		    && (document.getElementById("autopurge_5v2").checked == false) && (document.getElementById("autopurge_0v2").checked == false))
		  {
			  document.getElementById("auto_purge_check").checked = false;
			  document.getElementById("auto_purge_checkv2").checked = false;
			  		auto_purge(1, false);
					auto_purge(2, false);
		  }
		  //end add by TF team
}

function update_daylight_savings(offcheck)
{
	// zero means daylight savings time ON, 1 means OFF
	if(offcheck===0)
	{
		// in the database, 1 means daylight savings ON
		update_value(const_daylight_savings, 1); 
	}
	else
	{
		update_value(const_daylight_savings, 0); 
	}
}
/**********Added by TF-Team on 14-10-2015 for displaying light attach popup and add module****************/
function add_light_module(module_num,value) 
{
	var indexin = module_num;
	var valuein = value;
	update_value(indexin, valuein);
	$('#dialog-add-light-module').dialog({
		closeOnEscape: false,
		height: "auto !important",
		width: "auto !important",
		resizable: false,
		modal: true,
		draggable: false,
		dialogClass: 'main-dialog-class',
	});
	setTimeout(function () {
			light_attach_status = 1;
        }, 3000);
	
	light_add_timer = setTimeout(function () {
			dialogCloseAddLightPopup();
		 $.ajax({
					type: "GET",
					url: "save_variable.cgi",
					data: {
						index: const_light_status_clear,
						value: 0
					},
					dataType: "text",
					cache: false
				});
			// Tf-Team to add ajax to reset light attach status
        }, 60000);
}
/***********End of Add by TF-Team on 14-10-2015***********/

function rem_module()
{
	var select = document.getElementById("remove_modules");
	var selIndex = select.selectedIndex;
	if(selIndex != -1)
	{
		//document.getElementById("wrong_selection").style.display='none';
		document.getElementById("wrong_selection").style.visibility='hidden';
		update_value(const_light_del_module,$('#remove_modules').val());
	
		$('#dialog-remove-light-module').dialog({ //Added by TF-Team on 16-12-2015 to show load module removal dialog
			closeOnEscape: false,
			height: "auto !important",
			width: "auto !important",
			resizable: false,
			modal: true,
			draggable: false,
			dialogClass: 'main-dialog-class',
		});		
		setTimeout(function()
		{ 
			light_remove_status	= 1;
		}, 3000);
		light_remove_timer = setTimeout(function () 
		{
		dialogCloseRemoveLightPopup();
			$.ajax({
				type: "GET",
				url: "save_variable.cgi",
				data: {
					index: const_light_remove_clear,
					value: 0
				},
				dataType: "text",
				cache: false
			});
		// Tf-Team to add ajax to reset light remove status
		},60000);
	}else{
		document.getElementById("wrong_selection").style.display='block';
		document.getElementById("wrong_selection").style.visibility='visible';
	}
	
}
function dialogCloseAddLightPopup() {   //Added by Tf-team on 13-10-2015 for closing light add popup
	$('#dialog-add-light-module').dialog("close");
}
function dialogCloseRemoveLightPopup() {   //Added by Tf-team on 13-10-2015 for closing light add popup
	$('#dialog-remove-light-module').dialog("close");
}
function set_light_delay(module) {
	var ischecked;
	var delay_setting;

    switch (module) {
    case 1:
		ischecked = document.getElementById("delay_1").checked;
		delay_setting = document.getElementById("delay_off_for").value;
		if (ischecked) {
			// if was off, now turning on - grab the minutes value and set to that value
	       update_module(const_light_delay_time,delay_setting,1);
		} else {
			// was on, now turning off, so zero out the delay in the DB
	        update_module(const_light_delay_time,0,1);
		}
		break;
    case 2:
		ischecked = document.getElementById("delay_2").checked;
		delay_setting = document.getElementById("delay_off_for2").value;
		if (ischecked) {
	       update_module(const_light_delay_time,delay_setting,2);
		} else {
	       update_module(const_light_delay_time,0,2);
		}
		break;
    case 3:
		ischecked = document.getElementById("delay_3").checked;
		delay_setting = document.getElementById("delay_off_for3").value;
		if (ischecked) {
	       update_module(const_light_delay_time,delay_setting,3);
		} else {
	       update_module(const_light_delay_time,0,3);
		}
		break;
	}
	
}

function set_light_delay_minutes(module) {
	var delay_setting;

	// when we change the minutes for one light, they all need to be changed to match
    switch (module) {
    case 1:
		delay_setting = document.getElementById("delay_off_for").value;
		break;
    case 2:
		delay_setting = document.getElementById("delay_off_for2").value;
		break;
    case 3:
		delay_setting = document.getElementById("delay_off_for3").value;
		break;
	}
	// commit the change in time to all three lights - if the delay is active for that module
    if (document.getElementById("delay_1").checked) { update_module(const_light_delay_time,delay_setting,1); }
    if (document.getElementById("delay_2").checked) { update_module(const_light_delay_time,delay_setting,2); }
    if (document.getElementById("delay_3").checked) { update_module(const_light_delay_time,delay_setting,3); }

	// now make sure all drop downs on the UI are set to the same value
	document.getElementById("delay_off_for").value = delay_setting;
	document.getElementById("delay_off_for2").value = delay_setting;
	document.getElementById("delay_off_for3").value = delay_setting;
}

function update_module_name(indexin, valuein, modulein) {

	if(modulein === 1) {
		//$(".name_1").html(user_title + " " + valuein);
		document.getElementById('name_1').innerHTML = valuein;
		document.getElementById('new_name_1').value = "";
	} else if(modulein === 2) {
		document.getElementById('name_2').innerHTML = valuein;
		document.getElementById('new_name_2').value = "";
	} else if(modulein === 3) {
		document.getElementById('name_3').innerHTML = valuein;
		document.getElementById('new_name_3').value = "";
	}
	update_module(indexin, valuein, modulein);
}

function update_bluetooth_key(indexin, valuein) {	
	$("#bt_key").html(valuein);
	document.getElementById('key').value = "";
	update_value(indexin, valuein);
}

function update_bluetooth_pin(indexin, valuein) {
	$("#bt_pin").html(valuein);
	document.getElementById('pin').value = "";
	update_value(indexin, valuein);
}


function update_module(indexin, valuein, modulein) {
    bool_needs_save = true;
    trace('Update Module: index is ' + indexin + ', value is ' + valuein + ', module is ' + modulein);
    $.ajax({
        type: "GET",
        url: "save_variable.cgi",
        data: {
            index: indexin,
            value: valuein,
            module: modulein
        },
        dataType: "text",
        cache: false
    });
}

function update_config(indexin, valuein)
{
	if(valuein == "1" || valuein == "2")
	{
		$('#spa_borderbottom').show();
		$('#spa_borderbottom1').hide();
	}
	if(valuein == "3" || valuein == "4")
	{
		$('#spa_borderbottom1').show();
		$('#spa_borderbottom').hide();
	}
	if(valuein === "0")
	{
		//TF Team - spa
		document.getElementById("spa").checked=false;
		$('.spa_sel').hide();
		$('#spa_tab').hide();
		document.getElementById("auto_purge_check").checked = false;
		auto_purge(1, false);
		auto_purge(2, false);
	}
	else
	{
		$('.spa_sel').show();
	}
	update_value(indexin, valuein); 
}

function update_value(indexin, valuein) {
    bool_needs_save = true;
    trace('Update Value: ' + valuein + ' Index: ' + indexin);
    // note that data type here should be "text" but seems to be causing an endless loop error - look into this
    $.ajax({
        type: "GET",
        url: "save_variable.cgi",
        data: {
            index: indexin,
            value: valuein
        },
        dataType: "text",
        cache: false
    });
}

function confirmExit() {
    if (bool_needs_save) {
        $.ajax({
            async: false,
            type: "GET",
            url: "saveDT.cgi",
            dataType: "text",
            cache: false
        });
    }
	document.getElementById("pw").value = "";  //Added by TF Team
    return null;
}


function displayTime() {
    var str = "";
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    str += hours + ":" + minutes + ":" + seconds + " ";
    if (hours > 11) {
        str += "PM";
    } else {
        str += "AM";
    }
    return str;
}
$(function () {
    $("#tabs-Settings").tabs({
        activate: function (event, ui) {
            reload = true;
            //alert('selected: '+ui.newTab.index());
            trace(displayTime());
            load();
            trace(displayTime());
        }
    });
    $("#tabs-Settings li[role=tab]").unbind('keydown');

});
$(function () {
    //volume_slider
    $("#volume_slider").slider({
        min: 0,
        max: 100,
        step: 1,
        slide: function (event, ui) {
            $("#volume_val").val(ui.value + '%');
        },
        change: function (event, ui) {
		    //Issue 748 : added by TF team to fix RPC send issue when switching the webpage tabs
			if(event.originalEvent){
            $.ajax({
                type: "GET",
                url: "save_variable.cgi",
                data: {
                    index: const_music_volume,
                    value: ui.value
                },
                dataType: "text",
                cache: false
            });
        }
        }
    });
    $("#volume_val").val($("#volume_slider").slider("value"));
    //treble_slider
    $("#treble_slider").slider({
        min: 0,
        max: 100,
        step: 1,
        slide: function ( event, ui ) {
                $( "#treble_val" ).val( ui.value +'%');
            },
        change: function (event, ui) {
		    //Issue 748 : added by TF team to fix RPC send issue when switching the webpage tabs
			if(event.originalEvent){
            $.ajax({
                type: "GET",
                url: "save_variable.cgi",
                data: {
                    index: const_music_treble,
                    value: ui.value
                },
                dataType: "text",
                cache: false
            });
	    	}  
        }
    });
    $( "#treble_val" ).val( $( "#treble_slider" ).slider( "value" ) );
	
    //bass_slider
    $("#bass_slider").slider({
        min: 0,
        max: 100,
        step: 1,
        slide: function ( event, ui ) {
               $( "#bass_val" ).val( ui.value +'%');
            },
        change: function (event, ui) {
		    //Issue 748 : added by TF team to fix RPC send issue when switching the webpage tabs
			if(event.originalEvent){
            $.ajax({
                type: "GET",
                url: "save_variable.cgi",
                data: {
                    index: const_music_bass,
                    value: ui.value
                },
                dataType: "text",
                cache: false
            });
        }
        }
    });
    $( "#bass_val" ).val( $( "#bass_slider" ).slider( "value" ) );
	
    //bal_slider
    $("#bal_slider").slider({
        min: -50,
        max: 50,
        step: 1,
        slide: function (event, ui) {
            $("#bal_val").val(ui.value);
        },
        change: function (event, ui) {
		    //Issue 748 : added by TF team to fix RPC send issue when switching the webpage tabs
			if(event.originalEvent){
            $.ajax({
                type: "GET",
                url: "save_variable.cgi",
                data: {
                    index: const_music_balance,
                    value: ui.value
                },
                dataType: "text",
                cache: false
            });
        }
        }
    });
    $("#bal_val").val($("#bal_slider").slider("value"));
});
$(function () {
    $('#slider_chroma').slider({
        range: 'min',
        min: 0,
        max: 100,
        slide: function (event, ui) {
            $('#amount_chroma').val(ui.value + '%');
        },
        change: function (event, ui) {
            update_value(const_rain_brightness, ui.value);
        }
    });
    $('#amount_chroma').val($('#slider_chroma').slider('value') + '%');
    $('#slider_1').slider({
        range: 'min',
        min: 0,
        max: 100,
        value: 0,
        slide: function (event, ui) {
            $('#amount_1').val(ui.value + '%');
        },
        change: function (event, ui) {
            update_module(const_light_brightness, ui.value, 1);
        }
    });
    $('#amount_1').val($('#slider_1').slider('value') + '%');
    $('#slider_2').slider({
        range: 'min',
        min: 0,
        max: 100,
        value: 0,
        slide: function (event, ui) {
            $('#amount_2').val(ui.value + '%');
        },
        change: function (event, ui) {
            update_module(const_light_brightness, ui.value, 2);
        }
    });
    $('#amount_2').val($('#slider_2').slider('value') + '%');
    $('#slider_3').slider({
        range: 'min',
        min: 0,
        max: 100,
        value: 0,
        slide: function (event, ui) {
            $('#amount_3').val(ui.value + '%');
        },
        change: function (event, ui) {
            update_module(const_light_brightness, ui.value, 3);
        }
    });
    $('#amount_3').val($('#slider_3').slider('value') + '%');
});

function in_array(array, id) {
    var i;
    for (i = 0; i < array.length; i += 1) {
        if (parseInt(array[i], 10) === id) {
            return true;
        }
    }
    return false;
}
$(function () {
    $("#one_order").sortable({
        update: function (event, ui) {
            var i;
            var order = $("#one_order").sortable("toArray");
            for (i = 1; i < 7; i += 1) {
                if (!in_array(order, i)) {
                    order.push(i.toString());
                }
            }
            trace('one order', order.join(","));
            $.ajax({
                type: "GET",
                url: "save_variable.cgi",
                data: {
                    index: const_valve_outlet_order,
                    valve: 1,
                    value: order.join("")
                },
                dataType: "text",
                cache: false
            });
        }
    });
    $("#one_order").disableSelection();
    $("#two_order").sortable({
        update: function (event, ui) {
            var i;
            var order = $("#two_order").sortable("toArray");
            for (i = 1; i < 7; i += 1) {
                if (!in_array(order, i)) {
                    order.push(i.toString());
                }
            }
            trace('two order', order.join(","));
            $.ajax({
                type: "GET",
                url: "save_variable.cgi",
                data: {
                    index: const_valve_outlet_order,
                    valve: 2,
                    value: order.join("")
                },
                dataType: "text",
                cache: false
            });
        }
    });
    $("#two_order").disableSelection();
});

function update_value_valve_purge(indexin, valuein, valve, length) {
    bool_needs_save = true;
    trace('Update Valve');
    $.ajax({
        type: "GET",
        url: "save_variable.cgi",
        data: {
            index: indexin,
            value: valuein,
            length: length,
            valve: valve
        },
        dataType: "text",
        cache: false
    });
}

/*Added by TF Team 07-07*/
function update_value_valve_runtime(indexin, valuein, valve, length) {
    bool_needs_save = true;
    trace('Update Valve');
    $.ajax({
        type: "GET",
        url: "save_variable.cgi",
        data: {
            index: indexin,
            value: valuein,
            length: length,
            valve: valve
        },
        dataType: "text",
        cache: false
    });
}
/*Added by TF Team 07-07*/

/*Added by TF Team 07-07*/
function update_value_steam_runtime(indexin, valuein, valve, length) {
    bool_needs_save = true;
    trace('Update Steam');
    $.ajax({
        type: "GET",
        url: "save_variable.cgi",
        data: {
            index: indexin,
            value: valuein,
            length: length,
            valve: valve
        },
        dataType: "text",
        cache: false
    });
}
/*Added by TF Team 07-07*/
function update_value_valve(indexin, valuein, valve) {
    bool_needs_save = true;
    trace('Update Valve');
    $.ajax({
        type: "GET",
        url: "save_variable.cgi",
        data: {
            index: indexin,
            value: valuein,
            valve: valve
        },
        dataType: "text",
        cache: false
    });
}
var targetHidden = null;
var targetImage = null;
var targetValve = null;
var targetOutlet = null;

function makeSelection(image, valve, outlet) {
    if (!image) {
        return;
    }
    //targetHidden = document.getElementById(hidden);
    targetImage = document.getElementById(image);
    targetValve = valve;
    targetOutlet = outlet;
    var handle = window.open('Child.html');
    //var retVal = window.showModalDialog('child.html', window);
    
    if($(targetImage).hasClass("outlet_9") || $(targetImage).hasClass("outlet_10") ||$(targetImage).hasClass("outlet_23"))
    {
        update_value_outlet(const_valve_outlet_massage,0,valve,outlet);
    }
    //$('#dialog-form').dialog('moveToTop');
    //$( "#dialog-form" ).dialog( "open" );
	load();
}


function update_value_outlet(indexin, valuein, valve, outlet) {	

    bool_needs_save = true;
    trace('Update Outlet');
    $.ajax({
        type: "GET",
        url: "save_variable.cgi",
        data: {
            index: indexin,
            value: valuein,
            valve: valve,
            outlet: outlet
        },
        dataType: "text",
        cache: false
    });
}


//(issue : 994) - TF team added to update the custom massage order
function update_customMassageOrder(indexin, valuein, valve, outlet) {	

var len = valuein.length; // Added by tf team for CMV
var mid = len/2;
var value1 = valuein.substring(0,mid);
var value2 = valuein.substring(mid,len);

	if(badBit!=1)
	{	
		badBit = 0;

		bool_needs_save = true;
		trace('Update Outlet');
		$.ajax({
			type: "GET",
			url: "save_variable.cgi",
			success: function(data){  //Added by TF-Team on 02-10-2015 for Custom massage pattern copy issue
			$.ajax({
			type: "GET",
			url: "save_variable.cgi",
			data: {
				index: indexin,
				value2: value2,
				value : 2,
				valve: valve,
				outlet: outlet
			},
			dataType: "text",
			cache: false
		});
			},
			data: {
				index: indexin,
				value1: value1,
				value : 1,
				valve: valve,
				outlet: outlet
			},
			dataType: "text",
			cache: false
		});
	}
	else  // Added by tf team for CMV
	{
	badBit = 0;
	}
}

function update_value_settings_lock(indexin, checked, code)
{
	bool_needs_save = true;
	trace('Settings Lock');
    $.ajax({
        type: "GET",
        url: "save_variable.cgi",
        data: {
            index: indexin,
			value : checked,
            checked: checked,
            code: code
        },
        dataType: "text",
        cache: false
    });
}

function update_value_ui(indexin, valuein, ui) {
    bool_needs_save = true;
    trace('Update UI');
    $.ajax({
        type: "GET",
        url: "save_variable.cgi",
        data: {
            index: indexin,
            value: valuein,
            which: ui
        },
        dataType: "text",
        cache: false
    });
}
// Changing Reset User from USER 1 to PRESET 1 - TF Team 14-07
function reset_user(valuein) {
	if(valuein === 1) {
		$(".user_1_title_string").html(user_title + " Preset 1");
		document.getElementById('newuser1').value = "";
	} else if(valuein === 2) {
		$(".user_2_title_string").html(user_title + " Preset 2");
		document.getElementById('newuser2').value = "";
	} else if(valuein === 3) {
		$(".user_3_title_string").html(user_title + " Preset 3");
		document.getElementById('newuser3').value = "";
	} else if(valuein === 4) {
		$(".user_4_title_string").html(user_title + " Preset 4");
		document.getElementById('newuser4').value = "";
	} else if(valuein === 5) {
		$(".user_5_title_string").html(user_title + " Preset 5");
		document.getElementById('newuser5').value = "";
	} else if(valuein === 6) {
		$(".user_6_title_string").html(user_title + " Preset 6");
		document.getElementById('newuser6').value = "";
	}
	update_value(const_clear_user_name,valuein);
}

function update_value_user(indexin, valuein, userin) {
    bool_needs_save = true;
    trace('Update User');
	if(userin === 1) {
		$(".user_1_title_string").html(user_title + " " + valuein);
		document.getElementById('newuser1').value = "";
	} else if(userin === 2) {
		$(".user_2_title_string").html(user_title + " " + valuein);
		document.getElementById('newuser2').value = "";
	} else if(userin === 3) {
		$(".user_3_title_string").html(user_title + " " + valuein);
		document.getElementById('newuser3').value = "";
	} else if(userin === 4) {
		$(".user_4_title_string").html(user_title + " " + valuein);
		document.getElementById('newuser4').value = "";
	} else if(userin === 5) {
		$(".user_5_title_string").html(user_title + " " + valuein);
		document.getElementById('newuser5').value = "";
	} else if(userin === 6) {
		$(".user_6_title_string").html(user_title + " " + valuein);
		document.getElementById('newuser6').value = "";
	}
    $.ajax({
        type: "GET",
        url: "save_variable.cgi",
        data: {
            index: indexin,
            value: valuein,
            user: userin
        },
        dataType: "text",
        cache: false
    });
}

function reset_input(valuein) {
	if(valuein === 1) {
		$("#input_name_1").html("Input 1");
		document.getElementById('input1_rename').value = "";
	} else if(valuein === 2) {
		$("#input_name_2").html("Input 2");
		document.getElementById('input2_rename').value = "";
	}
	update_value(const_clear_input_name,valuein);
}

function update_input_name(valuein) {
    bool_needs_save = true;
    trace('Update Input Name');
    var newname;
	if(valuein === 1) {
		newname = document.getElementById("input1_rename").value;
		$("#input_name_1").html(newname);
		document.getElementById('input1_rename').value = "";
	} else if(valuein === 2) {
		newname = document.getElementById("input2_rename").value;
		$("#input_name_2").html(newname);
		document.getElementById('input2_rename').value = "";
	}
	update_value(const_input_name,valuein);
}

function id_interface(indexin) {
    //make cgi call here
    $.ajax({
        type: "GET",
        url: "id_interface.cgi",
        data: {
            index: indexin
        },
        dataType: "JSON",
        cache: false
    });
}

function save_interface(indexin) {
    //make cgi call here
    $.ajax({
        type: "GET",
        url: "saveUI.cgi",
        data: {
            index: indexin
        },
        dataType: "JSON",
        cache: false
    });
}

function remove_module(module) {
    $.ajax({
        type: "GET",
        url: "remove_module.cgi",
        data: {
            value: module
        },
        dataType: "JSON",
        cache: false
    });
}

function auto_purge(valve, checked) {
    //The two valves are tied for auto purge
    if (checked === false) {
        //We just unchecked it, hide the stuff
        document.getElementById('auto_purge').selectedIndex = 0;
        update_value_valve_purge(const_valve_auto_purge, 0, 1, 0);
        $(".v1_purge").hide();
        $("#auto_purge").hide();
        //We just unchecked it, hide the stuff
        document.getElementById('auto_purgev2').selectedIndex = 0;
        update_value_valve_purge(const_valve_auto_purge, 0, 2, 0);
        $(".v2_purge").hide();
        $("#auto_purgev2").hide();
		document.getElementById("autopurge_0").checked = false;
		document.getElementById("autopurge_1").checked = false; 
		document.getElementById("autopurge_2").checked = false;   
		document.getElementById("autopurge_3").checked = false; 
		document.getElementById("autopurge_4").checked = false;  
		document.getElementById("autopurge_5").checked = false;
		document.getElementById("autopurge_1v2").checked = false; 
		document.getElementById("autopurge_2v2").checked = false;
		document.getElementById("autopurge_3v2").checked = false;  
		document.getElementById("autopurge_4v2").checked = false;
		document.getElementById("autopurge_5v2").checked = false; 
		document.getElementById("autopurge_0v2").checked = false;
    } else {
        //Now we should show it
        $(".v1_purge").show();
        $("#auto_purge").show();
        //Now we should show it
        $(".v2_purge").show();
        $("#auto_purgev2").show();
        update_value_valve_purge(const_valve_auto_purge, 1, 1, 1);
        update_value_valve_purge(const_valve_auto_purge, 1, 2, 1);
    }
	//load();
}
/*TF Team added 07-07 For MAX RUN TIME VALVES*/
function max_valve_runtime(valve, checked) {
    //The two valves are tied for auto purge
    if (valve == 1) {
		if(checked === false)
		{
			document.getElementById('max_valve_runtime').selectedIndex = 0;
			update_value_valve_runtime(const_max_valve_runtime, 0, 1, 0);
			$("#max_valve_runtime").hide();
		}
		else if(checked === true)
		{
			$("#max_valve_runtime").show();
			update_value_valve_runtime(const_max_valve_runtime, 1, 1, 1);
		}	
	}
	if (valve == 2) {
		if(checked === false)
		{	
			document.getElementById('max_valve_runtimev2').selectedIndex = 0;
			update_value_valve_runtime(const_max_valve_runtime, 0, 2, 0);
			$("#max_valve_runtimev2").hide();
		}	
		else if(checked === true)
		{
    		$("#max_valve_runtimev2").show();
			update_value_valve_runtime(const_max_valve_runtime, 1, 2, 1);
		}
    }
	//load();
}
/*End of add TF Team 07-07*/

/*TF Team added 07-07 FOR MAX RUN TIME STEAM*/
function max_steam_runtime(checked) {
    //The two valves are tied for auto purge
    if (checked === false) {
        document.getElementById('max_steam_runtime').selectedIndex = 0;
        update_value_valve_runtime(const_max_steam_runtime, 0, 1, 0);
        $("#max_steam_runtime").hide();
    } else {
        //Now we should show it
        $("#max_steam_runtime").show();
        update_value_valve_runtime(const_max_steam_runtime, 1, 1, 1);
    }
	//load();
}
/*End of add TF Team 07-07*/

function cold_water(checked) {
	if (checked == false) {
		//We just unchecked it, so hide stuff and disable coldwater
		document.getElementById('cold_water').selectedIndex = 0;
		update_value_valve(const_valve_cold_water,4,1);
		$("#cold_water").hide();
		//We just unchecked it, so hide stuff and disable coldwater
		document.getElementById('cold_waterv2').selectedIndex = 0;
		update_value_valve(const_valve_cold_water,4,2);
		$("#cold_waterv2").hide();
	} else {
		//Now we should show it.
		$("#cold_water").show();
		update_value_valve(const_valve_cold_water,0,1);
		$("#cold_waterv2").show();
		update_value_valve(const_valve_cold_water,0,2);
		//load();
	}
}

function set_def_deluge(index, valve) {
	// there can be only one outlet set to steam deluge at a time - ensure that the selected one is a valid outlet, and if not, bump the selection to the next valid outlet
    if (valve === 1) {
        if (!($("#outlet_0_id").hasClass("outlet_0") &&
            $("#outlet_1_id").hasClass("outlet_0") &&
            $("#outlet_2_id").hasClass("outlet_0") &&
            $("#outlet_3_id").hasClass("outlet_0") &&
            $("#outlet_4_id").hasClass("outlet_0") &&
            $("#outlet_5_id").hasClass("outlet_0"))) {
            switch (index) {
            case 0:
                if ($("#outlet_0_id").hasClass("outlet_0")) {
					// if our selected outlet is not valid (i.e. is not configured as an oulet), then try the next outlet
                    set_def_deluge(1, 1);
                } else {
                    $("#steamdeluge_0").prop('checked', true);
                    update_value_valve(const_valve_deluge_default, 0, 1);
                }
                break;
            case 1:
                if ($("#outlet_1_id").hasClass("outlet_0")) {
                    set_def_deluge(2, 1);
                } else {
                    $("#steamdeluge_1").prop('checked', true);
                    update_value_valve(const_valve_deluge_default, 1, 1);
                }
                break;
            case 2:
                if ($("#outlet_2_id").hasClass("outlet_0")) {
                    set_def_deluge(3, 1);
                } else {
                    $("#setdeluge_2").prop('checked', true);
                    update_value_valve(const_valve_deluge_default, 2, 1);
                }
                break;
            case 3:
                if ($("#outlet_3_id").hasClass("outlet_0")) {
                    set_def_deluge(4, 1);
                } else {
                    $("#setdeluge_3").prop('checked', true);
                    update_value_valve(const_valve_deluge_default, 3, 1);
                }
                break;
            case 4:
                if ($("#outlet_4_id").hasClass("outlet_0")) {
                     set_def_deluge(5, 1);
                } else {
                    $("#setdeluge_4").prop('checked', true);
                    update_value_valve(const_valve_deluge_default, 4, 1);
                }
                break;
            case 5:
                if ($("#outlet_5_id").hasClass("outlet_0")) {
                    set_def_deluge(0, 1);
                } else {
                    $("#setdeluge_5").prop('checked', true);
                    update_value_valve(const_valve_deluge_default, 5, 1);
                }
                break;
            }
        }
    } else {
        if (!($("#outletv2_0_id").hasClass("outlet_0") &&
            $("#outletv2_1_id").hasClass("outlet_0") &&
            $("#outletv2_2_id").hasClass("outlet_0") &&
            $("#outletv2_3_id").hasClass("outlet_0") &&
            $("#outletv2_4_id").hasClass("outlet_0") &&
            $("#outletv2_5_id").hasClass("outlet_0"))) {
            switch (index) {
            case 0:
                if ($("#outletv2_0_id").hasClass("outlet_0")) {
                    set_def_deluge(1, 2);
                } else {
                    $("#setdeluge_0v2").prop('checked', true);
                    update_value_valve(const_valve_deluge_default, 0, 2);
                }
                break;
            case 1:
                if ($("#outletv2_1_id").hasClass("outlet_0")) {
                    set_def_deluge(2, 2);
                } else {
                    $("#setdeluge_1v2").prop('checked', true);
                    update_value_valve(const_valve_deluge_default, 1, 2);
                }
                break;
            case 2:
                if ($("#outletv2_2_id").hasClass("outlet_0")) {
                    set_def_deluge(3, 2);
                } else {
                    $("#setdeluge_2v2").prop('checked', true);
                    update_value_valve(const_valve_deluge_default, 2, 2);
                }
                break;
            case 3:
                if ($("#outletv2_3_id").hasClass("outlet_0")) {
                    set_def_deluge(4, 2);
                } else {
                    $("#setdeluge_3v2").prop('checked', true);
                    update_value_valve(const_valve_deluge_default, 3, 2);
                }
                break;
            case 4:
                if ($("#outletv2_4_id").hasClass("outlet_0")) {
                    set_def_deluge(5, 2);
                } else {
                    $("#setdeluge_4v2").prop('checked', true);
                    update_value_valve(const_valve_deluge_default, 4, 2);
                }
                break;
            case 5:
                if ($("#outletv2_5_id").hasClass("outlet_0")) {
                    set_def_deluge(0, 2);
                } else {
                    $("#setdeluge_5v2").prop('checked', true);
                    update_value_valve(const_valve_deluge_default, 5, 2);
                }
                break;
            }
        }
    }
}

//Issue 994 : altered by TF team,22-04-2015 to grey out massage text box if the user deselecs the custom massagebox radio button
function activate_textbox(ischecked,textboxname,customorderin,valvein){	
	if (ischecked) {
		//added by TF team,22-04-2015
		if(textboxname =="massage_orderv1c1"){			
			$("#massage_orderv1c1.massage_box").css("background-color", "#5a5a5a");
			update_value(const_custom_msg_Status,0);						
		}
		if(textboxname =="massage_orderv1c2"){
			update_value(const_custom_msg_Status,2);			
			$("#massage_orderv1c2.massage_box").css("background-color", "#5a5a5a");
		}	
		if(textboxname =="massage_orderv2c1"){
			update_value(const_custom_msg_Status,4);			
			$("#massage_orderv2c1.massage_box").css("background-color", "#5a5a5a");
		}	
		if(textboxname =="massage_orderv2c2"){			
			update_value(const_custom_msg_Status,6);
			$("#massage_orderv2c2.massage_box").css("background-color", "#5a5a5a");
		}			
		document.getElementById(textboxname).disabled = false;
	}else{	
		if(textboxname =="massage_orderv1c1"){			
			update_value(const_custom_msg_Status,1);					
			$("#massage_orderv1c1.massage_box").css("background-color", "#A0A0A0");
		}
		if(textboxname =="massage_orderv1c2"){			
			update_value(const_custom_msg_Status,3);		
			$("#massage_orderv1c2.massage_box").css("background-color", "#A0A0A0");
		}	
		if(textboxname =="massage_orderv2c1"){
			update_value(const_custom_msg_Status,5);		
			$("#massage_orderv2c1.massage_box").css("background-color", "#A0A0A0");			
		}	
		if(textboxname =="massage_orderv2c2"){
			update_value(const_custom_msg_Status,7);
			$("#massage_orderv2c2.massage_box").css("background-color", "#A0A0A0");
		}			

		document.getElementById(textboxname).disabled = true;		
		dialogOpencustomMassageWarning1();
		setTimeout(function () {
			dialogClosecustomMassageWarning1();
        }, 2900);			
		//disabled by TF team
		// also clear out the custom massage order		
		//update_value_outlet(const_valve_massage_order,"",valvein,customorderin);
		//document.getElementById(textboxname).value = "";
	}
}

/******Added by TF-Team on 27-10-2015 for bug fix of 1339********/
function clear_massage(){
	//To send a message to the cgi after clearing the custom massage pattern in the webpage 
	update_value(const_massage_clear,1);
}
/*******End of Add**********/

function run_power_clean () {
	// to do here: show a warning to wait for power clean cycle to end, or possibly find a way to shut down the interface until power clean is over
	// now send message to start power clean
	update_value(const_steam_start_clean,1);	
	// reload the page to reset the time to power clean entry
    
	setTimeout(function () {
                powerclean_check_load();
            }, 500);
}

//Added By TF2 for power clean pop-up - TF2*March 2nd 2015 - Bug 279
/* *********************************************************************************************************************** */
function Upload_powerclean_message() {
	$('#dialog-steam-powerclean').dialog({
		closeOnEscape: false,
		height: "auto !important",
		width: "auto !important",
		resizable: false,
		modal: true,
		draggable: false,
		dialogClass: 'main-dialog-class',
	});
}

function Unload_powerclean_message() {
	$('#dialog-steam-powerclean').dialog("close");
}

function powerclean_check_load() {
	$.ajax({
			type: "GET",
			url: "powerclean_check.cgi",
			data: {},
			dataType: "JSON",
			cache: false,
			
			success: function (data) {
				if(data.powerclean == 1)
				{
					$('#dialog-steam-powerclean').dialog({
						closeOnEscape: false,
						height: "auto !important",
						width: "auto !important",
						resizable: false,
						modal: true,
						draggable: false,
						dialogClass: 'main-dialog-class',
					});
					powerclean_On = 1; //TF Team 07-07
				}
				else if((data.powerclean == 0) && (powerclean_On == 1)) //TF Team 07-07
				{
					$('#dialog-steam-powerclean').dialog("close");
					powerclean_On = 0; //TF Team 07-07
				}
        	}
		});	
			setTimeout(function () {
            powerclean_check_load();
            }, 1000);
	
}
/* *********************************************************************************************************************** */
//End of Add by TF2 - TF2*March 2nd 2015 - Bug 279 - Power clean pop-up

function check_def_outlet(index, valve) {
    if (valve === 1) {
        if (!($("#outlet_0_id").hasClass("outlet_0") &&
            $("#outlet_1_id").hasClass("outlet_0") &&
            $("#outlet_2_id").hasClass("outlet_0") &&
            $("#outlet_3_id").hasClass("outlet_0") &&
            $("#outlet_4_id").hasClass("outlet_0") &&
            $("#outlet_5_id").hasClass("outlet_0"))) {
            switch (index) {
            case 0:
                if ($("#outlet_0_id").hasClass("outlet_0")) {
                    check_def_outlet(1, 1);
                } else {
                    $("#default_0").prop('checked', true);
                    update_value_valve(const_valve_outlet_default, 0, 1);
                }
                break;
            case 1:
                if ($("#outlet_1_id").hasClass("outlet_0")) {
                    check_def_outlet(2, 1);
                } else {
                    $("#default_1").prop('checked', true);
                    update_value_valve(const_valve_outlet_default, 1, 1);
                }
                break;
            case 2:
                if ($("#outlet_2_id").hasClass("outlet_0")) {
                    check_def_outlet(3, 1);
                } else {
                    $("#default_2").prop('checked', true);
                    update_value_valve(const_valve_outlet_default, 2, 1);
                }
                break;
            case 3:
                if ($("#outlet_3_id").hasClass("outlet_0")) {
                    check_def_outlet(4, 1);
                } else {
                    $("#default_3").prop('checked', true);
                    update_value_valve(const_valve_outlet_default, 3, 1);
                }
                break;
            case 4:
                if ($("#outlet_4_id").hasClass("outlet_0")) {
                     check_def_outlet(5, 1);
                } else {
                    $("#default_4").prop('checked', true);
                    update_value_valve(const_valve_outlet_default, 4, 1);
                }
                break;
            case 5:
                if ($("#outlet_5_id").hasClass("outlet_0")) {
                    check_def_outlet(0, 1);
                } else {
                    $("#default_5").prop('checked', true);
                    update_value_valve(const_valve_outlet_default, 5, 1);
                }
                break;
            }
        }
    } else {
        if (!($("#outletv2_0_id").hasClass("outlet_0") &&
            $("#outletv2_1_id").hasClass("outlet_0") &&
            $("#outletv2_2_id").hasClass("outlet_0") &&
            $("#outletv2_3_id").hasClass("outlet_0") &&
            $("#outletv2_4_id").hasClass("outlet_0") &&
            $("#outletv2_5_id").hasClass("outlet_0"))) {
            switch (index) {
            case 0:
                if ($("#outletv2_0_id").hasClass("outlet_0")) {
                    check_def_outlet(1, 2);
                } else {
                    $("#default_0v2").prop('checked', true);
                    update_value_valve(const_valve_outlet_default, 0, 2);
                }
                break;
            case 1:
                if ($("#outletv2_1_id").hasClass("outlet_0")) {
                    check_def_outlet(2, 2);
                } else {
                    $("#default_1v2").prop('checked', true);
                    update_value_valve(const_valve_outlet_default, 1, 2);
                }
                break;
            case 2:
                if ($("#outletv2_2_id").hasClass("outlet_0")) {
                    check_def_outlet(3, 2);
                } else {
                    $("#default_2v2").prop('checked', true);
                    update_value_valve(const_valve_outlet_default, 2, 2);
                }
                break;
            case 3:
                if ($("#outletv2_3_id").hasClass("outlet_0")) {
                    check_def_outlet(4, 2);
                } else {
                    $("#default_3v2").prop('checked', true);
                    update_value_valve(const_valve_outlet_default, 3, 2);
                }
                break;
            case 4:
                if ($("#outletv2_4_id").hasClass("outlet_0")) {
                    check_def_outlet(5, 2);
                } else {
                    $("#default_4v2").prop('checked', true);
                    update_value_valve(const_valve_outlet_default, 4, 2);
                }
                break;
            case 5:
                if ($("#outletv2_5_id").hasClass("outlet_0")) {
                    check_def_outlet(0, 2);
                } else {
                    $("#default_5v2").prop('checked', true);
                    update_value_valve(const_valve_outlet_default, 5, 2);
                }
                break;
            }
        }
    }
}
//Added by TF-Team on 17-11-2015 for spa selection implementation 
function spa_selection(checked,image,value)
{
	switch(value)
	{
	case 1:
		if(checked.checked && ($(image).hasClass("breathe")))
		{
			   update_spa_value(const_spa_selection,1,1);
		}else{
			update_spa_value(const_spa_selection,1,0);
		}
		break;
	case 2:
		if(checked.checked && ($(image).hasClass("release")))
		{
			   update_spa_value(const_spa_selection,2,1);
		}else{
			update_spa_value(const_spa_selection,2,0);
		}
		break;
	case 3:
		if(checked.checked && ($(image).hasClass("exhilerate")))
		{
			   update_spa_value(const_spa_selection,3,1);
		}else{
			update_spa_value(const_spa_selection,3,0);
		}
		break;
	case 4:
		if(checked.checked && ($(image).hasClass("flex")))
		{
			   update_spa_value(const_spa_selection,4,1);
		}
		else{
			update_spa_value(const_spa_selection,4,0);
		}
		break;
	case 5:
		if(checked.checked && ($(image).hasClass("warmup")))
		{
			   update_spa_value(const_spa_selection,5,1);
		}else{
			update_spa_value(const_spa_selection,5,0);
		}
		break;
	case 6:
		if(checked.checked && ($(image).hasClass("cooldown")))
		{
			   update_spa_value(const_spa_selection,6,1);
		}else{
			update_spa_value(const_spa_selection,6,0);
		}
		break;
	case 7:
		if(checked.checked && ($(image).hasClass("renew")))
		{
			   update_spa_value(const_spa_selection,7,1);
		}else{
			update_spa_value(const_spa_selection,7,0);
		}
		break;
	case 8:
		if(checked.checked && ($(image).hasClass("headaid")))
		{
			   update_spa_value(const_spa_selection,8,1);
		}else{
			update_spa_value(const_spa_selection,8,0);
		}
		break;
	case 9:
		if(checked.checked && ($(image).hasClass("detox")))
		{
			   update_spa_value(const_spa_selection,9,1);
		}else{
			update_spa_value(const_spa_selection,9,0);
		}
		break;
	case 10:
		if(checked.checked && ($(image).hasClass("steam_coach")))
		{
			   update_spa_value(const_spa_selection,10,1);
		}else{
			update_spa_value(const_spa_selection,10,0);
		}
		break;
	case 11:
		if(checked.checked && ($(image).hasClass("repair")))
		{
			   update_spa_value(const_spa_selection,11,1);
		}else{
			update_spa_value(const_spa_selection,11,0);
		}
		break;
	}
	setTimeout(function() //Added by TF Team on 9-2-2016 for last spa experience deselect implementation
	{
		if(showerConfigurationActive == 1 || showerConfigurationActive == 2 || showerConfigurationActive == 3 || showerConfigurationActive == 4 || showerConfigurationActive == 5)
		{
			if((document.getElementById("enable1").checked == false) && (document.getElementById("enable2").checked == false) &&
			(document.getElementById("enable3").checked == false) && (document.getElementById("enable4").checked == false) &&
			(document.getElementById("enable5").checked == false) && (document.getElementById("enable6").checked == false) &&
			(document.getElementById("enable7").checked == false) && (document.getElementById("enable8").checked == false) &&
			(document.getElementById("enable9").checked == false) && (document.getElementById("enable10").checked == false) &&
			(document.getElementById("enable11").checked == false))
			{
				location.href = "settings.html";
				document.getElementById("spa_activate_checkbox").checked = false;
				update_value(const_spa,0);
				$('#spa_tab').hide();
			}
		}
		if(showerConfigurationActive == 6 || showerConfigurationActive == 7 || showerConfigurationActive == 8)
		{
			if((document.getElementById("enable1_1").checked == false) && (document.getElementById("enable2_1").checked == false) &&
				(document.getElementById("enable3_1").checked == false) && (document.getElementById("enable4_1").checked == false) &&
				(document.getElementById("enable5_1").checked == false) && (document.getElementById("enable6_1").checked == false) &&
				(document.getElementById("enable7_1").checked == false) && (document.getElementById("enable8_1").checked == false) &&
				(document.getElementById("enable9").checked == false) && (document.getElementById("enable10").checked == false) &&
				(document.getElementById("enable11").checked == false))
				{
					location.href = "settings.html";
					document.getElementById("spa_activate_checkbox").checked = false;
					update_value(const_spa,0);
					$('#spa_tab').hide();
				}
		}
	}, 1500);
	
}

function update_spa_value(indexin,valuein,checked)
{
	bool_needs_save = true;
    trace('Update Spa');
    $.ajax({
        type: "GET",
        url: "save_variable.cgi",
        data: {
            index: indexin,
            value: valuein,
			check: checked
        },
        dataType: "text",
        cache: false
    });
}
//End of add by TF-Team on 17-11-2015 for spa selection 
function load() {
    trace('Settings Load Start');
    
    $.ajax({
        type: "GET",
        url: "values.cgi",
        data: {},
        dataType: "JSON",
        cache: false,
      /*  error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert("Fatal Error: UI has not loaded properly. Could not communicate with unit. Error Status: " + textStatus + ", Error Description: " + errorThrown);
			// now make sure everything is hidden to avoid confusion
			console.log(arguments);
			$("#users_tab").hide(); 
			$("#valve1_tab").hide(); 
			$("#valve2_tab").hide(); 
			$("#interface_tab").hide(); 
			$("#music_tab").hide(); 
			$("#lighting_tab").hide(); 
			$("#steam_tab").hide(); 
       },*/
        success: function (data) {
			hide_things = data.hide_all;
			bool_gen1UIConnectionStatus = data.gen1connected;
			bool_gen2UIConnectionStatus = data.gen2connected;
//			gen1UIConnected();
            if (hide_things) {
				// removing control.html functionality until release 2 
				              
				if(data.shower_on || data.steam_running) {    //Added steam_running by TF Team 10-07
	    	    	location.href = "control.html";
				}	
                if (data.num_interface !== 0) {
                    //If there are no interfaces, there is no control
                    
                    if(!(data.rainpanel_installed 
                        || data.bridge_installed 
                        || data.amp_installed
                        || data.steam_installed
                        || data.valve1_installed
                        || data.valve2_installed
                        || data.music_installed ) )
                        {
                            $('#control_div').hide();
                            $('#control-tab').hide();
                        }
						else
						{
                            $('#control_div').show();
                            $('#control-tab').show();
                        }
                } else {
                    $('#control-tab').hide();
                }	
				if(data.bridge_installed) //TF-Team for issue 1389
				{
					document.getElementById("Light_bridge").style.visibility='visible';
					document.getElementById("Light_bridge").style.display='block';
				}else{
					document.getElementById("Light_bridge").style.visibility='hidden';
					document.getElementById("Light_bridge").style.display='none';
				}
				//Issue 994 : added by TF team,22-04-2015 				
				showerConfigurationActive = data.ShowerConfiguration;
				valve1PortType 			  = data.valve1PortsAvailable;
				valve2PortType            = data.valve2PortsAvailable;
				
				
//Per Email from Mark Storsved on 2/24/14 - 
//Dual Shower will not be supported in Release One as Kohler doesn't understand how it will impact the shower experience.
//So the code will be left, but commented out.
/*
                if(data.valve1_installed && data.valve2_installed)
                {
                    $('.dual_shower').show();
                }else{
                    $('.dual_shower').hide();
                }
				document.getElementById("dual_shower_1").checked = data.dual_shower;
                document.getElementById("dual_shower_2").checked = data.dual_shower;
*/
  
				//system tab - activate date picker
                document.getElementById('datetimepicker').value = data.time;
//    			$('#datetimepicker').datetimepicker();

                $('#datetimepicker').datetimepicker({
                    timeFormat: data.time_format,
                    dateFormat: data.date_format,
                    showTimezone: true
                });

				//system tab - set up automatic/custom configuration list
                configv1_outlets = data.num_outlets;
                configv2_outlets = data.v2_num_outlets;
                config_index = data.config;
				
				//(issue- 1159)- TF team added to hide valve if fatal error occured 
				v1_fatalERROR = data.valve1_ErrorFatal;
				v2_fatalERROR = data.valve2_ErrorFatal;
				
                config();

				//system tab - set up steam, massage, spa checkboxes
				if(data.steam_installed)
				{
					//Show the steam enable button
					$("#steam_activate_checkbox").show();
					document.getElementById('steam_select').checked = data.steam_select;
					if(data.steam_select)
					{
						$(".v1_deluge").show(); //TF team
						$(".v2_deluge").show(); //TF team
						
						$("#steam_spa_title").show();
						$("#steam_spa_outlet_table").show();
						document.getElementById("steam_spa_separation_line").style.visibility='visible';
						document.getElementById("steam_spa_title").style.visibility='visible';
						//document.getElementById("steam_spa_outlet_table").style.visibility='visible';
					}
					else
					{
						$(".v1_deluge").hide(); //TF team
						$(".v2_deluge").hide(); //TF team
						$("#steam_spa_separation_line").hide();
						$("#steam_spa_title").hide();
						$("#steam_spa_outlet_table").hide();
						document.getElementById("steam_spa_separation_line").style.visibility='hidden';
						document.getElementById("steam_spa_title").style.visibility='hidden';
						//document.getElementById("steam_spa_outlet_table").style.visibility='hidden';
					}
				}
				else
				{
					//Hide the steam enable button
					$("#steam_activate_checkbox").hide();
					$(".v1_deluge").hide(); //TF team
					$(".v2_deluge").hide(); //TF team
					$("#steam_spa_separation_line").hide();
					$("#steam_spa_title").hide();
					$("#steam_spa_outlet_table").hide();
					document.getElementById("steam_spa_separation_line").style.visibility='hidden';
					document.getElementById("steam_spa_title").style.visibility='hidden';
					//document.getElementById("steam_spa_outlet_table").style.visibility='hidden';
					
				}
				
				if(data.valve1_installed || data.valve2_installed)
				{
					$("#massage_activate_checkbox").show();
					document.getElementById('massage').checked = data.massage;
					if(data.massage)
					{
						$(".massage_div").show();
						$("#custom_massage_block_1").show();  //Added by TF team 14-08
						$("#custom_massage_block_2").show();  //Added by TF team 14-08
					}
					else
					{
						$(".massage_div").hide();
						$("#custom_massage_block_1").hide();  //Added by TF team 14-08
						$("#custom_massage_block_2").hide();  //Added by TF team 14-08
					}
				}
				else
				{
					$("#massage_activate_checkbox").hide();
				}

				// show/hide status of spa checkbox handled by the config() decision - show spa if a standard config is used
				// $("#spa_activate_checkbox").show();
                document.getElementById('spa').checked = data.spa;

				//system tab - set daylight saving time stuff
                //document.getElementById('daylight_savings').checked = data.daylight;
				if(data.daylight) {
					document.getElementById('daylight_0').checked = true;
					document.getElementById('daylight_1').checked = false;
				} else {
					document.getElementById('daylight_0').checked = false;
					document.getElementById('daylight_1').checked = true;
				}
                
				document.getElementById('lock_check').checked = data.ui_settings_locked; //Changed data.locked to data.ui_settings_locked by TF Team
				
				document.getElementById('web_lock').checked = data.web_locked;  //Added by TF Team
				document.getElementById('userlock').checked = data.ui_user_locked;  //Added by TF Team
				
				
				// system tab - set language
                document.getElementById('lang').selectedIndex = data.langIndex;
				
				/*
				//relay and contact stuff - removed from system tab for release 1
                document.getElementById('relay1_name').value = data.relay1_string;
                document.getElementById('relay2_name').value = data.relay2_string;
                document.getElementById('contact1_name').value = data.contact1_string;
                document.getElementById('contact2_name').value = data.contact2_string;

                document.getElementById('relay1_on_trigger').selectedIndex = data.relay_1_on_trigger;
                document.getElementById('relay1_off_trigger').selectedIndex = data.relay_1_off_trigger;
                document.getElementById('relay1_on_delay').value = data.relay_1_on_delay;
                if (data.relay_1_on_delay !== 0) {
                    document.getElementById('relay1_on_delay_check').checked = true;
                }
                document.getElementById('relay1_off_delay').value = data.relay_1_off_delay;
                if (data.relay_1_off_delay !== 0) {
                    document.getElementById('relay1_off_delay_check').checked = true;
                }
                document.getElementById('relay2_on_trigger').selectedIndex = data.relay_2_on_trigger;
                document.getElementById('relay2_off_trigger').selectedIndex = data.relay_2_off_trigger;
                document.getElementById('relay2_on_delay').value = data.relay_2_on_delay;
                if (data.relay_2_on_delay !== 0) {
                    document.getElementById('relay2_on_delay_check').checked = true;
                }
                document.getElementById('relay2_off_delay').value = data.relay_2_off_delay;
                if (data.relay_2_off_delay !== 0) {
                    document.getElementById('relay2_off_delay_check').checked = true;
                }
                document.getElementById('contact_1_open').selectedIndex = data.contact_1_on_trigger;
                document.getElementById('contact_1_closed').selectedIndex = data.contact_1_off_trigger;
                document.getElementById('contact1_on_delay').value = data.contact_1_on_delay;
                if (data.contact_1_on_delay !== 0) {
                    document.getElementById('contact1_on_delay_check').checked = true;
                }
                document.getElementById('contact1_off_delay').value = data.contact_1_off_delay;
                if (data.contact_1_off_delay !== 0) {
                    document.getElementById('contact1_off_delay_check').checked = true;
                }
                document.getElementById('contact_2_open').selectedIndex = data.contact_2_on_trigger;
                document.getElementById('contact_2_closed').selectedIndex = data.contact_2_off_trigger;
                document.getElementById('contact2_on_delay').value = data.contact_2_on_delay;
                if (data.contact_2_on_delay !== 0) {
                    document.getElementById('contact2_on_delay_check').checked = true;
                }
                document.getElementById('contact2_off_delay').value = data.contact_2_off_delay;
                if (data.contact_2_off_delay !== 0) {
                    document.getElementById('contact2_off_delay_check').checked = true;
                }
				*/

                //light tab defaults                
                //Show/hide modules and dim divs
                $('#remove_modules').empty();
                var select = document.getElementById("remove_modules");
                modules_installed = 0;
				if (data.bridge_installed) {
                    $('#new_light_modual').show();
				}

				// figure out the delay we will be using for all three modules - delay is always either 0 or same value as the other modules
				var lightdelay = 5;  // Changed from 1 to 5 for showing default as 5 mins in delay_off_for by tf-team on 12-10-2015
				if (data.light1_delay !== 0) { lightdelay = data.light1_delay; }
				if (data.light2_delay !== 0) { lightdelay = data.light2_delay; }
				if (data.light3_delay !== 0) { lightdelay = data.light3_delay; }

                if (data.light1_installed) {
                    select.options[select.options.length] = new Option($('.light_1_string').html(), 1);
                    $('#module_1').show();
                    modules_installed += 1;
					// if this is a dimmable light, show dimming options
                    if (data.light1_type === 0) {
	                    $('#light1_type').html("Switch/Toggle");
                        $('#hide_this_1').hide();
                        $('#spacer_1').show();
                        bool_light1_dimmer = false;
                    } else {
	                    $('#light1_type').html("Dimmable");
                        $('#hide_this_1').show();
                        $('#spacer_1').hide();
						// set the fade speed and default brightness here
						/********Added by Tf-Team to restore drop down through index*********/
						var light_fade_index1;
						if(data.light1_fade == 5)
						{
							light_fade_index1 = 0;
						}
						if(data.light1_fade == 30)
						{
							light_fade_index1 = 1;
						}
						if(data.light1_fade == 0)
						{
							light_fade_index1 = 2;
						}
						/******End of Add******/
		                document.getElementById("fade_1").selectedIndex = light_fade_index1;
						$('#slider_1').slider('value', data.light1_level);
		                $('#amount_1').val($('#slider_1').slider('value') + '%');
                    }
					// set the delay here
	                if (data.light1_delay !== 0) {
    	                document.getElementById("delay_1").checked = true;
	       	            $("#delay_off_for").val(data.light1_delay);
            	    } else {
    	                document.getElementById("delay_1").checked = false;
	       	            $("#delay_off_for").val(lightdelay);
					}
                } else {
                    $('#module_1').hide();
                }

                //module 2...
                if (data.light2_installed) {
                    modules_installed += 1;
                    select.options[select.options.length] = new Option($('.light_2_string').html(), 2);
					$('#module_2').show();
                    if (data.light2_type === 0) {
	                    $('#light2_type').html("Switch/Toggle");
                        $('#hide_this_2').hide();
                        $('#spacer_2').show();
                        bool_light2_dimmer = false;
                    } else {
	                    $('#light2_type').html("Dimmable");
                        $('#hide_this_2').show();
                        $('#spacer_2').hide();
						// set the fade speed and default brightness here
						/********Added by Tf-Team to restore drop down through index*********/
						var light_fade_index2;
						if(data.light2_fade == 5)
						{
							light_fade_index2 = 0;
						}
						if(data.light2_fade == 30)
						{
							light_fade_index2 = 1;
						}
						if(data.light2_fade == 0)
						{
							light_fade_index2 = 2;
						}
						/******End of Add******/
		                document.getElementById("fade_2").selectedIndex = light_fade_index2;
						$('#slider_2').slider('value', data.light2_level);
		                $('#amount_2').val($('#slider_2').slider('value') + '%');
                    }
					// set the delay here
	                if (data.light2_delay !== 0) {
    	                document.getElementById("delay_2").checked = true;
	       	            $("#delay_off_for2").val(data.light2_delay);
            	    } else {
    	                document.getElementById("delay_2").checked = false;
	       	            $("#delay_off_for2").val(lightdelay);  // Changed from delay_off_for to delay_off_for bt Tf-Team on 12-10-2015
					}
                } else {
                    $('#module_2').hide();
                }
                //module 3...
                if (data.light3_installed) {
                    modules_installed += 1;
                    select.options[select.options.length] = new Option($('.light_3_string').html(), 3);
					$('#module_3').show();
                    if (data.light3_type === 0) {
	                    $('#light3_type').html("Switch/Toggle");
                        $('#hide_this_3').hide();
                        $('#spacer_3').show();
                        bool_light3_dimmer = false;
                    } else {
	                    $('#light3_type').html("Dimmable");
                        $('#hide_this_3').show();
                        $('#spacer_3').hide();
						// set the fade speed and default brightness here
						/********Added by Tf-Team to restore drop down through index*********/
						var light_fade_index3;
						if(data.light3_fade == 5)
						{
							light_fade_index3 = 0;
						}
						if(data.light3_fade == 30)
						{
							light_fade_index3 = 1;
						}
						if(data.light3_fade == 0)
						{
							light_fade_index3 = 2;
						}
						/******End of Add******/
		                document.getElementById("fade_3").selectedIndex = light_fade_index3;
						$('#slider_3').slider('value', data.light3_level);
		                $('#amount_3').val($('#slider_3').slider('value') + '%');
                    }
					// set the delay here
	                if (data.light3_delay !== 0) {
    	                document.getElementById("delay_3").checked = true;
	       	            $("#delay_off_for3").val(data.light3_delay);
            	    } else {
    	                document.getElementById("delay_3").checked = false;
	       	            $("#delay_off_for3").val(lightdelay);
					}
                } else {
                    $('#module_3').hide();
                }

                var num = modules_installed;
                if (num === 0) {
                    //no modules, hide button and select
                    $('#remove_modules').hide();
                    $('#del_light_modual').hide();
                } else {
                    $('#remove_modules').show();
                    $('#del_light_modual').show();
                    if (num >= 3) {
                        //Hide Id button
                        $('#new_light_modual').hide();
                    }
                }

                $("#name_1").html(data.light1_name);
                $("#name_2").html(data.light2_name);
                $("#name_3").html(data.light3_name);

                //RainPanel
                document.getElementById("fade_speed_select").selectedIndex = data.rain_fade;
                document.getElementById("white_color_select").selectedIndex = data.rain_white;
                document.getElementById("effect_speed_select").selectedIndex = data.rain_speed;
                $('#slider_chroma').slider('value', data.rain_brightness);
                $('#amount_chroma').val($('#slider_chroma').slider('value') + '%');
                
				//interface tab
                $("#one_order").empty();
                $("#two_order").empty();
                var v1_outlets = 0;
                if ((data.valve1_outlet1_func) !== undefined) {
                    v1_outlets += 1;
                    document.getElementById("one_order").innerHTML += "<li name=\""+ data.valve1_outlet1_func.id+"\" id=\""+ data.valve1_outlet1_func.id+"\" class=\"ui-state-default outlet outlet_" + data.valve1_outlet1_func.func + "\" ></li>";
                }
                if ((data.valve1_outlet2_func) !== undefined) {
                    v1_outlets += 1;
                    document.getElementById("one_order").innerHTML += "<li name=\""+ data.valve1_outlet2_func.id+"\" id=\""+ data.valve1_outlet2_func.id+"\" class=\"ui-state-default outlet outlet_" + data.valve1_outlet2_func.func + "\" ></li>";
                }
                if ((data.valve1_outlet3_func) !== undefined) {
                    v1_outlets += 1;
                    document.getElementById("one_order").innerHTML += "<li name=\""+ data.valve1_outlet3_func.id+"\" id=\""+ data.valve1_outlet3_func.id+"\" class=\"ui-state-default outlet outlet_" + data.valve1_outlet3_func.func + "\" ></li>";
                }
                if ((data.valve1_outlet4_func) !== undefined) {
                    v1_outlets += 1;
                    document.getElementById("one_order").innerHTML += "<li name=\""+ data.valve1_outlet4_func.id+"\" id=\""+ data.valve1_outlet4_func.id+"\" class=\"ui-state-default outlet outlet_" + data.valve1_outlet4_func.func + "\" ></li>";
                }
                if ((data.valve1_outlet5_func) !== undefined) {
                    v1_outlets += 1;
                    document.getElementById("one_order").innerHTML += "<li name=\""+ data.valve1_outlet5_func.id+"\" id=\""+ data.valve1_outlet5_func.id+"\" class=\"ui-state-default outlet outlet_" + data.valve1_outlet5_func.func + "\" ></li>";
                }
                if ((data.valve1_outlet6_func) !== undefined) {
                    v1_outlets += 1;
                    document.getElementById("one_order").innerHTML += "<li name=\""+ data.valve1_outlet6_func.id+"\" id=\""+ data.valve1_outlet6_func.id+"\" class=\"ui-state-default outlet outlet_" + data.valve1_outlet6_func.func + "\" ></li>";
                }
                if (v1_outlets === 0) {
                    $('#valve1_order').hide();
                    //TODO: add in hiding on interface tab?
                } else {
                    $('#valve1_order').show();
                }
                var v2_outlets = 0;
                if ((data.valve2_outlet1_func) !== undefined) {
                    v2_outlets += 1;
                    document.getElementById("two_order").innerHTML += "<li name=\""+ data.valve2_outlet1_func.id+"\" id=\""+ data.valve2_outlet1_func.id+"\" class=\"ui-state-default outlet outlet_" + data.valve2_outlet1_func.func + "\" ></li>";
                }
                if ((data.valve2_outlet2_func) !== undefined) {
                    v2_outlets += 1;
                    document.getElementById("two_order").innerHTML += "<li name=\""+ data.valve2_outlet2_func.id+"\" id=\""+ data.valve2_outlet2_func.id+"\" class=\"ui-state-default outlet outlet_" + data.valve2_outlet2_func.func + "\" ></li>";
                }
                if ((data.valve2_outlet3_func) !== undefined) {
                    v2_outlets += 1;
                    document.getElementById("two_order").innerHTML += "<li name=\""+ data.valve2_outlet3_func.id+"\" id=\""+ data.valve2_outlet3_func.id+"\" class=\"ui-state-default outlet outlet_" + data.valve2_outlet3_func.func + "\" ></li>";
                }
                if ((data.valve2_outlet4_func) !== undefined) {
                    v2_outlets += 1;
                    document.getElementById("two_order").innerHTML += "<li name=\""+ data.valve2_outlet4_func.id+"\" id=\""+ data.valve2_outlet4_func.id+"\" class=\"ui-state-default outlet outlet_" + data.valve2_outlet4_func.func + "\" ></li>";
                }
                if ((data.valve2_outlet5_func) !== undefined) {
                    v2_outlets += 1;
                    document.getElementById("two_order").innerHTML += "<li name=\""+ data.valve2_outlet5_func.id+"\" id=\""+ data.valve2_outlet5_func.id+"\" class=\"ui-state-default outlet outlet_" + data.valve2_outlet5_func.func + "\" ></li>";
                }
                if ((data.valve2_outlet6_func) !== undefined) {
                    v2_outlets += 1;
                    document.getElementById("two_order").innerHTML += "<li name=\""+ data.valve2_outlet6_func.id+"\" id=\""+ data.valve2_outlet6_func.id+"\" class=\"ui-state-default outlet outlet_" + data.valve2_outlet6_func.func + "\" ></li>";
                }
                if (v2_outlets === 0) {
                    $('#valve2_order').hide();
                    //TODO: add in hiding on interface tab?
                } else {
                    $('#valve2_order').show();
                }
                if (v1_outlets === 0 && v2_outlets === 0) {
                    $('#order_div').hide();
                } else {
                    $('#order_div').show();
                }
				
				//Issue 994 : added by TF team ,22-04-2015 to get pattern from server 
				// fill in custom massage orders - if they exist, activate corresponding checkbox				
				if(data.valve_config_changed === 1){	

					// 994 - TF team added for the custom massage popup
					if((data.v1c1 != "")||
					  (data.v1c2 != "")||
					  (data.v2c1 != "")||
					  (data.v2c2 != ""))
					  {
						dialogOpencustomMassageWarning3();
						setTimeout(function (){
						 dialogClosecustomMassageWarning3();
						}, 3800);								  
					  }
							
					document.getElementById("massageorder_1").checked = false;
					document.getElementById("massageorder_2").checked = false;
					document.getElementById('massage_orderv1c1').value = "";
					document.getElementById('massage_orderv1c2').value = "";		
			
					CustomMassage_OrderV1C1 = "";
					CustomMassage_OrderV1C2 = "";
					$("#massage_orderv1c1.massage_box").css("background-color", "#5a5a5a");
					$("#massage_orderv1c2.massage_box").css("background-color", "#5a5a5a");
				
					update_customMassageOrder(const_valve_massage_order,"",1,1);
					update_customMassageOrder(const_valve_massage_order,"",1,2);
				
					document.getElementById("massageorderv2_1").checked = false;
					document.getElementById("massageorderv2_2").checked = false;
					document.getElementById('massage_orderv2c1').value = "";
					document.getElementById('massage_orderv2c2').value = "";	
					CustomMassage_OrderV2C1 = "";
					CustomMassage_OrderV2C2 = "";

					update_customMassageOrder(const_valve_massage_order,"",2,1);
					update_customMassageOrder(const_valve_massage_order,"",2,2);
					$("#massage_orderv2c1.massage_box").css("background-color", "#5a5a5a");
					$("#massage_orderv2c2.massage_box").css("background-color", "#5a5a5a");
					clear_massage();  // Added by TF-Team on 27-10-2015 for bug fix 1339
				}							
                $("#massage_orderv1c1").val(data.v1c1);					
				CustomMassage_OrderV1C1 = data.v1c1;				
				if (data.custom_v1c1 === 0){
					if(data.v1c1 !== ""){
					document.getElementById("massageorder_1").checked = true;
					}else{
						document.getElementById("massageorder_1").checked 		= false;
						document.getElementById("massage_orderv1c1").disabled 	= true; 
						$("#massage_orderv1c1.massage_box").css("background-color", "#5a5a5a");   // Added by TF-Team 
					} 
				}else{
					if(data.v1c1 !== ""){
						$("#massage_orderv1c1.massage_box").css("background-color", "#A0A0A0");						
					}						
					document.getElementById("massageorder_1").checked = false;
					document.getElementById("massage_orderv1c1").disabled = true;
				}
                $("#massage_orderv1c2").val(data.v1c2);
				CustomMassage_OrderV1C2=data.v1c2;
				if (data.custom_v1c2 === 0){
					if(data.v1c2 !== ""){
					document.getElementById("massageorder_2").checked = true;
					}else{
						document.getElementById("massageorder_2").checked 		= false;
						document.getElementById("massage_orderv1c2").disabled 	= true;
						$("#massage_orderv1c2.massage_box").css("background-color", "#5a5a5a");  // Added by TF-Team
					}
				} else {
					if(data.v1c2 !== ""){
						$("#massage_orderv1c2.massage_box").css("background-color", "#A0A0A0");						
					}						
					document.getElementById("massageorder_2").checked = false;
					document.getElementById("massage_orderv1c2").disabled 	= true;
				}
                $("#massage_orderv2c1").val(data.v2c1);
				CustomMassage_OrderV2C1 = data.v2c1;
				if (data.custom_v2c1 === 0) {
					if(data.v2c1 !== ""){
					document.getElementById("massageorderv2_1").checked = true;
					}else{
						document.getElementById("massageorderv2_1").checked 	= false;
						document.getElementById("massage_orderv2c1").disabled 	= true;
						$("#massage_orderv2c1.massage_box").css("background-color", "#5a5a5a");  // Added by TF-Team
					}
				} else {
					if(data.v2c1 !== ""){
						$("#massage_orderv2c1.massage_box").css("background-color", "#A0A0A0");						
					}						
					document.getElementById("massageorderv2_1").checked = false;
					document.getElementById("massage_orderv2c1").disabled 	= true;
				}
                $("#massage_orderv2c2").val(data.v2c2);
				CustomMassage_OrderV2C2 = data.v2c2;
				if (data.custom_v2c2 === 0) {
					if(data.v2c2 !== ""){
					document.getElementById("massageorderv2_2").checked = true;
					}else{
						document.getElementById("massageorderv2_2").checked 	= false;
						document.getElementById("massage_orderv2c2").disabled 	= true;
						$("#massage_orderv2c2.massage_box").css("background-color", "#5a5a5a");  // Added by TF-Team
					}
				} else {
					if(data.v2c2 !== ""){
						$("#massage_orderv2c2.massage_box").css("background-color", "#A0A0A0");						
					}						
					document.getElementById("massageorderv2_2").checked = false;
					document.getElementById("massage_orderv2c2").disabled 	= true;
				}//end TF 				

                if (data.num_interface !== 0 ) {
                    if(!(data.rainpanel_installed 
						|| data.rainpanel2_installed    //Added by TF2 March*20*2015 - Bug 967 - Accomodating second rain panel
                        || data.bridge_installed 
                        || data.amp_installed
                        || data.steam_installed
                        || data.valve1_installed
                        || data.valve2_installed
                        || data.music_installed ) )
                        {
                            $('#control_div').hide();
                            $('#control-tab').hide();
                        }
						else
						{
							$('#control_div').show();
                            $('#control-tab').show();
                        }
                    
                    //If there are no interfaces, there is no control
                    $('#interface_tab').show();
                } else {
                    $('#control_div').hide();
                    $('#tabs-Interface').hide();
                    $('#interface_tab').hide();
                }
                if (!(data.rainpanel_installed || data.rainpanel2_installed)) {     //Changed by TF2 March*20*2015 - Bug 967 - Accomodating second rain panel
                    $('#chroma_settings_div').hide();
                } else {
                    $('#chroma_settings_div').show();
                }
                //LIGHTING VALUES
                //TODO: module type needs to hide slider, set global?
                if (!data.bridge_installed && !data.rainpanel_installed && !data.rainpanel2_installed) {  //Changed by TF2 March*20*2015 - Bug 967 - Accomodating second rain panel
                    $('#lighting_tab').hide();
                    $('#tabs-Lighting').hide();
                } else {
                    $('#lighting_tab').show();
                }

				if (!data.konnect_installed) {
                    $('#konnect_tab').hide();
                } else {
                    $('#konnect_tab').show();
					$('#konnect_ipstring').html(data.konnectip_string);
					$('#konnect_macstring').html(data.konnectmac_string);
					$('#konnect_ssidstring').html(data.konnectSSID);
					$('#konnect_modestring').html(data.konnectmode);
					$('#konnect_strengthstring').html(data.wifistrength_string);
                }

                if (!data.steam_installed) {
                    $('#steam_tab').hide();
                    $('#tabs-Steam').hide();
                } else {
                    $('#steam_tab').show();
                }
                if (!data.amp_installed) {
                    $('#tabs-Music').hide();
                    $('#music_tab').hide();
                    $('#music_status').hide();
                } else {
                    $('#music_tab').show();
                    $('#music_status').show();
                }

                //user tab load
                $(".user_1_title_string").html(user_title + " " + data.user1_string);
                $(".user_2_title_string").html(user_title + " " + data.user2_string);
                $(".user_3_title_string").html(user_title + " " + data.user3_string);
                $(".user_4_title_string").html(user_title + " " + data.user4_string);
                $(".user_5_title_string").html(user_title + " " + data.user5_string);
                $(".user_6_title_string").html(user_title + " " + data.user6_string);

                //about tab load
                if (data.amulet_version_string === "not_seen") {
                    $('#int1_about_div').hide();
                    $('#am_ver_div').hide();
                } else {
                    $('#int1_about_div').show();
                    $('#am_ver_div').show();
                    $('#amulet_version').html('v' + data.amulet_version_string);
					if(data.UI1_Type == 1)
						$('#int1_about_div').html('User Interface 1 (E)');
					else
						$('#int1_about_div').html('User Interface 1 (S)');
                }
                if (data.coproc_version_string === "not_seen") {
                    $('#co_ver_div').hide();
                } else {
                    $('#co_ver_div').show();
                    $('#coproc_version').html('v' + data.coproc_version_string);
                }
                if (data.language_version_string === "not_seen") {
                    $('#lang_ver_div').hide();
                } else {
                    $('#lang_version').html('v' + data.language_version_string);
                    $('#lang_ver_div').show();
                }
                if (data.touch_version_string === "not_seen") {
                    $('#touch_ver_div').hide();
                } else {
                    $('#touch_version').html('v' + data.touch_version_string);
                    $('#touch_ver_div').show();
                }
                
                
                if (data.amulet2_version_string === "not_seen") {
                    $('#int2_about_div').hide();
                    $('#am2_ver_div').hide();
                } else {
                    $('#int2_about_div').show();
                    $('#am2_ver_div').show();
                    $('#amulet2_version').html('v' + data.amulet2_version_string);
					if(data.UI2_Type == 1)
						$('#int2_about_div').html('User Interface 2 (E)');
					else
						$('#int2_about_div').html('User Interface 2 (S)');
                }
                if (data.coproc2_version_string === "not_seen") {
                    $('#co2_ver_div').hide();
                } else {
                    $('#co2_ver_div').show();
                    $('#coproc2_version').html('v' + data.coproc2_version_string);
                }
                if (data.language2_version_string === "not_seen") {
                    $('#lang2_ver_div').hide();
                } else {
                    $('#lang2_version').html('v' + data.language2_version_string);
                    $('#lang2_ver_div').show();
                }
				if (data.touch2_version_string === "not_seen") {
                    $('#touch2_ver_div').hide();
                } else {
                    $('#touch2_version').html('v' + data.touch2_version_string);
                    $('#touch2_ver_div').show();
                }
                
                
                if (data.amulet3_version_string === "not_seen") {
                    $('#int3_about_div').hide();
                    $('#am3_ver_div').hide();
                } else {
                    $('#int3_about_div').show();
                    $('#am3_ver_div').show();
                    $('#amulet3_version').html('v' + data.amulet3_version_string);
					if(data.UI3_Type == 1)
						$('#int3_about_div').html('User Interface 3 (E)');
					else
						$('#int3_about_div').html('User Interface 3 (S)');
                }
                if (data.coproc3_version_string === "not_seen") {
                    $('#co3_ver_div').hide();
                } else {
                    $('#co3_ver_div').show();
                    $('#coproc3_version').html('v' + data.coproc3_version_string);
                }
                if (data.language3_version_string === "not_seen") {
                    $('#lang3_ver_div').hide();
                } else {
                    $('#lang3_version').html('v' + data.language3_version_string);
                    $('#lang3_ver_div').show();
                }
				if (data.touch3_version_string === "not_seen") {
                    $('#touch3_ver_div').hide();
                } else {
                    $('#touch3_version').html('v' + data.touch3_version_string);
                    $('#touch3_ver_div').show();
                }

				if (data.konnectversion_string === "not_seen") {
					$('#konnectconnected').hide();
					$('#int4_about_div').hide();
                    $('#am4_ver_div').hide();
                } else {
					$('#konnectconnected').show();
					$('#int4_about_div').show();
                    $('#am4_ver_div').show();
                    $('#amulet4_version').html('v' + data.konnectversion_string);
					if(data.UI3_Type == 1)
						$('#int4_about_div').html('Kohler Konnect');
					else
						$('#int4_about_div').html('Kohler Konnect');
                }
                if (data.coprockonnectversion_string === "not_seen") {
                    $('#co4_ver_div').hide();
                } else {
                    $('#co4_ver_div').show();
                    $('#coproc4_version').html('v' + data.coprockonnectversion_string);
                }
				
				
                if (data.valve_1_version_string === "not_seen") {
                    $('#valve1_ver_div').hide();
                } else {
                    $('#valve1_ver_div').show();
                    $('#valve1_version').html('v' + data.valve_1_version_string);
                }
                if (data.valve_2_version_string === "not_seen") {
                    $('#valve2_ver_div').hide();
                } else {
                    $('#valve2_ver_div').show();
                    $('#valve2_version').html('v' + data.valve_2_version_string);
                }
                $('#controller_version').html('v' + data.controller_version_string);
                if (data.music_module_version_string === "not_seen") {
                    $('#music_ver_div').hide();
                } else {
                    $('#music_ver_div').show();
                    $('#music_version').html('v' + data.music_module_version_string);
                }
                if (data.lighting_version_string === "not_seen") {
                    $('#light_ver_div').hide();
                } else {
                    $('#light_ver_div').show();
                    $('#lighting_version').html('v' + data.lighting_version_string);
                }
                if (data.steam_version_string === "not_seen") {
                    $('#steam_ver_div').hide();
                } else {
                    $('#steam_version').html('v' + data.steam_version_string);
                    $('#steam_ver_div').show();
                }
                if (data.amp_version_string === "not_seen") {
                    $('#amp_ver_div').hide();
                } else {
                    $('#amp_ver_div').show();
                    $('#amp_version').html('v' + data.amp_version_string);
                }
                if (data.watertile_version_string === "not_seen") {
                    $('#rain_ver_div').hide();
                } else {
                    $('#rain_ver_div').show();
                    $('#watertile_version').html('v' + data.watertile_version_string);
                }
                if (data.watertile_2_version_string === "not_seen") {
                    $('#rain_ver2_div').hide();
                } else {
                    $('#rain_ver2_div').show();
                    $('#watertile_2_version').html('v' + data.watertile_2_version_string);
                }
					//interface tab load - CORYO - Interface tab load here.
					/*
                if (data.num_interface > 0) {
                    $('#interface1_frame').show();
                    $('#interface1_title').show();
                    //Enable interface 1 values
                    document.getElementById("interface1_beep").selectedIndex = data.interface1_beep_input;
                    document.getElementById("interface1_auto_dim").checked = data.interface1_auto_dim_input;
                    document.getElementById("interface1_auto_return").checked = data.interface1_auto_return_input;
                    document.getElementById("interface1_start_screen").selectedIndex = data.interface1_start_screen_input;
                    $("#interface1_curr_name").html(data.interface1_curr_name_input);
                } else {
                    $('#interface1_frame').hide();
                    $('#interface1_title').hide();
                }
                if (data.num_interface > 1) {
                    $('#interface2_frame').show();
                    $('#interface2_title').show();
                    //Enable interface 2 values
                    document.getElementById("interface2_beep").selectedIndex = data.interface2_beep_input;
                    document.getElementById("interface2_auto_dim").checked = data.interface2_auto_dim_input;
                    document.getElementById("interface2_auto_return").checked = data.interface2_auto_return_input;
                    document.getElementById("interface2_start_screen").selectedIndex = data.interface2_start_screen_input;
                    $("#interface2_curr_name").html(data.interface2_curr_name_input);
                } else {
                    $('#interface2_frame').hide();
                    $('#interface2_title').hide();
                }
                if (data.num_interface > 2) {
                    $('#interface3_frame').show();
                    $('#interface3_title').show();
                    //Enable interface 3 values
                    document.getElementById("interface3_beep").selectedIndex = data.interface3_beep_input;
                    document.getElementById("interface3_auto_dim").checked = data.interface3_auto_dim_input;
                    document.getElementById("interface3_auto_return").checked = data.interface3_auto_return_input;
                    document.getElementById("interface3_start_screen").selectedIndex = data.interface3_start_screen_input;
                    $("#interface3_curr_name").html(data.interface3_curr_name_input);
                } else {
                    $('#interface3_frame').hide();
                    $('#interface3_title').hide();
                }
		*/
                //music load
                $("#bt_pin").html(data.pin_string);
                $("#bt_key").html(data.key_string);
                $("#bt_device").html(data.device_string);
				
				//Issue 1256 : Added by TF-Team on 11-5-2016 for scaling balance value acc. to UI range.
				Treble_value = (data.treble)/2;
				Bass_value = (data.bass)/2;
				Balance_value = (data.balance-100)/2;
                $('#treble_slider').slider('value', Treble_value);
				$("#treble_val").val($("#treble_slider").slider("value") + '%');

                $('#bass_slider').slider('value', Bass_value);
				$("#bass_val").val($("#bass_slider").slider("value") + '%');

                $('#volume_slider').slider('value', data.volume);
                $('#bal_slider').slider('value', Balance_value);
                $("#volume_val").val($("#volume_slider").slider("value") + '%');
                $("#bal_val").val($("#bal_slider").slider("value"));
                
				//steam load 
                $("#steam_default_temp").val(data.steam_default_string_temp);
                $("#steam_max_temp").val(data.steam_max_temp_string);
                document.getElementById('steam_default_temp').max = data.steam_max_temp_string;
                $("#steam_def_time").val(data.steam_def_time_string);
	            $("#steam_power_clean").html(data.steam_power_clean_string);
                
				/*TF Team 08-07*/
				document.getElementById('max_steam_runtime').selectedIndex = data.max_steam_runtime;
                if (data.max_steam_runtime_enable !== 0) {
                    document.getElementById('max_steam_runtime_check').checked = true;
                    $("#max_steam_runtime").show();
                } else {
                    document.getElementById('max_steam_runtime_check').checked = false;
                    $("#max_steam_runtime").hide();
                }				
				/*TF Team 08-07*/
				//valve load 
                document.getElementById("outlets").value = data.num_outlets;
                if (data.num_outlets === 0) {
                    $('#tabs-Valve1').hide();
                    $('#valve1_tab').hide();
                } else {
                    $('#valve1_tab').show();
                }
                if (data.num_outlets === 2) {
                    $('#outlet_three').hide();
                    $('#outlet_four').hide();
                    $('#outlet_five').hide();
                    $('#outlet_six').hide();
                    $('#outlet_0_flow').hide();
                    $('#outlet_1_flow').hide();
					$('#custom_massage_block_1').hide(); //Added by TF team  11-08
                } else if (data.num_outlets === 6) {
                    $('#outlet_0_flow').hide();
                    $('#outlet_1_flow').hide();
                    $('#outlet_2_flow').hide();
                    $('#outlet_three').show();
                    $('#outlet_four').show();
                    $('#outlet_five').show();
                    $('#outlet_six').show();
					//$('#custom_massage_block_1').show(); //Added by TF team  11-08
                } else if (data.num_outlets === 3) {
                    $('#outlet_four').hide();
                    $('#outlet_five').hide();
                    $('#outlet_six').hide();
                    $('#outlet_three').show();
					//$('#custom_massage_block_1').show(); //Added by TF team  11-08
                    if(data.v1_threeport_flow)
                    {
                        $('#outlet_0_flow').show();
                        $('#outlet_1_flow').show();
                        $('#outlet_2_flow').show();
                        $("#valve1_outlet_1_ramp").val(data.outlet_1_ramp);
                        $("#valve1_outlet_1_flow").val(data.outlet_1_flow);
                        $("#valve1_outlet_2_ramp").val(data.outlet_2_ramp);
                        $("#valve1_outlet_2_flow").val(data.outlet_2_flow);
                        $("#valve1_outlet_3_ramp").val(data.outlet_3_ramp);
                        $("#valve1_outlet_3_flow").val(data.outlet_3_flow);
                    }else{
                        $('#outlet_0_flow').hide();
                        $('#outlet_1_flow').hide();
                        $('#outlet_2_flow').hide();
                    }
                }
                document.getElementById("outlet_0_id").className = "outlet " + data.one_type;
                document.getElementById("outlet_1_id").className = "outlet " + data.two_type;
                document.getElementById("outlet_2_id").className = "outlet " + data.three_type;
                document.getElementById("outlet_3_id").className = "outlet " + data.four_type;
                document.getElementById("outlet_4_id").className = "outlet " + data.five_type;
                document.getElementById("outlet_5_id").className = "outlet " + data.six_type;
                document.getElementById("autopurge_0").checked = data.purge_0;
                document.getElementById("autopurge_1").checked = data.purge_1;
                document.getElementById("autopurge_2").checked = data.purge_2;
                document.getElementById("autopurge_3").checked = data.purge_3;
                document.getElementById("autopurge_4").checked = data.purge_4;
                document.getElementById("autopurge_5").checked = data.purge_5;
                
				// set the default outlet
				switch (data.def_outlet) {
                case 1:
                    document.getElementById("default_0").checked = true;
                    break;
                case 2:
                    document.getElementById("default_1").checked = true;
                    break;
                case 3:
                    document.getElementById("default_2").checked = true;
                    break;
                case 4:
                    document.getElementById("default_3").checked = true;
                   break;
                case 5:
                    document.getElementById("default_4").checked = true;
                   break;
                case 6:
                    document.getElementById("default_5").checked = true;
                   break;
                default:
					document.getElementById("default_0").checked = false;
					document.getElementById("default_1").checked = false;
					document.getElementById("default_2").checked = false;
					document.getElementById("default_3").checked = false;
					document.getElementById("default_4").checked = false;
					document.getElementById("default_5").checked = false;
                    break;
                }
				
				//Add by TF Team 07-07
				trace('default deluge valve = ');
				trace(data.def_deluge_valve);
				trace('default deluge outlet = ');
				trace(data.def_deluge_outlet);
				if(data.one_type === "outlet_10" || data.one_type === "outlet_9" || data.one_type === "outlet_23")
				{
					document.getElementById("v1_DelugeOutlet1").style.visibility='hidden';
				}else
				{
					document.getElementById("v1_DelugeOutlet1").style.visibility='visible';
				}
				
				if(data.two_type === "outlet_10" || data.two_type === "outlet_9" || data.two_type === "outlet_23")
				{
					document.getElementById("v1_DelugeOutlet2").style.visibility='hidden';		
				}else
				{
					document.getElementById("v1_DelugeOutlet2").style.visibility='visible';		
				}
				if(data.three_type === "outlet_10" || data.three_type === "outlet_9" || data.three_type === "outlet_23")
				{
					document.getElementById("v1_DelugeOutlet3").style.visibility='hidden';		
				}else
				{
					document.getElementById("v1_DelugeOutlet3").style.visibility='visible';		
				}
				if(data.four_type === "outlet_10" || data.four_type === "outlet_9" || data.four_type === "outlet_23")
				{
					document.getElementById("v1_DelugeOutlet4").style.visibility='hidden';		
				}else
				{
					document.getElementById("v1_DelugeOutlet4").style.visibility='visible';		
				}
				
				if(data.five_type === "outlet_10" || data.five_type === "outlet_9" || data.five_type === "outlet_23")
				{
					document.getElementById("v1_DelugeOutlet5").style.visibility='hidden';		
				}else
				{
					document.getElementById("v1_DelugeOutlet5").style.visibility='visible';		
				}

				if(data.six_type === "outlet_10" || data.six_type === "outlet_9" || data.six_type === "outlet_23")
				{
					document.getElementById("v1_DelugeOutlet6").style.visibility='hidden';		
				}else
				{
					document.getElementById("v1_DelugeOutlet6").style.visibility='visible';		
				}								

				if(data.def_deluge_valve === 1)
				{
					trace('valve 1');

					document.getElementById("steamdeluge_0v2").checked = false;
					document.getElementById("steamdeluge_1v2").checked = false;
					document.getElementById("steamdeluge_2v2").checked = false;
					document.getElementById("steamdeluge_3v2").checked = false;
					document.getElementById("steamdeluge_4v2").checked = false;
					document.getElementById("steamdeluge_5v2").checked = false;
					
					switch (data.def_deluge_outlet) {
					case 1:
						document.getElementById("steamdeluge_0").checked = true;
						break;
					case 2:
						document.getElementById("steamdeluge_1").checked = true;
						break;
					case 3:
						document.getElementById("steamdeluge_2").checked = true;
						break;
					case 4:
						document.getElementById("steamdeluge_3").checked = true;
					   break;
					case 5:
						document.getElementById("steamdeluge_4").checked = true;
					   break;
					case 6:
						document.getElementById("steamdeluge_5").checked = true;
					   break;
					default:
						document.getElementById("steamdeluge_0").checked = false;
						document.getElementById("steamdeluge_1").checked = false;
						document.getElementById("steamdeluge_2").checked = false;
						document.getElementById("steamdeluge_3").checked = false;
						document.getElementById("steamdeluge_4").checked = false;
						document.getElementById("steamdeluge_5").checked = false;
						break;
					}
				}
				else if(data.def_deluge_valve === 2)
				{
					trace('valve 2');	
					document.getElementById("steamdeluge_0").checked = false;
					document.getElementById("steamdeluge_1").checked = false;
					document.getElementById("steamdeluge_2").checked = false;
					document.getElementById("steamdeluge_3").checked = false;
					document.getElementById("steamdeluge_4").checked = false;
					document.getElementById("steamdeluge_5").checked = false;
					
					switch (data.def_deluge_outlet) {
					case 1:
						document.getElementById("steamdeluge_0v2").checked = true;
						break;
					case 2:
						document.getElementById("steamdeluge_1v2").checked = true;
						break;
					case 3:
						document.getElementById("steamdeluge_2v2").checked = true;
						break;
					case 4:
						document.getElementById("steamdeluge_3v2").checked = true;
					   break;
					case 5:
						document.getElementById("steamdeluge_4v2").checked = true;
					   break;
					case 6:
						document.getElementById("steamdeluge_5v2").checked = true;
					   break;
					default:
						document.getElementById("steamdeluge_0v2").checked = false;
						document.getElementById("steamdeluge_1v2").checked = false;
						document.getElementById("steamdeluge_2v2").checked = false;
						document.getElementById("steamdeluge_3v2").checked = false;
						document.getElementById("steamdeluge_4v2").checked = false;
						document.getElementById("steamdeluge_5v2").checked = false;
						break;
					}
					
				}
				//added by TF team to delete deluge selection when in custom and outlets are blank
				else if(data.def_deluge_valve === 0)
				{
						document.getElementById("steamdeluge_0").checked = false;
						document.getElementById("steamdeluge_1").checked = false;
						document.getElementById("steamdeluge_2").checked = false;
						document.getElementById("steamdeluge_3").checked = false;
						document.getElementById("steamdeluge_4").checked = false;
						document.getElementById("steamdeluge_5").checked = false;
						document.getElementById("steamdeluge_0v2").checked = false;
						document.getElementById("steamdeluge_1v2").checked = false;
						document.getElementById("steamdeluge_2v2").checked = false;
						document.getElementById("steamdeluge_3v2").checked = false;
						document.getElementById("steamdeluge_4v2").checked = false;
						document.getElementById("steamdeluge_5v2").checked = false;
				}
					//added by TF team to delete deluge selection when in custom and outlets are blank
				
				//End of add by TF Team 07-07


                document.getElementById("massage_0").checked = data.one_massage;
                document.getElementById("massage_1").checked = data.two_massage;
                document.getElementById("massage_2").checked = data.three_massage;
                document.getElementById("massage_3").checked = data.four_massage;
                document.getElementById("massage_4").checked = data.five_massage;
                document.getElementById("massage_5").checked = data.six_massage;

				//<!--(issue 971) Tf Team added to hide massage radio button if tubfils selected 
				if(data.one_type === "outlet_10" || data.one_type === "outlet_9" || data.one_type === "outlet_23")
				{
					document.getElementById("v1_MassageOutlet1").style.visibility='hidden';		
				}else
				{
					document.getElementById("v1_MassageOutlet1").style.visibility='visible';		
				}
				
				if(data.two_type === "outlet_10" || data.two_type === "outlet_9" || data.two_type === "outlet_23")
				{
					document.getElementById("v1_MassageOutlet2").style.visibility='hidden';		
				}else
				{
					document.getElementById("v1_MassageOutlet2").style.visibility='visible';		
				}
				if(data.three_type === "outlet_10" || data.three_type === "outlet_9" || data.three_type === "outlet_23")
				{
					document.getElementById("v1_MassageOutlet3").style.visibility='hidden';		
				}else
				{
					document.getElementById("v1_MassageOutlet3").style.visibility='visible';		
				}
				if(data.four_type === "outlet_10" || data.four_type === "outlet_9" || data.four_type === "outlet_23")
				{
					document.getElementById("v1_MassageOutlet4").style.visibility='hidden';		
				}else
				{
					document.getElementById("v1_MassageOutlet4").style.visibility='visible';		
				}
				
				if(data.five_type === "outlet_10" || data.five_type === "outlet_9" || data.five_type === "outlet_23")
				{
					document.getElementById("v1_MassageOutlet5").style.visibility='hidden';		
				}else
				{
					document.getElementById("v1_MassageOutlet5").style.visibility='visible';		
				}

				if(data.six_type === "outlet_10" || data.six_type === "outlet_9" || data.six_type === "outlet_23")
				{
					document.getElementById("v1_MassageOutlet6").style.visibility='hidden';		
				}else
				{
					document.getElementById("v1_MassageOutlet6").style.visibility='visible';		
				}								
				//end 971				

				document.getElementById('cold_water').selectedIndex = data.cold_water;
				if(data.cold_water !== 4) {
					$("#cold_water").show();
					document.getElementById('cold_water_check').checked = true;
				} else {
					$("#cold_water").hide();					
					document.getElementById('cold_water_check').checked = false;
				}
                document.getElementById('auto_purge').selectedIndex = data.auto_purge;
                if (data.auto_purge_enable !== 0) {
                    document.getElementById('auto_purge_check').checked = true;
                    document.getElementById('auto_purge_checkv2').checked = true;
                    $(".v1_purge").show();
                    $("#auto_purge").show();
                    $(".v2_purge").show();
                    $("#auto_purgev2").show();
                } else {
                    document.getElementById('auto_purge_check').checked = false;
                    document.getElementById('auto_purge_checkv2').checked = false;
                    $(".v1_purge").hide();
                    $("#auto_purge").hide();
                    $(".v2_purge").hide();
                    $("#auto_purgev2").hide();
                }
                document.getElementById('def_temperature').value = data.def_temp;
                document.getElementById('max_temperature').value = data.max_temp;
                document.getElementById('def_temperature').max = data.max_temp;
				
				/*TF Team 08-07*/
				document.getElementById('max_valve_runtime').selectedIndex = data.max_valve1_runtime;
                if (data.max_valve1_runtime_enable !== 0) {
                    document.getElementById('max_valve_runtime_check').checked = true;
                    $("#max_valve_runtime").show();
                } else {
                    document.getElementById('max_valve_runtime_check').checked = false;
                    $("#max_valve_runtime").hide();
                }				
				/*TF Team 08-07*/
                
				//valve2 load 
                document.getElementById("outletv2s").value = data.v2_num_outlets;
                if (data.v2_num_outlets === 0) {
                    $('#tabs-Valve2').hide();
                    $('#valve2_tab').hide();
                } else {
                    $('#valve2_tab').show();
                }
                if (data.v2_num_outlets === 2) {
                    $('#outletv2_three').hide();
                    $('#outletv2_four').hide();
                    $('#outletv2_five').hide();
                    $('#outletv2_six').hide();
                    $('#outletv2_0_flow').hide();
                    $('#outletv2_1_flow').hide();
					$('#custom_massage_block_2').hide(); //Added by TF team  11-08
                } else if (data.v2_num_outlets === 6) {
                    $('#outletv2_0_flow').hide();
                    $('#outletv2_1_flow').hide();
                    $('#outletv2_2_flow').hide();
                    $('#outletv2_three').show();
                    $('#outletv2_four').show();
                    $('#outletv2_five').show();
                    $('#outletv2_six').show();
					//$('#custom_massage_block_2').show(); //Added by TF team  11-08
                } else if (data.v2_num_outlets === 3) {
                    $('#outletv2_five').hide();
                    $('#outletv2_four').hide();
                    $('#outletv2_six').hide();
                    $('#outletv2_three').show();
					//$('#custom_massage_block_2').show(); //Added by TF team  11-08
                    if(data.v2_threeport_flow)
                    {
                        $('#outletv2_0_flow').show();
                        $('#outletv2_1_flow').show();
                        $('#outletv2_2_flow').show();
                        $("#valve2_outlet_1_ramp").val(data.outlet_1_ramp);
                        $("#valve2_outlet_1_flow").val(data.outlet_1_flow);
                        $("#valve2_outlet_2_ramp").val(data.outlet_2_ramp);
                        $("#valve2_outlet_2_flow").val(data.outlet_2_flow);
                        $("#valve2_outlet_3_ramp").val(data.outlet_3_ramp);
                        $("#valve2_outlet_3_flow").val(data.outlet_3_flow);
                    }else{
                        $('#outletv2_0_flow').hide();
                        $('#outletv2_1_flow').hide();
                        $('#outletv2_2_flow').hide();
                    }
                }
                document.getElementById("outletv2_0_id").className = "outlet " + data.v2_one_type;
                document.getElementById("outletv2_1_id").className = "outlet " + data.v2_two_type;
                document.getElementById("outletv2_2_id").className = "outlet " + data.v2_three_type;
                document.getElementById("outletv2_3_id").className = "outlet " + data.v2_four_type;
                document.getElementById("outletv2_4_id").className = "outlet " + data.v2_five_type;
                document.getElementById("outletv2_5_id").className = "outlet " + data.v2_six_type;
                document.getElementById("autopurge_0v2").checked = data.purgev2_0;
                document.getElementById("autopurge_1v2").checked = data.purgev2_1;
                document.getElementById("autopurge_2v2").checked = data.purgev2_2;
                document.getElementById("autopurge_3v2").checked = data.purgev2_3;
                document.getElementById("autopurge_4v2").checked = data.purgev2_4;
                document.getElementById("autopurge_5v2").checked = data.purgev2_5;

				switch (data.v2_def_outlet) {
                case 1:
                    document.getElementById("default_0v2").checked = true;
                    break;
                case 2:
                    document.getElementById("default_1v2").checked = true;
                    break;
                case 3:
                    document.getElementById("default_2v2").checked = true;
                    break;
                case 4:
                    document.getElementById("default_3v2").checked = true;
                    break;
                case 5:
                    document.getElementById("default_4v2").checked = true;
                    break;
                case 6:
                    document.getElementById("default_5v2").checked = true;
                    break;
                default:
					document.getElementById("default_0v2").checked = false;
					document.getElementById("default_1v2").checked = false;
					document.getElementById("default_2v2").checked = false;
					document.getElementById("default_3v2").checked = false;
					document.getElementById("default_4v2").checked = false;
					document.getElementById("default_5v2").checked = false;
                    break;
                }

                document.getElementById("massage_0v2").checked = data.v2_one_massage;
                document.getElementById("massage_1v2").checked = data.v2_two_massage;
                document.getElementById("massage_2v2").checked = data.v2_three_massage;
                document.getElementById("massage_3v2").checked = data.v2_four_massage;
                document.getElementById("massage_4v2").checked = data.v2_five_massage;
                document.getElementById("massage_5v2").checked = data.v2_six_massage;
				
				if(data.v2_one_type === "outlet_10" || data.v2_one_type === "outlet_9" || data.v2_one_type === "outlet_23")
				{
					document.getElementById("v2_DelugeOutlet1").style.visibility='hidden';		
				}else
				{
					document.getElementById("v2_DelugeOutlet1").style.visibility='visible';		
				}
				if(data.v2_two_type === "outlet_10" || data.v2_two_type === "outlet_9" || data.v2_two_type === "outlet_23")
				{
					document.getElementById("v2_DelugeOutlet2").style.visibility='hidden';		
				}else
				{
					document.getElementById("v2_DelugeOutlet2").style.visibility='visible';		
				}
				if(data.v2_three_type === "outlet_10" || data.v2_three_type === "outlet_9" || data.v2_three_type === "outlet_23")
				{
					document.getElementById("v2_DelugeOutlet3").style.visibility='hidden';		
				}else
				{
					document.getElementById("v2_DelugeOutlet3").style.visibility='visible';		
				}				
				if(data.v2_four_type === "outlet_10" || data.v2_four_type === "outlet_9" || data.v2_four_type === "outlet_23")
				{
					document.getElementById("v2_DelugeOutlet4").style.visibility='hidden';		
				}else
				{
					document.getElementById("v2_DelugeOutlet4").style.visibility='visible';		
				}				
				if(data.v2_five_type === "outlet_10" || data.v2_five_type === "outlet_9" || data.v2_five_type === "outlet_23")
				{
					document.getElementById("v2_DelugeOutlet5").style.visibility='hidden';		
				}else
				{
					document.getElementById("v2_DelugeOutlet5").style.visibility='visible';		
				}
				if(data.v2_six_type === "outlet_10" || data.v2_six_type === "outlet_9" || data.v2_six_type === "outlet_23")
				{
					document.getElementById("v2_DelugeOutlet6").style.visibility='hidden';		
				}else
				{
					document.getElementById("v2_DelugeOutlet6").style.visibility='visible';		
				}								




				//<!--(issue 971) Tf Team added to hide massage radio button if tubfils selected 
				if(data.v2_one_type === "outlet_10" || data.v2_one_type === "outlet_9" || data.v2_one_type === "outlet_23")
				{
					document.getElementById("v2_MassageOutlet1").style.visibility='hidden';		
				}else
				{
					document.getElementById("v2_MassageOutlet1").style.visibility='visible';		
				}
				if(data.v2_two_type === "outlet_10" || data.v2_two_type === "outlet_9" || data.v2_two_type === "outlet_23")
				{
					document.getElementById("v2_MassageOutlet2").style.visibility='hidden';		
				}else
				{
					document.getElementById("v2_MassageOutlet2").style.visibility='visible';		
				}
				if(data.v2_three_type === "outlet_10" || data.v2_three_type === "outlet_9" || data.v2_three_type === "outlet_23")
				{
					document.getElementById("v2_MassageOutlet3").style.visibility='hidden';		
				}else
				{
					document.getElementById("v2_MassageOutlet3").style.visibility='visible';		
				}				
				if(data.v2_four_type === "outlet_10" || data.v2_four_type === "outlet_9" || data.v2_four_type === "outlet_23")
				{
					document.getElementById("v2_MassageOutlet4").style.visibility='hidden';		
				}else
				{
					document.getElementById("v2_MassageOutlet4").style.visibility='visible';		
				}				
				if(data.v2_five_type === "outlet_10" || data.v2_five_type === "outlet_9" || data.v2_five_type === "outlet_23")
				{
					document.getElementById("v2_MassageOutlet5").style.visibility='hidden';		
				}else
				{
					document.getElementById("v2_MassageOutlet5").style.visibility='visible';		
				}
				if(data.v2_six_type === "outlet_10" || data.v2_six_type === "outlet_9" || data.v2_six_type === "outlet_23")
				{
					document.getElementById("v2_MassageOutlet6").style.visibility='hidden';		
				}else
				{
					document.getElementById("v2_MassageOutlet6").style.visibility='visible';		
				}								
				//end 971
				
				document.getElementById('cold_waterv2').selectedIndex = data.v2_cold_water;
				if(data.v2_cold_water !== 4) {
					$("#cold_waterv2").show();
					document.getElementById('cold_water_checkv2').checked = true;
				} else {
					$("#cold_waterv2").hide();
					document.getElementById('cold_water_checkv2').checked = false;
				}
                document.getElementById('auto_purgev2').selectedIndex = data.v2_auto_purge;

                document.getElementById('def_temperaturev2').value = data.v2_def_temp;
                document.getElementById('max_temperaturev2').value = data.v2_max_temp;
                document.getElementById('def_temperaturev2').max = data.v2_max_temp;
				
				/*TF Team 08-07*/
				document.getElementById('max_valve_runtimev2').selectedIndex = data.max_valve2_runtime;
                if (data.max_valve2_runtime_enable !== 0) {
                    document.getElementById('max_valve_runtime_checkv2').checked = true;
                    $("#max_valve_runtimev2").show();
                } else {
                    document.getElementById('max_valve_runtime_checkv2').checked = false;
                    $("#max_valve_runtimev2").hide();
                }				
				/*TF Team 08-07*/
                
				//system load 
                switch (data.units) {
                case 0:
                    units_are_f = true;
                    document.getElementById('units_f').checked = true;
                    document.getElementById('def_temperature').step = "1";
                    document.getElementById('max_temperature').step = "1";
                    document.getElementById('def_temperature').min = 86;
                    document.getElementById('max_temperature').min = 86;
                    document.getElementById('max_temperature').max = 120;
                    document.getElementById('def_temperaturev2').step = "1";
                    document.getElementById('max_temperaturev2').step = "1";
                    document.getElementById('def_temperaturev2').min = 86;
                    document.getElementById('max_temperaturev2').min = 86;
                    document.getElementById('max_temperaturev2').max = 120;
                    document.getElementById('steam_default_temp').min = 90;
                    document.getElementById('steam_default_temp').step = "1";
                    document.getElementById('steam_max_temp').step = "1";
                    document.getElementById('steam_max_temp').min = 90;
                    document.getElementById('steam_max_temp').max = 125;
                    break;
                case 1:
                    units_are_f = false;
                    document.getElementById('units_c').checked = true;
                    document.getElementById('def_temperature').step = "0.5";
                    document.getElementById('max_temperature').step = "0.5";
                    document.getElementById('def_temperature').min = 30;
                    document.getElementById('max_temperature').min = 30;
                    document.getElementById('max_temperature').max = 49;
                    document.getElementById('def_temperaturev2').step = "0.5";
                    document.getElementById('max_temperaturev2').step = "0.5";
                    document.getElementById('def_temperaturev2').min = 30;
                    document.getElementById('max_temperaturev2').min = 30;
                    document.getElementById('max_temperaturev2').max = 49;
                    document.getElementById('steam_default_temp').min = 32;
                    document.getElementById('steam_default_temp').step = "0.5";
                    document.getElementById('steam_max_temp').step = "0.5";
                    document.getElementById('steam_max_temp').min = 32;
                    document.getElementById('steam_max_temp').max = 52;
                    break;
                default:
                    break;
                }
				
				if(showerConfigurationActive == 1 || showerConfigurationActive == 2 || showerConfigurationActive == 3 || showerConfigurationActive == 4 || showerConfigurationActive == 5)
				{
					$('#spa_borderbottom').show();
					$('#spa_borderbottom1').hide();
				}
				
				if(showerConfigurationActive == 6 || showerConfigurationActive == 7 || showerConfigurationActive == 8)
				{
					$('#spa_borderbottom1').show();
					$('#spa_borderbottom').hide();
				}
				
				document.getElementById("enable1").checked = data.spa_breathe;
				document.getElementById("enable2").checked = data.spa_release;
				document.getElementById("enable3").checked = data.spa_exhilerate;
				document.getElementById("enable4").checked = data.spa_flex;
				document.getElementById("enable5").checked = data.spa_warmup;
				document.getElementById("enable6").checked = data.spa_cooldown;
				document.getElementById("enable7").checked = data.spa_renew;
				document.getElementById("enable8").checked = data.spa_headaid;
				document.getElementById("enable9").checked = data.spa_detox;
				document.getElementById("enable10").checked = data.spa_steamcoach;
				document.getElementById("enable11").checked = data.spa_repair;
				
				document.getElementById("enable1_1").checked = data.spa_breathe;
				document.getElementById("enable2_1").checked = data.spa_release;
				document.getElementById("enable3_1").checked = data.spa_exhilerate;
				document.getElementById("enable4_1").checked = data.spa_flex;
				document.getElementById("enable5_1").checked = data.spa_warmup;
				document.getElementById("enable6_1").checked = data.spa_cooldown;
				document.getElementById("enable7_1").checked = data.spa_renew;
				document.getElementById("enable8_1").checked = data.spa_headaid;
				
				if(data.spa_breathe_config)
				{
					$("#spa_breathe").show();
					$("#spa_breathe1").show();
				}else{
					$("#spa_breathe").hide();
					$("#spa_breathe1").hide();
				}
				if(data.spa_release_config)
				{
					$("#spa_release").show();
					$("#spa_release1").show();
				}else{
					$("#spa_release").hide();
					$("#spa_release1").hide();
				}
				if(data.spa_exhilerate_config)
				{
					$("#spa_exhilerate").show();
					$("#spa_exhilerate1").show();
				}else{
					$("#spa_exhilerate").hide();
					$("#spa_exhilerate1").hide();
				}
				if(data.spa_warmup_config)
				{
					$("#spa_warmup").show();
					$("#spa_warmup1").show();
				}else{
					$("#spa_warmup").hide();
					$("#spa_warmup1").hide();
				}
				if(data.spa_cooldown_config)
				{
					$("#spa_cooldown").show();
					$("#spa_cooldown1").show();
				}else{
					$("#spa_cooldown").hide();
					$("#spa_cooldown1").hide();
				}
				if(data.spa_renew_config)
				{
					$("#spa_renew").show();
					$("#spa_renew1").show();
				}else{
					$("#spa_renew").hide();
					$("#spa_renew1").hide();
				}
				if(data.spa_headaid_config)
				{
					$("#spa_headaid").show();
					$("#spa_headaid1").show();
				}else{
					$("#spa_headaid").hide();
					$("#spa_headaid1").hide();
				}
				if(data.spa_flex_config)
				{
					$("#spa_flex").show();
					$("#spa_flex1").show();
				}else{
					$("#spa_flex").hide();
					$("#spa_flex1").hide();
				}
				if(data.spa_detox_config)
				{
					$("#spa_detox").show();
				}else{
					$("#spa_detox").hide();
				}
				if(data.spa_steamcoach_config)
				{
					$("#spa_steam_coach").show();
				}else{
					$("#spa_steam_coach").hide();
				}
				if(data.spa_repair_config)
				{
					$("#spa_repair").show();
				}else{
					$("#spa_repair").hide();
				}
				
				if(data.steam_select)
				{
					var temp;
					$("#steam_spa_title").show();
				}else{
					$("#steam_spa_title").hide();
				}
				
				if((data.spa) && (document.getElementById("shower_config").value !=0))
				{
					$('#spa_tab').show();
				}else{
					$('#spa_tab').hide();
				}
				
				if((data.spa) && (data.steam_select))
				{
					$("#steam_spa_separation_line").show();
				}else{
					$("#steam_spa_separation_line").hide();
				}
			
				
				/*Added by TF2 4Apr2015 - Bug 1112 - To hide swap buttons on both valve tabs when only one valve is connected*/
				if(data.num_outlets ==0 || data.v2_num_outlets == 0) {
					$("#swap_valves_button").hide();
					$("#swap_valves_button_v2").hide();															
				} else {	
					//If Config A and 6X6 then show
				    if(document.getElementById("shower_config").value == 1){
							if(data.num_outlets == 6 && data.v2_num_outlets == 6)
							{
								$("#swap_valves_button").show();
								$("#swap_valves_button_v2").show();
							} else {
								$("#swap_valves_button").hide();
								$("#swap_valves_button_v2").hide();									
							}
					}		
					//If Config B and 6X6 or 3X3 then show
				    if(document.getElementById("shower_config").value == 2){
							if((data.num_outlets == 6 && data.v2_num_outlets == 6)||
								(data.num_outlets == 3 && data.v2_num_outlets == 3))
							{
								$("#swap_valves_button").show();
								$("#swap_valves_button_v2").show();
							} else {
								$("#swap_valves_button").hide();
								$("#swap_valves_button_v2").hide();									
							}
					}		
					//If Config C and 6X6 then show
				    if(document.getElementById("shower_config").value == 3){
							if(data.num_outlets == 6 && data.v2_num_outlets == 6)
							{
								$("#swap_valves_button").show();
								$("#swap_valves_button_v2").show();
							} else {
								$("#swap_valves_button").hide();
								$("#swap_valves_button_v2").hide();									
				}
					}		
					//If Config D and 6X6 or 3X3 or 6X3 or 3X6 then show
				    if(document.getElementById("shower_config").value == 4){
							if((data.num_outlets == 6 && data.v2_num_outlets == 6) ||
								(data.num_outlets == 6 && data.v2_num_outlets == 3) ||
								(data.num_outlets == 3 && data.v2_num_outlets == 3) ||
								(data.num_outlets == 3 && data.v2_num_outlets == 6))
							{
								$("#swap_valves_button").show();
								$("#swap_valves_button_v2").show();
							} else {
								$("#swap_valves_button").hide();
								$("#swap_valves_button_v2").hide();									
							}
					}		
					//If Config Custom and any two valves attached then show
				    if((document.getElementById("shower_config").value == 0) ||
						(document.getElementById("shower_config").value == 127))
					{
							if(data.num_outlets !==0 && data.v2_num_outlets !== 0) 
							{
								$("#swap_valves_button").show();
								$("#swap_valves_button_v2").show();
							} else {
								$("#swap_valves_button").hide();
								$("#swap_valves_button_v2").hide();	
							}
					}
					
				}	
				/*End of add by TF2 4Apr2015 - Bug 1112 - To hide swap buttons on both valve tabs when only one valve is connected*/
				
				//CORYO - TODO: Show the Controller IP, Gateway and MAC
				$("#controller_ip").html(data.IP);
				$("#controller_gateway").html(data.gateway);
				$("#controller_mac").html(data.MAC);
				
                $('#tabs').show();
			//(issue : 1159) - TF team added to display dialog if a non resettable valve attached 	
			if((data.valve1_ErrorFatal==1)||(data.valve1_ErrorResettable==1))
			{
				if(data.valve1_ErrorFatal==1)
				{
					$("#valve1_tab").hide(); 	
				}
				$('#spa_activate_checkbox').hide();								
			}

			if((data.valve2_ErrorFatal==1)||(data.valve2_ErrorResettable==1))
			{
				if(data.valve2_ErrorFatal==1)
				{
					$("#valve2_tab").hide(); 	
				}

				$('#spa_activate_checkbox').hide();
			}
			if((((data.valve1_ErrorFatal==1)||(data.valve1_ErrorResettable==1))||		
			((data.valve2_ErrorFatal==1)||(data.valve2_ErrorResettable==1)))
			&&(document.getElementById("shower_config").value !=0))
			{
				$('#spa_activate_checkbox').show();
			}			
			if((data.valve1_ErrorFatal==1)||(data.valve2_ErrorFatal==1))
			{
												
					$('#valveFatalWarning').dialog({
					modal: true,
					closeOnEscape: false,
					resizable: false,
					draggable: false,
					width: 'auto',
					height:'auto',
					dialogClass: 'device-dialog-class',
					});

					if(data.valve1_ErrorFatal==1)
					{
						document.getElementById("valve1_FATAL").style.display='block';
					}else
					{
						document.getElementById("valve1_FATAL").style.display='none';
					}
					if(data.valve2_ErrorFatal==1) 					
					{
						document.getElementById("valve2_FATAL").style.display='block';
					}else
					{
						document.getElementById("valve2_FATAL").style.display='none';
					}	
					setTimeout(function (){	
					$('#valveFatalWarning').dialog("close");
				}, 4500);												
			}							
				
            }
       		//Added by TF Team
			if(data.web_locked == true)
			{
				if (document.getElementById("pw").value != "0922")
				{
					$('#dialog-Lockpage').dialog({
						closeOnEscape: false,
					modal: true,
					draggable: false,
					dialogClass: 'device-dialog-class',
					});
					document.getElementById("password").style.display='block';
					document.getElementById("password").style.visibility='visible';
				}
            }
			hide_tab();
			//End of Add
       
       
        }
    });
}

function hide_tab() {
    trace('Load Start hide tab');
	//CORYO - Don't allow control to load for phase 1 - jump to settings.
	//location.href = "settings.html";
	
    $.ajax({
        type: "GET",
        url: "system_info.cgi",
        data: {},
        dataType: "JSON",
        cache: false,
       success: function (data) {
		if(data.light_attach == 1)
		{
			//do nothing to prevent navigating to control page from settings-Lighting page during light attach( issue - 1384)
		}
		else if((data.light_turnoff1 == 1) || (data.light_turnoff2 == 1 )|| (data.light_turnoff3 == 1)) //Gowrish
		{
			//do nothing to prevent navigating to control page from settings-Lighting page during light attach( issue - 1384) 
		}else
		{
			if(data.devices_running == true) 
			{    //Added steam_running by TF Team 10-07
	    	    location.href = "control.html";
			}
		}
				
				/**********Added by TF-Team for load module removal dialog on 16-12-2015******/
				if(data.light_remove == 0)
				{
					if(light_remove_status == 1)
					{
						if ($("#dialog-remove-light-module").dialog( "isOpen" )===true)
						{
							dialogCloseRemoveLightPopup();
							location.href = "settings.html#tabs-Lighting";
							window.location.reload(true);
							clearTimeout(light_remove_timer); //Added by TF-team to clear timer if light is removed within 60 secs.
						}
					}
				}
				/********End of Add**********/
				/**********Added by TF-Team for light popup display on 14-10-2015******/
				if(data.light_attach == 0)
				{
					if(light_attach_status == 1)
					{
						if ($("#dialog-add-light-module").dialog( "isOpen" )===true)
						{
							dialogCloseAddLightPopup();
							location.href = "settings.html#tabs-Lighting";
							window.location.reload(true);
							clearTimeout(light_add_timer); //Added by TF-team to clear timer if light is attached within 60 secs.
						}
					}
				}
				/********End of Add**********/
	   }
	});
	setTimeout(function () {
                hide_tab();
    	    }, 3000);
}

//TODO: CORYO - There is where shower configurations are populated based on outlets available per valve.
function config() 
	{

	//(issue:1159) - TF team added to not show the configuration of the FATAL error occured valve
	if(v1_fatalERROR==1){
		configv1_outlets = 0;	
	}	
	if(v2_fatalERROR==1){
		configv2_outlets = 0;	
	}
	
	
    //TODO: this needs the translations. Should be easy to add in
    $('#shower_config').empty().append($('<option>', {
        value: 0,
        text: custom_text
    }));
	
	
	$('.spa_sel').hide();
	//Configurations per email from Keith Ruh on 9/4/14. 
    if ((configv1_outlets === 6 && configv2_outlets === 3) ||
        (configv1_outlets === 3 && configv2_outlets === 6) ||
		(configv1_outlets === 6 && configv2_outlets === 6)
	)
	{
	
        $('#shower_config').append($('<option>', {
            value: 1,
            text: config_a
        }));
    }
	if ((configv1_outlets === 6 && configv2_outlets === 3) ||
			 (configv1_outlets === 6 && configv2_outlets === 6) ||
			 (configv1_outlets === 3 && configv2_outlets === 6) ||
			 (configv1_outlets === 3 && configv2_outlets === 3)
	)
	{
	
        $('#shower_config').append($('<option>', {
            value: 2,
            text: config_b
        }));        
    } 
	if ((configv1_outlets === 6 && configv2_outlets === 0) ||
			 (configv1_outlets === 6 && configv2_outlets === 2) ||
			 (configv1_outlets === 6 && configv2_outlets === 3) ||
			 (configv1_outlets === 6 && configv2_outlets === 6) ||
			 (configv1_outlets === 3 && configv2_outlets === 6) ||
			 (configv1_outlets === 2 && configv2_outlets === 6) ||
			 (configv1_outlets === 0 && configv2_outlets === 6)
	)
	{
	
        $('#shower_config').append($('<option>', {
            value: 3,
            text: config_c
        }));
    } 
	if ((configv1_outlets === 6 && configv2_outlets === 0) ||
			 (configv1_outlets === 6 && configv2_outlets === 2) ||
			 (configv1_outlets === 6 && configv2_outlets === 3) ||
			 (configv1_outlets === 6 && configv2_outlets === 6) ||
			 (configv1_outlets === 3 && configv2_outlets === 0) ||
			 (configv1_outlets === 3 && configv2_outlets === 2) ||
			 (configv1_outlets === 3 && configv2_outlets === 3) ||
			 (configv1_outlets === 3 && configv2_outlets === 6) ||
			 (configv1_outlets === 2 && configv2_outlets === 3) ||
			 (configv1_outlets === 2 && configv2_outlets === 6) ||
			 (configv1_outlets === 0 && configv2_outlets === 3) ||
			 (configv1_outlets === 0 && configv2_outlets === 6)
	)
	{
		
        $('#shower_config').append($('<option>', {
            value: 4,
            text: config_d
        }));
    }

    $("#shower_config").val(config_index);
	if(config_index)
	{
		trace("Config index is " + config_index);
		//(issue : 1174) - tf team added not to show spa radio division 
		if(((config_index!=5)||(config_index!=0))&&(document.getElementById("shower_config").value !=0)) //added config_index!=0 by TF Team 02-07
		{
			$('#spa_activate_checkbox').show();
		}
	}
}

function language() {
    trace('Languages');
    //<%languages%>
    var words;
    $.ajax({
        type: "GET",
        url: "languages.cgi",
        data: {},
        dataType: "JSON",
        cache: false,
        success: function (data) {
			words = data;
            discon_string = words.discon_string;
            con_string = words.con_string;
           user_title = words.user_title;
            //main page text
            custom_text = words.custom_text;
            config_a = words.conA;
            config_a_1 = words.conAAlt1;
            config_a_2 = words.conAAlt2;
            config_a_3 = words.conAAlt3;
            config_b = words.conB;
            config_b_1 = words.conBAlt1;
            config_b_2 = words.conBAlt2;
            config_b_3 = words.conBAlt3;
            config_c = words.conC;
            config_d = words.conD;
            config_d_1 = words.conDAlt1;
            config_d_2 = words.conDAlt2;
            config_d_3 = words.conDAlt3;
            config_unwind = words.conCUnwind;
            config_downpour = words.conCDownpour;
            config_frontage = words.conCFrontage;
            config_surround = words.conCSurround;
            config_linear = words.conCLinear;
            config_envelop = words.conCEnvelop;
            //might seem odd, but calling config for in case of language change here
            config();
            $("#interface1_beep option").eq(0).text(words.silent_text);
            $("#interface1_beep option").eq(1).text(words.quiet_text);
            $("#interface1_beep option").eq(2).text(words.loud_text);
            $("#interface2_beep option").eq(0).text(words.silent_text);
            $("#interface2_beep option").eq(1).text(words.quiet_text);
            $("#interface2_beep option").eq(2).text(words.loud_text);
            $("#interface3_beep option").eq(0).text(words.silent_text);
            $("#interface3_beep option").eq(1).text(words.quiet_text);
            $("#interface3_beep option").eq(2).text(words.loud_text);
            $("#interface1_auto_dim option").eq(0).text(words.off_word_text);
            $("#interface1_auto_dim option").eq(1).text(words.one_minute_text);
            $("#interface1_auto_dim option").eq(2).text(words.five_minute_text);
            $("#interface2_auto_dim option").eq(0).text(words.off_word_text);
            $("#interface2_auto_dim option").eq(1).text(words.one_minute_text);
            $("#interface2_auto_dim option").eq(2).text(words.five_minute_text);
            $("#interface3_auto_dim option").eq(0).text(words.off_word_text);
            $("#interface3_auto_dim option").eq(1).text(words.one_minute_text);
            $("#interface3_auto_dim option").eq(2).text(words.five_minute_text);
            $("#interface1_start_screen option").eq(0).text(words.home_text);
            $("#interface1_start_screen option").eq(1).text(words.quick_text);
            $("#interface1_start_screen option").eq(2).text(words.users_text);
            $("#interface1_start_screen option").eq(3).text(words.valve1_text);
            $("#interface1_start_screen option").eq(4).text(words.valve2_text);
            $("#interface1_start_screen option").eq(5).text(words.music_text);
            $("#interface1_start_screen option").eq(6).text(words.lighting_text);
            $("#interface2_start_screen option").eq(0).text(words.home_text);
            $("#interface2_start_screen option").eq(1).text(words.quick_text);
            $("#interface2_start_screen option").eq(2).text(words.users_text);
            $("#interface2_start_screen option").eq(3).text(words.valve1_text);
            $("#interface2_start_screen option").eq(4).text(words.valve2_text);
            $("#interface2_start_screen option").eq(5).text(words.music_text);
            $("#interface2_start_screen option").eq(6).text(words.lighting_text);
            $("#interface3_start_screen option").eq(0).text(words.home_text);
            $("#interface3_start_screen option").eq(1).text(words.quick_text);
            $("#interface3_start_screen option").eq(2).text(words.users_text);
            $("#interface3_start_screen option").eq(3).text(words.valve1_text);
            $("#interface3_start_screen option").eq(4).text(words.valve2_text);
            $("#interface3_start_screen option").eq(5).text(words.music_text);
            $("#interface3_start_screen option").eq(6).text(words.lighting_text);
            //selects
            $("#effect_speed_select option").eq(0).text(words.slow_text);
            $("#effect_speed_select option").eq(1).text(words.medium_text);
            $("#effect_speed_select option").eq(2).text(words.fast_text);
            $("#white_color_select option").eq(0).text(words.warm_text);
            $("#white_color_select option").eq(1).text(words.neutral_text);
            $("#white_color_select option").eq(2).text(words.cool_text);
            $("#fade_speed_select option").eq(0).text(words.slow_text);
            $("#fade_speed_select option").eq(1).text(words.medium_text);
            $("#fade_speed_select option").eq(2).text(words.fast_text);
            //$("#fade_1 option").eq(0).text(words.noneText);
            //$("#fade_1 option").eq(1).text(words.slow_text);
            //$("#fade_1 option").eq(2).text(words.medium_text);
            //$("#fade_1 option").eq(3).text(words.fast_text);
            //$("#fade_2 option").eq(0).text(words.noneText);
            //$("#fade_2 option").eq(1).text(words.slow_text);
            //$("#fade_2 option").eq(2).text(words.medium_text);
            //$("#fade_2 option").eq(3).text(words.fast_text);
            //$("#fade_3 option").eq(0).text(words.noneText);
            //$("#fade_3 option").eq(1).text(words.slow_text);
            //$("#fade_3 option").eq(2).text(words.medium_text);
           // $("#fade_3 option").eq(3).text(words.fast_text);
            //music text 
            $("#music_repeat_select option").eq(0).text(words.all_word_string);
            $("#music_repeat_select option").eq(1).text(words.one_word_string);
            //system text 
            $("#contact_2_open option").eq(0).text(words.noneText);
            $("#contact_2_open option").eq(1).text(words.turn_shower_on_text);
            $("#contact_2_open option").eq(2).text(words.shower_off_text);
            $("#contact_2_open option").eq(3).text(words.turn_everything_off_text);
            $("#contact_2_open option").eq(4).text(words.preset_1_text);
            $("#contact_2_open option").eq(5).text(words.preset_2_text);
            $("#contact_2_open option").eq(6).text(words.preset_3_text);
            $("#contact_2_open option").eq(7).text(words.preset_4_text);
            $("#contact_2_open option").eq(8).text(words.preset_5_text);
            $("#contact_2_open option").eq(9).text(words.preset_6_text);
            $("#contact_1_open option").eq(0).text(words.noneText);
            $("#contact_1_open option").eq(1).text(words.turn_shower_on_text);
            $("#contact_1_open option").eq(2).text(words.shower_off_text);
            $("#contact_1_open option").eq(3).text(words.turn_everything_off_text);
            $("#contact_1_open option").eq(4).text(words.preset_1_text);
            $("#contact_1_open option").eq(5).text(words.preset_2_text);
            $("#contact_1_open option").eq(6).text(words.preset_3_text);
            $("#contact_1_open option").eq(7).text(words.preset_4_text);
            $("#contact_1_open option").eq(8).text(words.preset_5_text);
            $("#contact_1_open option").eq(9).text(words.preset_6_text);
            $("#contact_2_closed option").eq(0).text(words.noneText);
            $("#contact_2_closed option").eq(1).text(words.turn_shower_on_text);
            $("#contact_2_closed option").eq(2).text(words.shower_off_text);
            $("#contact_2_closed option").eq(3).text(words.turn_everything_off_text);
            $("#contact_2_closed option").eq(4).text(words.preset_1_text);
            $("#contact_2_closed option").eq(5).text(words.preset_2_text);
            $("#contact_2_closed option").eq(6).text(words.preset_3_text);
            $("#contact_2_closed option").eq(7).text(words.preset_4_text);
            $("#contact_2_closed option").eq(8).text(words.preset_5_text);
            $("#contact_2_closed option").eq(9).text(words.preset_6_text);
            $("#contact_1_closed option").eq(0).text(words.noneText);
            $("#contact_1_closed option").eq(1).text(words.turn_shower_on_text);
            $("#contact_1_closed option").eq(2).text(words.shower_off_text);
            $("#contact_1_closed option").eq(3).text(words.turn_everything_off_text);
            $("#contact_1_closed option").eq(4).text(words.preset_1_text);
            $("#contact_1_closed option").eq(5).text(words.preset_2_text);
            $("#contact_1_closed option").eq(6).text(words.preset_3_text);
            $("#contact_1_closed option").eq(7).text(words.preset_4_text);
            $("#contact_1_closed option").eq(8).text(words.preset_5_text);
            $("#contact_1_closed option").eq(9).text(words.preset_6_text);
            $("#relay2_on_trigger option").eq(0).text(words.noneText);
            $("#relay2_on_trigger option").eq(1).text(words.contact_1_close_text);
            $("#relay2_on_trigger option").eq(2).text(words.contact_1_open_text);
            $("#relay2_on_trigger option").eq(3).text(words.contact_2_close_text);
            $("#relay2_on_trigger option").eq(4).text(words.contact_2_open_text);
            $("#relay2_on_trigger option").eq(5).text(words.shower_on_text);
            $("#relay2_on_trigger option").eq(6).text(words.shower_off_text);
            $("#relay2_on_trigger option").eq(7).text(words.anything_on_text);
            $("#relay2_on_trigger option").eq(8).text(words.everything_off_text);
            $("#relay1_on_trigger option").eq(0).text(words.noneText);
            $("#relay1_on_trigger option").eq(1).text(words.contact_1_close_text);
            $("#relay1_on_trigger option").eq(2).text(words.contact_1_open_text);
            $("#relay1_on_trigger option").eq(3).text(words.contact_2_close_text);
            $("#relay1_on_trigger option").eq(4).text(words.contact_2_open_text);
            $("#relay1_on_trigger option").eq(5).text(words.shower_on_text);
            $("#relay1_on_trigger option").eq(6).text(words.shower_off_text);
            $("#relay1_on_trigger option").eq(7).text(words.anything_on_text);
            $("#relay1_on_trigger option").eq(8).text(words.everything_off_text);
            $("#relay2_off_trigger option").eq(0).text(words.noneText);
            $("#relay2_off_trigger option").eq(1).text(words.contact_1_close_text);
            $("#relay2_off_trigger option").eq(2).text(words.contact_1_open_text);
            $("#relay2_off_trigger option").eq(3).text(words.contact_2_close_text);
            $("#relay2_off_trigger option").eq(4).text(words.contact_2_open_text);
            $("#relay2_off_trigger option").eq(5).text(words.shower_on_text);
            $("#relay2_off_trigger option").eq(6).text(words.shower_off_text);
            $("#relay2_off_trigger option").eq(7).text(words.anything_on_text);
            $("#relay2_off_trigger option").eq(8).text(words.everything_off_text);
            $("#relay1_off_trigger option").eq(0).text(words.noneText);
            $("#relay1_off_trigger option").eq(1).text(words.contact_1_close_text);
            $("#relay1_off_trigger option").eq(2).text(words.contact_1_open_text);
            $("#relay1_off_trigger option").eq(3).text(words.contact_2_close_text);
            $("#relay1_off_trigger option").eq(4).text(words.contact_2_open_text);
            $("#relay1_off_trigger option").eq(5).text(words.shower_on_text);
            $("#relay1_off_trigger option").eq(6).text(words.shower_off_text);
            $("#relay1_off_trigger option").eq(7).text(words.anything_on_text);
            $("#relay1_off_trigger option").eq(8).text(words.everything_off_text);
            //TODO: button
            $('#save_current').val(words.save_current_text);
            //update text
            $('#select_file_btn').val(words.select_file_string);
            $('#update_button').val(words.update_string);
            $('.startButton').val(words.startText);
            $('.stopButton').val(words.stopText);
            $('.offButton').val(words.offText);
            $('.onButton').val(words.onText);
            $("#valve1_outlet_0_ramp option").eq(0).text(words.low_text);
            $("#valve1_outlet_0_ramp option").eq(1).text(words.medium_text);
            $("#valve1_outlet_0_ramp option").eq(2).text(words.high_text);
            $("#valve1_outlet_1_ramp option").eq(0).text(words.low_text);
            $("#valve1_outlet_1_ramp option").eq(1).text(words.medium_text);
            $("#valve1_outlet_1_ramp option").eq(2).text(words.high_text);
            $("#valve1_outlet_2_ramp option").eq(0).text(words.low_text);
            $("#valve1_outlet_2_ramp option").eq(1).text(words.medium_text);
            $("#valve1_outlet_2_ramp option").eq(2).text(words.high_text);
            $("#valve2_outlet_0_ramp option").eq(0).text(words.low_text);
            $("#valve2_outlet_0_ramp option").eq(1).text(words.medium_text);
            $("#valve2_outlet_0_ramp option").eq(2).text(words.high_text);
            $("#valve2_outlet_1_ramp option").eq(0).text(words.low_text);
            $("#valve2_outlet_1_ramp option").eq(1).text(words.medium_text);
            $("#valve2_outlet_1_ramp option").eq(2).text(words.high_text);
            $("#valve2_outlet_2_ramp option").eq(0).text(words.low_text);
            $("#valve2_outlet_2_ramp option").eq(1).text(words.medium_text);
            $("#valve2_outlet_2_ramp option").eq(2).text(words.high_text);
            $("#valve1_outlet_0_flow option").eq(0).text(words.slow_text);
            $("#valve1_outlet_0_flow option").eq(1).text(words.medium_text);
            $("#valve1_outlet_0_flow option").eq(2).text(words.high_text);
            $("#valve1_outlet_1_flow option").eq(0).text(words.slow_text);
            $("#valve1_outlet_1_flow option").eq(1).text(words.medium_text);
            $("#valve1_outlet_1_flow option").eq(2).text(words.high_text);
            $("#valve1_outlet_2_flow option").eq(0).text(words.slow_text);
            $("#valve1_outlet_2_flow option").eq(1).text(words.medium_text);
            $("#valve1_outlet_2_flow option").eq(2).text(words.high_text);
            $("#valve2_outlet_0_flow option").eq(0).text(words.slow_text);
            $("#valve2_outlet_0_flow option").eq(1).text(words.medium_text);
            $("#valve2_outlet_0_flow option").eq(2).text(words.high_text);
            $("#valve2_outlet_1_flow option").eq(0).text(words.slow_text);
            $("#valve2_outlet_1_flow option").eq(1).text(words.medium_text);
            $("#valve2_outlet_1_flow option").eq(2).text(words.high_text);
            $("#valve2_outlet_2_flow option").eq(0).text(words.slow_text);
            $("#valve2_outlet_2_flow option").eq(1).text(words.medium_text);
            $("#valve2_outlet_2_flow option").eq(2).text(words.high_text);
            $("#massage_select_1 option").eq(0).text(words.noneText);
            $("#massage_select_1 option").eq(1).text(words.waveText);
            $("#massage_select_1 option").eq(2).text(words.singleText);
            $("#massage_select_1 option").eq(3).text(words.customText);
            $("#massage_select_2 option").eq(0).text(words.noneText);
            $("#massage_select_2 option").eq(1).text(words.waveText);
            $("#massage_select_2 option").eq(2).text(words.singleText);
            $("#massage_select_2 option").eq(3).text(words.customText);
            $("#chroma_experience option").eq(0).text(words.colorCycleExpText);
            $("#chroma_experience option").eq(1).text(words.warmExpText);
            $("#chroma_experience option").eq(2).text(words.CoolExpText);
            $("#chroma_experience option").eq(3).text(words.riseExptext);
            $("#chroma_experience option").eq(4).text(words.setExptext);
            $("#chroma_experience option").eq(5).text(words.cloudsExptext);
            $("#chroma_experience option").eq(6).text(words.relfectExptext);
            $("#chroma_experience option").eq(7).text(words.thunderExptext);
            //$("#chroma_color option").eq(0).text(words.dialChroText);
            $("#chroma_color option").eq(0).text(words.redChroText);
            $("#chroma_color option").eq(30).text(words.orangeChroText);
            $("#chroma_color option").eq(60).text(words.yelChroText);
            $("#chroma_color option").eq(115).text(words.greChroText);
            $("#chroma_color option").eq(235).text(words.blueChroText);
            $("#chroma_color option").eq(305).text(words.purpleChroText);
            $("#chroma_color option").eq(270).text(words.violetChroText);
            $("#chroma_color option").eq(330).text(words.pinkChroText);
            $("#chroma_color option").eq(-1).text(words.whiteChroText);
            $('.new_light_modual').val(words.new_light_modual_text);
            $('.del_light_modual').val(words.del_light_modual_text);
//            $('.clear_users').val(words.clear_users_text);    //Commnted by TF Team 14-07 to not copy from languages.csv
            $('.reset_system_button').val(words.reset_system_button);
            $('.reset_users_button').val(words.reset_users_button);
            $('.reset_default_button').val(words.reset_default_button);
            $('.id_string').val(words.id_string);
            $('.update_int_string').val(words.update_int_string);
            $('.power_clean_button').val(words.power_clean_button);
            
            
            $('.auto_purge_string').html(data.auto_purge_string);
            trace(data.auto_purge_string);
            $.each(data, function (key, val) {
                if(key!=="")
                {
                    try {
                        $('.' + key).html(val);
                    } catch (e) {
                        trace('Language Error: ' + key + ' ' + val + ' ' + e.message);
                    }
                }
            });
        }
    });
}

function update_lock(value) {    //Changed from update_lock() to update_lock(value) by TF Team
    bool_needs_save = true;							
	if (value == 0)				//Added by TF Team
	{							//Added by TF Team
    var code = document.getElementById("lock_code");
    var check = document.getElementById("lock_check");

	//If there is a value in the code box, do something about it.
	if(code.value !== "")
	{
		// if the lock is activated
		if (check.checked === true)
		{
			if(code.value === "1020"){	
				update_value_settings_lock(const_settings_lock, 1, code.value);
				document.getElementById("wrong_password_1").style.display='none';
				document.getElementById("wrong_password_1").style.visibility='hidden';
			}
			else{
				document.getElementById("wrong_password_1").style.display='block';
				document.getElementById("wrong_password_1").style.visibility='visible';
			}
		}
		else
		{
			if(code.value === "1020"){	
				update_value_settings_lock(const_settings_lock, 0, code.value);
				document.getElementById("wrong_password_1").style.display='none';
				document.getElementById("wrong_password_1").style.visibility='hidden';
			}
			else{
				document.getElementById("wrong_password_1").style.display='block';
				document.getElementById("wrong_password_1").style.visibility='visible';
			}
		}
		//load();
		code.value = "";
	}
	else
		{
			document.getElementById("wrong_password_1").style.display='block';
			document.getElementById("wrong_password_1").style.visibility='visible';
		}
	}					//Added by TF Team
	//Added by TF Team
	else if (value == 1)
	{
		var webcode = document.getElementById("web_code");
		var webcheck = document.getElementById("web_lock");

		//If there is a value in the code box, do something about it.
		if(webcode.value !== "")
		{
			// if the lock is activated
			if (webcheck.checked === true)
			{
				if(webcode.value === "0922"){	
					update_value_settings_lock(const_webpage_lock, 1, webcode.value);
					document.getElementById("wrong_password_2").style.display='none';
					document.getElementById("wrong_password_2").style.visibility='hidden';
				}
				else
				{
					document.getElementById("wrong_password_2").style.display='block';
					document.getElementById("wrong_password_2").style.visibility='visible'
				}
					
			}
			else
			{
				if(webcode.value === "0922"){	
					update_value_settings_lock(const_webpage_lock, 0, webcode.value);
					document.getElementById("wrong_password_2").style.display='none';
					document.getElementById("wrong_password_2").style.visibility='hidden';
				}
				else
				{
					document.getElementById("wrong_password_2").style.display='block';
					document.getElementById("wrong_password_2").style.visibility='visible'
				}
			}
			//load();
			// clear the code box as it's a secret!
			webcode.value = "";
		}
		else
		{
			// there was no code, so turning it on means nothing; just turn it off again
			if (webcheck.checked === true)
			{
				webcheck.checked = false;
					document.getElementById("wrong_password_2").style.display='block';
					document.getElementById("wrong_password_2").style.visibility='visible'
			}
			else
			{
				// if they were turning it off, allow this (although shouldn't they have to enter the code in this case??)
				update_value_settings_lock(const_webpage_lock, 0, webcode.value);
				document.getElementById("wrong_password_2").style.display='block';
				document.getElementById("wrong_password_2").style.visibility='visible'
			}
			//There was no value in the code box.
			//load();
			webcode.value = "";
		}			
	}
	//End of add by TF Team
}

function validate(evt) {
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;

  //allow backspace key
  if (key == 8) { 
    return;
  }

  key = String.fromCharCode( key );
  var regex = /[0-9]/;
  if( !regex.test(key) ) {
    theEvent.returnValue = false;
    if(theEvent.preventDefault) {	
	  theEvent.preventDefault();
	}
  }
}
//Added by TF Team
function password(value) {
	var PIN = "0922";
	/* var password = document.getElementById("pw");  */
	if (value === PIN)
	{
		$('#dialog-Lockpage').dialog("close");
		document.getElementById("password").style.display='none';
		document.getElementById("password").style.visibility='hidden';
		document.getElementById("wrong_password").style.display='none';
		document.getElementById("wrong_password").style.visibility='hidden';
	}	
		
	else
	{
		document.getElementById("pw").value = "";
		document.getElementById("wrong_password").style.display='block';
		document.getElementById("wrong_password").style.visibility='visible';
	}		
		
}


function validate_special_char(evt) // Added by TF-Team to restrict special characters in CMV
{
	var sEvent = evt || window.event;
	var special_key = sEvent.keyCode || sEvent.which;
	if((special_key == 33) || (special_key == 35) || (special_key == 36) || ((special_key == 37) && (sEvent.shiftKey == true))|| (special_key == 126) || (special_key == 64) || (special_key == 94)) // Added by TF-team to block special characters
	{
		preventKEY(sEvent);
	}
	if((special_key == 37) || (special_key == 39))
	{
		return true;
	}
}

//End of Add by TF Team

//Issue 994 : altered by TF team to validate the custom massage event,22-04-2015
function validate_custom_massage(evt,valve,selectedTextbox,textboxID,customOrderIN){

	//dummy event key 300 added to implement massage radio button deselect feature 
	if(evt!=300){
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;
	}
	//fake that event got is space(added for autocorrect support)
	var autocorrectBIT =0;
	if(evt==300) {
		key =32;			
		autocorrectBIT = 1;
	}
		
	if(key==188)
	key = ",";
		
    //Accept all these regular expressions
    var regex = /[1-8]|\,|\s|\b/;	
	//Allow HOME and END keys       (-> right <-left keys) 
	if((key == 35)||(key == 36)||(key == 37)||(key == 39)){
		return true;
	}		
	//skip if events are BACKSPACE,KEY 8 and DEL from conversion
	if((key != 8)&&(key != 56)&&(key!=46)&&(key!=",")){ 
		key = String.fromCharCode(key);    
	}	
	//restrict unwanted keys	
  	if((!regex.test(key))||
	 ((evt.keyCode==0)&&(evt.charCode==46))){  //This is just a DOT so restrict it(added to fix similar key code issue for DELETE and DOT)	  
   	 	preventKEY(theEvent);				   //prevent the key/event from displaying   
  	}   
	//get the caret position from textbox	
	var caretPOS = GetCaretPosition(textboxID);			 	
	
	//DELETE     //BACKSPACE  //SPACE      //COMMA 
	if((key==46)||(key==8)||(key ==" ")||(key ==",")){			
		if(key==8){
			caretPOS -= 1;  //decrement one caret count if event is backspace
		}		
		//delete character of the given index from a string		
		if((key==46)||(key==8))
		customOrderIN = customOrderIN.substring(0,caretPOS) + '' + customOrderIN.substring(caretPOS+1);	
	
		//add SPACE/COMMA to the given index of a string
		if((key ==" ")||(key==",")){
			if(autocorrectBIT==0)
			customOrderIN = [customOrderIN.slice(0,caretPOS),key, customOrderIN.slice(caretPOS)].join('');				
		}
		
	}		
	//count number of commas/frames present in the string
	var numberOfFrames = (customOrderIN.split(",").length - 1); 
	totalFrames = numberOfFrames;
	  

	if(((valve1PortType==2)&&(valve==1))||((valve2PortType==2)&&(valve==2))){		
		//shower configuration 3 - validate event with the help of regular expression pattern
		if(validateCustomMassageOrder(key,valve,0,selectedTextbox,customOrderIN,numberOfFrames,twoPortPattern,caretPOS,autocorrectBIT)==true){
			return true;	
		}else{
			preventKEY(theEvent);//prevent the key/event from displaying   
		}	
	}else{
		//shower configuration 6 - validate event with the help of regular expression pattern
		if(validateCustomMassageOrder(key,valve,1,selectedTextbox,customOrderIN,numberOfFrames,six_three_PortPattern,caretPOS,autocorrectBIT)==true){  				
			return true;
		}else{
			preventKEY(theEvent); //prevent the key/event from displaying 				
		}			
	}	
}


// Issue 994 : added added by TF team to validate the event occured
function validateCustomMassageOrder(key,valve,configuration,selectedTextbox,customOrderIn,numberOfFRAMES,customPatternARRAY,caretPos,autoCorrection){	

	//copy custom massage string to another string for validation 
	var mainEventString = customOrderIn;

	//count number of massage radio buttons active 
	var limit = countNumberOFmassageOutletsON(valve,configuration);			
	
	//checks the outlet is valid
	//(based upon the massage radio button selection,valid faucets etc)	
	//and restricts more than 10 custom massage 

	if(((isOutletValid(key,valve) == true)&&(numberOfFRAMES<10)&&(limit!=0))||(autoCorrection==1)){   
		//reset the badBit which takes ultimate 
		//decition to send the pattern to server
		badBit =0;
		//reset the string
		var subEventString = "";		
		//skip if Backspace/Delete/Space/Comma event comes
		if((key!=8)&&(key!=46)&&(key!=56)&&(key!=" ")&&(key!=",")){
			//Add numerics/outlets to the given index of mainEventString
			mainEventString = [mainEventString.slice(0,caretPos),key, mainEventString.slice(caretPos)].join('');			
		}										
        var patternNotFound = 0;   //get set if any invalid pattern found
		var errorFlag		= 0;   //used to notify fault present in the pattern(eg comma in the end,space in the end..etc)  
		for(var characterIndex=0;characterIndex<mainEventString.length;characterIndex++){				
			subEventString += mainEventString.charAt(characterIndex);				
			if((mainEventString.charAt(characterIndex)==",")||((mainEventString.length-1)==characterIndex)){							
				for(var patternIndex = 0;patternIndex<limit;patternIndex++){			
					if((!customPatternARRAY[patternIndex].test(subEventString))&&(subEventString!="")){
						errorFlag 		= 0;
						if(patternIndex==(limit-1))
						patternNotFound	= 1;		
					}else{													
						errorFlag 		= 0;	
						if(configuration==1){
							if(errorIndexConfigSix.test(patternIndex)){															
								if(subEventString.slice(-1)==","){
									errorFlag = 1;		
								}																
							}	
						}else{
							if(errorIndexConfigThree.test(patternIndex)){
								if(subEventString.slice(-1)==","){
									errorFlag = 1;		
								}								
							}								
						}
						patternIndex = limit+1;
						subEventString = "";
					}
				}										
			}	
		}				
        //filters some of these events in error condition  		
		var eventFilter  = /(^[1-6]$)|\s|\,/;			
		if(valve==1){	
			if(configuration==1){	
				if(selectedTextbox==1){							    
					if((errorFlag==1)||(((patternNotFound==1)&&(!eventFilter.test(key)))||
				   ((patternNotFound==1)&&(key==8))||((patternNotFound==1)&&(key==46))  ||
				   ((patternNotFound==1)&&(key==" ")))){						
						$("#massage_orderv1c1.massage_box").css("background-color", "red");
						errorFlag =0;
						patternNotFound=0;
						badBit = 1;
						return true;
					}else if((errorFlag==0)&&(((patternNotFound==0)&&(eventFilter.test(key)))||
					((patternNotFound==0)&&(key==8))||((patternNotFound==0)&&(key==46)))){
						$("#massage_orderv1c1.massage_box").css("background-color", "green");							
						badBit = 0;
						return true;
					}else{
						return false;
					}							
				}if(selectedTextbox==2){	
					if((errorFlag==1)||(((patternNotFound==1)&&(!eventFilter.test(key)))||
					((patternNotFound==1)&&(key==8))||((patternNotFound==1)&&(key==46))  ||
					((patternNotFound==1)&&(key==" ")))){												
						$("#massage_orderv1c2.massage_box").css("background-color", "red");
						errorFlag =0;
						patternNotFound=0;
						badBit = 1;
						return true;
					}else if((errorFlag==0)&&(((patternNotFound==0)&&(eventFilter.test(key)))||
					((patternNotFound==0)&&(key==8))||((patternNotFound==0)&&(key==46)))){
						$("#massage_orderv1c2.massage_box").css("background-color", "green");							
						badBit = 0;
						return true;
					}else{
						return false;
					}							
				}			
			}else{	
				if(selectedTextbox==1){							    
					if((errorFlag==1)||(((patternNotFound==1)&&(!eventFilter.test(key))) ||
					((patternNotFound==1)&&(key==8))||((patternNotFound==1)&&(key==46))  ||
					((patternNotFound==1)&&(key==" ")))){																		
						$("#massage_orderv1c1.massage_box").css("background-color", "red");		
						errorFlag =0;
						patternNotFound=0;						
						badBit = 1;
						return true;
					}else if((errorFlag==0)&&(((patternNotFound==0)&&(eventFilter.test(key)))||
					((patternNotFound==0)&&(key==8))||((patternNotFound==0)&&(key==46)))){
						$("#massage_orderv1c1.massage_box").css("background-color", "green");
						badBit = 0;
						return true;
					}else{
						return false;
					}
				}	
				if(selectedTextbox==2){	
					if((errorFlag==1)||(((patternNotFound==1)&&(!eventFilter.test(key)))||
					((patternNotFound==1)&&(key==8))||((patternNotFound==1)&&(key==46)) ||
					((patternNotFound==1)&&(key==" ")))){																		
						$("#massage_orderv1c2.massage_box").css("background-color", "red");
						errorFlag =0;
						patternNotFound=0;												
						badBit = 1;
						return true;
					}else if((errorFlag==0)&&(((patternNotFound==0)&&(eventFilter.test(key)))||
					((patternNotFound==0)&&(key==8))||((patternNotFound==0)&&(key==46)))){
						$("#massage_orderv1c2.massage_box").css("background-color", "green");							
						badBit = 0;
						return true;
					}else{
						return false;
					}
				}							
			}	
		}if(valve==2){	
			if(configuration==1){	
				if(selectedTextbox==3){	
					if((errorFlag==1)||(((patternNotFound==1)&&(!eventFilter.test(key)))||
					((patternNotFound==1)&&(key==8))||((patternNotFound==1)&&(key==46)) ||
					((patternNotFound==1)&&(key==" ")))){																		
						$("#massage_orderv2c1.massage_box").css("background-color", "red");							
						errorFlag =0;
						patternNotFound=0;												
						badBit = 1;
						return true;
					}else if((errorFlag==0)&&(((patternNotFound==0)&&(eventFilter.test(key)))||
					((patternNotFound==0)&&(key==8))||((patternNotFound==0)&&(key==46)))){
						$("#massage_orderv2c1.massage_box").css("background-color", "green");
						badBit = 0;
						return true;
					}else{
						return false;
					}
				}	
				if(selectedTextbox==4){	
					if((errorFlag==1)||(((patternNotFound==1)&&(!eventFilter.test(key)))||
					((patternNotFound==1)&&(key==8))||((patternNotFound==1)&&(key==46)) ||
					((patternNotFound==1)&&(key==" ")))){																		
						$("#massage_orderv2c2.massage_box").css("background-color", "red");
						errorFlag =0;
						patternNotFound=0;						
						badBit = 1;
						return true;
					}else if((errorFlag==0)&&(((patternNotFound==0)&&(eventFilter.test(key)))||
					((patternNotFound==0)&&(key==8))||((patternNotFound==0)&&(key==46)))){
						$("#massage_orderv2c2.massage_box").css("background-color", "green");							
						badBit = 0;
						return true;
					}else{
						return false;
					}
				}			
			}	
			else{
				if(selectedTextbox==3){	
					if((errorFlag==1)||(((patternNotFound==1)&&(!eventFilter.test(key)))||
					((patternNotFound==1)&&(key==8))||((patternNotFound==1)&&(key==46)) ||
					((patternNotFound==1)&&(key==" ")))){																		
						$("#massage_orderv2c1.massage_box").css("background-color", "red");
						errorFlag =0;
						patternNotFound=0;						
						badBit = 1;
						return true;
					}else if((errorFlag==0)&&(((patternNotFound==0)&&(eventFilter.test(key)))||
					((patternNotFound==0)&&(key==8))||((patternNotFound==0)&&(key==46)))){
						$("#massage_orderv2c1.massage_box").css("background-color", "green");
						badBit = 0;
						return true;
					}else{
						return false;
					}
				}	
				if(selectedTextbox==4){	
					if((errorFlag==1)||(((patternNotFound==1)&&(!eventFilter.test(key)))||
					((patternNotFound==1)&&(key==8))||((patternNotFound==1)&&(key==46)) ||
					((patternNotFound==1)&&(key==" ")))){																		
						$("#massage_orderv2c2.massage_box").css("background-color", "red");
						errorFlag =0;
						patternNotFound=0;						
						badBit = 1;
						return true;
					}else if((errorFlag==0)&&(((patternNotFound==0)&&(eventFilter.test(key)))||
					((patternNotFound==0)&&(key==8))||((patternNotFound==0)&&(key==46)))){
						$("#massage_orderv2c2.massage_box").css("background-color", "green");
						badBit = 0;
						return true;
					}else{
						return false;
					}
				}			
			}	
		}					
	}else{
		return false;
	}
}

//Issue 994 : Added by TF team to Prevent the key from action 
function preventKEY(theEvent){
    theEvent.returnValue = false;
	if(theEvent.preventDefault){
      theEvent.preventDefault();
	}		
}
//Issue 994  : added by TF team ,22-04-2015
//checks the outlet is valid
//(based upon the massage radio button selection,valid faucets etc)	
//and restricts more than 10 custom massage frames
function isOutletValid(outletNum,valveNum){	
	if((outletNum==" ")||(outletNum==",")||(outletNum==8)||(outletNum==46)){
		return true;
	}
	if(outletNum ==56){
		return false;	
	}			
	if(valveNum == 1 ){
      	switch(outletNum){
   	 		case "1" :
			        if(($("#outlet_0_id").hasClass("outlet_0")==true)|| 
		 			($("#outlet_0_id").hasClass("outlet_9")==true)||
		    		($("#outlet_0_id").hasClass("outlet_10")==true)||
					((document.getElementById('massage_0').checked)==false)
					){
		      			return false;
		    		}
					else{	
						return true;
            		}break;
   	 		case "2" :
					if(($("#outlet_1_id").hasClass("outlet_0")==true)||
		 			($("#outlet_1_id").hasClass("outlet_9")==true)||
		    		($("#outlet_1_id").hasClass("outlet_10")==true)||
					((document.getElementById('massage_1').checked)==false)
					){
		      			return false;
		    		}
					else{	
						return true;
            		}break;

   	 		case "3" :
			        if(($("#outlet_2_id").hasClass("outlet_0")==true)||
		 			($("#outlet_2_id").hasClass("outlet_9")==true)||
		    		($("#outlet_2_id").hasClass("outlet_10")==true)||
					((document.getElementById('massage_2').checked)==false)
					){
		      			return false;
		    		}
					else{	
						return true;
            		}break;

   	 		case "4" :
			        if(($("#outlet_3_id").hasClass("outlet_0")==true)||
		 			($("#outlet_3_id").hasClass("outlet_9")==true)||
		    		($("#outlet_3_id").hasClass("outlet_10")==true)||
					((document.getElementById('massage_3').checked)==false)
					){
		      			return false;
		    		}
					else{	
						return true;
            		}break;

   	 		case "5" :
					if(($("#outlet_4_id").hasClass("outlet_0")==true)||
		 			($("#outlet_4_id").hasClass("outlet_9")==true)||
		    		($("#outlet_4_id").hasClass("outlet_10")==true)||
					((document.getElementById('massage_4').checked)==false)
					){
		      			return false;
		    		}
					else{	
						return true;
            		}break;
   	 		case "6" :
					if(($("#outlet_5_id").hasClass("outlet_0")==true)||
		 			($("#outlet_5_id").hasClass("outlet_9")==true)||
		    		($("#outlet_5_id").hasClass("outlet_10")==true)||
					((document.getElementById('massage_5').checked)==false)
					){
						return false;
		    		}else{	
						return true;
            		}break;
	}
  }
	else{
      	switch(outletNum){
   	 		case "1" :
					if(($("#outletv2_0_id").hasClass("outlet_0")==true)||
		 			($("#outletv2_0_id").hasClass("outlet_9")==true)||
		    		($("#outletv2_0_id").hasClass("outlet_10")==true)||
					((document.getElementById('massage_0v2').checked)==false)
					){
		      			return false;
		    		}
					else{	
						return true;
            		}break;
   	 		case "2" :
					if(($("#outletv2_1_id").hasClass("outlet_0")==true)||
		 			($("#outletv2_1_id").hasClass("outlet_9")==true)||
		    		($("#outletv2_1_id").hasClass("outlet_10")==true)||
					((document.getElementById('massage_1v2').checked)==false)
					){
		      			return false;
		    		}
					else{	
						return true;
            		}break;
   	 		case "3" :
					if(($("#outletv2_2_id").hasClass("outlet_0")==true)||
		 			($("#outletv2_2_id").hasClass("outlet_9")==true)||
		    		($("#outletv2_2_id").hasClass("outlet_10")==true)||
					((document.getElementById('massage_2v2').checked)==false)
					){
		      			return false;
		    		}
					else{	
						return true;
            		}break;
   	 		case "4" :
					if(($("#outletv2_3_id").hasClass("outlet_0")==true)||
		 			($("#outletv2_3_id").hasClass("outlet_9")==true)||
		    		($("#outletv2_3_id").hasClass("outlet_10")==true)||
					((document.getElementById('massage_3v2').checked)==false)
					){
		      			return false;
		    		}
					else{	
						return true;
            		}break;
   	 		case "5" :
					if(($("#outletv2_4_id").hasClass("outlet_0")==true)||
		 			($("#outletv2_4_id").hasClass("outlet_9")==true)||
		    		($("#outletv2_4_id").hasClass("outlet_10")==true)||
					((document.getElementById('massage_4v2').checked)==false)
					){
		      			return false;
		    		}
					else{	
						return true;
            		}break;
   	 		case "6" :
					if(($("#outletv2_5_id").hasClass("outlet_0")==true)||
		 			($("#outletv2_5_id").hasClass("outlet_9")==true)||
		    		($("#outletv2_5_id").hasClass("outlet_10")==true)||
					((document.getElementById('massage_5v2').checked)==false)
					){
		      			return false;
		    		}
					else{	
						return true;
            		}break;
		}
    }	
}

//Issue 994  : added by TF team ,22-04-2015
//to count number of massage radio buttons active
function countNumberOFmassageOutletsON(valve,configType){		
	var massageRadioCount= 0;	
	var massageLimit = 0;
	//count number of massage radio buttons enabled
	if(valve ==1){		
		if(valve1PortType == 6)
		{
				if((document.getElementById('massage_0').checked)==true)
				massageRadioCount++;		
				if((document.getElementById('massage_1').checked)==true)
				massageRadioCount++;
				if((document.getElementById('massage_2').checked)==true)
				massageRadioCount++;			
				if((document.getElementById('massage_3').checked)==true)
				massageRadioCount++;		
				if((document.getElementById('massage_4').checked)==true)
				massageRadioCount++;		
				if((document.getElementById('massage_5').checked)==true)
				massageRadioCount++;
		}else if(valve1PortType == 3)
		{
				if((document.getElementById('massage_0').checked)==true)
				massageRadioCount++;		
				if((document.getElementById('massage_1').checked)==true)
				massageRadioCount++;
				if((document.getElementById('massage_2').checked)==true)
				massageRadioCount++;
		}else
		{
				if((document.getElementById('massage_0').checked)==true)
				massageRadioCount++;		
				if((document.getElementById('massage_1').checked)==true)
				massageRadioCount++;	
		}
	}else{					
		if(valve2PortType == 6)
		{
				if((document.getElementById('massage_0v2').checked)==true)
				massageRadioCount++;		
				if((document.getElementById('massage_1v2').checked)==true)
				massageRadioCount++;
				if((document.getElementById('massage_2v2').checked)==true)
				massageRadioCount++;			
				if((document.getElementById('massage_3v2').checked)==true)
				massageRadioCount++;		
				if((document.getElementById('massage_4v2').checked)==true)
				massageRadioCount++;		
				if((document.getElementById('massage_5v2').checked)==true)
				massageRadioCount++;
		}else if(valve2PortType == 3)
		{
				if((document.getElementById('massage_0v2').checked)==true)
				massageRadioCount++;		
				if((document.getElementById('massage_1v2').checked)==true)
				massageRadioCount++;
				if((document.getElementById('massage_2v2').checked)==true)
				massageRadioCount++;
		}else
		{
				if((document.getElementById('massage_0v2').checked)==true)
				massageRadioCount++;		
				if((document.getElementById('massage_1v2').checked)==true)
				massageRadioCount++;	
		}
	}
	//set limit according to the pattern array
	if(configType==1){
		if(massageRadioCount==2)
		massageLimit = 2;	
		if(massageRadioCount==3)
		massageLimit = 4;	
		if(massageRadioCount==4)
		massageLimit = 6;	
		if(massageRadioCount==5)
		massageLimit =  8;	
		if(massageRadioCount==6)
		massageLimit = 10;	
	}else{
		if(massageRadioCount==2)
		massageLimit = 2;	
		if(massageRadioCount==3)
		massageLimit = 4;			
	}	
	return massageLimit;
	
}
//Issue 994  : added by TF team ,22-04-2015
//to get the cursor position from the massage textbox  
function GetCaretPosition (ctrl) {	
	var idElement = document.getElementById(ctrl)	
	var CaretPos  = 0;   
	
	if (document.selection) {
	idElement.focus ();
	var Sel = document.selection.createRange ();
	Sel.moveStart ('character', -idElement.value.length);
	CaretPos = Sel.text.length;
	}
	else if (idElement.selectionStart || idElement.selectionStart == '0')
	CaretPos = idElement.selectionStart;
	return (CaretPos);
}
//Issue 994  : added by TF team ,22-04-2015
//to get pattern from the textboxes and autocorrect it 
function getAutoCorrected(valve,outlet){
	var tempSTR1 = 0;
	var tempSTR2 = 0;
	outlet += 1; 
	if(valve==1){
		tempSTR1 = document.getElementById('massage_orderv1c1').value;
		tempSTR2 = document.getElementById('massage_orderv1c2').value;

		//v2c1
		if(tempSTR1!=""){
			tempSTR1 = autocorrectPattern(tempSTR1,outlet);
			document.getElementById('massage_orderv1c1').value = tempSTR1;		
			validate_custom_massage(300,1,1,"massage_orderv1c1",tempSTR1);
			update_customMassageOrder(const_valve_massage_order,tempSTR1,1,1);
		}						
		//v2c2
		if(tempSTR2!=""){
			tempSTR2 = autocorrectPattern(tempSTR2,outlet);
			document.getElementById('massage_orderv1c2').value = tempSTR2;
			validate_custom_massage(300,1,2,"massage_orderv1c2",tempSTR2);	
			setTimeout(function()
			{
				 update_customMassageOrder(const_valve_massage_order,tempSTR2,1,2);
			}, 2000); 
		}	
	
		if(tempSTR1=="")
		{
			$("#massage_orderv1c1.massage_box").css("background-color", "#5a5a5a");	
		}
		if(tempSTR2=="")
		{
			$("#massage_orderv1c2.massage_box").css("background-color", "#5a5a5a");	
		}		
	}else{

		tempSTR1 = document.getElementById('massage_orderv2c1').value;
		tempSTR2 = document.getElementById('massage_orderv2c2').value;
		
		//v2c1
		if(tempSTR1!=""){
			tempSTR1 = autocorrectPattern(tempSTR1,outlet);
			document.getElementById('massage_orderv2c1').value = tempSTR1;		
			validate_custom_massage(300,2,3,"massage_orderv2c1",tempSTR1);
			update_customMassageOrder(const_valve_massage_order,tempSTR1,2,1);
		}			
		//v2c2
		if(tempSTR2!=""){
			tempSTR2 = autocorrectPattern(tempSTR2,outlet);
			document.getElementById('massage_orderv2c2').value = tempSTR2;
			validate_custom_massage(300,2,4,"massage_orderv2c2",tempSTR2);
			setTimeout(function(){
			update_customMassageOrder(const_valve_massage_order,tempSTR2,2,2);
			}, 2000);				// added by tf team on 14-01-2016, custom massage frames
			
		}	
		if(tempSTR1=="")
		{
			$("#massage_orderv1c1.massage_box").css("background-color", "#5a5a5a");	
		}
		if(tempSTR2=="")
		{
			$("#massage_orderv1c2.massage_box").css("background-color", "#5a5a5a");	
		}
	}
}

//Issue 994  : added by TF team 
//function to autocorrect the custom massage pattern if massge radio button is deselected
function autocorrectPattern(patternString,outlet){
	//var patternString = pattern;
	var arrayINDEX = []; //array holds index of the outlet occurences in the custom massage string
	var arrayIndexCounter = 0;
	//find number of occurence of outlet/digit in the custom string
	for(var i = 0;i<patternString.length;i++){
		if(patternString.charAt(i)==outlet){
			//Save the occurence indexes to an array
			arrayIndexCounter++;			
		}	
	}
	//Take that index count occurence as loop limit
	var limit = arrayIndexCounter;
	//autocorrect the pattern
	for(var indexCount = 0;indexCount<limit;indexCount++){		
		for(var i = 0;i<patternString.length;i++){
			if(patternString.charAt(i)==outlet){		
				charINDEX = i;
				i = patternString.length;
			}	
		}					
		var doneBIT =0;
		//if charINDEX  is zero
		if(charINDEX == 0){
			if(((patternString.charAt(charINDEX +1) == " ")||
		    (patternString.charAt(charINDEX +1) == ",")||(charINDEX == 0))&&(doneBIT==0)){	
				patternString = patternString.substring(0,charINDEX+1) + '' + patternString.substring(charINDEX+2);	
				patternString = patternString.substring(0,(charINDEX)) + '' + patternString.substring(charINDEX+1);	
				doneBIT =1;
			}
		} 	
		//if charINDEX is eos
		if(charINDEX==(patternString.length - 1 )){
			if(((patternString.charAt(charINDEX-1) == " ")||
			(patternString.charAt(charINDEX-1) == ","))&&(doneBIT==0)){
				patternString = patternString.substring(0,charINDEX) + '' + patternString.substring(charINDEX+1);	
				patternString = patternString.substring(0,(charINDEX-1)) + '' + patternString.substring(charINDEX);	
				doneBIT = 1;

			}
		}
		if((((patternString.charAt(charINDEX+1) == " ")&&
        (patternString.charAt(charINDEX-1) == " "))||
		((patternString.charAt(charINDEX -1) == ",")&&
		(patternString.charAt(charINDEX +1) == " ")))&&(doneBIT==0)){						 	   	 
			patternString = patternString.substring(0,charINDEX) + '' + patternString.substring(charINDEX+1);	
			patternString = patternString.substring(0,charINDEX) + '' + patternString.substring(charINDEX+1);	
			doneBIT =1;
		}
		if((((patternString.charAt(charINDEX+1) == ",")&&
	    (patternString.charAt(charINDEX-1) == " "))|| 
		((patternString.charAt(charINDEX-1) == ",")&&
	    (patternString.charAt(charINDEX+1) == ",")))&&(doneBIT==0)){
			patternString = patternString.substring(0,charINDEX) + '' + patternString.substring(charINDEX+1);	
			patternString = patternString.substring(0,(charINDEX-1)) + '' + patternString.substring(charINDEX);	
			doneBIT =1;
		}
	}		
	return patternString;
}

//Issue 994  : added by TF team 
//for warning 
function dialogOpencustomMassageWarning1() {
	$('#custom_massage_warning_1').dialog({
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
function dialogClosecustomMassageWarning1() {
	$('#custom_massage_warning_1').dialog("close");
}
//Issue 994  : added by TF team for warning
function dialogOpencustomMassageWarning2() {
	$('#custom_massage_warning_2').dialog({
		closeOnEscape: false,
		height: "auto !important",
		width: "auto !important",
		resizable: false,
		modal: true,
		draggable: false,
		dialogClass: 'main-dialog-class',
	});
}
//Issue 994  : added by TF team for warning 
function dialogClosecustomMassageWarning2() {
	$('#custom_massage_warning_2').dialog("close");
}
//Issue 994  : added by TF team for warning
function dialogOpencustomMassageWarning3() {
	$('#custom_massage_warning_3').dialog({
		closeOnEscape: false,
		height: "auto !important",
		width: "auto !important",
		resizable: false,
		modal: true,
		draggable: false,
		dialogClass: 'main-dialog-class',
	});
}
//Issue 994  : added by TF team for warning 
function dialogClosecustomMassageWarning3() {
	$('#custom_massage_warning_3').dialog("close");
}
//end TF 


function max_change(max,min)
{
    number_blur(max);
    if(parseInt(max.value,10) < parseInt(min.value,10))
    {
        min.value=max.value;
    }
    min.max=max.value;

}

function validate_user(evt) {
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;

  //Changed by TF Team to accomadate characters
//allow backspace key //Delete and right arrow
  if ((key == 8) || (key == 39) || (key == 46)) { 
    return;
  }
  
    if(    (key == 43)  //"+"
	  || (key == 61)  //"="
	  || (key == 45)  //"-"
	  || (key == 47)  //"/"
	  || (key == 33)  //"!"
	  || (key == 35)  //"#"
	  || (key == 36)  //"$"
	  || (key == 37)  //"%"
	  || (key == 38)  //"&"
	  || (key == 40)  //"("
	  || (key == 41)  //")"
	  
	){
//Changed by TF Team to accomadate characters
    return;
  }

 //Issue 1114 : Added by TF2 for restricting key entries more than fifteen and space
  if (key == 32) { 
    return;
  }
 //End of Add by TF2

  key = String.fromCharCode( key );
  var regex = /^[A-Za-z0-9]+$/;
  if( !regex.test(key) ) {
    theEvent.returnValue = false;
    if(theEvent.preventDefault) {	
	  theEvent.preventDefault();
	}
  }
}

//Issue 994  : altered by TF team ,22-04-2015
function set_outlet(name_of_class,selection_id_number,valve ){
	var outlet;	
	if(valve === 1){
  		outlet = document.getElementById("outlet_number").innerHTML - 1;
	}else{
  		outlet = document.getElementById("outlet_number_v2").innerHTML - 1;
	}
	
	// TF team - put condition on top from bottom
	// now update the image on the interface to match the selected outlet
	var outlet_pic_id;
	if (valve === 1 ){
	    outlet_pic_id = "outlet_" + outlet + "_id";
	}else{
	    outlet_pic_id = "outletv2_" + outlet + "_id"; 
	}		
	
	//(issue 971) Tf Team altered to hide/show massage radio button if tubfils selected 
	//added to support autocorrect when user changes outlet to tubfil/blank
	if(selection_id_number===9 ||
	   selection_id_number===10||
	   selection_id_number===23||
	   selection_id_number===0){
		var outlet_num = 0;
		
		if(valve === 1 ){
			if(outlet_pic_id == "outlet_0_id"){
				document.getElementById("massage_0").checked = 0;
				document.getElementById("v1_MassageOutlet1").style.visibility='hidden';
				document.getElementById("v1_DelugeOutlet1").style.visibility='hidden';						
				outlet_num = 0;	
			}			
			if(outlet_pic_id == "outlet_1_id"){
				document.getElementById("massage_1").checked = 0;
				document.getElementById("v1_MassageOutlet2").style.visibility='hidden';		
				document.getElementById("v1_DelugeOutlet2").style.visibility='hidden';						
				outlet_num = 1;	
			}			
			if(outlet_pic_id == "outlet_2_id"){
				document.getElementById("massage_2").checked = 0;
				document.getElementById("v1_MassageOutlet3").style.visibility='hidden';		
				document.getElementById("v1_DelugeOutlet3").style.visibility='hidden';						
				outlet_num = 2;	
			}			
			if(outlet_pic_id == "outlet_3_id"){
				document.getElementById("massage_3").checked = 0;
				document.getElementById("v1_MassageOutlet4").style.visibility='hidden';						
				document.getElementById("v1_DelugeOutlet4").style.visibility='hidden';						
				outlet_num = 3;	
			}			
			if(outlet_pic_id == "outlet_4_id"){
				document.getElementById("massage_4").checked = 0;
				document.getElementById("v1_MassageOutlet5").style.visibility='hidden';						
				document.getElementById("v1_DelugeOutlet5").style.visibility='hidden';						
				outlet_num = 4;	
			}			
			if(outlet_pic_id == "outlet_5_id"){
				document.getElementById("massage_5").checked = 0;
				document.getElementById("v1_MassageOutlet6").style.visibility='hidden';						
				document.getElementById("v1_DelugeOutlet6").style.visibility='hidden';						
				outlet_num = 5;			
			}			
			getAutoCorrected(valve,outlet_num);
		}else{
			if(outlet_pic_id == "outletv2_0_id"){	
				document.getElementById("massage_0v2").checked = 0;			
				document.getElementById("v2_MassageOutlet1").style.visibility='hidden';
				document.getElementById("v2_DelugeOutlet1").style.visibility='hidden';						
				
				outlet_num = 0;	
			}			
			if(outlet_pic_id == "outletv2_1_id"){
				document.getElementById("massage_1v2").checked = 0;
				document.getElementById("v2_MassageOutlet2").style.visibility='hidden';
				document.getElementById("v2_DelugeOutlet2").style.visibility='hidden';
				outlet_num = 1;	
			}			
			if(outlet_pic_id == "outletv2_2_id"){
				document.getElementById("massage_2v2").checked = 0;
				document.getElementById("v2_MassageOutlet3").style.visibility='hidden';
				document.getElementById("v2_DelugeOutlet3").style.visibility='hidden';																			
				outlet_num = 2;	
			}			
			if(outlet_pic_id == "outletv2_3_id"){
				document.getElementById("massage_3v2").checked = 0;
				document.getElementById("v2_MassageOutlet4").style.visibility='hidden';
				document.getElementById("v2_DelugeOutlet4").style.visibility='hidden';
				outlet_num = 3;	
			}			
			if(outlet_pic_id == "outletv2_4_id"){
				document.getElementById("massage_4v2").checked = 0;
				document.getElementById("v2_MassageOutlet5").style.visibility='hidden';
				document.getElementById("v2_DelugeOutlet5").style.visibility='hidden';
				outlet_num = 4;	
			}			
			if(outlet_pic_id == "outletv2_5_id"){
				document.getElementById("massage_5v2").checked = 0;
				document.getElementById("v2_MassageOutlet6").style.visibility='hidden';
				document.getElementById("v2_DelugeOutlet6").style.visibility='hidden';
				outlet_num = 5;	
			}			
			getAutoCorrected(valve,outlet_num);
		}		
		update_value_outlet(const_valve_outlet_massage,0,valve,outlet_num);
	}else{		
		if(valve === 1 ){
			if(outlet_pic_id == "outlet_0_id"){				
				//document.getElementById("v1_MassageOutlet1").style.display='block';
				document.getElementById("v1_MassageOutlet1").style.visibility='visible';
				//$("#v1_MassageOutlet1").show();									
			}			
			if(outlet_pic_id == "outlet_1_id"){
				//document.getElementById("v1_MassageOutlet2").style.display='block';
				document.getElementById("v1_MassageOutlet2").style.visibility='visible';
				//$("#v1_MassageOutlet2").show();												
			}			
			if(outlet_pic_id == "outlet_2_id"){
				//document.getElementById("v1_MassageOutlet3").style.display='block';
				document.getElementById("v1_MassageOutlet3").style.visibility='visible';
				//$("#v1_MassageOutlet3").show();													
			}			
			if(outlet_pic_id == "outlet_3_id"){
				//document.getElementById("v1_MassageOutlet4").style.display='block';
				document.getElementById("v1_MassageOutlet4").style.visibility='visible';
				//$("#v1_MassageOutlet4").show();													
			}			
			if(outlet_pic_id == "outlet_4_id"){
				//document.getElementById("v1_MassageOutlet5").style.display='block';
				document.getElementById("v1_MassageOutlet5").style.visibility='visible';
				//$("#v1_MassageOutlet5").show();																	
			}			
			if(outlet_pic_id == "outlet_5_id"){
				//document.getElementById("v1_MassageOutlet6").style.display='block';
				document.getElementById("v1_MassageOutlet6").style.visibility='visible';
				//$("#v1_MassageOutlet6").show();																	
			}			
		}else{
			if(outlet_pic_id == "outletv2_0_id"){
				//document.getElementById("v2_MassageOutlet1").style.display='block';
				document.getElementById("v2_MassageOutlet1").style.visibility='visible';
				//$("#v2_MassageOutlet1").show();									
			}			
			if(outlet_pic_id == "outletv2_1_id"){
				//document.getElementById("v2_MassageOutlet2").style.display='block';
				document.getElementById("v2_MassageOutlet2").style.visibility='visible';
				//$("#v2_MassageOutlet2").show();													
			}			
			if(outlet_pic_id == "outletv2_2_id"){
				//document.getElementById("v2_MassageOutlet3").style.display='block';
				document.getElementById("v2_MassageOutlet3").style.visibility='visible';
				//$("#v2_MassageOutlet3").show();													
			}			
			if(outlet_pic_id == "outletv2_3_id"){
				//document.getElementById("v2_MassageOutlet4").style.display='block';
				document.getElementById("v2_MassageOutlet4").style.visibility='visible';
				$("#v2_MassageOutlet4").show();													
			}			
			if(outlet_pic_id == "outletv2_4_id"){
				//document.getElementById("v2_MassageOutlet5").style.display='block';
				document.getElementById("v2_MassageOutlet5").style.visibility='visible';
				//$("#v2_MassageOutlet5").show();													
			}			
			if(outlet_pic_id == "outletv2_5_id"){
			//	document.getElementById("v2_MassageOutlet6").style.display='block';
				document.getElementById("v2_MassageOutlet6").style.visibility='visible';
				//$("#v2_MassageOutlet6").show();													
			}		
		}
	}//end - 971	
	
	//issue 1158 : added by TF team,22-04-2015 to change configuration to CUSTOM if tubfils selected
	if(selection_id_number===9||selection_id_number===10 || selection_id_number===0){  //Added blank icon TF Team 08-07
				
		var changeConfigToCustom = 0;				
		//3x6		
		if(showerConfigurationActive==1){ 
			changeConfigToCustom = 1;		
		}		
		//6x6
		if(showerConfigurationActive==2){ 
			if(valve==1){
				if((outlet_pic_id != "outlet_4_id")&&(outlet_pic_id != "outlet_5_id")){
					changeConfigToCustom = 1;
				}				
			}else{
				changeConfigToCustom = 1;
			}				
		}
		//6x6		
		if(showerConfigurationActive==5){ 
			if(valve==1){
				if(outlet_pic_id != "outlet_5_id"){
					changeConfigToCustom = 1;
				}				
			}else{
				if(outlet_pic_id != "outletv2_5_id"){
					changeConfigToCustom = 1;
				}								
			}	
		}			
		//3x3
		if(showerConfigurationActive==3){ 
			changeConfigToCustom = 1;
		}		
		//6x3
		if(showerConfigurationActive==4){ 
			if( valve==1){
				if(outlet_pic_id !="outlet_5_id"){
					changeConfigToCustom = 1;
				}
			}else{
				changeConfigToCustom = 1;
			}	
		}
		//single 6		
		if(showerConfigurationActive==6){    
			if( valve==1){	
				changeConfigToCustom = 1;
			}
		}
		//single 6 (only first 3 outlets)
		if(showerConfigurationActive==8){ 
			if(valve==1){	
				if((outlet_pic_id !="outlet_3_id")&&
				   (outlet_pic_id !="outlet_4_id")&&	
				   (outlet_pic_id !="outlet_5_id")){
					changeConfigToCustom = 1;
				}		
			}
		}
		//single 3
		if(showerConfigurationActive==7){ 
			if( valve==1){	
				changeConfigToCustom = 1;
			}
		}
		if(changeConfigToCustom==1){
			update_config(1,5);	//added new index not to clear the outlets 
			
			$('.spa_sel').hide(); // (issue-1174)-tf team added to hide spa radio button
		}
	}//end TF 
	
    // update the database
    bool_needs_save = true;
    trace('Select New Valve');
    $.ajax({
        type: "GET",
        url: "save_variable.cgi",
        data: {
            index: const_valve_outlet_type,
            value: selection_id_number,
            valve: valve,
			outlet: outlet
        },
        dataType: "JSON",
        cache: true
    });
	
	document.getElementById(outlet_pic_id).setAttribute ("class", "outlet " + name_of_class);
	
	// and close the popup
	if (valve === 1) {
		document.getElementById("valve_picker").style.display = 'none';
	} else {
		document.getElementById("valve_picker_v2").style.display = 'none';
	}
}

function pop(e, popid,outlet,valve) {
    var popimage = document.getElementById(popid);

    if(popimage.style.display == 'block') {
       popimage.style.display = 'none';
    }
    else {
      // check for window scroll
      var top = window.pageYOffset || document.documentElement.scrollTop
      var left = window.pageXOffset || document.documentElement.scrollLeft
      popimage.style.left = (e.clientX + left - 300) + 'px';
      popimage.style.top = (e.clientY + top - 50)  + 'px';
      
      if (valve === 1) {
          document.getElementById("outlet_number").innerHTML = outlet + 1;
          document.getElementById("valve_number").innerHTML = valve;
      } else {
          document.getElementById("outlet_number_v2").innerHTML = outlet + 1;
          document.getElementById("valve_number_v2").innerHTML = valve;
      }
	  		
       popimage.style.display = 'block';
	   
	    //Edditing for settings page by TF Team 06-07
		//$('#outletv1_9').hide();
		//$('#outletv2_9').hide();
		//$('#outletv1_10').hide();
		//$('#outletv2_10').hide();
		if(valve == 1)
		{
		   if((showerConfigurationActive == 1) &&((outlet === 0) || (outlet === 1) || (outlet === 2)))
				{
					$('#outletv1_9').hide();
					$('#outletv1_10').hide();
				} 
		   else if((showerConfigurationActive == 2) &&((outlet === 0) || (outlet === 1) || (outlet === 2) || (outlet === 3)))
		   {	
					$('#outletv1_9').hide();
					$('#outletv1_10').hide();	
		   }	
		   else if((showerConfigurationActive == 3) &&((outlet === 0) || (outlet === 1) || (outlet === 2)))
		   {
					$('#outletv1_9').hide();
					$('#outletv1_10').hide();
		   }   
		   else if((showerConfigurationActive == 4) &&((outlet === 0) || (outlet === 1) || (outlet === 2) || (outlet === 3) || (outlet === 4)))
		   {
						$('#outletv1_9').hide();
						$('#outletv1_10').hide();  
		   }	   
		   else if((showerConfigurationActive == 5) &&((outlet === 0) || (outlet === 1) || (outlet === 2) || (outlet === 3) || (outlet === 4)))
		   {
					$('#outletv1_9').hide();
					$('#outletv1_10').hide();
			} 
		   else if((showerConfigurationActive == 6) &&((outlet === 0) || (outlet === 1) || (outlet === 2) || (outlet === 3) || (outlet === 4) || (outlet === 5)))
		   {
						$('#outletv1_9').hide();
						$('#outletv1_10').hide();
		   }
		   else if((showerConfigurationActive == 7) &&((outlet === 0) || (outlet === 1) || (outlet === 2)))
		   {
					$('#outletv1_9').hide();
					$('#outletv1_10').hide(); 
		   }   
		   else if((showerConfigurationActive == 8)  &&((outlet === 0) || (outlet === 1) || (outlet === 2)))
		   {
					$('#outletv1_9').hide();
					$('#outletv1_10').hide();  
		   }   
		   else
		   {
			$('#outletv1_9').show();
			$('#outletv1_10').show();   
		   }
			if(bool_gen1UIConnectionStatus == false)
			{
				$('#outletv1_23').show();
			}
			else
			{
				$('#outletv1_23').hide();
			}
		}		
		if(valve == 2)
		{
		   if((showerConfigurationActive == 1) &&((outlet === 0) || (outlet === 1) || (outlet === 2) || (outlet === 3) || (outlet === 4) || (outlet === 5)))
				{
					$('#outletv2_9').hide();
					$('#outletv2_10').hide();
				} 
		   else if((showerConfigurationActive == 2) &&((outlet === 0) || (outlet === 1) || (outlet === 2) || (outlet === 3) || (outlet === 4) || (outlet === 5)))
		   {	
					$('#outletv2_9').hide();
					$('#outletv2_10').hide();	
		   }	
		   else if((showerConfigurationActive == 3) &&((outlet === 0) || (outlet === 1) || (outlet === 2)))
		   {
					$('#outletv2_9').hide();
					$('#outletv2_10').hide();
		   }   
		   else if((showerConfigurationActive == 4) &&((outlet === 0) || (outlet === 1) || (outlet === 2)))
		   {
						$('#outletv2_9').hide();
						$('#outletv2_10').hide();  
		   }	   
		   else if((showerConfigurationActive == 5) &&((outlet === 0) || (outlet === 1) || (outlet === 2) || (outlet === 3) || (outlet === 4)))
		   {
					$('#outletv2_9').hide();
					$('#outletv2_10').hide();
		   } 
		   else
		   {
			$('#outletv2_9').show();
			$('#outletv2_10').show();   
		   }
			
			if(bool_gen1UIConnectionStatus == false)
			{
				$('#outletv2_23').show();
			}
			else
			{
				$('#outletv2_23').hide();
			}
		}
	   //End of edit for settings page by TF Team 06-07
    }

    e.preventDefault();
    
    return false;
 }

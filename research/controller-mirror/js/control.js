function trace(s) {
    try {
        console.log(s)
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
var none_text = "none";
var modules_installed = 0;
var bool_light1_dimmer = true;
var bool_light2_dimmer = true;
var bool_light3_dimmer = true;
var bool_needs_save = false;
var reload = false;
var default_steam_time = 0; //Added by TF Team
var ui_start = 0; //ADded by TF team
var page_load_v1 = 0;
var page_load_v2 = 0;
var valve1_outlets = 0;
var valve2_outlets = 0;
var steam_connected = false;
var steam_use = false;
var ui_connected = false;

function bt_disconnect()
{
    $.ajax({
        type: "GET",
        url: "bt_disconnect.cgi",
        data: {},
        dataType: "text",
        cache: false
    });
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
    $("#tabs-Service").tabs({
        activate: function (event, ui) {
            reload = true;
            //alert('selected: '+ui.newTab.index());
            trace(displayTime());
            load();
            trace(displayTime());
        }
    });
    $("#datepicker").datepicker({
        inline: true
    });
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
    });
    $("#volume_val").val($("#volume_slider").slider("value"));
    //treble_slider
    $("#treble_slider").slider({
        min: 0,
        max: 100,
        step: 1,
        /*slide: function( event, ui ) {
                //$( "#treble_val" ).val( ui.value +'%');
            },*/
        change: function (event, ui) {
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
    });
    //$( "#treble_val" ).val( $( "#treble_slider" ).slider( "value" ) );
    //bass_slider
    $("#bass_slider").slider({
        min: 0,
        max: 100,
        step: 1,
        /*slide: function( event, ui ) {
               // $( "#bass_val" ).val( ui.value +'%');
            },*/
        change: function (event, ui) {
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
    });
    // $( "#bass_val" ).val( $( "#bass_slider" ).slider( "value" ) );
    //bal_slider
    $("#bal_slider").slider({
        min: -50,
        max: 50,
        step: 1,
        slide: function (event, ui) {
            $("#bal_val").val(ui.value);
        },
        change: function (event, ui) {
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
    });
    $("#bal_val").val($("#bal_slider").slider("value"));
});
var bool_light1_on = false;
var bool_light2_on = false;
var bool_light3_on = false;
var bool_shower_on = false;
var bool_music_on = false;
var bool_steam_on = false;
var bool_rain_on = false;
$(function () {
    $("#valve_1_control").bind('mousedown', function (e) {
        e.metaKey = true;
    }).selectable({
        stop: function () {
            valve1 = "";
            $(".ui-selected", this).each(function () {
                var index = $("#valve_1_control li").index(this);
                valve1 += ((index + 1));
            });
            if (bool_shower_on) {
                quick_shower(3);
            }
        }
    });
    $("#valve_2_control").bind('mousedown', function (e) {
        e.metaKey = true;
    }).selectable({
        stop: function () {
            valve2 = "";
            $(".ui-selected", this).each(function () {
                var index = $("#valve_2_control li").index(this);
                valve2 += ((index + 1));
            });
            if (bool_shower_on) {
                quick_shower(4);
            }
        }
    });
    $("#light_1_bright").slider({
        min: 0,
        max: 100,
        step: 1,
        slide: function (event, ui) {
            $("#light_1_bright_lbl").val(ui.value + "%");
        },
        change: function (event, ui) {
            if (bool_light1_on) {
                $.ajax({
                    type: "GET",
                    url: "light_on.cgi",
                    data: {
                        module: 1,
                        intensity: ui.value
                    },
                    dataType: "text",
                    cache: false
                });
            }
        }
    });
    $("#light_1_bright_lbl").val($("#light_1_bright").slider("value") + "%");
    $("#light_3_bright").slider({
        min: 0,
        max: 100,
        step: 1,
        slide: function (event, ui) {
            $("#light_3_bright_lbl").val(ui.value + "%");
        },
        change: function (event, ui) {
            if (bool_light3_on) {
                $.ajax({
                    type: "GET",
                    url: "light_module.cgi",
                    data: {
                        module: 3,
                        intensity: ui.value
                    },
                    dataType: "text",
                    cache: false
                });
            }
        }
    });
    $("#light_3_bright_lbl").val($("#light_3_bright").slider("value") + "%");
    $("#light_2_bright").slider({
        min: 0,
        max: 100,
        step: 1,
        slide: function (event, ui) {
            $("#light_2_bright_lbl").val(ui.value + "%");
        },
        change: function (event, ui) {
            if (bool_light2_on) {
                $.ajax({
                    type: "GET",
                    url: "light_module.cgi",
                    data: {
                        module: 2,
                        intensity: ui.value
                    },
                    dataType: "text",
                    cache: false
                });
            }
        }
    });
    $("#light_2_bright_lbl").val($("#light_2_bright").slider("value") + "%");
    $("#music_volume").slider({
        min: 0,
        max: 100,
        step: 1,
        slide: function (event, ui) {
            $("#music_volume_lbl").val(ui.value + "%");
        },
        change: function (event, ui) {
            if (bool_music_on === true) {
                $.ajax({
                    type: "GET",
                    url: "music_on.cgi",
                    data: {
                        volume: ui.value
                    },
                    dataType: "text",
                    cache: false
                });
            }
        }
    });
    $("#music_volume_lbl").val($("#music_volume").slider("value") + "%");
    //bal_slider
});
//Periodically try to update the settings area
var counter = 0;
var valve1 = 0;
var valve2 = 0;

function shower_cmd() {
	if(document.getElementById("startshower").value == "Start")
		quick_shower(0);
	else if(document.getElementById("startshower").value == "Stop")
		stop_shower();
}

function steam_cmd()
{
	if(document.getElementById("steambutton_on").value === "Start")
		steam_on();
	else if(document.getElementById("steambutton_on").value === "Stop")
		steam_off();
}

function quick_shower(valve_num_temp) {
	if(bool_shower_on === false)
	document.getElementById("startshower").value = "Starting";
    bool_shower_on = true;
    var massage1 = document.getElementById('massage_select_1').value;
    var massage2 = document.getElementById('massage_select_2').value;
    var temp1 = document.getElementById('valve1_temp').value;
    var temp2 = document.getElementById('valve2_temp').value;
	if(valve_num_temp == 1 || valve_num_temp == 2)
	{
		if(valve_num_temp == 1)
		{	
			var index;
			valve1 = "";
				if($("#valve_1_control li:nth-child(1)").hasClass("ui-selected"))
				{
					//index = $("#valve_1_control li").index(this);
						valve1 += 1;
				}
				if($("#valve_1_control li:nth-child(2)").hasClass("ui-selected"))
				{
					//index = $("#valve_1_control li").index(this);
						valve1 += 2;
				}
				if($("#valve_1_control li:nth-child(3)").hasClass("ui-selected"))
				{
					//index = $("#valve_1_control li").index(this);
						valve1 += 3;
				}
				if($("#valve_1_control li:nth-child(4)").hasClass("ui-selected"))
				{
					//index = $("#valve_1_control li").index(this);
						valve1 += 4;
				}
				if($("#valve_1_control li:nth-child(5)").hasClass("ui-selected"))
				{
					//index = $("#valve_1_control li").index(this);
						valve1 += 5;
				}
				if($("#valve_1_control li:nth-child(6)").hasClass("ui-selected"))
				{
					//index = $("#valve_1_control li").index(this);
						valve1 += 6;
				}
		}
		if(valve_num_temp == 2)
		{
			var index;
			valve2 = "";
			if($("#valve_2_control li:nth-child(1)").hasClass("ui-selected"))
			{
				//index = $("#valve_2_control li").index(this);
					valve2 += 1;
			}
			if($("#valve_2_control li:nth-child(2)").hasClass("ui-selected"))
			{
				//index = $("#valve_2_control li").index(this);
					valve2 += 2;
			}
			if($("#valve_2_control li:nth-child(3)").hasClass("ui-selected"))
			{
				//index = $("#valve_2_control li").index(this);
					valve2 += 3;
			}
			if($("#valve_2_control li:nth-child(4)").hasClass("ui-selected"))
			{
				//index = $("#valve_2_control li").index(this);
					valve2 += 4;
			}
			if($("#valve_2_control li:nth-child(5)").hasClass("ui-selected"))
			{
				//index = $("#valve_2_control li").index(this);
					valve2 += 5;
			}
			if($("#valve_2_control li:nth-child(6)").hasClass("ui-selected"))
			{
				//index = $("#valve_2_control li").index(this);
					valve2 += 6;
			}
		}	
	}	
	else if(valve_num_temp == 3)
		valve_num_temp = 1;
	else if(valve_num_temp == 4)
		valve_num_temp = 2;
    if ((valve1 === "" && valve2 === "") && (valve1_temp == 0 && valve2_temp == 0 )) {
        stop_shower();
    } else {
		
		if(valve_num_temp == 1 || valve_num_temp == 0)
		{
			$.ajax({
				type: "GET",
				url: "quick_shower.cgi",
				data: {
					valve_num : 1,
					valve1_outlet: valve1,
					valve1_massage: massage1,
					valve1_temp: temp1,
					valve2_outlet: valve2,
					valve2_massage: massage2,
					valve2_temp: temp2
					},
				dataType: "text",
				cache: false
			});
		}
		if(valve_num_temp == 2 || valve_num_temp == 0)
		{
			$.ajax({
				type: "GET",
				url: "quick_shower.cgi",
				data: {
					valve_num : 2,
					valve2_outlet: valve2,
					valve2_massage: massage2,
					valve2_temp: temp2,
					valve1_temp: temp1,
					valve1_outlet: valve1,
					valve1_massage: massage1
					},
				dataType: "text",
				cache: false
			});
		}
	// document.getElementById("startshower").style.visibility = "hidden"; //Added by TF Team 10-07
	// document.getElementById("stopshower").style.visibility = "visible"; //Added by TF Team 10-07
    }
}

function stop_shower() {
	if(bool_shower_on === true)
	document.getElementById("startshower").value = "Stopping";
    bool_shower_on = false;
    $.ajax({
        type: "GET",
        url: "stop_shower.cgi",
		data: {},
        dataType: "text",
        cache: false
    });
	//document.getElementById("startshower").style.visibility = "visible"; //Added by TF Team 10-07
	//document.getElementById("stopshower").style.visibility = "hidden"; //Added by TF team 10-07
}

function start_user() {
    bool_shower_on = true;
	bool_steam_on = true;
    var user = $("input:radio[name='user']:checked").val();
	if (typeof user !== "undefined") {

		trace("Start shower with user profile: " + user);
    	//cycle through and find which user is pressed
    	$.ajax({
        	type: "GET",
        	url: "start_user.cgi",
        	data: {
            	user: user
        	},
        	dataType: "text",
        	cache: false
    	});
		// change button to say "Running"
		document.getElementById("userstartbutton").value = "Running";
	}
}
function stop_user() {
    bool_shower_on = false;
	bool_steam_on = false;
	trace("Stop shower");
    //cycle through and find which user is pressed
    $.ajax({
        type: "GET",
        url: "stop_user.cgi",
        data: {},
        dataType: "text",
        cache: false
    });
	// change start button to say "Start"
	document.getElementById("userstopbutton").value = "Stopping";
}

function light_on(light_module) {
    var intensity = 100; //If it is a on default to 100 percent, maybe this should be done in page setup and always get the slider intensity?
    switch (light_module) {
    case 1:
        bool_light1_on = true;
        if (bool_light1_dimmer) {
            intensity = $("#light_1_bright").slider("value");
        }
        break;
    case 2:
        bool_light2_on = true;
        if (bool_light2_dimmer) {
            intensity = $("#light_2_bright").slider("value");
        }
        break;
    case 3:
        bool_light3_on = true;
        if (bool_light3_dimmer) {
            intensity = $("#light_3_bright").slider("value");
        }
        break;
    default:
        return;
    }
    $.ajax({
        type: "GET",
        url: "light_on.cgi",
        data: {
            module: light_module,
            intensity: intensity
        },
        dataType: "text",
        cache: false
    });
}

function light_off(light_module) {
    switch (light_module) {
    case 1:
        bool_light1_on = false;
        break;
    case 2:
        bool_light2_on = false;
        break;
    case 3:
        bool_light3_on = false;
        break;
    default:
        return;
    }
    $.ajax({
        type: "GET",
        url: "light_off.cgi",
        data: {
            module: light_module
        },
        dataType: "text",
        cache: false
    });
}

function music_on() {
    bool_music_on = true;
    $.ajax({
        type: "GET",
        url: "music_on.cgi",
        data: {
            volume: $("#music_volume").slider("value")
        },
        dataType: "text",
        cache: false
    });
}

function music_off() {
    /* bool_music_off = true; */     /* Commented by TF Team - bool_music_off not declared	*/
	   bool_music_on = false;        /*Added by TF Team*/
    $.ajax({
        type: "GET",
        url: "music_off.cgi",
        data: {
            volume: $("#music_volume").slider("value")
        },
        dataType: "text",
        cache: false
    });
}

function rain_on() {
    bool_rain_on = true;
    if (document.getElementById('chroma_color_radio').checked) {
        $.ajax({
            type: "GET",
            url: "rain_on.cgi",
            data: {
                mode: 1,
                color: $('#chroma_color').val()
            },
            dataType: "text",
            cache: false
        });
    } else if (document.getElementById('chroma_experience_radio').checked) {
        $.ajax({
            type: "GET",
            url: "rain_on.cgi",
            data: {
                mode: 2,
                effect: $('#chroma_experience').val()
            },
            dataType: "text",
            cache: false
        });
    }
}

function rain_off() {
    /* bool_rain_off = false; */     /*Commented by TF Team - bool_rain_off not declared*/
	   bool_rain_on = false;		 /*Added by TF Team*/
    $.ajax({
        type: "GET",
        url: "rain_off.cgi",
        data: {},
        dataType: "text",
        cache: false
    });
}

function steam_on() {
    if(bool_steam_on === false)
	document.getElementById("steambutton_on").value = "Starting";
	bool_steam_on = true;
	
	trace("Turning steam on");
    $.ajax({
        type: "GET",
        url: "steam_on.cgi",
        data: {
            temp: document.getElementById('steam_set_temp').value,
            time: document.getElementById('steam_set_time').value
        },
        dataType: "text",
        cache: false
    });
	// change steam on button to say "Active"
	
	//document.getElementById("steambutton_on").style.visibility = "hidden"; //Added by TF Team 10-07
	//document.getElementById("steambutton_off").style.visibility = "visible"; //Added by TF Team 10-07
}

function steam_off() {
    /* bool_steam_on = true; */       /*Commented by TF Team - Should be false*/
	   if(bool_steam_on === true)
	   document.getElementById("steambutton_on").value = "Stopping";
	   bool_steam_on = false;		/*Added by TF Team*/
	   
	trace("Turning steam off");
    $.ajax({
        type: "GET",
        url: "steam_off.cgi",
        data: {},
        dataType: "text",
        cache: false
    });
	// restore on button
	//document.getElementById("steambutton_on").value = "On";   //TF Team 13-07
	//document.getElementById("steambutton_on").style.visibility = "visible"; //Added by TF Team 10-07
	//document.getElementById("steambutton_off").style.visibility = "hidden"; //Added by TF Team 10-07

    document.getElementById("steam_set_time").value = default_steam_time; //Added by TF Team 10-07

}

function loadXMLDoc() {
    trace('LoadXMLDoc');
    $.ajax({
        type: "GET",
        url: "system_info.cgi",
        data: {},
        dataType: "JSON",
        cache: false,
        success: function (data) {
            if (hide_things) {
				/*Commented by TF Team - changing valve1temp display to valve1_CurrentStatus
                /* $('.valve1Temp').html(data.valve1Temp);     
                $('.valve2Temp').html(data.valve2Temp);
                $('.valve1Temp').show();
                $('.valve2Temp').show();
                
                if(data.valve1Temp !== "Off" && 
                    data.valve1Temp !== "Error" && 
                    data.valve1Temp !== "" ) */
					
				/*Added by TF Team*/
				$('.valve1_Currentstatus').html(data.valve1_Currentstatus);     
				$('.valve2_Currentstatus').html(data.valve2_Currentstatus);
				$('.valve1Temp').html(data.valve1Temp);
                $('.valve2Temp').html(data.valve2Temp);
				$('.valve1_Currentstatus').show();
				$('.valve2_Currentstatus').show();
                $('.valve1Temp').show();
                $('.valve2Temp').show();
				
				var current_steam_settime = document.getElementById('steam_set_time').value;
				trace("steam set time value");
				trace(document.getElementById('steam_set_time').value);
				trace("current_steam_settime");
				trace(current_steam_settime);
               
			   if(ui_start === 0)
			   {	   
				if((data.devices_running == true) || (ui_connected == false)) {    //Added steam_running by TF Team 10-07
					//Hide settings and service tabs
					$("#control_div").hide();
					if(ui_connected == true)
					{
						$("#settings-tab").hide();
						$("#tabs-Settings").hide();
						$("#service-tab").hide();
						$("#tabs-Service").hide();
					}
				} else {
					$("#control_div").show();
				}
				ui_start = 1;
			   }
				
                if(data.valve1_Currentstatus !== "Off" && 
                    data.valve1_Currentstatus !== "Error" && 
                    data.valve1_Currentstatus !== "" )				/*End of Add by TF Team*/
                {
					if(data.valve1_Currentstatus === "Paused") //Added by TF team 08-08
					$("#currTempStatusString1").hide();    //Added by TF Team 08-08
					else
					$("#currTempStatusString1").show();    //Added by TF Team 08-08
                    // We have a valve installed, and it is running
                    document.getElementById("valve1_temp").value = data.valve1Setpoint;
					if((bool_shower_on === true) || (page_load_v1 === 0))
					{	
						if(data.valve1outlet1)
						{
							$("#valve_1_control li:nth-child(1)").addClass("ui-selected");
						}else{
							$("#valve_1_control li:nth-child(1)").removeClass("ui-selected");
						}
						if(data.valve1outlet2)
						{
							$("#valve_1_control li:nth-child(2)").addClass("ui-selected");
						}else{
							$("#valve_1_control li:nth-child(2)").removeClass("ui-selected");
						}
						if(data.valve1outlet3)
						{
							$("#valve_1_control li:nth-child(3)").addClass("ui-selected");
						}else{
							$("#valve_1_control li:nth-child(3)").removeClass("ui-selected");
						}
						if(data.valve1outlet4)
						{
							$("#valve_1_control li:nth-child(4)").addClass("ui-selected");
						}else{
							$("#valve_1_control li:nth-child(4)").removeClass("ui-selected");
						}
						if(data.valve1outlet5)
						{
							$("#valve_1_control li:nth-child(5)").addClass("ui-selected");
						}else{
							$("#valve_1_control li:nth-child(5)").removeClass("ui-selected");
						}
						if(data.valve1outlet6)
						{
							$("#valve_1_control li:nth-child(6)").addClass("ui-selected");
						}else{
							$("#valve_1_control li:nth-child(6)").removeClass("ui-selected");
						}
						
											document.getElementById('massage_select_1').selectedIndex = data.valve1_massage; //TF team 14-08
						if(page_load_v1 === 0)
							page_load_v1 = 1;
					}
                }
				else  										//Added by TF Team 08-08
				{
					$("#currTempStatusString1").hide();    //Added by TF Team 08-08
				}
				
				//document.getElementById('massage_select_1').selectedIndex = data.valve1_massage; //TF team 14-08
				
                if(data.valve2_Currentstatus !== "Off" && 
                    data.valve2_Currentstatus !== "Error" && 
                    data.valve2_Currentstatus !== "" )
                {
					if(data.valve2_Currentstatus === "Paused") //Added by TF Team 08-08
					$("#currTempStatusString2").hide();    //Added by TF Team 08-08
					else
					$("#currTempStatusString2").show();    //Added by TF Team 08-08	
                    document.getElementById("valve2_temp").value = data.valve2Setpoint;
                    // We have a valve installed, and it is running
					if((bool_shower_on === true) || (page_load_v2 === 0))
					{	
						if(data.valve2outlet1)
						{
							$("#valve_2_control li:nth-child(1)").addClass("ui-selected");
						}else{
							$("#valve_2_control li:nth-child(1)").removeClass("ui-selected");
						}
						if(data.valve2outlet2)
						{
							$("#valve_2_control li:nth-child(2)").addClass("ui-selected");
						}else{
							$("#valve_2_control li:nth-child(2)").removeClass("ui-selected");
						}
						if(data.valve2outlet3)
						{
							$("#valve_2_control li:nth-child(3)").addClass("ui-selected");
						}else{
							$("#valve_2_control li:nth-child(3)").removeClass("ui-selected");
						}
						if(data.valve2outlet4)
						{
							$("#valve_2_control li:nth-child(4)").addClass("ui-selected");
						}else{
							$("#valve_2_control li:nth-child(4)").removeClass("ui-selected");
						}
						if(data.valve2outlet5)
						{
							$("#valve_2_control li:nth-child(5)").addClass("ui-selected");
						}else{
							$("#valve_2_control li:nth-child(5)").removeClass("ui-selected");
						}
						if(data.valve2outlet6)
						{
							$("#valve_2_control li:nth-child(6)").addClass("ui-selected");
						}else{
							$("#valve_2_control li:nth-child(6)").removeClass("ui-selected");
						}
						document.getElementById('massage_select_2').selectedIndex = data.valve2_massage; //TF team 14-08
						if(page_load_v2 === 0)
							page_load_v2 = 1;
					}	
                }else										//Added by TF Team 08-08
					$("#currTempStatusString2").hide();    //Added by TF Team 08-08
				
                //document.getElementById('massage_select_2').selectedIndex = data.valve2_massage; //TF team 14-08
				
                $('.LZ1Status').html(data.LZ1Status);
                $('.LZ2Status').html(data.LZ2Status);
                $('.LZ3Status').html(data.LZ3Status);
                
                $('.steamStatus').html(data.steamStatus);
                $('.steamTempStatus').html(data.steamTempStatus); 
                $('.steamTimeStatus').html(data.steamTimeStatus); 
                if(data.steamStatus === "On" || 
                    data.steamStatus === "On (Power Clean Needed)" ||
					data.steamStatus === "Purge")
                {
                    $('#steamTempStatus').show();
                    $('#steamTimeStatus').show();
                    //document.getElementById("steam_set_temp").value = data.steamTempStatus; //Commented by TF Team - should not get a value from cgi only set 13-07
                    //document.getElementById("steam_set_time").value = data.steamTimeMinutes; //Commented by TF Team - should not get a value from cgi only set 13-07
                }else{
                    $('#steamTempStatus').hide();
                    $('#steamTimeStatus').hide();
                }
				
                if(data.musicStatus !== "")
                {
                    $('.music_status').show();
                    var temp = $('#musicStatusSpan');
                    $(temp).html(data.musicStatus);
                    $('#volStatus').html(data.volStatus);
                    $('#muteStatus').html(data.muteStatus);
                    if(data.musicStatus !== "Off")
                    {
                        $('#music_volume_div').show();
                    }else{
                        $('#music_volume_div').hide();
                    }
                }else{
                    $('.music_status').hide();
                }
					
				if((data.spa_on == true) && (steam_connected && steam_use))
				{
					$('#steam_control_div').hide();
					document.getElementById("steam_hide_message").style.display='block';
					document.getElementById("steam_hide_message").style.visibility='visible';
				}	
				else if((data.spa_on == false) && (steam_connected && steam_use))
				{	
					$('#steam_control_div').show();
					document.getElementById("steam_hide_message").style.display='none';
					document.getElementById("steam_hide_message").style.visibility='hidden';
				}

				if((data.spa_on == true) && (valve1_outlets != 0 || valve2_outlets != 0))
				{
					$('#shower_control_div').hide();
					document.getElementById("shower_hide_message").style.display='block';
					document.getElementById("shower_hide_message").style.visibility='visible';
				}	
				else if ((data.spa_on == false) &&(valve1_outlets != 0 || valve2_outlets != 0))
				{	
					$('#shower_control_div').show();
					document.getElementById("shower_hide_message").style.display='none';
					document.getElementById("shower_hide_message").style.visibility='hidden';
				}
            }
        }
    });
}
setInterval(function () {
    loadXMLDoc();
}, 5000);


setInterval(function () {
    load_status();
}, 10000);


function load_status() {
    trace('Load Start control load status');
	//CORYO - Don't allow control to load for phase 1 - jump to settings.
	//location.href = "settings.html";
	
    $.ajax({
        type: "GET",
        url: "values.cgi",
        data: {},
        dataType: "JSON",
        cache: false,
       success: function (data) {
		   	if(data.shower_on == true)
				{
					bool_shower_on = true;
					document.getElementById("startshower").value = "Stop";
					//document.getElementById("startshower").style.visibility = "hidden"; //Added by TF Team 10-07
					//document.getElementById("stopshower").style.visibility = "visible"; //Added by TF Team 10-07
					$(function () {
						valve1 = "";
						$("#valve_1_control").$(".ui-selected", this).each(function () {
									var index = $("#valve_1_control li").index(this);
									valve1 += ((index + 1));
						});
						valve2 = "";
						$("#valve_2_control").$(".ui-selected", this).each(function () {
									var index = $("#valve_2_control li").index(this);
									valve2 += ((index + 1));
								});
						});		
				}	
				else
				{
					document.getElementById("startshower").value = "Start";
					//document.getElementById("startshower").style.visibility = "visible";
					//document.getElementById("stopshower").style.visibility = "hidden";
					bool_shower_on = false;
				}
				
		   if(data.steam_running == true)
				{
					bool_steam_on = true;
					document.getElementById("steambutton_on").value = "Stop"; //Added by TF Team 10-07
					//document.getElementById("steambutton_on").style.visibility = "hidden"; //Added by TF Team 10-07
					//document.getElementById("steambutton_off").style.visibility = "visible"; //Added by TF Team 10-07
					document.getElementById("steam_set_time").value = data.steamTimeRemaining;
				}
				else
				{
					document.getElementById("steambutton_on").value = "Start"; //Added by TF Team 10-07
					//document.getElementById("steambutton_on").style.visibility = "visible";
					//document.getElementById("steambutton_off").style.visibility = "hidden";
					//document.getElementById("steam_set_time").value = default_steam_time; //Added by TF Team 10-07
					bool_steam_on = false;
				}
			if(data.CurrentUser == 0)
			{
				document.getElementById("userstartbutton").value = "Start";
				document.getElementById("userstopbutton").value = "Stop";
			}	
			else
			{
				document.getElementById("userstartbutton").value = "Running";
			}
				
	   }
	});
}



function load() {
    trace('Load Start control');
	//CORYO - Don't allow control to load for phase 1 - jump to settings.
	//location.href = "settings.html";
	
    $.ajax({
        type: "GET",
        url: "values.cgi",
        data: {},
        dataType: "JSON",
        cache: false,
       success: function (data) {

			trace("data dump begin");
			// dump out the data to trace - DEBUG
			for (var i in data) { 
			    //we have to catch some 'not defined' errors if object has
    			//an attribute of type "dynamic property")
    			try {
    				//print out in form "propertyname:::value"
        			trace(i + ":::" + data[i]);
			    } catch (ex) {
        			//just ignore error and continue with next iteration(=property)
        			continue;
    			}
			}

            hide_things = data.hide_all;
            if (hide_things) {
                switch (data.units) {
                case 0:
                    units_are_f = true;
                    break;
                case 1:
                    units_are_f = false;
                    break;
                }
				
				//Check to see if the shower is on. 
				if(data.shower_on || data.steam_running) {    //Added steam_running by TF Team 10-07
					//Hide settings and service tabs
					$("#settings-tab").hide();
					$("#tabs-Settings").hide();
					$("#service-tab").hide();
					$("#tabs-Service").hide();
					$("#control_div").hide();
				} else {
					$("#settings-tab").show();
					$("#tabs-Settings").show();
					$("#service-tab").show();
					$("#tabs-Service").show();
					$("#control_div").show();
				}
				/* chroma and lighting controls removed for release 1
                //TODO: change this to select the current running
                document.getElementById("chroma_experience_radio").checked = true;
                $('#chroma_experience').show();
                $('#chroma_color').hide();*/

                //light tab   //Un commented by TF-Team to add light bridge status on 12-10-2015
                modules_installed = 0;
                if (data.light1_installed) {
                    $('#light_1').show();
                    modules_installed += 1;
                    $('#LZ1StatusDiv').show();
                    if (data.light1_type === 0) {
                        bool_light1_dimmer = false;
                        $('#control_light1_div').hide();
                    } else {
                        $('#control_light1_div').show();
                    }
                } else {
                    $('#light_1').hide();
                    $('#LZ1StatusDiv').hide();
                }
                //module 2...
                if (data.light2_installed) {
                    modules_installed += 1;
                    $('#light_2').show();
                    $('#LZ2StatusDiv').show();
                    if (data.light2_type === 0) {
                        bool_light2_dimmer = false;
                        $('#control_light2_div').hide();
                    } else {
                        $('#control_light2_div').show();
                    }
                } else {
                    $('#light_2').hide();
                    $('#LZ2StatusDiv').hide();
                }
                //module 3...
                if (data.light3_installed) {
                    modules_installed += 1;
                    $('#LZ3StatusDiv').show();
                    $('#light_3').show();
                    if (data.light3_type === 0) {
                        bool_light3_dimmer = false;
                        $('#control_light3_div').hide();
                    } else {
                        $('#control_light3_div').show();
                    }
                } else {
                    $('#light_3').hide();
                    $('#LZ3StatusDiv').hide();
                }
				$("#light1_name").html(data.light1_name);
				$("#light2_name").html(data.light2_name);
				$("#light3_name").html(data.light3_name);
				
			//	*/ End of Un-Comment 12-10-2015
				
				/*User Div Hiding by TF Team*/
				if((data.user_1_enabled === "false") && (data.user_2_enabled === "false")
					&& (data.user_3_enabled === "false") && (data.user_4_enabled === "false")
				    && (data.user_5_enabled === "false") && (data.user_6_enabled === "false"))
				{
					
					document.getElementById("user_control_div").style.visibility='hidden';
					 /* $('user_control_div').hide();
					 $("#user1_div").hide();
					 $("#user2_div").hide();
					 $("#user3_div").hide();
					 $("#user4_div").hide();
					 $("#user5_div").hide();
					 $("#user6_div").hide();
					 document.getElementById("stopbutton").style.visibility = 'hidden';  //'visible'
					 document.getElementById("startbutton").style.visibility = 'hidden';  //'visible' */
					 
				} else
				{
					
					document.getElementById("user_control_div").style.visibility='visible';
					//$('user_control_div').show();
					// hide the users that aren't actually defined
					if (data.user_1_enabled ==="false") {
						$("#user1_div").hide();
					}
					if (data.user_2_enabled ==="false") {
						$("#user2_div").hide();
					}
					if (data.user_3_enabled ==="false") {
						$("#user3_div").hide();
					}
					if (data.user_4_enabled ==="false") {
						$("#user4_div").hide();
					}
					if (data.user_5_enabled ==="false") {
						$("#user5_div").hide();
					}
					if (data.user_6_enabled ==="false") {
						$("#user6_div").hide();
					}
				
                $(".user1_name").html(data.user1_string);
                $(".user2_name").html(data.user2_string);
                $(".user3_name").html(data.user3_string);
                $(".user4_name").html(data.user4_string);
                $(".user5_name").html(data.user5_string);
                $(".user6_name").html(data.user6_string);
					
					$(".user_1_title_string").html(user_title + " " + data.user1_string);
					$(".user_2_title_string").html(user_title + " " + data.user2_string);
					$(".user_3_title_string").html(user_title + " " + data.user3_string);
					$(".user_4_title_string").html(user_title + " " + data.user4_string);
					$(".user_5_title_string").html(user_title + " " + data.user5_string);
					$(".user_6_title_string").html(user_title + " " + data.user6_string);
				}	
				/*User Div Hiding end by TF Team*/
				
                // fill in the user names
				
				/*Commenting below and adding them above 822-843 else loop TF team*/
                /* $(".user1_name").html(data.user1_string);
                $(".user2_name").html(data.user2_string);
                $(".user3_name").html(data.user3_string);
                $(".user4_name").html(data.user4_string);
                $(".user5_name").html(data.user5_string);
                $(".user6_name").html(data.user6_string); */
				/*End of comment TF Team*/
						
				// to do here: hide any user profiles that are not actually populated
				// if no users are populated, hide the Start/Stop buttons too
				// select the first populated user by default (for now just user user1 as we are not hiding any users yet)
				/* document.getElementById("user1").checked = true; */   //COmmented by TF Team
                // if shower is actually on, show start button to say "Running" instead
				
				//Added by TF Team 10-07******************************************
				if(data.shower_on == true)
				{
					document.getElementById("startshower").value = "Stop";
					//document.getElementById("startshower").style.visibility = "hidden"; //Added by TF Team 10-07
					//document.getElementById("stopshower").style.visibility = "visible"; //Added by TF Team 10-07
				}	
				else
				{
					document.getElementById("startshower").value = "Start";
					//document.getElementById("startshower").style.visibility = "visible";
					//document.getElementById("stopshower").style.visibility = "hidden";
				}
				
				if(data.steam_running == true)
				{
					document.getElementById("steambutton_on").value = "Stop";
					//document.getElementById("steambutton_on").style.visibility = "hidden"; //Added by TF Team 10-07
					//document.getElementById("steambutton_off").style.visibility = "visible"; //Added by TF Team 10-07
				}
				else
				{
					document.getElementById("steambutton_on").value = "Start";
					//document.getElementById("steambutton_on").style.visibility = "visible";
					//document.getElementById("steambutton_off").style.visibility = "hidden";
				}
				
				valve1_outlets = data.num_outlets;
				valve2_outlets = data.v2_num_outlets;
				steam_connected = data.steam_installed;
				steam_use = data.steam_select;
				//END of Added by TF Team 10-07******************************************
				
				// if steam is actually on, show steam button as "Active"
				/* COmmented by TF team 17-08
				if (data.shower_steam_running === "true") {
					document.getElementById("steambutton_on").value = "Active";
				}
					*/
				// populate the outlets in each valve section, in main shower section
				$("#valve_1_control").empty();
                $("#valve_2_control").empty();

                var v1_outlets = 0;
                if ((data.valve1_outlet1_func) !== undefined) {
                    v1_outlets += 1;
                    if (data.def_control_outlet !== 1) {
                        document.getElementById("valve_1_control").innerHTML += '<li class="ui-state-default outlet outlet_' + data.valve1_outlet1_func.func + '"></li>';
                    } else {
                        document.getElementById("valve_1_control").innerHTML += '<li class="ui-state-default ui-selected outlet outlet_' + data.valve1_outlet1_func.func + '"></li>';
                        valve1 = '1';
                    }
                }
                if ((data.valve1_outlet2_func) !== undefined) {
                    v1_outlets += 1;
                    if (data.def_control_outlet !== 2) {
                        document.getElementById("valve_1_control").innerHTML += '<li class="ui-state-default outlet outlet_' + data.valve1_outlet2_func.func + '"></li>';
                    } else {
                        document.getElementById("valve_1_control").innerHTML += '<li class="ui-state-default ui-selected outlet outlet_' + data.valve1_outlet2_func.func + '"></li>';
                        valve1 = '2';
                    }
                }
                if ((data.valve1_outlet3_func) !== undefined) {
                    v1_outlets += 1;
                    if (data.def_control_outlet !== 3) {
                        document.getElementById("valve_1_control").innerHTML += '<li class="ui-state-default outlet outlet_' + data.valve1_outlet3_func.func + '"></li>';
                    } else {
                        document.getElementById("valve_1_control").innerHTML += '<li class="ui-state-default ui-selected outlet outlet_' + data.valve1_outlet3_func.func + '"></li>';
                        valve1 = '3';
                    }
                }
                if ((data.valve1_outlet4_func) !== undefined) {
                    v1_outlets += 1;
                    if (data.def_control_outlet !== 4) {
                        document.getElementById("valve_1_control").innerHTML += '<li class="ui-state-default outlet outlet_' + data.valve1_outlet4_func.func + '"></li>';
                    } else {
                        document.getElementById("valve_1_control").innerHTML += '<li class="ui-state-default ui-selected outlet outlet_' + data.valve1_outlet4_func.func + '"></li>';
                        valve1 = '4';
                    }
                }
                if ((data.valve1_outlet5_func) !== undefined) {
                    v1_outlets += 1;
                    if (data.def_control_outlet !== 5) {
                        document.getElementById("valve_1_control").innerHTML += '<li class="ui-state-default outlet outlet_' + data.valve1_outlet5_func.func + '"></li>';
                    } else {
                        document.getElementById("valve_1_control").innerHTML += '<li class="ui-state-default ui-selected outlet outlet_' + data.valve1_outlet5_func.func + '"></li>';
                        valve1 = '5';
                    }
                }
                if ((data.valve1_outlet6_func) !== undefined) {
                    v1_outlets += 1;
                    if (data.def_control_outlet !== 6) {
                        document.getElementById("valve_1_control").innerHTML += '<li class="ui-state-default outlet outlet_' + data.valve1_outlet6_func.func + '"></li>';
                    } else {
                        document.getElementById("valve_1_control").innerHTML += '<li class="ui-state-default ui-selected outlet outlet_' + data.valve1_outlet6_func.func + '"></li>';
                        valve1 = '6';
                    }
                }
		
					
				
				
                if (0 === data.num_outlets)
				{
                    $('#valve_1_div').hide();
                    $('#valve1_status').hide();
                } 
				else if(data.valve1_ErrorFatal == 1)
				{
					$('#valve_1_div').hide();
					$('#valve1_status').show();
				}
				else
				{
                    $('#valve_1_div').show();
                    $('#valve1_status').show();
                }


                var v2_outlets = 0;
                if ((data.valve2_outlet1_func) !== undefined) {
                    v2_outlets += 1;
                    if (data.v2_def_control_outlet !== 1) {
                        document.getElementById("valve_2_control").innerHTML += '<li class="ui-state-default outlet outlet_' + data.valve2_outlet1_func.func + '"></li>';
                    } else {
                        document.getElementById("valve_2_control").innerHTML += '<li class="ui-state-default ui-selected outlet outlet_' + data.valve2_outlet1_func.func + '"></li>';
                        valve2 = '1';
                    }
                }
                if ((data.valve2_outlet2_func) !== undefined) {
                    v2_outlets += 1;
                    if (data.v2_def_control_outlet !== 2) {
                        document.getElementById("valve_2_control").innerHTML += '<li class="ui-state-default outlet outlet_' + data.valve2_outlet2_func.func + '"></li>';
                    } else {
                        document.getElementById("valve_2_control").innerHTML += '<li class="ui-state-default ui-selected outlet outlet_' + data.valve2_outlet2_func.func + '"></li>';
                        valve2 = '2';
                    }
                }
                if ((data.valve2_outlet3_func) !== undefined) {
                    v2_outlets += 1;
                    if (data.v2_def_control_outlet !== 3) {
                        document.getElementById("valve_2_control").innerHTML += '<li class="ui-state-default outlet outlet_' + data.valve2_outlet3_func.func + '"></li>';
                    } else {
                        document.getElementById("valve_2_control").innerHTML += '<li class="ui-state-default ui-selected outlet outlet_' + data.valve2_outlet3_func.func + '"></li>';
                        valve2 = '3';
                    }
                }
                if ((data.valve2_outlet4_func) !== undefined) {
                    v2_outlets += 1;
                    if (data.v2_def_control_outlet !== 4) {
                        document.getElementById("valve_2_control").innerHTML += '<li class="ui-state-default outlet outlet_' + data.valve2_outlet4_func.func + '"></li>';
                    } else {
                        document.getElementById("valve_2_control").innerHTML += '<li class="ui-state-default ui-selected outlet outlet_' + data.valve2_outlet4_func.func + '"></li>';
                        valve2 = '4';
                    }
                }
                if ((data.valve2_outlet5_func) !== undefined) {
                    v2_outlets += 1;
                    if (data.v2_def_control_outlet !== 5) {
                        document.getElementById("valve_2_control").innerHTML += '<li class="ui-state-default outlet outlet_' + data.valve2_outlet5_func.func + '"></li>';
                    } else {
                        document.getElementById("valve_2_control").innerHTML += '<li class="ui-state-default ui-selected outlet outlet_' + data.valve2_outlet5_func.func + '"></li>';
                        valve2 = '5';
                    }
                }
                if ((data.valve2_outlet6_func) !== undefined) {
                    v2_outlets += 1;
                    if (data.v2_def_control_outlet !== 6) {
                        document.getElementById("valve_2_control").innerHTML += '<li class="ui-state-default outlet outlet_' + data.valve2_outlet6_func.func + '"></li>';
                    } else {
                        document.getElementById("valve_2_control").innerHTML += '<li class="ui-state-default ui-selected outlet outlet_' + data.valve2_outlet6_func.func + '"></li>';
                        valve2 = '6';
                    }
                } 
			    

                if (0 === data.v2_num_outlets) 
				{
                    $('#valve_2_div').hide();
                    $('#valve2_status').hide();
                }
				else if(data.valve2_ErrorFatal == 1)
				{
					$('#valve_2_div').hide();
					$('#valve2_status').show();
				}	
				else {
                    $('#valve_2_div').show();
                    $('#valve2_status').show();
                }

				//populate massage dropdowns - note this needs a language update when multiplate languages are introduced
				//Commented by TF team 14-08 for massage drop downs
				/*
			    $('#massage_select_1').empty().append($('<option>', {
            		value: 0,
		            text: 'None'
        			}));
				if(data.massage ==  true){						//Added by TF team	
					$('#massage_select_1').append($('<option>', {
						value: 1,
						text: 'Wave'
						}));
					$('#massage_select_1').append($('<option>', {
						value: 2,
						text: 'Single'
						}));
					// only add Custom as an option if there actually are defined custom massage patterns
					if (data.v1c1 !== "") {
						$('#massage_select_1').append($('<option>', {
							value: 3,
							text: 'Custom 1'
							}));
					}
					if (data.v1c2 !== "") {
						$('#massage_select_1').append($('<option>', {
							value: 4,
							text: 'Custom 2'
							}));
					}
				}								//ADded by TF team	
				
			    $('#massage_select_2').empty().append($('<option>', {
            		value: 0,
		            text: 'None'
        			}));
				if(data.massage ==  true){						//Added by TF team	
					$('#massage_select_2').append($('<option>', {
						value: 1,
						text: 'Wave'
						}));
					$('#massage_select_2').append($('<option>', {
						value: 2,
						text: 'Single'
						}));
					// only add Custom as an option if there actually are defined custom massage patterns
					if (data.v2c1 !== "") {
						$('#massage_select_2').append($('<option>', {
							value: 3,
							text: 'Custom 1'
							}));
					}
					if (data.v2c2 !== "") {
						$('#massage_select_2').append($('<option>', {
							value: 4,
							text: 'Custom 2'
							}));
					}
				}				//Added by TF team	
				*/
				//Comment end by TF team 14-08 for massage drop downs
				//Added by TF team 14-08 for massage drop downs
				//$('#v1_massage_blank').show();
				//$('#v2_massage_blank').show();
				if(data.massage ==  true){						//Added by TF team	
				$('#v1_massage_none').show();
				$('#v1_massage_single').show();
				if(data.num_outlets == 2){
					$('#v1_massage_wave').hide();
				}else{
					$('#v1_massage_wave').show();
				}
				if (data.v1c1 !== "") {
						$('#v1_massage_custom1').show();
					}
					else 
						$('#v1_massage_custom1').hide();
					if (data.v1c2 !== ""){
						$('#v1_massage_custom2').show();
					}else
						$('#v1_massage_custom2').hide();
									
				$('#v2_massage_none').show();
				$('#v2_massage_single').show();
				if(data.v2_num_outlets == 2){
				$('#v2_massage_wave').hide();
				}else {
					$('#v2_massage_wave').show();
				}
				if (data.v2c1 !== "") {
						$('#v2_massage_custom1').show();
					}
					else 
						$('#v2_massage_custom1').hide();
					if (data.v2c2 !== ""){
						$('#v2_massage_custom2').show();
					}else
						$('#v2_massage_custom2').hide();
				}
				else{
						//$('#v1_massage_none').hide();
						$('#v1_massage_single').hide();
						$('#v1_massage_wave').hide();
						$('#v1_massage_custom1').hide();
						$('#v1_massage_custom2').hide();
						//$('#v2_massage_none').hide();
						$('#v2_massage_single').hide();
						$('#v2_massage_wave').hide();
						$('#v2_massage_custom1').hide();
						$('#v2_massage_custom2').hide();
					}
					
				//Add end by TF team 14-08 for massage drop downs
				
				// current music settings
                if (!data.amp_installed) {
                    $('#music_status').hide();
                } else {
                    $('#music_status').show();
                }
                if (data.num_outlets === 0 && data.v2_num_outlets === 0) {
                    $('#shower_control_div').hide();
                    $('#valve_status').hide();
                    if (!data.rain_installed && !data.bridge_installed && !data.steam_installed && !data.amp_installed) {
                        $('#shower_status').hide();
                        /* if (!reload) {
                             $('a href="#tabs-Settings"').click();   //Comment by TF Team
                        } */
                    } else {
                        $('#shower_status').show();
                        //$('#tabs-Control').show();
                    }
                } else {
                    $('#shower_control_div').show();
                    $('#order_div').show();
                    $('#valve_status').show();
                }
                $("#massage_orderv1c1").val(data.v1c1);
                $("#massage_orderv1c2").val(data.v1c2);
                $("#massage_orderv2c1").val(data.v2c1);
                $("#massage_orderv2c2").val(data.v2c2);
                if (data.num_interface === 0) {
                    //If there are no interfaces, there is no control
					ui_connected = false;
                    $('#control_div').hide();
                } else {
					ui_connected = true;
                    $('#control_div').show();
                }

                //LIGHTING VALUES
                $('#chroma_control_div').show();
                $('#chroma_settings_div').show();
                $('#light_control_div').show();
                $('.lightingModulesString').show();
                $('#light_status').show();
                if (!data.bridge_installed && !data.rainpanel_installed) {
                    $('#light_control_div').hide();
                } else if (!data.rainpanel_installed) {
                    $('#chroma_control_div').hide();
                    $('#chroma_settings_div').hide();
                } else if (!data.bridge_installed) {
                    $('.lightingModulesString').hide();
                    $('#light_status').hide();
                }
                if (!data.steam_installed) {
                    $('#steam_div').hide();
                    $('#steam_control_div').hide();
                    $('#steam_status').hide();
                } else {
					if(data.steam_select)
					{
                    $('#steam_div').show();
                    $('#steam_control_div').show();
                    $('#steam_status').show();
                }
					else
					{
						$('#steam_div').hide();
						$('#steam_control_div').hide();
						$('#steam_status').hide();
					}
                }
				/*
                if (!data.amp_installed) {
                    $('#amp_div').hide();
                } else {
                    $('#amp_div').show();
                }
				*/
				$('#amp_div').hide();
				
                document.getElementById("valve1_temp").value = data.valve1_temp_string;
                document.getElementById("valve2_temp").value = data.valve2_temp_string;
                document.getElementById("steam_set_temp").value = data.steam_temp_string;
                document.getElementById("steam_set_time").value = data.steam_time_string;
				default_steam_time = data.steam_def_time_string;   //ADded by TF Team 14-07
                $('#music_volume').slider('value', data.amp_volume_string);
                $("#music_volume_lbl").val($("#music_volume").slider("value") + '%');
                $("input[name=user][value=1]").prop('checked', true);
                $('#valve_1_control li:first').addClass('ui_selected');
                loadXMLDoc();
                //user tab load
				/*Commenting below, adding the same in 822-843 else loop TF Team*/
                /* $(".user_1_title_string").html(user_title + " " + data.user1_string);
                $(".user_2_title_string").html(user_title + " " + data.user2_string);
                $(".user_3_title_string").html(user_title + " " + data.user3_string);
                $(".user_4_title_string").html(user_title + " " + data.user4_string);
                $(".user_5_title_string").html(user_title + " " + data.user5_string);
                $(".user_6_title_string").html(user_title + " " + data.user6_string); */
				/*End of COmment by TF Team*/

				
				/*Comment by TF Team, Copied the code in the above (826-843) if loop*/
				/* // hide the users that aren't actually defined
				if (data.user_1_enabled ==="false") {
					$("#user1_div").hide();
				}
				if (data.user_2_enabled ==="false") {
					$("#user2_div").hide();
				}
				if (data.user_3_enabled ==="false") {
					$("#user3_div").hide();
				}
				if (data.user_4_enabled ==="false") {
					$("#user4_div").hide();
				}
				if (data.user_5_enabled ==="false") {
					$("#user5_div").hide();
				}
				if (data.user_6_enabled ==="false") {
					$("#user6_div").hide();
				} */

                document.getElementById('steam_set_temp').max = data.steam_max_temp_string;
                document.getElementById('valve1_temp').max = data.max_temp;
                document.getElementById('valve2_temp').max = data.v2_max_temp;
                switch (data.units) {
                case 0:
                    document.getElementById('steam_set_temp').min = 86;
                    document.getElementById('steam_set_temp').step = "1";
                    document.getElementById('valve1_temp').min = 86;
                    document.getElementById('valve1_temp').step = "1";
                    document.getElementById('valve2_temp').min = 86;
                    document.getElementById('valve2_temp').step = "1";
                    break;
                case 1:
                    document.getElementById('steam_set_temp').min = 26;
                    document.getElementById('steam_set_temp').step = "0.5";
                    document.getElementById('valve1_temp').min = 26;
                    document.getElementById('valve1_temp').step = "0.5";
                    document.getElementById('valve2_temp').min = 26;
                    document.getElementById('valve2_temp').step = "0.5";
                    break;
                default:
                    break;
                }
                $('#tabs').show();
            }
        }
    });
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
            none_text = words.noneText;
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
            //$("#interface1_start_screen option").eq(5).text(words.music_text);
            $("#interface1_start_screen option").eq(6).text(words.lighting_text);
            $("#interface2_start_screen option").eq(0).text(words.home_text);
            $("#interface2_start_screen option").eq(1).text(words.quick_text);
            $("#interface2_start_screen option").eq(2).text(words.users_text);
            $("#interface2_start_screen option").eq(3).text(words.valve1_text);
            $("#interface2_start_screen option").eq(4).text(words.valve2_text);
            //$("#interface2_start_screen option").eq(5).text(words.music_text);
            $("#interface2_start_screen option").eq(6).text(words.lighting_text);
            $("#interface3_start_screen option").eq(0).text(words.home_text);
            $("#interface3_start_screen option").eq(1).text(words.quick_text);
            $("#interface3_start_screen option").eq(2).text(words.users_text);
            $("#interface3_start_screen option").eq(3).text(words.valve1_text);
            $("#interface3_start_screen option").eq(4).text(words.valve2_text);
            //$("#interface3_start_screen option").eq(5).text(words.music_text);
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
            $("#fade_1 option").eq(0).text(words.noneText);
            $("#fade_1 option").eq(1).text(words.slow_text);
            $("#fade_1 option").eq(2).text(words.medium_text);
            $("#fade_1 option").eq(3).text(words.fast_text);
            $("#fade_2 option").eq(0).text(words.noneText);
            $("#fade_2 option").eq(1).text(words.slow_text);
            $("#fade_2 option").eq(2).text(words.medium_text);
            $("#fade_2 option").eq(3).text(words.fast_text);
            $("#fade_3 option").eq(0).text(words.noneText);
            $("#fade_3 option").eq(1).text(words.slow_text);
            $("#fade_3 option").eq(2).text(words.medium_text);
            $("#fade_3 option").eq(3).text(words.fast_text);
            //music text 
            $("#music_repeat_select option").eq(0).text(words.all_word_string);
            $("#music_repeat_select option").eq(1).text(words.one_word_string);
            //system text 
            $("#lang option").eq(0).text(words.eng_lang_text);
            $("#lang option").eq(1).text(words.ara_lang_text);
            $("#lang option").eq(2).text(words.schi_lang_text);
            $("#lang option").eq(3).text(words.mchi_lang_text);
            $("#lang option").eq(4).text(words.brit_lang_text);
            $("#lang option").eq(5).text(words.ger_lang_text);
            $("#lang option").eq(6).text(words.ita_lang_text);
            $("#lang option").eq(7).text(words.jap_lang_text);
            $("#lang option").eq(8).text(words.kor_lang_text);
            $("#lang option").eq(9).text(words.por_lang_text);
            $("#lang option").eq(10).text(words.rus_lang_text);
            $("#lang option").eq(11).text(words.tha_lang_text);
            $("#lang option").eq(12).text(words.fre_lang_text);
            $("#lang option").eq(13).text(words.spa_lang_text);
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
			$('.bluetoothButton').val(words.bt_disconnect_string);
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
            //$("#massage_select_1 option").eq(0).text(words.noneText);
            //$("#massage_select_1 option").eq(1).text(words.waveText);
            //$("#massage_select_1 option").eq(2).text(words.singleText);
            //$("#massage_select_1 option").eq(3).text(words.customText);
           // $("#massage_select_2 option").eq(0).text(words.noneText);
           // $("#massage_select_2 option").eq(1).text(words.waveText);
           // $("#massage_select_2 option").eq(2).text(words.singleText);
           // $("#massage_select_2 option").eq(3).text(words.customText);
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
            $('.clear_users').val(words.clear_users_text);
            $('.reset_system_button').val(words.reset_system_button);
            $('.reset_users_button').val(words.reset_users_button);
            $('.reset_default_button').val(words.reset_default_button);
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
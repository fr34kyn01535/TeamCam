define(['jquery', 'materialize', 'sj_bundle', 'ripples', './overlay', './overwolf', './renderer', './teamspeak'],
    function($, sj, r, overlay, overwolf, renderer, teamspeak){

    console.log("[TeamCam] Scripts loaded.");

    /* Do some stuff now ... */
    /* ToDo: Split code into overlay, overwolf, renderer & teamspeak.js */




    /**
      Old "Overlay.hmtl" inline JavaScript-Code
    **/
    var ts3 = {};
    var cam = new main();

    var activeServerId;
    var windowId;
    var settingsId;

    function reconnect(){
        cam.disconnect();


        $("#videos .video").fadeOut(200,function(){
            $("#videos .video").remove();
        });

        ts3.getServerInfo(activeServerId,function(success,channel){
            if(!success.success) return;
            var username = btoa(unescape(encodeURIComponent(channel.myClientName)));

            $("#username .value").text(channel.myClientName);
            $("#localVideo").attr("data_nickname",channel.myClientName);

            var room = btoa(unescape(encodeURIComponent(channel.channelName+channel.host)));

            $("#info").html("Host: "+channel.host+"<br/>Channel: "+channel.channelName);

            cam.connect(username,room);
        });
    }

    function ts3Loaded() {
        ts3 = $("#ts3")[0];

        setTimeout(function() {
            ts3.init({name:""}, function(result,servers) {
                if(result.error){
                    critical("Teamspeak 3 could not be detected, restart Overwolf as Admin...");
                    return;
                }
                activeServerId = servers.activeServerId;
                init();
                reconnect();
            });
        }, 500);
    }


    function critical(message){
        alert(message);
        close();
    }

    function init(){
        ts3.addEventListener("onServerStatusChange", function(data) {
            if(data.status == "CONNECTION_ESTABLISHED"){
                console.log("onServerStatusChang: ",data);
                activeServerId = data.serverId;
                reconnect();
            }
        });

        ts3.addEventListener("onActiveServerChanged",
            function(serverId) {
                activeServerId = serverId;
                reconnect();
            }
        );

        ts3.addEventListener("onDisconnectedFromClient",
            function(){
                close();
            }
        );

        ts3.addEventListener("onClientEvent",
            function(e) {
                if(e.isOwnClient && e.newChannelId){
                    reconnect();
                }
            }
        );


        ts3.addEventListener("onTalkStatusChanged",
            function(e) {
                if(e.state == "Talk"){
                    var talkingVideo = $("video[data_nickname='"+e.clientName+"'");
                    if(talkingVideo.length != 0){
                        $("video").css("z-index",0);
                        talkingVideo.css("z-index",999);
                        talkingVideo.addClass("talking");
                        $("#username .value").text(e.clientName);
                        $("#username").addClass("talking");
                    }
                }

                if(e.state == "StopTalk"){
                    var talkingVideo = $("video[data_nickname='"+e.clientName+"'");
                    if(talkingVideo.length != 0){
                        $("#username").removeClass("talking");
                        talkingVideo.removeClass("talking");
                    }
                }
            }
        );
    }

    $(function(){
        $.material.init();
        overwolf.windows.getCurrentWindow(function(result){
            if (result.status=="success"){
                windowId = result.window.id;
            }
        });

        overwolf.windows.onStateChanged.addListener(
            function (result) {
                if(result.window_id == settingsId && result.window_state=="closed"){
                    reconnect();
                }
            }
        );

        $("#username").hover(function(){
            $("#info").fadeIn(250);
        },function(){
            $("#info").fadeOut(250);
        });

        $("#settings").click(function(){
            overwolf.windows.obtainDeclaredWindow("settings",
                function(result){
                    if (result.status == "success"){
                        settingsId = result.window.id;
                        overwolf.windows.restore(settingsId);
                    }
                }
            );
        });

        overwolf.games.onGameInfoUpdated.addListener(
            function (value) {
                console.log(value);
            }
        );
    });

});
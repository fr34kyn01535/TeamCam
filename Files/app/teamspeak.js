
define(['./view','./chat'],
    function(view,chat) {
        var teamspeak = {};

        teamspeak.ts3 =  view.getTS3Element();
        teamspeak.activeServerId = {};

        teamspeak.ts3.init({name:""}, function(result,servers) {
            if(result.error){
                alert("Teamspeak 3 could not be detected, restart Overwolf as Admin...");
                return;
            }
            teamspeak.activeServerId = servers.activeServerId;
        });

        teamspeak.ts3.addEventListener("onServerStatusChange", function(data) {
            if(data.status == "CONNECTION_ESTABLISHED"){
                console.log("onServerStatusChang: ",data);
                activeServerId = data.serverId;
                chat.reconnect();
            }
        });

        teamspeak.ts3.addEventListener("onActiveServerChanged",
            function(serverId) {
                activeServerId = serverId;
                chat.reconnect();
            }
        );

        teamspeak.ts3.addEventListener("onDisconnectedFromClient",
            function(){
                close();
            }
        );

        teamspeak.ts3.addEventListener("onClientEvent",
            function(e) {
                if(e.isOwnClient && e.newChannelId){
                    chat.reconnect();
                }
            }
        );

        teamspeak.ts3.addEventListener("onTalkStatusChanged",
            function(e) {
                if(e.state == "Talk"){
                    view.setTalking(e.clientName,true);
                }
                else if(e.state == "StopTalk"){
                    view.setTalking(e.clientName,false);
                }
            }
        );

        teamspeak.ts3.getServerInfo(teamspeak.activeServerId,function(success,channel){
            if(!success.success) return;
            var username = btoa(unescape(encodeURIComponent(channel.myClientName)));

            $("#username .value").text(channel.myClientName);
            $("#localVideo").attr("data_nickname",channel.myClientName);

            var room = btoa(unescape(encodeURIComponent(channel.channelName+channel.host)));

            $("#info").html("Host: "+channel.host+"<br/>Channel: "+channel.channelName);

            chat.connect(username,room);
        });

        return teamspeak;

    });
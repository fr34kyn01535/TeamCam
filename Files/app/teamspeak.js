define(['./view','./chat'],
    function(view,chat) {
        var teamspeak = {};
        teamspeak.activeServerId = 0;

        teamspeak.reconnect = function(){
            ts3.getServerInfo(teamspeak.activeServerId,function(success,channel){
                if(!success.success) return;

                var username = btoa(unescape(encodeURIComponent(channel.myClientName)));
                var room = btoa(unescape(encodeURIComponent(channel.channelName+channel.host)));

                view.setMyNickname(channel.myClientName);
                view.setInfo(channel.host,channel.channelName);

                chat.disconnect();
                chat.connect(username,room);
            });
        }

        $(document).bind('teamspeak.load', function(event,ts3) {
            ts3.init({name:""}, function(result,servers) {
                if(result.error){
                    console.log(result.error);
                    alert("Teamspeak could not be initialised:"+result.error+" \bRestart Overwolf and Teamspeak 3 and try again.");
                    view.close();
                    return;
                }
                teamspeak.activeServerId = servers.activeServerId;
                teamspeak.reconnect();
            });

            ts3.addEventListener("onServerStatusChange", function(data) {
                if(data.status == "CONNECTION_ESTABLISHED"){
                    console.log("onServerStatusChang: ",data);
                    activeServerId = data.serverId;
                    teamspeak.reconnect();
                }
            });

            ts3.addEventListener("onActiveServerChanged",
                function(serverId) {
                    activeServerId = serverId;
                    teamspeak.reconnect();
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
                        teamspeak.reconnect();
                    }
                }
            );

            ts3.addEventListener("onTalkStatusChanged",
                function(e) {
                    if(e.state == "Talk"){
                        view.setTalking(e.clientName,true);
                    }
                    else if(e.state == "StopTalk"){
                        view.setTalking(e.clientName,false);
                    }
                }
            );


        });
        return teamspeak;

    });
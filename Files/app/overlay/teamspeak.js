define(['./view','./connection','../logger'],
    function(view,connection,logger) {
        var teamspeak = {};
        teamspeak.activeServerId = 0;
        teamspeak.reconnect = function(){
            ts3.getServerInfo(teamspeak.activeServerId,function(success,channel){
                if(!success.success) return;

                var username = btoa(unescape(encodeURIComponent(channel.myClientName)));
                var room = btoa(unescape(encodeURIComponent(channel.channelName+channel.host)));

                view.setMyNickname(channel.myClientName);
                view.setInfo(channel.host,channel.channelName);

                connection.disconnect();
                connection.connect(username,room);

                ts3.getClientInfo({serverId:teamspeak.activeServerId},function(success,e){
                    view.toggleMicrophone(e.isInputMuted);
                })

            });
        }


        $(document).bind('view.microphoneToggle', function(event,state) {
            logger.debug(logger.components.teamspeak,"Event: view.microphoneToggle",[event,state]);
            state = (state != "true");
            ts3.updateClientDeviceState({serverId:teamspeak.activeServerId,muteMicrophone:state},function(success,e){
                if(!success.success) return;
            });
            view.toggleMicrophone(state);
        });

        $(document).bind('teamspeak.load', function(event,ts3) {
            logger.debug(logger.components.teamspeak,"Event: teamspeak.load",[event,ts3]);
            ts3.init({name:""}, function(result,servers) {
                if(result.error){
                    console.log(result.error);
                    alert("Teamspeak could not be initialised: "+result.error+" \nRestart Overwolf and Teamspeak 3 and try again.");
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
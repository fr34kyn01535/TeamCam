define(['jquery', 'material','ripples','./connection'],
    function($,chat) {

        var view = {};
        view.viewId = 0;
        view.settingsViewId = 0;



        window.ts3Loaded = function(){
            $(document).trigger('teamspeak.load', $("#ts3")[0]);
        }

        $("body").append('<object id="ts3" type="application/x-overwolfteamspeakplugin">\
            <param name="onload" value="ts3Loaded" />\
            </object>');


        $.material.init();

        $("#username").hover(function(){
            $("#info").fadeIn(250);
        },function(){
            $("#info").fadeOut(250);
        });

        view.removeVideo = function(sid){
            $('#videos').find('>#remoteVideos_' + sid).fadeOut(350,function(){
                $('#videos').find('>#remoteVideos_' + sid).remove();
            });
        }

        view.removeVideos = function(){
            $('#videos').find('>#video').fadeOut(350,function(){
                $('#videos').find('>#video').remove();
            });
        }

        view.appendVideo = function(video){
            $('#videos').append(video);
        }

        view.setInfo = function(host,channelName){
            $("#info").html("Host: "+host+"<br/>Channel: "+channelName);
        }

        view.setMyNickname = function(nickname){
            $("#username .value").text(nickname);
            $("#localVideo").attr("data_nickname",nickname);
        }

        view.setCurrentNickname = function(nickname){
            $("#username .value").text(nickname);
        }

        view.videoExists = function(nickname){
            return $("video[data_nickname='"+nickname+"'").length != 0;
        }

        view.createVideo = function(nickname,sid){
            return $('<video style="z-index:0;" data_nickname="'+nickname+'" autoplay="autoplay" oncontextmenu="return false;"/>').attr('id', 'remoteVideos_' + sid);
        }

        view.videoExists = function(nickname){
            return $("video[data_nickname='"+nickname+"'").length != 0;
        }

        view.setTalking = function(nickname,talking){
            if(talking){
                var talkingVideo = $("video[data_nickname='"+nickname+"'");
                if(talkingVideo.length != 0){
                    $("video").css("z-index",0);
                    talkingVideo.css("z-index",999);
                    talkingVideo.addClass("talking");
                    $("#username .value").text(nickname);
                    $("#username").addClass("talking");
                }
            }else{
                var talkingVideo = $("video[data_nickname='"+nickname+"'");
                if(talkingVideo.length != 0){
                    $("#username").removeClass("talking");
                    talkingVideo.removeClass("talking");
                }
            }
        }

        view.close = function(){
            overwolf.windows.close(view.viewId);
        }

        overwolf.windows.getCurrentWindow(function(result){
            if (result.status=="success"){
                view.viewId = result.window.id;
            }
        });

        overwolf.windows.onStateChanged.addListener(
            function (result) {
                if(result.window_id == view.settingsViewId && result.window_state=="closed"){
                    chat.reconnect();
                }
            }
        );

        overwolf.games.onGameInfoUpdated.addListener(
            function (value) {
                console.log(value);
            }
        );

        $("#settings").click(function(){
            overwolf.windows.obtainDeclaredWindow("settings",
                function(result){
                    if (result.status == "success"){
                        view.settingsViewId = result.window.id;
                        overwolf.windows.restore(view.settingsViewId);
                    }
                }
            );
        });

        return view;
});







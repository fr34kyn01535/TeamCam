define(['jquery','material'],
    function($,connection) {

        var view = {};
        view.viewId = 0;
        view.settingsViewId = 0;



        window.ts3Loaded = function(){
            $(document).trigger('teamspeak.load', $("#ts3")[0]);
        }

        $(function(){
            $.material.init();
            $("body").append('<object id="ts3" type="application/x-overwolfteamspeakplugin">\
            <param name="onload" value="ts3Loaded" />\
            </object>');

            $("#username").hover(function(){
                $("#info").fadeIn(250);
            },function(){
                $("#info").fadeOut(250);
            });


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
            return $('<video class="video" data_nickname="'+nickname+'" autoplay="autoplay" oncontextmenu="return false;"/>').attr('id', 'remoteVideos_' + sid);
        }

        view.videoExists = function(nickname){
            return $("video[data_nickname='"+nickname+"'").length != 0;
        }

        view.setTalking = function(nickname,talking){
                var selector = null;

                var talkingVideo = $("video[data_nickname='"+nickname+"'");
                if(talkingVideo.length != 0) {
                    selector = talkingVideo;
                }else if(localStorage.getItem("hideNoCam") != "true"){
                    selector = $("#nocam");
                }

                if(selector != null){
                    if(talking){
                        $(".video").css("z-index",0);
                        selector.css("z-index",999);
                        selector.addClass("talking");
                        $("#username .value").text(nickname);
                        $("#username").addClass("talking");
                    }else{
                        $("#username").removeClass("talking");
                        selector.removeClass("talking");
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
                    $(document).trigger('settings.close', $("#ts3")[0]);
                }
            }
        );

        overwolf.games.onGameInfoUpdated.addListener(
            function (value) {
                console.log(value);
            }
        );


        return view;
});







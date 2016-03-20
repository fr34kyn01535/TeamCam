define(['jquery', 'materialize','ripples','./chat'],
    function($, materialize, ripples,chat) {

        var view = {};
        view.viewId = 0;
        view.settingsViewId = 0;

        $.material.init();

        $("#username").hover(function(){
            $("#info").fadeIn(250);
        },function(){
            $("#info").fadeOut(250);
        });

        view.getTS3Element = function(){
            return $("#ts3")[0];
        }

        view.setCurrentNickname = function(nickname){
            $("#username .value").text(nickname);
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







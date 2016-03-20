define(['jquery', 'material', 'strophe', 'ripples', './chat', './overwolf', './view', './teamspeak'],
    function($, strophe, r, overlay, overwolf, renderer, teamspeak){

    console.log("[TeamCam] Scripts loaded.");


    var cam = new main();

    var activeServerId;
    var windowId;
    var settingsId;

    function reconnect(){
        cam.disconnect();

        $("#videos .video").fadeOut(200,function(){
            $("#videos .video").remove();
        });

    }



});
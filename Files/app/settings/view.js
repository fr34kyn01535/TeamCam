define(['jquery','material'],
    function($){
        var view = {};
        view.windowId = 0;

        overwolf.windows.getCurrentWindow(function(result){
            if (result.status=="success"){
                view.windowId = result.window.id;
            }
        });


    $(function(){
        $.material.init();

        $("#save").click(function(){
            var val = $("#videoSelection").find(":selected").val();
            if(val != undefined){
                localStorage.setItem("sourceId",val);
            }
            localStorage.setItem("hideNoCam",$("#hideNoCam").is(':checked'));

            overwolf.windows.close(view.windowId);
        });

        $("#hideNoCam").prop('checked',localStorage.getItem("hideNoCam") == "true");

        MediaStreamTrack.getSources(function(sourceInfos) {
            var sourceId = localStorage.getItem("sourceId");
            var found = false;
            $("#videoSelection").empty();
            $("#videoSelection").append($('<option>').text("Default video device"));

            for (var i = 0; i != sourceInfos.length; ++i) {
                var sourceInfo = sourceInfos[i];

                if (sourceInfo.kind === 'video') {
                    if(sourceInfo.id == sourceId){
                        found = true;
                        $("#videoSelection").append($('<option>').text(sourceInfo.label).val(sourceInfo.id));
                        $("#videoSelection option[value="+sourceInfo.id+"]").attr("selected",true);
                    }else{
                        $("#videoSelection").append($('<option>').text(sourceInfo.label).val(sourceInfo.id));
                    }
                }
            }
            if(!found) localStorage.setItem("sourceId",null);
            $("#videoSelection").show();
        });


        return view;
    });
});
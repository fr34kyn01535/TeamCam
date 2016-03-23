define(["./configuration"],
    function(configuration) {
        var logger = {};

        logger.components = {
            "main": "MAIN",
            "teamspeak": "TS3",
            "view": "VIEW",
            "connection": "CONNECTION",
            "strophe": "STROPHE"
        };

        //Use like: logger.log(logger.components.main,"Test");
        logger.log = function(component,text){
            console.log("%c["+component+"] %c"+text,"color:#111;font-weight:bold;","color:#222;font-weight:normal;")
        };

        logger.error = function(component,text){
            console.log("%c["+component+"] %c"+text,"color:#111;font-weight:bold;","color:#222;font-weight:normal;")
        };
        logger.warn = function(component,text){
            console.log("%c["+component+"] %c"+text,"color:#111;font-weight:bold;","color:#222;font-weight:normal;")
        };
        logger.debug = function(component,text,params){
            if(configuration.debug)
                console.log("%c["+component+"] %c"+text,"color:green;font-weight:bold;","color:#222;font-weight:normal;",params)
        };
        return logger;
    });





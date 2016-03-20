requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../app',
        jquery: 'jquery',
        jquery_ui: 'jquery-ui.min',
        material: 'material.min',
        ripples: 'ripples.min',
        strophe: 'strophejingle.bundle',
    },
    shim: {
        'material': { deps: ["jquery", "jquery_ui"]},
        'jquery': {
            exports: '$'
        }
    }
});
requirejs(['app/main']);

console.log("TeamCam booting...");
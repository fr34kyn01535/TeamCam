requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../app',
        jquery: 'jquery',
        jquery_ui: 'jquery-ui.min',
        materialize: 'material.min',
        ripples: 'ripples.min',
        sj_bundle: 'strophejingle.bundle',
    },
    shim: {
        'materialize': { deps: ["jquery", "jquery_ui"]},
        'jquery': {
            exports: '$'
        }
    }
});
requirejs(['app/main']);

console.log("TeamCam booting...");
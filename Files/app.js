requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../app',
        jquery: 'jquery',
        jquery_ui: 'jquery-ui.min',
        material: 'material.min',
        ripples: 'ripples.min',
        strophe: 'strophe'
    },
    shim: {
        'material': { deps: ["jquery", "jquery_ui"]},
        'ripples': { deps: ["jquery"]},
        'jquery': {
            exports: '$'
        }
    }
});
SIGNV = 2002;
NOCACHE = true;

seajs.config({

    plugins: ['shim', 'text'],

    debug: true,

    alias: {
        'timeformat': 'lib/timeformat.js',
        'jquery.tmpl': {
            src: 'lib/jquery.tmpl.js'
        },
        'userbox': 'lib/userbox.js',
        'handler': 'lib/handler.js',
        'argo_api': {
            src: 'lib/argo_api.js'
        },
        'cookie': {
            src: 'lib/cookie.js'
        },
        'markdown': {
            src: 'lib/markdown.js'
        },
        'format': 'lib/format.js',
        'slides': {
            src: 'lib/slides.js'
        },
        'scrollbar': 'lib/scrollbar.js',
        'jquery.mousewheel': {
            src: 'lib/jquery.mousewheel.js'
        },
        'jquery.jqpagination': {
            src: 'lib/jquery.jqpagination.js'
        },
        'jquery': {
            src: 'lib/jquery.js',
            exports: 'jQuery'
        },
        'bootstrap': {
            src: 'lib/bootstrap.js',
            exports: 'jQuery'
        },
        'url': {
            src: 'lib/url.js'
        }
    },
    
    map: [
        [ /(.*(?:css|js))$/i, '$1?' + SIGNV]
    ]
    
});

SIGNV = 2005;
NOCACHE = true;

seajs.config({

    plugins: ['shim', 'text'],

    debug: true,

    alias: {
        'jquery': {
            src: 'lib/jquery.js',
            exports: 'jQuery'
        },
        'timeformat': 'lib/timeformat.js',
        'jquery.tmpl': {
            src: 'lib/jquery.tmpl.js'
        },
        'userbox': 'lib/userbox.js',
        'handler': 'lib/handler.js',
        'handler-ann': 'lib/handler-ann.js',
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
        'thinish': {
            src: 'lib/thinish.js',
        },
        'data': {
            src: './data.js',
        },
        'jquery.form': {
            src: 'lib/jquery.form.js',
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
        [ /(js\/.*(?:css|js))$/i, '$1?' + SIGNV]
    ]
    
});

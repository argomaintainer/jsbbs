$MOD('jsbbs.main', function(){
    
    $MOD['frame.hook'].register_hook('before_boot');
    $MOD['frame.hook'].register_hook('after_boot');
    register_hook('after_scroll');

    require_jslib('userbox');
    using('jsbbs.userbox');

    require_jslib('argo_api');
    import_module('argo_api', '$api');
    require_jslib('scrollbar');

    require_jslib('handler');
    require_jslib('url');
    using('frame.url_for', 'url_for_');

    require_jslib('jquery.jqpagination');


    function raise_too_old_browser(){
        location = "choose_modern_browsers.html";
    }

    function raise_may_no_good_browser(){
    }
    
    do_while_load(function(){

        window.onhashchange = onhashchange;
        bind_hook('after_boot', refresh_frame);

        $G.hooks.before_boot();
        $G.hooks.after_boot();

        $(window).scroll(function(){
            $G.hooks.after_scroll();
        });

    });

})
using('jsbbs.main');

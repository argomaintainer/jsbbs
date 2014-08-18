define(function(require){

    require('jquery');
    require('bootstrap');
    require('data');
    require('thinist');
    require('jquery.form');    
    require('jquery.tmpl');
    require('frame');

    $MOD('jsbbs.main', function(){

        $('#all').replaceWith($(render_string('main-layout')));
        
        $MOD['frame.hook'].register_hook('before_boot');
        $MOD['frame.hook'].register_hook('after_boot');
        register_hook('after_scroll');

        require('userbox');
        using('jsbbs.userbox');

        require('argo_api');
        import_module('argo_api', '$api');
        require('scrollbar');

        require('handler');
        require('url');
        using('frame.url_for', 'url_for_');

        require('jquery.jqpagination');

        function raise_too_old_browser(){
            location = "choose_modern_browsers.html";
        }

        function raise_may_no_good_browser(){
        }
        
        $(function(){

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
    
});

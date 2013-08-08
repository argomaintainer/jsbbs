SIGNV = '2013-08-06-00:22';
NOCACHE = false;

$MOD('jsbbs.main', function(){

    var localStorage = window.localStorage;
    if(!localStorage)
        localStorage = {};
    window.isnewtopic = function(tf, boardname){
        var key = 'lt:' + boardname;
        if(!(key in localStorage))
            return true;
        return tf > localStorage[key];
    }

    if(window.NOCACHE || SIGNV != localStorage['site:$version']){
	    if(window.localStorage)
		    localStorage.clear();
        if(!localStorage['tpl:$all'])
            localStorage['tpl:$all'] = '';
        var arr = localStorage['tpl:$all'].split(';');
        for(x in arr){
            if(x)
                localStorage.removeItem('tpl:'+arr[x]);
        }
        localStorage['site:$version'] = SIGNV;
    }        
    
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

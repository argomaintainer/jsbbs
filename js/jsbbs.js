$MOD('jsbbs.main', function(){
    
    $MOD['frame.hook'].register_hook('after_boot');

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

        if(!$.support.boxModel){
            raise_too_old_browser();
        }
        else{
            if(!$.support.objectAll){
                raise_may_no_good_browser();
            }
            
            console.log([$MOD['frame.hook']]);

            function quite_set_hash(hash){
                $G.refresh = false;
                location.hash = hash;
            }
            
            $G('refresh', true);  // auto refresh in hashchange

            window.onhashchange = function(){
                if($G.refresh){
                    refresh_frame();
                }
                else{
                    $G.refresh = true;
                }
            };

            $G.hooks.after_boot();        
            refresh_frame();
            
            bind_hook('after_boot', refresh_userbox);

            return {
                quite_set_hash: quite_set_hash
            }
            
        }
    });
    
})

$MOD('jsbbs.main', function(){

    console.log('zzzzzzzzzzz');

    if(!$MOD['frame.hook']){
        return;
    }

    $MOD['frame.hook'].register_hook('before_boot');
    $MOD['frame.hook'].register_hook('after_boot');

    console.log('dddddddddddd');

    loadjs('userbox');
    using('jsbbs.userbox');

    loadjs('argo_api');
    import_module('argo_api', '$api');

    loadjs('handler-ann');
    loadjs('url');
    using('frame.url_for', 'url_for_');

    function raise_too_old_browser(){
        location = "choose_modern_browsers.html";
    }

    function raise_may_no_good_browser(){
    }
    
    $(function(){

        $G['simple-userbox'] = true;

        if(!$.support.boxModel){
            raise_too_old_browser();
        }
        else{
            if(!$.support.objectAll){
                raise_may_no_good_browser();
            }

            window.onhashchange = onhashchange;
            bind_hook('after_boot', refresh_frame);

            $G.hooks.before_boot();
            $G.hooks.after_boot();
            
        }
    });

})
using('jsbbs.main');

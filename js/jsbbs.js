SIGNV = document.getElementById("jsbbsjs").getAttribute('tt')
NOCACHE = (String(location).indexOf('__debug__') >= 0);
if(NOCACHE){
    console.log('NOCACHE');
}

function jump_board(t){
    setTimeout(
        function(){
            var href = $(t).find('a:first').attr('href');
            if(href){
                location = href;
            }
        }, 100);
    return false;
}

function extend_rows() {
        var textarea = document.getElementById('newpost_textarea').rows = "18";
}

function filter_board(t){
    if(!$api._cache["/ajax/board/alls"]){
        $api.get_all_boards(function(){});
        return;
    }
    var all=$api._cache['/ajax/board/alls'].data.all;
    var ret = [];
    var pat = $(t).val();
    for(var i=0; i<all.length; ++i)
        for(var j=0; j<all[i].boards.length; ++j){
            var ss = all[i].seccode + ' ' + all[i].secname + ' '
                + all[i].boards[j].boardname + ' '
                + all[i].boards[j].title;
            if(ss.toLocaleLowerCase().indexOf(pat.toLocaleLowerCase()) > 0){
                ret.push('<li>' +
                         '<a target="_blank" href="' +
                         url_for_board(all[i].boards[j].boardname) +
                         '">' + 
                         all[i].boards[j].title + '</a></li>');
            }
        }
    $(t).parents('.boardsearch').find('.secfav-ul').html(ret.join(''))[ret.length?'removeClass':'addClass']('empty');        
    
    return ret;
}

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
        if(!window.NOCACHE){
            localStorage['site:$version'] = SIGNV;
            location.reload(true);
        }
    }        
    
    $MOD['frame.hook'].register_hook('before_boot');
    $MOD['frame.hook'].register_hook('after_boot');
    register_hook('after_scroll');

    require_jslib('userbox');
    using('jsbbs.userbox');

    require_jslib('argo_api');
    import_module('argo_api', '$api');

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

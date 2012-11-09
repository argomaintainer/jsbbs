$MOD('jsbbs.load_lib', function(){

    /*
      jsbbs.load_lib
      ~~~~~~~~~~~~~~~

      Some method for manager js lib(jsfile).
 
      require_jslib(libname):
        Load '/js/lib/$libname.js' file if this lib has not been loaded.

      drop_jslib(libname):
        Drop a loaded lib. (so you can reload it.)

      --

      $G.load_lib : the lib that have been loaded.
      
    */

    $G('loaded_lib', {});
    function require_jslib(libname){
        if(libname in $G.loaded_lib){
            return false;
        }
        console.log('Load lib [' + libname + '] ... ');
        $.ajax({
            url : 'js/lib/'+ libname + '.js',
            dataType: "script",
            async: false,
            success: function(data){
                $G.loaded_lib[libname] = true;
                console.log('Done.\n');
            },
            error: function(jqXHR, textStatus, errorThrown){
                throw errorThrown;
            },
        });
        return true;
    }
    function drop_jslib(libname){
        delete $G.loaded_lib[libname];
    }
    return {
        "require_jslib": require_jslib,
        "drop_jslib": drop_jslib,
    }
})

$MOD('jsbbs.hook', function(){

    /*
      jsbbs.hook
      ~~~~~~~~~~~

      Yet another hook system for plugin.

      trigger_hooks(hookname, [] args):
          Trigger the `hookname` hook with $args as arguments.
          And you can also trigger it directly:
              $G.hooks[hookname](arg1, arg2 ...)

      register_hook(hookname):
          register the `hookname` as hook. A hook MUST be
            registered before using.

      bind_hook(hookanem, fun):
          Push the `fun` to the hook.

    */
    
    $G('hooks', {});
    function trigger_hooks(hookname, args){
        if(!(hookname in $G.hooks)){
            throw "No such hook";
        }
        var funs = $G.hooks[hookname].__funs__;
        if(!funs){
            return;
        }
        for(i in funs){
            funs[i].apply(this, args);
        }
    }
    return {
        trigger_hooks: trigger_hooks,
        register_hook: function(hookname){
            var funs = [];
            $G.hooks[hookname] = function(){
                trigger_hooks(hookname, arguments);
            }
            $G.hooks[hookname].__funs__ = funs;
            return $G.hooks[hookname];
        },
        bind_hook: function(hookname, fun){
            $G.hooks[hookname].__funs__.push(fun);
        },
    };
});

$MOD('jsbbs.frame', function(){

    $Type('Frame', ['enter', 'basetpl', 'local', 'pos', 'level']);

    function merge_args(href, kwargs){            
        var hash = href, k, buf;
        if(kwargs){
            buf = [];
            for(k in kwargs){
                buf.push(k + '=' + kwargs[k]);
            }
            return href + '?' + buf.join('&&');
        }
        else{
            return href;
        }
    }
    
    function parse_args(args){
        if(!args){
            return '';
        }
        args = args.split('&&');
        var kwargs={}, t, i;
        for(i in args){
            t = args[i].split('=');
            kwargs[t[0]] = t[1];
        }
        return kwargs;
    }

    FRAME_LIB = {}

    MAIN_CONTAINER = '#frame';

    $G('local', {});

    function refresh_frame(){
        var hash = location.hash, t, libname;
        if(hash && (hash.length>2)){
            if(hash.substr(0,2)!='#!'){
                console.warn('Refresh an illegal frame.');
                return;
            }
            hash = hash.substr(2);
        }
        else{
            hash = 'home';
        }
        t = hash.split('?');
        t[1] = t[1]?parse_args(t[1]):NULL_DATA;
        console.log('Enter [' + t[0] + ']');
        libname = 'frame::' + t[0];
        if(t[0] in FRAME_LIB){
            require_jslib(FRAME_LIB[t[0]]);
        }
        require_module(libname);
        if(('__frame__' in $G.local)&&('__leave__' in $G.local.__frame__)){
            $G.local.__frame__.__leave__(t[0], t[1]);
        }
        $('#main').empty();
        $('#dy-widgets').empty();
        $G.local = {}
        $G.local.__frame__ = $MOD[libname];
        $MOD[libname].__enter__(t[1]);
    }

    function init_frame_page(parts){
        parts.forEach(function(ele, index, self){
            self[index] = '<div id="part-' + ele + '"></div>';
        });
        $('#main').html(parts.join(''));
    }

    function show_alert(messsage, type){
        if($('#message').length)
            return;
        var tag = $('<div id="message">');
        tag.html(messsage);
        if(type){
            tag.addClass('message-' + type);
        }
        tag.appendTo('body');
        setTimeout(function(){
            tag.fadeIn(1200, function(){
                tag.remove();
            });
        }, 1000);              
    }

    return {
        "parse_args" : parse_args,
        "merge_args" : merge_args,
        "init_frame_page" : init_frame_page,
        "refresh_frame": refresh_frame,
        "FRAME_LIB" : FRAME_LIB,
        "MAIN_CONTAINER" : MAIN_CONTAINER,
        "show_alert" : show_alert,
    }

});

$MOD('jsbbs.template', function(){

    $MOD['jsbbs.load_lib'].require_jslib('jquery.tmpl');
    $G('template', $.template);
    function loading_template(tplname){
        if(tplname in $G.template){
            console.log('Template[' + tplname + '] loaded.');
            return;
        }
        console.log('Loading template[' + tplname + ']...');
        $.ajax('template/' + tplname + '.html',
               {
                   dataType: 'text',
                   async: false,
                   success: function(data){
                       $.template(tplname, data);
                       $G.template[tplname] = $.template[tplname];
                       console.log('Loading template success');
                   },
               });
        console.log('Done...');
    }

    function require_template(tplname){
        if(!(tplname in $G.template)){
            loading_template(tplname);
        }
    }

    $MOD['jsbbs.hook'].register_hook('after_render');    

    NULL_DATA = {}
    function render_template(tplname, data, selector){
        if(!selector){
            selector="#main";
        }
        require_template(tplname);
        if(typeof data == "undefined")
            data = NULL_DATA;
        $.tmpl(tplname, data).appendTo(selector);
        $G.hooks.after_render();
    }

    function render_template_prepend(tplname, data, selector){
        if(!selector){
            selector="#main";
        }
        require_template(tplname);
        if(typeof data == "undefined")
            data = NULL_DATA;
        $.tmpl(tplname, data).prependTo(selector);
        $G.hooks.after_render();
    }

    function load_widgets(widgets){
        var w, v;
        for(w in widgets){
            v = widgets[w];
            render_template('widget/' + v.type, v, '#dy-widgets');
        }
    }

    function set_pos_mark(pos){
        if(!pos.length) return;
        var buf='',
        html;
        pos.slice(0,-1).forEach(function(element){
            buf += '<li><a href="' + element[1] + '">' + element[0] +
                '</a><span class="divider">›</span></li>';
            console.log(buf);
        });
        buf += '<li class="active">' + pos[pos.length-1][0] + '</li>';
        console.log(buf);
        $('#pos-inner').html(buf);
    };            
    
    return {
        "require_template": require_template,
        "render_template": render_template,
        "render_template_prepend": render_template_prepend,
        "set_pos_mark": set_pos_mark,
        'load_widgets': load_widgets,
        'json_encode': JSON.stringify,
    };

});

$MOD('jsbbs.url_for', {
    'avatar': function(userid){ return '/avatar/' + userid },
    'board': function(boardname){ return '#!board?boardname=' + boardname},
    'user': function(userid){ return '#!user?userid=' + userid},
    'img' : function(path){ return 'img/' + path },
    'post': function(filename, boardname){
        return '#!post?filename=' + filename + '&&boardname='
            + boardname;
    },
})

$MOD('jsbbs.html_trick', function(){

    require_module('jsbbs.frame');

    var refresh_frame = $MOD['jsbbs.frame'].refresh_frame;

    function collect_para(){
        var kwargs={};
        $('[name]').each(function(){
            var self=$(this);
            kwargs[self.attr('name')] = self.val();
        });
        return kwargs;
    }

    $G('submit', {});

    $(document).click(function(e){
        var target=$(e.target),
        href=target.attr('href'),
        action=target.attr('data-submit'),
        args, parent;
        last = target;
        if(href=='#'){
            e.preventDefault();
        }
        if(action){
            $G.submit[action](e);
            return false;
        }
    });

    $(document).submit(function(e){
        var target=$(e.target),
        action=target.attr('data-submit'), args;
        if(action){
            $G.submit[action](collect_para(), e);
            return false;
        }
    });

    function scroll_to(selector){
        var container = $("body"),
        scrollTo = $(selector);
        container.scrollTop(
            scrollTo.offset().top - container.offset().top + container.scrollTop()
        );
        container.animate({
            scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
        });
    }

    function nice_size(filesize){
        if(filesize > 1024*1024)
            return Math.round(filesize/1024/1024) + 'M';
        else if(filesize > 1024)
            return Math.round(filesize/1024) + 'K';
        else if(filesize>0)
            return filesize + 'B';
        else return '0';
    }

    $.fn.hempty = function(msg){
        this.html('<div class="hint-empty">' + msg + '</div>');
    }

    var _, _v, _h=[];
    _ = function(a){
        console.log(a);
        _h.push(a);
        return _v = a;
    }

    return {
        "collect_para": collect_para,
        "scroll_to" : scroll_to,
        "nice_size" : nice_size,
        "_": _,
        "_h": _h,
    }

});

$MOD('jsbbs.userbox', function(){
    $G.submit.logout = function(){
        $api.user_logout(refresh_userbox);
    }
    $G.submit.login = function(kwargs){
        console.log(kwargs);
        $api.user_login(kwargs.userid, kwargs.password, function(data){
            if(data.success){
                $('#userbox').empty();
                refresh_userbox();
                show_alert('登录成功！', 'success');
            }
            else{
                show_alert(data.error, 'danger');
            }
        })
    }
    function sort_favitem(a, b){
        if(a.unread == b.unread)
            return a.total - b.total;
        return a.unread?0:1;
    }

    $MOD['jsbbs.hook'].register_hook('after_refresh_fav');
    function refresh_fav(){
        $('[data-submit=refresh_fav]').addClass('refreshing');
        $api.get_self_fav(function(data){
            if(data.success){
                $('#favbox').hempty('努力地读取收藏夹中...');
                setTimeout(function(){
                    $('#favbox').empty();
                    data.data.sort(sort_favitem);
                    render_template('widget/fav', { fav: data.data },
                                    '#favbox');
                    $('[data-submit=refresh_fav]').removeClass('refreshing');
                    $G.hooks.after_refresh_fav();
                }, 500);
            }
        });
    }                             
    $G.submit.refresh_fav = refresh_fav;

    $G('authed', false);
    function refresh_userbox(){
        var fav;
        $api.get_self_info(function(data){
            if(data.success){
                $G.authed = true;
                data = { u: data.data, authed: true};
            }
            else{
                $G.authed = false;
                data = { authed: false };
            }
            $('#userbox').empty();
            render_template('userbox', data, '#userbox');
            refresh_fav();
        });
    }                           
    return {
        'refresh_fav': refresh_fav,
        'refresh_userbox' : refresh_userbox,
    }
})

do_while_load(function(){
    using('jsbbs.load_lib');
    using('jsbbs.frame');
    using('jsbbs.template');
    using('jsbbs.html_trick');
    using('jsbbs.userbox');
    using('jsbbs.url_for', 'url_for_');
    using('jsbbs.hook');
    require_jslib('argo_api');
    require_jslib('scrollbar');
    import_module('argo_api', '$api');
    $G('refresh', true);
    function set_hash_static(hash){
        $G.refresh = false;
        location.hash = hash;
    }
    refresh_userbox();
    window.onhashchange = function(){
        console.log($G.refresh);
        if($G.refresh){        
            refresh_frame();
        }
        else{
            $G.refresh = true;
        };
    };

    window.set_hash_static = set_hash_static;
    window.onhashchange();

})

$MOD['jsbbs.frame'].FRAME_LIB = {
    "home" : "handler",
    'board' : 'handler',
    'post' : 'handler',
    'user' : 'handler',
    'mail' : 'handler',
}

/*
  main.js
  =======

  Startup everything.

  $MOD:
    + jsbbs.load_lib
    + jsbbs.hook
    + jsbbs.frame

  $G:
    + loaded_lib
    + hooks
    + dom_main
    + submit
  
*/

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
                $G.loaded_lib[libname] = $MOD[libname];
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
    function enter_frame(frame, arr){
        frame = 'frame/' + frame;
        if(require_jslib(frame)){
            if('__prepare__' in $MOD[frame]){
                $MOD[frame].__prepare__();
            }
        }
        $MOD[frame].__init__(arr);
    }
    return {
        "require_jslib": require_jslib,
        "drop_jslib": drop_jslib,
        "enter_frame": enter_frame,
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
    return {
        trigger_hooks: function(hookname, args){
            var funs = $G.hooks[hookname].__funs__;
            if(!funs){
                return;
            }
            for(i in funs){
                funs[i].apply(this, args);
            }
        },
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

$MOD('jsbbs.userbox', function(){
    // function refresh_userbox(){
    //     $.get('/snippets/userbox.php',
    //           function(data){
    //               $('#userbox').html(data);
    //           });
    // }
    // return {
    //     "refresh_userbox": refresh_userbox,
    // };
});

$MOD('jsbbs.frame', function(){

    /*
      jsbbs.frame
      ~~~~~~~~~~~~

      The implementation of Frame System.

      $G.dom_main :
        an alisa for $('#main') , standing for the Main Container
          of the content.

      $G.submit :
        Every submit event with action='data-submit' attr, will
          all $G.submit[action](event)

      render_frame(frame):
        an alisa for triggering `render_frame` hook.

      goto_frame(hash):
        $hash is not include '#!'. This function will get the content of
           /snippets/$hash by ajax, and call render_frame while it success.

      goto_frame_href(href):
        Simmilar to goto_frame, but href should include '#!' .
        And while it's a load-able href, it will return true,
        otherwise return false.

      show_alert(msg, type):
        Append an <div id=message, class=message-$type> with content
        msg. It will locked while display, and remove after 1200ms .
        
    */

    var MOD_HOOKS = $MOD.__buildin__.require_module('jsbbs.hook'),
    G_HOOKS = $G.hooks;

    $G('dom_main', undefined, {
        get: function(){
            return $('#main');
        },
        set: null,
    })

    function is_path(href){
        return ((typeof href=="string") &&
                href.match(/[\w\/]*(\?(\w*=\w*)(&&\w*=\w*)*)?/) != "");
    }

    MOD_HOOKS.register_hook('render_frame');
    MOD_HOOKS.register_hook('frame_update');
    function render_frame(frame){
        last = frame;
        var obj=$(frame),
        frame=obj.children('#frame'),
        reqlib=obj.attr("data-require");
        navatt=obj.attr("data-nav");
        $G.dom_main.empty();
        $G.dom_main.empty().html(frame);
        if(navatt){
            $(".widget-nav .active").removeClass("active");
            $("#nav-" + navatt).addClass("active");
        }
        $('.focus').focus();
        if(reqlib){
            reqlib = reqlib.split(':');
            for(x in reqlib){
                require_jslib(reqlib[x]);
            };
        }
        $G.hooks.render_frame();
    }

    function update_scrollbar(){
        $(".scrollbaring").each(function(){
            var obj=$(this);
            obj.mCustomScrollbar("update");
        });            
        $(".scrollbar").each(function(){
            var obj=$(this);
            obj.mCustomScrollbar();
            obj.addClass("scrollbaring").removeClass("scrollbar");
        });
    }
    MOD_HOOKS.bind_hook('render_frame', update_scrollbar);
    MOD_HOOKS.bind_hook('frame_update', update_scrollbar);
    
    function goto_frame(uri){
        $.get(uri, render_frame);
        if(uri){
            location.uri = '!' + uri;
        }
        else{
            location.uri = '';
        }      
    }

    function goto_frame_href(href){
        if(typeof href=="string"){
            goto_frame(href);
            return true;
        }
        return false;
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

    $G('submit', {});

    $(document).click(function(e){
        var target=$(e.target),
        href=target.attr('href'),
        action=target.attr("data-submit");
        last=e;
        if(action){
            $G.submit[action](e);
            return false;
        }
        if(href && (href.substr(0, 2)=='#!')){
            return !goto_frame_href(href);
        }
    });

    $(document).submit(function(e){
        var target=$(e.target), collection;
        action=target.attr('data-submit');
        if(action){
            collection = {};
            $("[name]").each(function(){
                var self=$(this);
                collection[self.attr('name')] = self.val();
            });                
            $G.submit[action](e, collection);
            return false;
        }
    })

    function set_pos_mark(pos){
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
        "render_frame" : render_frame,
        "goto_frame" : goto_frame,
        "goto_frame_href" : goto_frame_href,
        "show_alert" : show_alert,
        "update_scrollbar": update_scrollbar,
        "set_pos_mark": set_pos_mark,
    }

})

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

    NULL_DATA = {}
    function render_template(tplname, data, selector){
        if(!selector){
            selector="#main";
        }
        if(!(tplname in $G.template)){
            loading_template(tplname);
        }
        if(typeof data == "undefined")
            data = NULL_DATA;
        $(selector).empty();
        $.tmpl(tplname, data).appendTo(selector);
    }

    return {
        "render_template": render_template,
        "loading_template": loading_template,
    }
});

do_while_load(function(){     
    $MOD.__buildin__.using('__buildin__')
    using('jsbbs.load_lib');
    $G('frame', {});
    require_jslib('jquery.mousewheel.min');
    require_jslib('jquery.mCustomScrollbar');
    using('jsbbs.hook');
    using('jsbbs.frame');
    using('jsbbs.userbox');
    using('jsbbs.template');
    require_jslib('resize_fluid_height');
    bind_hook('resize_fluid_height', update_scrollbar);
    window.onhashchange = function(){
        var hash=location.hash;
        goto_frame_href(hash);
    }
    // refresh_userbox();
    window.onhashchange();
});


$MOD('frame.load_lib', function(){

    /*
      frame.load_lib
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
using('frame.load_lib');

$MOD('frame.hook', function(){

    /*
      frame.hook
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
            if(!(hookname in $G.hooks)){
                console.error('Bind wrong hook[' + hookname + ']');
            }
            $G.hooks[hookname].__funs__.push(fun);
        },
    };
});
using('frame.hook');

$MOD('frame.func', {

    merge_args : function(href, kwargs){            
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
    },
    
    parse_args: function(args){
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
    },

    show_alert: function(messsage, type){
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
    },
    
    get_current_hash: function(){
        var hash = location.hash, t;
        if(hash && (hash.length>2)){
            if(hash.substr(0,2)!='#!'){
                return;
            }
            hash = hash.substr(2);
        }
        else{
            hash = 'home';
        }
        t = hash.split('?');
        t[1] = t[1]?parse_args(t[1]):NULL_DATA;
        return $Type.FrameHash(t);
    },

    set_pos_mark: function(pos){
        if(!pos.length) return;
        var buf='',
        html;
        pos.slice(0,-1).forEach(function(element){
            buf += '<li><a href="' + element[1] + '">' + element[0] +
                '</a><span class="divider">›</span></li>';
        });
        buf += '<li class="active">' + pos[pos.length-1][0] + '</li>';
        $('#pos-inner').html(buf);
    },

    collect_para: function(group){
        if(!group) return;
        var kwargs={};
        $('[data-group=' + group + '][name]').each(function(){
            var self=$(this);
            kwargs[self.attr('name')] = self.val();
        });
        return kwargs;
    },

    collect_form_para : function(form){
        var kwargs = {};
        form.find('[name]').each(function(){
            var self=$(this);
            kwargs[self.attr('name')] = self.val();
        });
        return kwargs;
    },

    scroll_to: function(selector){
        var container = $("body"),
        scrollTo = $(selector);
        container.scrollTop(
            scrollTo.offset().top - container.offset().top
                + container.scrollTop()
        );
        container.animate({
            scrollTop: scrollTo.offset().top - container.offset().top
                + container.scrollTop()
        });
    },

    nice_size: function(filesize){
        if(filesize > 1024*1024)
            return Math.round(filesize/1024/1024) + 'M';
        else if(filesize > 1024)
            return Math.round(filesize/1024) + 'K';
        else if(filesize>0)
            return filesize + 'B';
        else return '0';
    },

    parts_div: function(parts){
        var buf;
        parts.forEach(function(ele, index, self){
            buf.push('<div id="part-' + ele + '"></div>');
        });
        return buf.join('\n');
    },

    range : function(start, end, step) {
        var range = [];
        var typeofStart = typeof start;
        var typeofEnd = typeof end;
        if (step === 0) {
            throw TypeError("Step cannot be zero.");
        }
        if (typeofStart == "undefined" || typeofEnd == "undefined") {
            throw TypeError("Must pass start and end arguments.");
        } else if (typeofStart != typeofEnd) {
            throw TypeError("Start and end arguments must be of same type.");
        }
        typeof step == "undefined" && (step = 1);
        if (end < start) {
            step = -step;
        }
        if (typeofStart == "number") {
            while (step > 0 ? end >= start : end <= start) {
                range.push(start);
                start += step;
            }
        } else if (typeofStart == "string") {
            if (start.length != 1 || end.length != 1) {
                throw TypeError("Only strings with one character are supported.");
            }
            start = start.charCodeAt(0);
            end = end.charCodeAt(0);
            while (step > 0 ? end >= start : end <= start) {
                range.push(String.fromCharCode(start));
                start += step;
            }
        } else {
            throw TypeError("Only string and number types are supported");
        }
        return range;
    },

})
using('frame.func');

$MOD('frame.template', function(){

    $MOD['frame.load_lib'].require_jslib('jquery.tmpl');
    $G('template', $.template);    
    $MOD['frame.hook'].register_hook('after_render');    
    NULL_DATA = {}

    require_jslib('timeformat');

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

    function raise404(msg){
        $('#main').empty();
        render_template('404', { msg: msg});
    }
    
    return {
        "require_template": require_template,
        "render_template": render_template,
        "render_template_prepend": render_template_prepend,
        'load_widgets': load_widgets,
        'json_encode': JSON.stringify,
        'tf_timestamp': $MOD.timeformat.nice_timestamp,
        'raise404': raise404,
    };

});
using('frame.template');

$MOD('frame.frame', function(){

    $Type('Frame', ['mark',
                    'enter',
                    'basetpl',
                    'local',
                    'pos',
                    'leave',
                    'isnew',
                    'submit',
                    'ajax',
                    'prepare',
                    'widgets_loader',
                    'keep_widgets']);

    $Type('FrameHash', ['hash', 'args']);

    $G('frames', {});
    $G('current', undefined);
    $G('submit', {});

    MAIN_CONTAINER = '#main';

    $.fn.ajax_data = function(){
        $(this).each(function(){
            var self = $(this);
            action = self.attr('data-ajax');
            if(action in $G.current.ajax){
                $G.current.ajax[self.attr('data-ajax')](self);
            }
            else if(action in $G.ajax){
                $G.ajax[action](self);
            }
            else{
                console.error('Wrong ajax[' + action + ']');
            }
        });
    }

    function declare_frame(args){
        if(!args.mark){
            console.error('Frame must has a mark.');
        }
        if(!args.submit)
            args.submit = {};
        if(!args.ajax)
            args.ajax = {};
        if(args.isnew != false)
            args.isnew = true;
        if(!args.local)
            args.local = {};        
        if(args.keep_widgets != true)
            args.keep_widgets = false;
        $G.frames[args.mark] = $Type.Frame(args);
    }

    function refresh_frame(){
        var curhash = get_current_hash(),
        frame;

        if(!curhash){
            console.warn('Refresh an illegal frame.');
            return;
        }

        if(!(curhash.hash in $G.frames)){
            console.error('Enter wrong frame. [' + curhash.hash + ']');
            return
        }

        console.log('ENTER frame[' + json_encode(curhash) + ']');

        if($G.current && $G.current.leave){
            $G.current.leave(curhash.hash, curhash.args);
        }

        $G.current = frame = $G.frames[curhash.hash];
        $G.local = frame.local;
        $G.local.__frame__ = frame;

        if(frame.isnew){
            $('#main').empty();
        }

        if(!frame.keep_widgets){
            $('#dy-widgets').empty();
        }

        if(frame.pos){
            set_pos_mark(frame.pos);
        }

        if(frame.prepare){
            frame.prepare(curhash.args);
        }

        if(frame.basetpl){
            console.log('Use basetpl :' + frame.basetpl
                        + '[' + frame.mark + ']');
            render_template(frame.basetpl, { args: curhash.args },
                            MAIN_CONTAINER);
            $('[data-ajax]').ajax_data();
        }
        
        frame.enter(curhash.args);

        if(frame.widgets_loader){
            if(typeof frame.widgets_loader == "function"){
                frame.widgets_loader(curhash.args).forEach(function(v){
                    render_template('widget/' + v.type, v, '#dy-widgets');
                });
            }
            else{
                frame.widgets_loader.forEach(function(ele){
                    var v = ele(curhash.args);
                    render_template('widget/' + v.type, v, '#dy-widgets');
                });
            }
        }

    }
    $G.submit['refresh_frame'] = refresh_frame;

    function close_popwindow(){
        $('#pop-window').addClass('hidden');
    }
    $G.submit['close_popwindow'] = close_popwindow;

    function show_popwindow(){
        var hover = null;
        $('#pop-window input').each(function(){
            var tmp = $(this);
            if(!tmp.val()){
                hover = tmp;
                return false;
            }
        });
        if(!hover){
            hover = $('#pop-window textarea').first();
        }
        $('#pop-window').removeClass('hidden');
        hover.focus();
    }
    $G.submit['show_popwindow'] = show_popwindow;

    function init_popwindow(template, data){
        $('#pop-window').empty();
        render_template(template, data, '#pop-window');
        show_popwindow();
    }

    function submit_action(action, args, event){
        if($G.current.submit && action in $G.current.submit){
            $G.current.submit[action](args, event);
            return false;
        }
        if(action in $G.submit){
            $G.submit[action](args, event);
            return false;
        }
        console.error('Wrong action[' + action + ']');
    }

    $(document).click(function(e){
        var target=$(e.target),
        href=target.attr('href'),
        action=target.attr('data-submit'),
        group, args, parent;
        last = target;
        if(href=='#'){
            e.preventDefault();
        }
        if(action){
            group = target.attr('data-group');
            submit_action(action, collect_para(group), e);
        }
    });

    $(document).submit(function(e){
        var target=$(e.target),
        action=target.attr('data-submit'), args, group, para;
        if(action){
            group = target.attr('data-group');
            if(group){
                para = collect_para(group);
            }
            else{
                para = collect_form_para(target);
            }
            submit_action(action, para, e);
            return false;
        }
    });

    $.fn.hempty = function(msg){
        this.html('<div class="hint-empty">' + msg + '</div>');
    }

    return {
        declare_frame: declare_frame,
        refresh_frame: refresh_frame,
        init_popwindow: init_popwindow,
        close_popwindow: close_popwindow,
        show_popwindow: show_popwindow,
    }

});
using('frame.frame');

$MOD('frame.debug', function(){

    var _, _v, _h=[];

    _ = function(a){
        console.log(a);
        _h.push(a);
        return _v = a;
    }

    return {
        "_v" : _v,
        "_": _,
        "_h": _h,
    }

});
using('frame.debug');

$MOD('main', function(){

    console.log([$MOD['frame.hook']]);

    $MOD['frame.hook'].register_hook('after_boot');

    function quite_set_hash(hash){
        $G.refresh = false;
        location.hash = hash;
    }
    
    do_while_load(function(){

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

    })

    return {
        quite_set_hash: quite_set_hash,
    }

})
using('main');

$MOD('prototype', function(){
    if(!Object.keys) Object.keys = function(o){
        if (o !== Object(o))
            throw new TypeError('Object.keys called on non-object');
        var ret=[],p;
        for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
        return ret;
    }
});

/* This MOD May be Remove */
$MOD('range', function(){

    var Range = $Type('Range', ['start', 'end', 'isnull']);

    return {
        'Range': Range,
        'new_range': function(start, end){
            if(start == null)
                return Range({isnull: true});
            return $Type.Range([start, end]);
        },
        'range_start': function(range){
            return (range.isnull) ? 0 : (range.start);
        },
        'range_update': function(range, start, end){
            if(range.isnull){
                range.isnull = false;
            }
            range.start = start;
            range.end = end;
        }
    }
    
})

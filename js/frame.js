NOCACHE = (location.toString().indexOf('__nocache__') > 0);

$MOD('frame.load_lib', function(){

    /*
      frame.load_lib
      ~~~~~~~~~~~~~~~

      Some method for manager js lib(jsfile).
      
      require_jslib(libname):
      Load '/js/lib/$libname.js' file if this lib has not been loaded.

      --

      $G.load_lib : the lib that have been loaded.
      
    */

    return {
        "require_jslib": require_jslib,
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

    $G.hooks = {};
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
        }
    };
});
using('frame.hook');

$MOD('frame.func', {

    merge_args : function(kwargs){            
        var k, buf = [];
        for(k in kwargs){
            buf.push(k + '=' + kwargs[k]);
        }
        return buf.join('&&');
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
        t[1] = t[1]?parse_args(t[1]):null_DATA;
        return $Type.FrameHash(t);
    },

    set_pos_mark: function(pos){
        if(!pos.length) return;
        var buf='',
        html;
        _.each(pos.slice(0,-1), function(element){
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
        _.each(parts, function(ele, index, self){
            buf.push('<div id="part-' + ele + '"></div>');
        });
        return buf.join('\n');
    },

    array_to_dict : function(arr){
        var t = {};
        for(x in arr)
            t[arr[x]] = true;
        return t;
    },

    array_values : function(c){
        var d = [];
        for(i in c)
            if(c.hasOwnProperty(i))
                d.push(c[i]);
        return d;
    },
    
    filter_by_lambda : function(d, kf){
        var ret = [], i;
        for(i in d)
            if(kf(d[i]))
                ret.push(d[i]);
        return ret;
    },
    
    group_by_lambda : function(d, kf){
        var ki = {}, k, ret = [], i;
        for(i=0; i<d.length; ++i){
            k = kf(d[i]);
            if(typeof ki[k] == 'undefined'){
                ki[k] = ret.length;
                ret.push([]);
            }
            ret[ki[k]].push(d[i]);
        }
        return ret;
    },

    ascii : function(str){
        
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
    }

})
using('frame.func');

$MOD('frame.template', function(){

    $MOD['frame.load_lib'].require_jslib('template');
    $G.template = $.template;    
    $MOD['frame.hook'].register_hook('after_render');    
    null_DATA = {}

    require_jslib('timeformat');

    function loading_template(tplname){
        if(tplname in $G.template){
            console.log('Template[' + tplname + '] loaded.');
            return;
        }
        var tpl_key = 'tpl:' + tplname;
        if(!localStorage[tpl_key]){
            console.log('Loading template[' + tplname + ']...');
            $.ajax('template/' + tplname + '.html',
                   {
                       dataType: 'text',
                       cache: false,
                       async: false,
                       success: function(data){
                           localStorage[tpl_key] = data;
                           console.log('Loading template success');
                       }
                   });
            console.log('Done...');
        }
        $.template(tplname, localStorage[tpl_key]);
        $G.template[tplname] = $.template[tplname];
        localStorage['tpl:$all'] = localStorage['tpl:$all'] + ';' +
            tplname;
    }

    function require_template(tplname){
        if(!(tplname in $G.template)){
            loading_template(tplname);
        }
    }
    function render_string(tplname, data){
        require_template(tplname);
        return $.tmpl(tplname, data);
    }
    function render_template(tplname, data, selector){
        if(!selector){
            selector = "#main";
        }
        require_template(tplname);
        if(typeof data == "undefined")
            data = null_DATA;
        $.tmpl(tplname, data).appendTo(selector);
        $G.hooks.after_render();
    }
    function render_template_prepend(tplname, data, selector){
        if(!selector){
            selector = "#main";
        }
        require_template(tplname);
        if(typeof data == "undefined")
            data = null_DATA;
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

    if(JSON){
        var json_encode=JSON.stringify;
    }
    else{
        var json_encode=function(d){
            console.log(['Try to encode', d]);
            return 'ERR';
        };
    }
    
    return {
        "require_template": require_template,
        "render_template": render_template,
        "render_template_prepend": render_template_prepend,
        'render_string': render_string,
        'load_widgets': load_widgets,
        'json_encode': json_encode,
        'tf_timestamp': $MOD.timeformat.nice_timestamp,
        'tf_after_yesterday': $MOD.timeformat.afterYesterdayTS,
        'tf_too_old': $MOD.timeformat.tooOldTS,
        'raise404': raise404
    };

});
using('frame.template');

$MOD('frame.frame', function(){

    $Type('Frame', ['mark',
                    'enter',
                    'basetpl',
                    'local',
                    'pos',
                    'isnew',
                    'submit',
                    'ajax',
                    'prepare',
                    'widgets_loader',
                    'marktop',
                    'keep_widgets']);

    $Type('FrameHash', ['hash', 'args']);

    $G.frames = {};
    $G.current = undefined;
    $G.submit = {};

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

    var bp = {
        parse_args : $MOD['frame.func'].parse_args,
        tpl : function(){},
        events : {
        },
        _listen_event : function(e){
            e = e || this.events;
            var self = this.el;
            _.each(e, function(es, sel){
                sel = (sel == '&') ? self : self.find(sel);
                _.each(es, function(handler, event){
                    sel.on(event, _.bind(handler, self));
                });
            });
        },
        exec : function(handler){
            if(_.isFunction(handler)){
                this.seq.push(handler);
            }else if(handler === null){
                this.seq.push(null);
            }
            var self = this;
            var header = self.seq[0];
            if(_.isFunction(header)){
                ++ self.running;
                self.seq.shift().apply(self, function(){
                    --self.running;
                    self.exec();
                });
            }else if(header == null){
                if(self.running != 0){
                    return;
                }
                self.seq.shift();
                self.exec();
            }
            return this;
        },
        _loadData : function(args, callback){
            
        },
        loadData : function(args){
            return this.exec(function(callback){
                this._loadData(args, callback);
            });
        },
        buildElement : function(){
            return this.exec(function(callback){
                this.el = _.isFunction(this.tpl) ?
                    this.tpl() : template(this.tpl, this.data);
                this._listen_event();
                this.el.trigger('init');
                callback();
            });
        },
        init : function(){},
        bind : function(el){
            return this.exec(function(callback){
                this.el = el;
                this.listen_event();
                this.el.trigger('init');
            });
        }
    }

    var frames = {};
    
    function declare_frame(mixin){
        function Frame(){
            this.data = {};
            this.el = null;
            this.seq = [];
            this.running = 0;
        };
        Frame.prototype = bp;
        Frame.prototype.constructor = Frame;
        _.extend(Frame, mixin);
        if(mixin.name){
            frames[name] = Frame;
        }
        return Frame;
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

        $G.current = frame = $G.frames[curhash.hash];
        $G.local = frame.local;
        $G.local.__frame__ = frame;

        $('.markhash li.active').removeClass('active disabled').find('a').removeClass('onactive');

        if(frame.marktop){
            $('.markhash-' + frame.marktop).addClass('active disabled').find('a').addClass('onactive');
        }

        if(frame.isnew){ // replace a new rather empty it for overtime render
            $('#main').replaceWith('<div id="main">');
        }

        if(!frame.keep_widgets){
            $('#dy-widgets').replaceWith('<div id="dy-widgets">');
        }

        $('.local-container').empty()

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

        window.scrollTo(0, 0);

        $('body').attr('class', 'frame-' + curhash.hash);

        if(frame.widgets_loader){
            if(typeof frame.widgets_loader == "function"){
                _.each(frame.widgets_loader(curhash.args), function(v){
                    render_template('widget/' + v.type, v, '#dy-widgets');
                });
            }
            else{
                _.each(frame.widgets_loader, function(ele){
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

    var _modal_yes;        
    $G.submit['modal_yes'] = function(){
        $('#modal').modal('hide');
        setTimeout(_modal_yes, 450);
    }        
    function modal_confirm(header, content, confirm){
        $('#modal-header-content').text(header);
        $('#modal-content').html(content);
        _modal_yes = confirm;
        $('#modal').modal('show');
    }

    function show_modal(html){
        $('#big-modal').html(html).modal('show');
    }

    function submit_action(action, args, event){
        if($G.current.submit && (action in $G.current.submit)){
            $G.current.submit[action](args, event);
            return false;
        }
        if(action in $G.submit){
            $G.submit[action](args, event);
            return false;
        }
        console.error('Wrong action[' + action + ']');
    }

    var BUBB = { 'SPAN': null,
                 'SMALL': null,
                 'I': null }

    function get_action(target, attrname){
        var action, tmp;
        if(action=target.attr(attrname)){
            return action;
        }
        if(target[0].tagName in BUBB){
            tmp = target.parents('[' + attrname + ']').first();
            if(action=tmp.attr(attrname)){
                return action;
            }
        }
        return null;
    }

    $G.refresh = true;  // auto refresh in hashchange
    function quite_set_hash(hash, kwargs){
        if($G.refresh && (location.hash != hash)){
            $G.refresh = false;
            if(typeof kwargs == 'object'){
                console.log([hash = hash + '?' + merge_args(kwargs)]);
            }
            location.hash = hash;
        }
    }

    function set_location(hash){
        if($G.refresh){
            window.location = hash;
        }
        else{
            setTimeout(function(){
                set_location(hash);
            }, 500);
        }
    }

    function onhashchange(){
        if($G.refresh){
            refresh_frame();
        }
        else{
            $G.refresh = true;
        }
    };    

    $(document).click(function(e){
        var target=$(e.target), 
        group, args, parent,
        href=target.attr('href');
        if(target.hasClass('onactive')){
            e.preventDefault();
            return;
        }
        if(href){
            if(href.substr(0, 11)=='javascript:'){
                if(!confirm('这个链接请求执行一段js代码:\n' + href + '\n这可能并不安全。是否真的要执行？')){
                return false;
                }
            }
            else{
                if(href != '#'){
                    return;
                }
            }
        }
        var action = get_action(target, 'data-submit');
        if(action || href == '#'){
            e.preventDefault();
        }
        if(action){
            e.preventDefault();
            if(action[0] == '#'){
                set_location(action);
                return false;
            }             
            group = target.attr('data-group');
            if(submit_action(action, collect_para(group), e) == false){
                return false;
            }
        }
    });

    $(document).submit(function(e){
        var target=$(e.target),
        action=target.attr('data-submit'), args, group, para;
        if(action){
            e.preventDefault();
            e.stopImmediatePropagation();
            group = target.attr('data-group');
            if(group){
                para = collect_para(group);
            }
            else{
                para = collect_form_para(target);
            }
            try{
                submit_action(action, para, e);
            }
            catch(e){
                console.log(e);
            }
            return false;
        }
    });

    return {
        declare_frame: declare_frame,
        refresh_frame: refresh_frame,
        init_popwindow: init_popwindow,
        close_popwindow: close_popwindow,
        show_popwindow: show_popwindow,
        modal_confirm: modal_confirm,
        show_modal: show_modal,
        set_location: set_location,
        onhashchange: onhashchange,
        quite_set_hash: quite_set_hash        
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
        "_h": _h
    }

});
using('frame.debug');

$MOD('temp', function(){
    $G.submit['load-gist'] = function(p, e){
        var gistframe = $('<iframe marginwidth="0" marginheight="0" frameborder="0" width="100%">')[0];
        var zone = e.target
        , gistframehtml = '<html><body><script type="text/javascript" src="https://gist.github.com/' + zone.getAttribute('data-gistid') + '.js"></script></body></html>';
        $(zone).replaceWith(gistframe);
        var gistframedoc = gistframe.document;
        if (gistframe.contentDocument) {
			gistframedoc = gistframe.contentDocument;
		} else if (gistframe.contentWindow) {
			gistframedoc = gistframe.contentWindow.document;
		}
        gistframedoc.open();
		gistframedoc.writeln(gistframehtml);
		gistframedoc.close();		
    }
});

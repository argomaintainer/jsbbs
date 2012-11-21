(function ($) {
	"use strict";
	
	$.jqPagination = function (el, options) {
	
		// To avoid scope issues, use 'base' instead of 'this'
		// to reference this class from internal events and functions.
	
		var base = this;

		// Access to jQuery and DOM versions of element
		base.$el = $(el);
		base.el = el;
		
		// get input jQuery object
		base.$input = base.$el.find('input');

		// Add a reverse reference to the DOM object
		base.$el.data("jqPagination", base);

		base.init = function () {

			base.options = $.extend({}, $.jqPagination.defaultOptions, options);
			
			// if the user hasn't provided a max page number in the options try and find
			// the data attribute for it, if that cannot be found, use one as a max page number
			
			if (base.options.max_page === null) {
			
				if (base.$input.data('max-page') !== undefined) {
					base.options.max_page = base.$input.data('max-page');
				} else {
					base.options.max_page = 1;
				}
				
			}
			
			// if the current-page data attribute is specified this takes priority
			// over the options passed in, so long as it's a number
			
			if (base.$input.data('current-page') !== undefined && base.isNumber(base.$input.data('current-page'))) {
				base.options.current_page = base.$input.data('current-page');
			}
			
			// remove the readonly attribute as JavaScript must be working by now ;-)
			base.$input.removeAttr('readonly');
			
			// set the initial input value
			// pass true to prevent paged callback form being fired
			
			base.updateInput(true);

			
			 //***************
			// BIND EVENTS
			
			base.$input.on('focus.jqPagination mouseup.jqPagination', function (event) {

				// if event === focus, select all text...
				if (event.type === 'focus') {

					var current_page	= parseInt(base.options.current_page, 10);

					$(this).val(current_page).select();

				}
			
				// if event === mouse up, return false. Fixes Chrome bug
				if (event.type === 'mouseup') {
					return false;
				}
				
			});
			
			base.$input.on('blur.jqPagination keydown.jqPagination', function (event) {
				
				var $self			= $(this),
					current_page	= parseInt(base.options.current_page, 10);
				
				// if the user hits escape revert the input back to the original value
				if (event.keyCode === 27) {
					$self.val(current_page);
					$self.blur();
				}
				
				// if the user hits enter, trigger blur event but DO NOT set the page value
				if (event.keyCode === 13) {
					$self.blur();
				}

				// only set the page is the event is focusout.. aka blur
				if (event.type === 'blur') {
					base.setPage($self.val());
				}
				
			});
			
			base.$el.on('click.jqPagination', 'a', function (event) {
			
				var $self = $(this);

				// we don't want to do anything if we've clicked a disabled link
				// return false so we stop normal link action btu also drop out of this event
				
				if ($self.hasClass('disabled')) {
					return false;
				}

				// for mac + windows (read: other), maintain the cmd + ctrl click for new tab
				if (!event.metaKey && !event.ctrlKey) {
					event.preventDefault();
					base.setPage($self.data('action'));
				}
				
			});
			
		};
		
		base.setPage = function (page) {
			
			// return current_page value if getting instead of setting
			if (page === undefined) {
				return base.options.current_page;
			}
		
			var current_page	= parseInt(base.options.current_page, 10),
				max_page		= parseInt(base.options.max_page, 10);
							
			if (isNaN(parseInt(page, 10))) {
				
				switch (page) {
				
					case 'first':
						page = 1;
						break;
						
					case 'prev':
					case 'previous':
						page = current_page - 1;
						break;
						
					case 'next':
						page = current_page + 1;
						break;
						
					case 'last':
						page = max_page;
						break;
						
				}
				
			}
			
			page = parseInt(page, 10);
			
			// reject any invalid page requests
			if (isNaN(page) || page < 1 || page > max_page || page === current_page) {
			
				// update the input element
				base.setInputValue(current_page);
				
				return false;
				
			}
			
			// update current page options
			base.options.current_page = page;
			base.$input.data('current-page', page);
			
			// update the input element
			base.updateInput();
			
		};
		
		base.setMaxPage = function (max_page) {
			
			// return the max_page value if getting instead of setting
			if (max_page === undefined) {
				return base.options.max_page;
			}

			// ignore if max_page is not a number
			if (!base.isNumber(max_page)) {
				console.error('jqPagination: max_page is not a number');
				return false;
			}
			
			// ignore if max_page is less than the current_page
			if (max_page < base.options.current_page) {
				console.error('jqPagination: max_page lower than current_page');
				return false;
			}
			
			// set max_page options
			base.options.max_page = max_page;
			base.$input.data('max-page', max_page);
				
			// update the input element
			base.updateInput();
			
		};
		
		// ATTN this isn't really the correct name is it?
		base.updateInput = function (prevent_paged) {
			
			var current_page = parseInt(base.options.current_page, 10);
							
			// set the input value
			base.setInputValue(current_page);
			
			// set the link href attributes
			base.setLinks(current_page);
			
			// we may want to prevent the paged callback from being fired
			if (prevent_paged !== true) {

				// fire the callback function with the current page
				base.options.paged(current_page);
			
			}
			
		};
		
		base.setInputValue = function (page) {
		
			var page_string	= base.options.page_string,
				max_page	= base.options.max_page;
	
			// this looks horrible :-(
			page_string = page_string
				.replace("{current_page}", page)
				.replace("{max_page}", max_page);
			
			base.$input.val(page_string);
		
		};
		
		base.isNumber = function(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		};
		
		base.setLinks = function (page) {
			
			var link_string		= base.options.link_string,
				current_page	= parseInt(base.options.current_page, 10),
				max_page		= parseInt(base.options.max_page, 10);
			
			if (link_string !== '') {
				
				// set initial page numbers + make sure the page numbers aren't out of range
					
				var previous = current_page - 1;
				if (previous < 1) {
					previous = 1;
				}
				
				var next = current_page + 1;
				if (next > max_page) {
					next = max_page;
				}
				
				// apply each page number to the link string, set it back to the element href attribute
				base.$el.find('a.first').attr('href', link_string.replace('{page_number}', '1'));
				base.$el.find('a.prev, a.previous').attr('href', link_string.replace('{page_number}', previous));
				base.$el.find('a.next').attr('href', link_string.replace('{page_number}', next));
				base.$el.find('a.last').attr('href', link_string.replace('{page_number}', max_page));
				
			}

			// set disable class on appropriate links
			base.$el.find('a').removeClass('disabled');

			if (current_page === max_page) {
				base.$el.find('.next, .last').addClass('disabled');
			}

			if (current_page === 1) {
				base.$el.find('.previous, .first').addClass('disabled');
			}

		};
		
		base.callMethod = function (method, key, value) {

			switch (method.toLowerCase()) {

				case 'option':

					// call the appropriate function for the desired key (read: option)
					switch (key.toLowerCase()) {
					
						case 'current_page':
							return base.setPage(value);
							
						case 'max_page':
							return base.setMaxPage(value);
						
					}

					// if we haven't already returned yet we must not be able to access the desired option
					console.error('jqPagination: cannot get / set option ' + key);
					return false;

					break;

				case 'destroy':

					base.$el
						.off('.jqPagination')
						.find('*')
							.off('.jqPagination');

					break;

				default:

					// the function name must not exist
					console.error('jqPagination: method "' + method + '" does not exist');
					return false;

			}

		};

		// Run initializer
		base.init();
		
	};

	$.jqPagination.defaultOptions = {
		current_page	: 1,
		link_string		: '',
		max_page		: null,
		page_string		: 'Page {current_page} of {max_page}',
		paged			: function () {}
	};

	$.fn.jqPagination = function () {

		// get any function parameters
		var self = this,
			args = Array.prototype.slice.call(arguments);

		// if the first argument is a string call the desired function
		// note: we can only do this to a single element, and not a collection of elements

		if (typeof args[0] === 'string') {
			
			// if we're dealing with multiple elements, set this to the first element
			if (self.length > 1) {
				self = self.eq(0);
			}

			var $plugin = $(self).data('jqPagination');

			return $plugin.callMethod(args[0], args[1], args[2]);

		}

		// if we're not dealing with a method, initialise plugin
		self.each(function () {
			(new $.jqPagination(this, args[0]));
		});
		
	};

})(jQuery);

// polyfill, provide a fallback if the console doesn't exist
if (!console) {

	var console	= {},
		func	= function () { return false; };

	console.log		= func;
	console.info	= func;
	console.warn	= func;
	console.error	= func;

}

$MOD('console', function(){
    if(typeof console == "undefine"){
        console = {
            log: function(){}
        };
    };
})

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
            }
        });
        return true;
    }
    function drop_jslib(libname){
        delete $G.loaded_lib[libname];
    }
    return {
        "require_jslib": require_jslib,
        "drop_jslib": drop_jslib
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
        }
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
        for_each_array(pos.slice(0,-1), function(element){
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
        for_each_array(parts, function(ele, index, self){
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
    }

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
                   }
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

        $('body').attr('class', 'frame-' + curhash.hash);

        if(frame.widgets_loader){
            if(typeof frame.widgets_loader == "function"){
                for_each_array(frame.widgets_loader(curhash.args), function(v){
                    render_template('widget/' + v.type, v, '#dy-widgets');
                });
            }
            else{
                for_each_array(frame.widgets_loader, function(ele){
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
        modal_confirm: modal_confirm
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
        quite_set_hash: quite_set_hash
    }

})
using('main');

$MOD('prototype', function(){

    // if(!Object.keys) Object.keys = function(o){
    //     if (o !== Object(o))
    //         throw new TypeError('Object.keys called on non-object');
    //     var ret=[],p;
    //     for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
    //     return ret;
    // }

    for_each_array = function ( that, callback, thisArg ) {
            
            var T, k;
            
            if ( that == null ) {
                throw new TypeError( "that is null or not defined" );
            }
            
            // 1. Let O be the result of calling ToObject passing the |that| value as the argument.
            var O = Object(that);
            
            // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0; // Hack to convert O.length to a UInt32
            
            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if ( {}.toString.call(callback) !== "[object Function]" ) {
                throw new TypeError( callback + " is not a function" );
            }
            
            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if ( thisArg ) {
                T = thisArg;
            }
            
            // 6. Let k be 0
            k = 0;
            
            // 7. Repeat, while k < len
            while( k < len ) {
                
                var kValue;
                
                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if ( Object.prototype.hasOwnProperty.call(O, k) ) {
                    
                    // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                    kValue = O[ k ];
                    
                    // ii. Call the Call internal method of callback with T as the this value and
                    // argument list containing kValue, k, and O.
                    callback.call( T, kValue, k, O );
                }
                // d. Increase k by 1.
                k++;
            }
            // 8. return undefined
    };
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

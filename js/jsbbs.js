(function(){

    window.NOCACHE = (location.toString().indexOf('__nocache__') > 0);
    window.DEBUG = (location.toString().indexOf('__debug__') > 0);

    // global namespace
    var $G = window.$G = {};

    // system function
    _.extend(window, {
        good_alert : function(title, level){
            alert('[' + level + ']' + title);
        },
        good_confirm : function(title, desc){
            confirm(title + '\n' + desc);
        }
    });

    template.helper('prop', function(obj, name){
        return obj[name];
    })

    template.helper('userid', function(){
        return localStorage.userid;
    });

    template.helper('url_for', window.url_for);

    // load lib
    // NOTE : Cannot not call this in a file that maybe be load by load
    $G.loaded_lib = {};
    var templater = {};

    function load(libs, callback){
        var over = 0;
        var exp = {};
        function finish(libname, istpl, src){
            if(istpl){
                templater[libname] = template.compile(src);
            }else{
                window.exports = function(mt){
                    exp[libname] = mt;
                }
                eval(src);
                window.exports = null;
            }
            if(++over >= libs.length){
                callback(exp);
            }
        }
        _.each(libs, function(libname){
            var path, istpl = false, src;
            if(libname.slice(-4) == '.tpl'){
                libname = libname.slice(0, -4);
                istpl = true;
            }
            if(!NOCACHE && (src = localStorage[(istpl ? 'templates/' : 'src/') + libname])){
                console.log('Cached Load: %s', (istpl ? 'templates/' : 'src/') + libname);
                finish(libname, istpl, src);
            }else{
                $.ajax({
                    url : istpl ? ('templates/'+libname+'.tpl') : ('js/' + libname + '.js'),
                    dataType: "text",
                    cache: false,
                    success: function(src){
                        console.log('Load: %s', (istpl ? 'templates/' : 'src/') + libname);
                        localStorage[(istpl ? 'templates/' : 'src/')
                                     + libname] = src;
                        $G.loaded_lib[libname] = true;
                        finish(libname, istpl, src);
                    }
                });
            }
        });
    }
    window.load = load;

    function BaseFrame(){}

    // frame
    BaseFrame.prototype = {
        tpl : function(){ return '<div>'; },
        deps : [],
        load : function(deps){
            return this.exec(function(callback){
                load(deps, callback);
            });
        },
        events : {
        },
        dumpArgs : function(fmt, event){
            var target = this.el.find(event.target);
            var args = {};
            _.each(fmt.split(';'), function(pair){
                var t = pair.shift();
                switch(t){
                case 'F':
                    args[pair] = target.find('[name='+pair+']').val();
                    break;
                case 'D':
                    args[pair] = target.data(pair);
                    break;
                case 'T':
                    args[pair] = target;
                    break;
                };
            });
            return args;
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
                self.seq.shift().call(self, function(){
                    --self.running;
                    self.exec();
                });
            }else if(header === null){
                if(self.running != 0){
                    return this;
                }
                self.seq.shift();
                self.exec();
            }
            return this;
        },
        _loadData : function(args, callback){
            callback(this.data = {});
        },
        loadData : function(args){
            return this.exec(function(callback){
                this._loadData(args, callback);
            });
        },
        buildElement : function(container){
            this.exec(null).exec(function(callback){
                this.el = $(_.isFunction(this.tpl) ?
                            this.tpl() :
                            templater[this.tpl](this.data));
                this._listen_event();
                if(container){
                    $(container).html(this.el);
                }
                callback();
            });
            return this;
        },
        init : function(){},
        bind : function(el){
            return this.exec(null).exec(function(callback){
                this.el = $(el);
                this._listen_event();
                callback();
            });
        }
    }

    var frames = $G.frames = {};
    
    function declare_frame(mixin){
        function Frame(){
            this.data = {};
            this.el = null;
            this.seq = [];
            this.running = 0;
            this.load(this.deps)
        };
        Frame.prototype = new BaseFrame;
        Frame.prototype.constructor = Frame;
        _.extend(Frame.prototype, mixin);
        if(mixin.fname){
            frames[mixin.fname] = Frame;
        }
        return Frame;
    }
    
})();

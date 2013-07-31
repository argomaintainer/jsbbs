define(function(require, exports, module){

    window.localStorage.clear();

    var $ = require('jquery');
    var ko = require('knockout');
    var api = require('bbsapi');
    var format = require('format');
    var vms = {};
    var session = {};

    require('../css/style.css');
    require('../font-awesome/css/font-awesome.min.css');

    window.conf = {
        version : window.SIGNV,
        SITENAME : '逸仙时空'
    };

    var localStorage;
    if(window.localStorage){
        localStorage = window.localStorage;
    }else{
        localStorage = {};
    }

    var url = {
        avatar : function(userid){ return 'http://argo.sysu.edu.cn/avatar/'+userid; },
        user : function(userid){ return '#!/@'+userid; },
        post : function(boardname, postid){ return '#!~'+boardname+'/'+postid;},
        board : function(boardname){ return '#!~'+boardname; },
        profile : function(){ return '#!/profile/'}
    }, k;
    for(k in url){
        if(url.hasOwnProperty(k)){
            window['url_for_'+k] = url[k]
        }
    }
    
    function get_tpl(tplname){
        var key = 'tpl:'+tplname;
        if(!(tplname in localStorage)){
            $.ajax('template/'+tplname+'.html',
                   {
                       dataType: 'text',
                       cache: false,
                       async: false,
                       success: function(data){
                           localStorage[key] = data;
                       }
                   });
        };
        return localStorage[key];
    }

    function before_remote(){
    }

    function after_remote(br){
    }

    var urloffset = (location.protocol + "//" + location.host
                     + "/n/index.html#!").length;

    function async_vm(mm, callback){
        if(!(mm.$name in vms)){
            console.error('No sush ViewModel. /%s/', mm.$name);
            return;
        }
        var vmc = vms[mm.$name];
        vmc.async_init(mm, function(data){
            var dom = $(get_tpl('vm/'+mm.$name));
            console.log(mm.$name, dom[0]);
            var vm = new vmc(data);
            ko.applyBindings(vm, dom[0]);
            dom.data('vm', vm);
            callback(dom);
        });
    }

    function route_go(url){
        var i, m, mm;
        for(i=0; i<routes.length; ++i){
            if(m = url.match(routes[i][0])){
                mm = routes[i][1](m);
                break;
            }
        }
        if(mm){
            var br = before_remote();
            async_vm(mm, function(dom){
                after_remote(br);
                $('#frame').replaceWith(dom);
            });
        }
        else{
            console.error('Wrong Route. /%s/', url);
        }
    }

    function startup(){
        var over = 1;
        var dom1 = null;
        var dom2 = null;
        function check(){
            if(--over<0){
                $('#topbar').replaceWith(dom1);
                $('#wall').replaceWith(dom2);
                url = location.href.substring(urloffset);
                route_go(url);
            }
        }                
        $(function(){
            async_vm({ $name : 'TopbarVM' },
                     function(dom){
                         dom1 = dom;
                         check();                         
                     });
            async_vm({ $name : 'WallVM' },
                     function(dom){
                         dom2 = dom;
                         check();
                     });
        });
    }        

    var single_url = {
        'allboards' : 'AllBoardsVM',
        'admin' : 'AdminVM',
        '' : 'IndexVM'
    };
    
    var routes = [
        [/^~(\w{2,20})\/(\w{2,20})\/?$/, function(match){
            return {
                $name : 'ReadVM',
                boardname : match[1],
                postid : match[2],
                tab : 'r'
            };
        }],
        [/^~(\w{2,20})\/([tpd])\/(\d{2,20})\/?$/, function(match){
            return {
                $name : 'ReadVM',
                boardname : match[1],
                startindex : match[3],
                tab : 'l',
                view : match[2]
            };
        }],
        [/^@(\w{2,20})\/?$/, function(match){
            return {
                $name : 'UserVM',
                userid : match[1]
            };
        }],
        [/^(allboards|admin|)\/?$/, function(match){
            return {
                $name : single_url[match[1]]
            };
        }],
        [/^profile\/(\w{2,20})\/?$/, function(match){
            return {
                $name : 'ProfileVM',
                tab : match[1]
            };
        }],
        [/^mail\/(\w{2,20})\/?$/, function(match){
            return {
                $name : 'MailVM',
                tab : '',
                mailid : match[1]
            };
        }],
        [/^mail\/l\/(\d{2,20})\/?$/, function(match){
            return {
                $name : 'MailVM',
                tab : 'l',
                startindex : match[1]
            };
        }],
    ];

    window.DEBUG = true;
    if(window.DEBUG){
        window.$api = api;
        window.$ = $;
        window._ = function(){
            console.log.apply(console, arguments);
        }
    }
    
    return module.exports = {
        get_tpl : get_tpl,
        route_go : route_go,
        vms : vms,
        session : session,
        startup : startup,
        localStorage : localStorage ,
        json_decode : $.parseJSON,
        format : format.format,
        otime : format.niceTimeWord
    };
        
});                

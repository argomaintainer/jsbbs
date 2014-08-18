if(!window.localStorage){
    location = "choose_modern_browsers.html";
}

$(function(){
    
    if(window.SIGNV != localStorage['site:version']){
	    if(window.localStorage)
		    localStorage.clear();
        localStorage['site:version'] = window.SIGNV;
    }

    var hash = location.hash;
    if(hash && (hash.length > 2)){
        if(hash.substr(0, 2) != '#!'){
            return;
        }
        hash = hash.substr(2);
    }else{
        location.hash = '!home';
    }

    function parse_args(args){
        var t = args.split('?');
        var obj = {};
        if(t[1]){
            _.each(t[1].split('&&'), function(pair){
                pair = pair.split('=');
                obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            });
        }
        t[1] = obj;
        return t;
    }

    var args = parse_args(hash);
    
    load(['handler/' + args[0], 'topbar'],
           function(exp){
               var topbar = new exp.topbar.Topbar;
               window.topbar = topbar;
               var frame = new $G.frames[args[0]];
               topbar.bind('#topbar').init();
               frame.loadData(args[1]).buildElement('#doc');
               $('body').data('page', frame.fname).addClass('page-' + frame.fname);
           });
        
});

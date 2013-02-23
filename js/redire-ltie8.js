var url_map = {
    'board': function(k){
        return '/bbstdoc?board=' + k.boardname;
    },
    'board_i': function(k){
        return '/bbsdoc?board=' + k.boardname;
    },
    'user': function(k){
        return '/bbsqry?userid=' + k.userid;
    },
    'post': function(k){
        return '/bbscon?board=' + k.boardname + '&file=' + k.filename;
    },
    'topic': function(k){
        return '/bbscon?board=' + k.boardname + '&file=' + k.filename;
    },
    '/' : function(k){return '/main.html'}
};

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

function get_location_hash(){
    var loc = '' + location;
    var i = loc.indexOf('#');
    if(i){
        return loc.substring(i);
    }
    else{
        return '';
    }
}

function get_current_hash(){
    var hash = get_location_hash(), t;
    if(hash && (hash.length>2)){
        if(hash.substr(0,2)!='#!'){
            return ['/', {}];
        }
        hash = hash.substr(2);
    }
    else{
        hash = '/';
    }        
    t = hash.split('?');
    t[1] = t[1]?parse_args(t[1]):{};
    return t;
}

var t=get_current_hash();
var url = (t && url_map[t[0]])?url_map[t[0]](t[1]):(url_map['/']());
document.write('为了使您获得更好的使用体验，请使用较新的浏览器浏览本网站...下面即将转回旧版...');
setTimeout(function(){ location = url; }, 2000);
document.close();
window.stop();
exit;

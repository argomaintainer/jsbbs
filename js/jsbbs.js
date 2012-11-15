require_jslib('userbox');
using('jsbbs.userbox');
require_jslib('argo_api');
import_module('argo_api', '$api');
require_jslib('scrollbar');

require_jslib('handler');

$MOD('frame.url_for', {
    'avatar': function(userid){ return '/avatar/' + userid },
    'board': function(boardname){ return '#!board?boardname=' + boardname},
    'board_i': function(index, boardname){
        return '#!board?boardname=' + boardname + '&&index=' + index;
    },
    'user': function(userid){ return '#!user?userid=' + userid},
    'img' : function(path){ return 'img/' + path },
    'post': function(filename, boardname){
        return '#!flow?filename=' + filename + '&&boardname='
            + boardname;
    },
    'topic' : function(filename, boardname){
        return '#!topic?filename=' + filename + '&&boardname=' + boardname;
    },
})
using('frame.url_for', 'url_for_');

$MOD('jsbbs.main', function(){    
    bind_hook('after_boot', refresh_userbox);
})

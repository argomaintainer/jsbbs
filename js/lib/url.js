$MOD('frame.url_for', {
    'avatar': function(userid){ return '/avatar/' + userid },
    'board': function(boardname){ return 'index.html#!board?boardname=' + boardname},
    'board_i': function(index, boardname){
        return 'index.html#!board?view=normal&&boardname=' + boardname + '&&index=' + index;
    },
    'user': function(userid){ return 'index.html#!user?userid=' + userid},
    'img' : function(path){ return 'img/' + path },
    'post': function(filename, boardname){
        return 'index.html#!flow?filename=' + filename + '&&boardname='
            + boardname;
    },
    'topic' : function(filename, boardname){
        return 'index.html#!topic?boardname=' + boardname + '&&filename=' + filename;
    },
    'mailbox': function(index){
        if(index){
            return 'index.html#!mail?index=' + index;
        }
        else{
            return 'index.html#!mail';
        }
    },
    'readmail': function(index){ return 'index.html#!readmail?index=' + index; },
    'page': function(path){ return 'index.html#!page?path=' + path;},
    'root': function(path){ return location.protocol + '//' + location.host + path;},
    'attach': function(boardname, filename){
        return '/attach/' + boardname + '/' + filename;
    },
    'url': function(path){ return DATA_ROOT + '/n/' + path;},
    'admin_board': function(boardname){
        return 'index.html#!admin_board?boardname=' + boardname ;
    },
    'ann': function(reqpath){ return 'ann.html#!read?reqpath=' + reqpath; },
    'index': function(type){ return 'index.html#!home?type=' + type }
    
})

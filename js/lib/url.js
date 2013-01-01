$MOD('frame.url_for', {
    'avatar': function(userid){ return '/avatar/' + userid },
    'board': function(boardname){ return '#!board?boardname=' + boardname},
    'board_i': function(index, boardname){
        return '#!board?view=normal&&boardname=' + boardname + '&&index=' + index;
    },
    'user': function(userid){ return '#!user?userid=' + userid},
    'img' : function(path){ return 'img/' + path },
    'post': function(filename, boardname){
        return '#!flow?filename=' + filename + '&&boardname='
            + boardname;
    },
    'topic' : function(filename, boardname){
        return '#!topic?boardname=' + boardname + '&&filename=' + filename;
    },
    'mailbox': function(index){
        if(index){
            return '#!mail?index=' + index;
        }
        else{
            return '#!mail';
        }
    },
    'readmail': function(index){ return '#!readmail?index=' + index; },
    'page': function(path){ return '#!page?path=' + path;},
    'root': function(path){ return location.origin + path;},
    'attach': function(boardname, filename){
        return '/attach/' + boardname + '/' + filename;
    },
    'url': function(path){ return DATA_ROOT + '/n/index.html' + path;},
    'admin_board': function(boardname){
        return '#!admin_board?boardname=' + boardname ;
    }
})

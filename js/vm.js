define(function(require, exports, module){
    
    var lib = require('lib');
    var vms = lib.vms;
    var session = lib.session;
    var api = require('bbsapi');
    var ko = require('knockout');
    var localStorage = lib.localStorage;
    require('../data');

    session.udata = null;
    function resolve_user(){
        var lastupdate = Number(new Date());
        // // DEBUG
        // if(lastupdate < localStorage['lastupdate:udata'] + 300000){
        //     return lib.json_decode(localStorage['cache:udate:data']);
        // }
        // localStorage['lastupdate:udata'] = lastupdate;
        // //
        var data = api.get_self_info_aync();
        if(data.success){
            session.udata = data.data;
        }else{
            session.udata = false;
        }
        // DEBUG
        // localStorage['cache:udate:data'] = session.udata;
        //
        return session.udata;
    }

    function TopbarVM(data){
        this.udata = ko.observable(data.udata);
        this.tab = ko.observable(data.tab);
        this.unread = ko.observable(data.unread);
    };
    TopbarVM.async_init = function(mm, callback){
        var ret = {};
        resolve_user();
        callback({
            udata : session.udata,
            tab : '',
            unread : 0
        });
    };
    vms.TopbarVM = TopbarVM;

    function WallVM(data){
        this.poster = ko.observable("images/heyepigu.png");
        // this.message = ko.observable(false);
        this.message = ko.observable('[10.10号逸仙时空招新，欢迎你来]');
        this.url = ko.observable('1.png');
    }

    WallVM.async_init = function(mm, callback){
        callback({});
    }

    vms.WallVM = WallVM;

    function IndexVM(data){
        this.udata = ko.observable(session.udata);
        this.myinfo = ko.observable(data.myinfo);
        this.hotman = ko.observableArray(data.hotman);
        this.fav = ko.observableArray(data.fav);
        this.newpost = ko.observableArray(data.newpost);
        this.topten = ko.observableArray(data.topten);
        this.goodpost = ko.observableArray(data.goodpost);
        this.userid = ko.computed(function(){
            return session.udata.userid;
        });
        this.postnum = ko.observable(10);
        this.favnum = ko.observable(10);
        this.votenum = ko.observable(10);
        this.unread = ko.observable(0);
    };

    IndexVM.async_init = function(mm, callback){
        INDEXVM_EG.myinfo.udata = session.udata;
        callback(INDEXVM_EG);
    }

    vms.IndexVM = IndexVM;

    function ReadVM(data){
        var self = this;
        /* sidebar */
        this.udata = session.udata;
        this.userid = ko.observable(session.udata.userid);
        this.bookmarks = ko.observableArray(data.bookmarks);
        this.bk_open = ko.observableArray(data.bk_open);
        this.bk_cursor = ko.observable(data.bk_cursor || '');
        this.readed = ko.observable({});
        /* content tab */
        this.tab = ko.observable(data.tab);
        /* for board */
        this.board = ko.observable(data.board);
        this.boardname = ko.computed(function(){
            return self.board().filename;
        });
        this.board_view = ko.observable(data.board_view);
        /* Topic View */
        this.board_tlist = ko.observableArray(data.board_tlist);
        this.board_tstart = ko.observable(data.board_tstart);
        /* Post View */
        this.board_plist = ko.observableArray(data.board_plist);
        this.board_plist_ord = ko.computed(function(){
            var d = {}, v=[], i, rp = self.board_plist(), it;
            for(i=0; i<rp.length; ++i){
                it = rp[i];
                if(!(it.id in d)){
                    d[it.id] = v.length;
                    v.push([]);
                }
                v[d[it.id]].push(it);
            }
            return v;
        });
            
        this.board_pstart = ko.observable(data.board_pstart);
        /* Digest View */
        this.board_dlist = ko.observableArray(data.board_dlist);
        this.board_dstart = ko.observable(data.board_dstart);
        /* for read */
        this.posts = ko.observableArray(data.posts);
    }

    ReadVM.prototype.open_board = function(boardname){
        var self = this;
        api.get_board_info(boardname, function(data){
            var d = data.data;
            if(d.seccode != self.bk_cursor()){
                api.get_boards_by_section(d.seccode, function(data){
                    self.bk_cursor(d.seccode);
                    self.bk_open(data.data);
                });
            }
            self.board(d);
        });
    }

    ReadVM.prototype.open_section = function(sid){
        var self = this;
        if(sid != self.bk_cursor()){
            api.get_boards_by_section(sid, function(data){
                self.bk_cursor(sid);
                self.bk_open(data.data);
            });
        }
    }

    ReadVM.prototype.bookboard = function(){};

    ReadVM.prototype.newpost = function(){};

    ReadVM.prototype.clearunread = function(){};

    ReadVM.prototype.settopicview = function(){
        var self = this;
        api.get_postindex(self.boardname(), 'topic', self.board_dstart,
                          function(data){
                              self.board_tlist(data.data);
                              self.board_tstart(self.board_tstart() + 20);
                              self.board_view('t');
                          });
    };

    ReadVM.prototype.setnormalview = function(){
        var self = this;
        api.get_postindex(self.boardname(), 'normal', self.board_dstart,
                          function(data){
                              self.board_plist(data.data);
                              console.log(data.data);
                              self.board_pstart(self.board_pstart() + 20);
                              self.board_view('p');
                          });
    };

    ReadVM.prototype.setdigestview = function(){
        var self = this;
        api.get_postindex(self.boardname(), 'digest', self.board_dstart,
                          function(data){
                              self.board_dlist(data.data);
                              self.board_dstart(self.board_dstart() + 20);
                              self.board_view('d');
                          });
    };

    ReadVM.async_init = function(mm, callback){
        var over = 2;
        var ret = {};
        function check(){
            if(--over <= 0) callback(ret);
        }
        ret.tab = mm.tab;
        api.get_board_info(mm.boardname, function(data){
            ret.board = data.data;
            ret.bk_cursor = ret.board.seccode;
            api.get_boards_by_section(ret.bk_cursor, function(data){
                ret.bk_open = data.data;
                check();
            });
        });
        ret.board_view = mm.view;
        if(mm.view == 't'){
            ++over;
            ret.board_tstart = mm.startindex;
            api.get_postindex(mm.boardname, 'topic', mm.startindex,
                              function(data){
                                  ret.board_tlist = data.data;
                                  check();
                              });
        }
        api.get_section(function(data){
            ret.bookmarks = data.data;
            check();
        });
    }

    vms.ReadVM = ReadVM;
    
});

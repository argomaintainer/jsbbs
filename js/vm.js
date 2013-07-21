define(function(require, exports, module){
    
    var lib = require('lib');
    var vms = lib.vms;
    var session = lib.session;
    var api = require('bbsapi');
    var ko = require('knockout');

    session.udata = null;
    function resolve_user(){
        var data = api.get_self_info_aync();
        if(data.success){
            session.udata = data.data;
        }else{
            session.udata = false;
        }
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

    function IndexVM(data){
        this.myinfo = ko.observable(data.myinfo);
        this.hotman = ko.observableArray(data.hotman);
        this.fav = ko.observableArray(data.fav);
        this.newpost = ko.observableArray(data.newpost);
        this.topten = ko.observableArray(data.topten);
        this.goodpost = ko.observableArray(data.goodpost);
    };
    IndexVM.async_init = function(mm, callback){
        var ret = {};
        ret.myinfo = {
            'udata' : session.udata,
            'postnum' : 10,
            'votenum' : 7,
            'favnum' : 18,
            'unread' : 0
        };
        ret.hotman = [
            ['liuzhipeng', 100, 20],
            ['LTaoist', 80, 190],
            ['yaoyao', 75, 99],
            ['Jasison', 64, 99],
            ['LoL', 51, 34],
        ];
        ret.fav = [
            {
                boardname : 'ClassMusic',
                title : '古典音乐',
                BM : ['chenbt'],
                newest : ['写给ClassMusic', 201122334],
            },
            {
                boardname : 'Programming',
                title : '编程技巧',
                BM : ['gcc', 'TigerSoldier'],
                newest : ['第一天准备开始干活！', 201122334],
            },
            {
                boardname : 'Game',
                title : '电脑游戏乐园',
                BM : ['lyj'],
                newest : ['一将成名', 201122334],
            },
        ];
        ret.newpost = [];
        ret.topten = [];
        ret.goodpost = [];
        callback(ret);
    }
    vms.IndexVM = IndexVM;
    
});

define(function(require, exports, module){
    
    var lib = require('lib');
    var vms = lib.vms;
    var session = lib.session;
    var api = require('bbsapi');
    var ko = require('knockout');
    var localStorage = lib.localStorage;

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
                newest : ['写给ClassMusic', 'm2', 201122334],
            },
            {
                boardname : 'Programming',
                title : '编程技巧',
                BM : ['gcc', 'TigerSoldier'],
                newest : ['第一天准备开始干活！', '1', 201122334],
            },
            {
                boardname : 'Game',
                title : '电脑游戏乐园',
                BM : ['lyj'],
                newest : ['一将成名', 'm4', 201122334],
            },
        ];
        ret.newpost = [
            {
                postid : '1',
                title : '有木有人看了小时代的，觉得怎样呢？',
                votenum : 3,
                board : 'BBS_Help',
                boardtitle : 'BBS求助',
                author : 'liuzhipeng',
                posttime : '222220001'
            },
            {
                postid : '2',
                title : '工学院交通工程学科',
                votenum : 13,
                board : 'gongxueyuan',
                boardtitle : '工学院',
                author : 'zhaoer',
                posttime : '23322220001'
            },
            {
                postid : '3',
                title : '南沙区机关招聘雇员数名',
                votenum : 3,
                board : 'job',
                boardtitle : '人才市场',
                author : 'Jedediah',
                posttime : '422220001'
            },                
        ];
        ret.newpost.push.apply(ret.newpost, ret.newpost);
        ret.newpost.push.apply(ret.newpost, ret.newpost);
        ret.topten = [
            {
                postid : '14',
                title : '在深圳的家庭支出',
                votenum : 14,
                board : 'Employee',
                boardtitle : '上班一族',
                author : 'Jedediah',
                posttime : '422220001'
            },                
            {
                postid : '14',
                title : '其实最烦的是午休敲键盘点鼠标的声音',
                votenum : 14,
                board : 'Say',
                boardtitle : '不吐不快',
                author : 'Jedediah',
                posttime : '222220001'
            },                
            {
                postid : '19',
                title : '矛盾',
                votenum : 30,
                board : 'Joke',
                boardtitle : '每天笑一笑',
                author : 'z',
                posttime : '422220001'
            },                
            {
                postid : '17',
                title : '搬凳子',
                votenum : 19,
                board : 'ACMICPC',
                boardtitle : '国际大学生程序设计竞赛',
                author : 'Jedediah',
                posttime : '422220001'
            },                                
        ];
        ret.goodpost = [
            {
                postid : '17',
                title : 'Travel版一年一度活动之夜游--鬼故事专场',
                votenum : 17,
                board : 'Employee',
                boardtitle : '上班一族',
                author : 'cloudykumo',
                posttime : '422220001',
                summary : '前言 本来是每年6月才会举办的Travel年度节目夜游，由于各种各样的关系不得已才推到了7月份虽然6月份发过贴子可惜人数不够而流产……'
            },
            {
                postid : '17',
                title : 'IT民工男的CS课程记忆',
                votenum : 23,
                board : 'Employee',
                boardtitle : '上班一族',
                author : 'kyhpudding',
                posttime : '422220001',
                summary : '先介绍下自己，03CS 本科在某更懂中文的地方混了两年多，做社区产品，后来做基础平台，带项目带新人前端到后端应用到底层跟各部分死磕无处不折腾……'
            },
            {
                postid : '17',
                title : 'IT民工男的CS课程记忆',
                votenum : 23,
                board : 'Employee',
                boardtitle : '上班一族',
                author : 'kyhpudding',
                posttime : '422220001',
                summary : '先介绍下自己，03CS 本科在某更懂中文的地方混了两年多，做社区产品，后来做基础平台，带项目带新人前端到后端应用到底层跟各部分死磕无处不折腾……'
            },
        ];
        callback(ret);
    }
    vms.IndexVM = IndexVM;
    
});

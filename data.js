ERROR = {
    101: '服务器发生错误',
    102: '服务器生错误',
    103: '服务器生错误',
    201: '没有该讨论区，请确认讨论区的名称正确',
    202: '没有该讨论区，请确认讨论区的名称正确',
    301: '请先登录再进行此操作',
    302: '两次输入密码不一致，请确认密码与确认密码一致',
    303: '非法的id，请换用其他id',
    304: '该id已被注册，请换用其他id',
    305: '性别只能选择男(Male)或者女(Female)',
    306: '服务器发生错误，注册失败',
    307: '该用户不存在，请检查用户id是否正确',
    308: '错误的用户名或者密码，登录失败',
    309: '服务器发生错误，注销登录失败',
    310: '添加的好友id不能为空',
    311: '这个id已经是你的好友咯',
    312: '好友数超过上限了',
    314: '收藏夹为空，请添加版块到收藏夹',
    315: '服务器发生错误，收藏版块失败',
    315: '服务器发生错误，取消收藏版块失败',
    320: '服务器发生错误，更新用户信息失败',
    321: '服务器发生错误，更新个人说明失败',
    322: '服务器发生错误，更新签名档失败',
    323: '服务器发生错误，上传头像失败',
    324: '头像只支持jpg格式，十分抱歉',
    325: '服务器发生错误，保存头像失败',
    326: 'id已经激活，无需再次验证',
    401: '错误的讨论区',
    402: '错误的讨论区或您没有执行该操作的权限',
    402: '错误的讨论区或您没有执行该操作的权限',
    405: '系统维护期，外网禁止发文',
    501: '没有该帖子',
    503: '没有该帖子',
    504: '没有该帖子',
    505: '没有该帖子',
    506: '回帖过于频繁，喝口水歇歇～',
    507: '此帖不可回复～',
    508: '上传附件失败',
    509: '服务器发生错误，发帖失败',
    510: '服务器发生错误，删贴失败',
    601: '没有该邮件',
    602: '收件人邮箱已经满了，发信失败',
    603: '错误的收件人或服务器发生错误，发送邮件失败',
    604: '错误的收件人或服务器发生错误，删除邮件失败'
}

DATA_ROOT = 'http://argo.sysu.edu.cn';
DATA_ADMIN = 'jmf';

(function(){
    var ret = {};
    ret.myinfo = {
        // 'udata' : session.udata,
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
    window.INDEXVM_EG = ret;
})();

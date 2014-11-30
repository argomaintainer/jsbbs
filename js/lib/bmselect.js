    var oClass = document.getElementById('bmClass');
    var oPage = document.getElementById('bmPage');
    var aClass = [];
    aClass[0] = ['BBS系统'];
    aClass[1] = ['校园社团'];
    aClass[2] = ['院系交流'];
    aClass[3] = ['电脑科技'];
    aClass[4] = ['休闲娱乐'];
    aClass[5] = ['文化艺术'];
    aClass[6] = ['学术科学'];
    aClass[7] = ['谈天说地'];
    aClass[8] = ['社会信息'];
    aClass[9] = ['体育健身'];
    
    var aPage = [];
    aPage[0] = ['BBS系统', '站长公告SYSOP', '版主专栏BoardManager', '投票选举vote', '系统管理大家谈Suggest', 'BBS注册使用帮助BBS_Help', '看版管理专栏BoardManagement', '投诉与申诉Complain', '系统错误报告BugReport', '奖惩布告栏announce', '竞选版主New_boardmanager', '周年庆典Celebration', '站务选举Selection', '站规讨论Rules', '酸甜苦辣留言板notepad', 'BBS激活发帖测试BBS_Test', '站衫版ArgoShirt', '新生宣传专版Welcome'];
    aPage[1] = ['校园社团', '中大特快SYSU_Info', '网络建设Network', '明珠海聚ZhuhaiCampus', '杏林风采SUMS', '东校区EastCampus', '一区管理中心1ZoneCentre', '爱心公益Public_Welfare', '海报墙posterwall'];
    aPage[2] = ['院系交流', '法学院Law', '电子与通信工程系EE', '计算机系CS', '岭南学院 LingNan', '管理学院Management', '理工学院PE', '数计学院MC', '化学与化学工程学院CE', '人文学院HS', '生科院LS', '政治与公共事务管理学院GS', '研究生院Postgraduate', '外国语学院FLS', '资讯管理学院IM', '软件学院SS', '地环学院ES', '药学院PS', '教育学院GES', '工学院SE', '二区管理中心2ZoneCentre', '传播与设计学院CD', '国际商学院IBS', '翻译学院STI', '社会学与人类学学院SSA'];
    aPage[3] = ['电脑科技', '编程技巧Programming', '网络技术Internet', '软件特区Software', '电脑游戏乐园Game', 'Visual系列Visual', '图形世界/3DGraphics_3D', '硬件点滴Hardware', '有问有答Problem', '视窗世界Windows', '大家来玩MUDMUD', '电脑病毒Virus', 'Coolest UnixLinux', '网络对战Netgame', 'CISCO网络技术CISCO', '网络资源NetShare', 'Java天地Java', '程序设计竞赛ACMICPC', '三区管理中心3ZoneCentre'];
    aPage[4] = ['休闲娱乐', '环球影视Film', '流行音乐Pop', '科学边缘marvel', '大江南北Travel', '饮食文化Food', '娱乐动态Play', '动漫天地Cartoon', '电台之声Radio', '每日笑一笑Joke', '煮酒论英雄emprise', '星座物语Astrology', '风驰电掣Automobile', '流行时尚Style', '脑力大比拼IQ', '摇滚天堂RnR', '玩转手机Mobile', '爵士伊甸Jazz', '光与影photography', '电视TV', '奇幻天地Fantasy', '数码世界Digital', '四区管理中心4ZoneCentre'];
    aPage[5] = ['文化艺术', '古典音乐ClassicMusic', '琴棋书画Chinese_Art', '逸仙书路Story', '诗词歌赋Poem', '我是谁？ID', '中大网友文摘Personal_corpus', '乐韵声平Instrument', '品书论艺Reading', '故事接龙SerialStory', 'BBS风景区ASCIIArt', '人物论坛Character', '贴图版Pictures', '五区管理中心5ZoneCentre', '神话传说Myth', '侦探推理Detective', '粤文化Cantonese', '站内原创推荐Recommend'];
    aPage[6] = ['学术科学', '天文地理Science', '古今军事Force', '千言万语Language', '经济论坛Economics', '心理学Psychology', '历史风云History', '生物科学Biology', '神思Philosophy', '社会风Sociology', '数学乐园mathematics', '人之初Sexology', '物理学Physics', '六区管理中心6ZoneCentre', '讲座专栏Lecture'];
    aPage[7] = ['谈天说地', '你心我心Heart', '不吐不快Say', '人生百味Life', '网内存知己Friend', '男孩子Boys', '女孩子Girls', '爱是我们的责任Love', '今天你过得好吗Diary', '时光流转Memory', '深情祝福Wishes', '不老的传说graduates', '爱我中华China', '单身贵族Single', '你一瓢来我一瓢water', '相聚一刻Gather', '上班一族Employee', '七区管理中心7ZoneCentre', '相约逸仙ArgoBridge', '逸仙时空圣诞嘉联华argochristmas'];
    aPage[8] = ['社会信息', '跳蚤市场Sale', '人才市场Job', '寻人寻物求租Search', '出国深造Abroad', '今日世界News', '考研之路Kaoyan', '股海风云Stock', '绿色情愫Green_Earth', '电脑市场PCMarket', '兼职信息PartTime', '八区管理中心8ZoneCentre', '公务员版Official', '商业代理Agent'];
    aPage[9] = ['体育健身', '健美健身Keepfit', '体育运动Sports', '绿茵纵横FootBall', '篮球世界Basketball', '羽毛球Badminton', '排球Volleyball', '乒乓球Pingpong', '网球天地Tennis', '碧波水漾Swimming', '户外极限XOutDoor', '中华武术Martialarts', '九区管理中心9ZoneCentre', '奥运频道London2012'];

    for(var key in aClass) {
      var classOption = document.createElement('option');
      classOption.value = classOption.text = aClass[key];
      oClass.options.add(classOption);
    }
    
    function showChild(current, child, childArr) {
      var currentValue = current.value;
      var count = childArr.length;
      child.length = 1;
      for(var i = 0; i < count; i++) {
        if(currentValue == childArr[i][0]) {
            for(var j = 1; j < childArr[i].length; j++) {
                var childOption = document.createElement('option');
                childOption.value = childOption.text = childArr[i][j];
                child.options.add(childOption); 
            }
        }
      }
    }
    
    oClass.onchange = function() {
      showChild(oClass, oPage, aPage);
    }

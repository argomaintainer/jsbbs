$(document).ready(function() {
	var brief = [
	{ code: "BBS系统", name: "站长公告",help:"SYSOP"},
    { code: "BBS系统", name: "版主专栏",help:"BoardManager"},
    { code: "BBS系统", name: "投票选举",help:"vote"},
    { code: "BBS系统", name: "系统管理大家谈",help:"Suggest"},
    { code: "BBS系统", name: "BBS注册使用帮助",help:"BBS_Help"},
    { code: "BBS系统", name: "看版管理专栏",help:"BoardManagement"},
    { code: "BBS系统", name: "投诉与申诉",help:"Complain"},
    { code: "BBS系统", name: "系统错误报告",help:"BugReport"},
    { code: "BBS系统", name: "奖惩布告栏",help:"announce"},
    { code: "BBS系统", name: "竞选版主",help:"New_boardmanager"},
    { code: "BBS系统", name: "周年庆典",help:"Celebration"},
    { code: "BBS系统", name: "站务选举",help:"Selection"},
    { code: "BBS系统", name: "站规讨论",help:"Rules"},
    { code: "BBS系统", name: "酸甜苦辣留言板",help:"notepad"},
    { code: "BBS系统", name: "BBS激活发帖测试",help:"BBS_Test"},
    { code: "BBS系统", name: "站衫版",help:"ArgoShirt"},
    { code: "BBS系统", name: "新生宣传专版",help:"Welcome"},

    { code: "校园社团", name: "中大特快",help:"SYSU_Info"},
    { code: "校园社团", name: "网络建设",help:"Network"},
    { code: "校园社团", name: "明珠海聚",help:"ZhuhaiCampus"},
    { code: "校园社团", name: "杏林风采",help:"SUMS"},
    { code: "校园社团", name: "东校区",help:"EastCampus"},
    { code: "校园社团", name: "一区管理中心",help:"1ZoneCentre"},
    { code: "校园社团", name: "新生交流",help:"Freshmen"},
    { code: "校园社团", name: "爱心公益",help:"Public_Welfare"},
    { code: "校园社团", name: "海报墙",help:"posterwall"},

    { code: "院系交流", name: "法学院",help:"Law"},
    { code: "院系交流", name: "电子与通信工程系",help:"EE"},
    { code: "院系交流", name: "计算机系",help:"CS"},
    { code: "院系交流", name: "岭南学院 ",help:"LingNan"},
    { code: "院系交流", name: "管理学院",help:"Management"},
    { code: "院系交流", name: "理工学院",help:"PE"},
    { code: "院系交流", name: "数计学院",help:"MC"},
    { code: "院系交流", name: "化学与化学工程学院",help:"CE"},
    { code: "院系交流", name: "人文学院",help:"HS"},
    { code: "院系交流", name: "生科院",help:"LS"},
    { code: "院系交流", name: "政治与公共事务管理学院",help:"GS"},
    { code: "院系交流", name: "研究生院",help:"Postgraduate"},
    { code: "院系交流", name: "外国语学院",help:"FLS"},
    { code: "院系交流", name: "资讯管理学院",help:"IM"},
    { code: "院系交流", name: "软件学院",help:"SS"},
    { code: "院系交流", name: "地环学院",help:"ES"},
    { code: "院系交流", name: "药学院",help:"PS"},
    { code: "院系交流", name: "教育学院",help:"GES"},
    { code: "院系交流", name: "工学院",help:"SE"},
    { code: "院系交流", name: "二区管理中心",help:"2ZoneCentre"},
    { code: "院系交流", name: "传播与设计学院",help:"CD"},
    { code: "院系交流", name: "国际商学院",help:"IBS"},
    { code: "院系交流", name: "翻译学院",help:"STI"},
    { code: "院系交流", name: "社会学与人类学学院",help:"SSA"},

    { code: "电脑技巧", name: "编程技巧",help:"Programming"},
    { code: "电脑技巧", name: "网络技术",help:"Internet"},
    { code: "电脑技巧", name: "软件特区",help:"Software"},
    { code: "电脑技巧", name: "电脑游戏乐园",help:"Game"},
    { code: "电脑技巧", name: "Visual系列",help:"Visual"},
    { code: "电脑技巧", name: "图形世界/3D",help:"Graphics_3D"},
    { code: "电脑技巧", name: "硬件点滴",help:"Hardware"},
    { code: "电脑技巧", name: "有问有答",help:"Problem"},
    { code: "电脑技巧", name: "视窗世界",help:"Windows"},
    { code: "电脑技巧", name: "大家来玩MUD",help:"MUD"},
    { code: "电脑技巧", name: "电脑病毒",help:"Virus"},
    { code: "电脑技巧", name: "Coolest Unix",help:"Linux"},
    { code: "电脑技巧", name: "网络对战",help:"Netgame"},
    { code: "电脑技巧", name: "CISCO网络技术",help:"CISCO"},
    { code: "电脑技巧", name: "网络资源",help:"NetShare"},
    { code: "电脑技巧", name: "Java天地",help:"Java"},
    { code: "电脑技巧", name: "程序设计竞赛",help:"ACMICPC"},
    { code: "电脑技巧", name: "三区管理中心",help:"3ZoneCentre"},

    { code: "休闲娱乐", name: "环球影视",help:"Film"},
    { code: "休闲娱乐", name: "流行音乐",help:"Pop"},
    { code: "休闲娱乐", name: "科学边缘",help:"marvel"},
    { code: "休闲娱乐", name: "大江南北",help:"Travel"},
    { code: "休闲娱乐", name: "饮食文化",help:"Food"},
    { code: "休闲娱乐", name: "娱乐动态",help:"Play"},
    { code: "休闲娱乐", name: "动漫天地",help:"Cartoon"},
    { code: "休闲娱乐", name: "电台之声",help:"Radio"},
    { code: "休闲娱乐", name: "每日笑一笑",help:"Joke"},
    { code: "休闲娱乐", name: "煮酒论英雄",help:"emprise"},
    { code: "休闲娱乐", name: "星座物语",help:"Astrology"},
    { code: "休闲娱乐", name: "风驰电掣",help:"Automobile"},
    { code: "休闲娱乐", name: "流行时尚",help:"Style"},
    { code: "休闲娱乐", name: "脑力大比拼",help:"IQ"},
    { code: "休闲娱乐", name: "摇滚天堂",help:"RnR"},
    { code: "休闲娱乐", name: "玩转手机",help:"Mobile"},
    { code: "休闲娱乐", name: "爵士伊甸",help:"Jazz"},
    { code: "休闲娱乐", name: "光与影",help:"photography"},
    { code: "休闲娱乐", name: "电视",help:"TV"},
    { code: "休闲娱乐", name: "奇幻天地",help:"Fantasy"},
    { code: "休闲娱乐", name: "数码世界",help:"Digital"},
    { code: "休闲娱乐", name: "四区管理中心",help:"4ZoneCentre"},

    { code: "文化艺术", name: "古典音乐",help:"ClassicMusic"},
    { code: "文化艺术", name: "琴棋书画",help:"Chinese_Art"},
    { code: "文化艺术", name: "逸仙书路",help:"Story"},
    { code: "文化艺术", name: "诗词歌赋",help:"Poem"},
    { code: "文化艺术", name: "我是谁？",help:"ID"},
    { code: "文化艺术", name: "中大网友文摘",help:"Personal_corpus"},
    { code: "文化艺术", name: "乐韵声平",help:"Instrument"},
    { code: "文化艺术", name: "品书论艺",help:"Reading"},
    { code: "文化艺术", name: "故事接龙",help:"SerialStory"},
    { code: "文化艺术", name: "BBS风景区",help:"ASCIIArt"},
    { code: "文化艺术", name: "人物论坛",help:"Character"},
    { code: "文化艺术", name: "贴图版",help:"Pictures"},
    { code: "文化艺术", name: "五区管理中心",help:"5ZoneCentre"},
    { code: "文化艺术", name: "神话传说",help:"Myth"},
    { code: "文化艺术", name: "侦探推理",help:"Detective"},
    { code: "文化艺术", name: "粤文化",help:"Cantonese"},
    { code: "文化艺术", name: "站内原创推荐",help:"Recommend"},


    { code: "学术科学", name: "天文地理",help:"Science"},
    { code: "学术科学", name: "古今军事",help:"Force"},
    { code: "学术科学", name: "千言万语",help:"Language"},
    { code: "学术科学", name: "经济论坛",help:"Economics"},
    { code: "学术科学", name: "心理学",help:"Psychology"},
    { code: "学术科学", name: "历史风云",help:"History"},
    { code: "学术科学", name: "生物科学",help:"Biology"},
    { code: "学术科学", name: "神思",help:"Philosophy"},
    { code: "学术科学", name: "社会风",help:"Sociology"},
    { code: "学术科学", name: "数学乐园",help:"mathematics"},
    { code: "学术科学", name: "人之初",help:"Sexology"},
    { code: "学术科学", name: "物理学",help:"Physics"},
    { code: "学术科学", name: "六区管理中心",help:"6ZoneCentre"},
    { code: "学术科学", name: "讲座专栏",help:"Lecture"}, 

    { code: "谈天说地", name: "你心我心",help:"Heart"},
    { code: "谈天说地", name: "不吐不快",help:"Say"},
    { code: "谈天说地", name: "人生百味",help:"Life"},
    { code: "谈天说地", name: "网内存知己",help:"Friend"},
    { code: "谈天说地", name: "男孩子",help:"Boys"},
    { code: "谈天说地", name: "女孩子",help:"Girls"},
    { code: "谈天说地", name: "爱是我们的责任",help:"Love"},
    { code: "谈天说地", name: "今天你过得好吗",help:"Diary"},
    { code: "谈天说地", name: "时光流转",help:"Memory"},
    { code: "谈天说地", name: "深情祝福",help:"Wishes"},
    { code: "谈天说地", name: "不老的传说",help:"graduates"},
    { code: "谈天说地", name: "爱我中华",help:"China"},
    { code: "谈天说地", name: "单身贵族",help:"Single"},
    { code: "谈天说地", name: "你一瓢来我一瓢",help:"water"},
    { code: "谈天说地", name: "相聚一刻",help:"Gather"},
    { code: "谈天说地", name: "上班一族",help:"Employee"},
    { code: "谈天说地", name: "七区管理中心",help:"7ZoneCentre"},
    { code: "谈天说地", name: "相约逸仙",help:"ArgoBridge"},
    { code: "谈天说地", name: "逸仙时空圣诞嘉联华",help:"argochristmas"},

    { code: "社会信息", name: "跳蚤市场",help:"Sale"},
    { code: "社会信息", name: "人才市场",help:"Job"},
    { code: "社会信息", name: "寻人寻物求租",help:"Search"},
    { code: "社会信息", name: "出国深造",help:"Abroad"},
    { code: "社会信息", name: "今日世界",help:"News"},
    { code: "社会信息", name: "考研之路",help:"Kaoyan"},
    { code: "社会信息", name: "股海风云",help:"Stock"},
    { code: "社会信息", name: "绿色情愫",help:"Green_Earth"},
    { code: "社会信息", name: "电脑市场",help:"PCMarket"},
    { code: "社会信息", name: "兼职信息",help:"PartTime"},
    { code: "社会信息", name: "八区管理中心",help:"8ZoneCentre"},
    { code: "社会信息", name: "公务员版",help:"Official"},
    { code: "社会信息", name: "商业代理",help:"Agent"},

    { code: "体育健身", name: "健美健身",help:"Keepfit"},
    { code: "体育健身", name: "体育运动",help:"Sports"},
    { code: "体育健身", name: "绿茵纵横",help:"FootBall"},
    { code: "体育健身", name: "篮球世界",help:"Basketball"},
    { code: "体育健身", name: "羽毛球",help:"Badminton"},
    { code: "体育健身", name: "排球",help:"Volleyball"},
    { code: "体育健身", name: "乒乓球",help:"Pingpong"},
    { code: "体育健身", name: "网球天地",help:"Tennis"},
    { code: "体育健身", name: "碧波水漾",help:"Swimming"},
    { code: "体育健身", name: "户外极限",help:"XOutDoor"},
    { code: "体育健身", name: "中华武术",help:"Martialarts"},
    { code: "体育健身", name: "九区管理中心",help:"9ZoneCentre"},
    { code: "体育健身", name: "奥运频道",help:"London2012"}	
	];
	//提示自动补齐
	$(".home_input_search").achieve(brief, {
		left: -1,
		top: 5,
		width:218,
		formatItem: function(row) {
			return row.name;
		},
		formatMatch2: function(row) {
			return row.code + row.name + row.help;
		},
		formatResult: function(itemData, input, i) {
			var cIndex = input.attr('index');
			$('#home_input_search' + cIndex).val(itemData[i].name);
		}
	});
		
});
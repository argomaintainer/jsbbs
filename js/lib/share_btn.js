$MOD('share_btn', function(){


    var Sharetor = {
        'sina': function(url, title){
            return "http://service.t.sina.com.cn/share/share.php?url=" +
                url + "&title=" + title + "&pic=&appkey=481646317&ralateUid=";
        },
        'renren': function(url, title){
            return "http://www.connect.renren.com/share/sharer?url=" +
                url + '&title=' + title;
        },
        'qq': function(url, title){
            return 'http://v.t.qq.com/share/share.php?url=' + url
                + '&title=' + title + '&appkey=e1f12b035c4245e1b3da9a9841c17fe1&site=http://bbs.sysu.edu.cn/';
        },
        'douban': function(url, title){
            return 'http://www.douban.com/recommend/?url='+url+'&title='+title+'';
        }
    };

    function share_window(url, title, type){
        window.open(Sharetor[type](encodeURIComponent(url),
                                   encodeURIComponent(title)), '_blank',
                    'width=640,height=480');
    };

    return {
        share_window: share_window
    };

});

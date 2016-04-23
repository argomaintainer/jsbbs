$MOD('argo_api', function(){

    function get_nc( url, data, callback, type ) {
        // ajax get no cache
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: 'get',
			url: url,
			data: data,
			success: callback,
            cache: false,
			dataType: type
		});
	}

    function get_nc_sync( url, data, callback, type ) {
        // ajax get no cache
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}
        var coll;
		jQuery.ajax({
			type: 'get',
			url: url,
			data: data,
			success: function(data){
                coll = data;
            },                
            cache: false,
            async: false,
			dataType: type
		});
        return coll;
	}

    function ajax_getor_nopara(url){
        return function(callback){
            get_nc(url, function(data){
                cache[url] = data;
                callback(data);
            });
        }
    }

    function get_local_num(key){
        var num = + localStorage[key];
        if(isNaN(num)){
            num = 0;
        }
        return num;
    }

    function cache_ajax(Configor, key, ajax, callback){
        var canUse = true;
        key = 'cache::' + key;
        if(Configor.tc){
            var nc = Math.floor(+ new Date / 1000);
            if(nc > (get_local_num('tc_' + key) + Configor.tc)){
                canUse = false;
            }
        }
        if(Configor.hc){
            var nc = get_local_num('counter::home');
            if(nc > (get_local_num('hc_' + key) + Configor.hc)){
                canUse = false;
            }
        }
        if(Configor.kc){
            var nc = get_local_num('kc_' + key) - 1;
            localStorage['kc_' + key] = nc;
            if(nc < 0){
                canUse = false;
            }
        }
        if(Configor.cc){
            var nc = get_local_num('counter::cross');
            if(nc > (get_local_num('cc_' + key) + Configor.cc)){
                canUse = false;
            }
        }
        if(canUse && localStorage[key]){
            callback(JSON.parse(localStorage[key]));
            return;
        }

        var bgRet = Configor.bg && localStorage[key];
        if(bgRet && Configor.bgi){
            var nc = Math.floor(+ new Date / 1000);
            if(nc > (get_local_num('tc_' + key) + Configor.bgi)){
                bgRet = false;
            }
        }
            
        jQuery.ajax({
            method : ajax.method,
            url : ajax.url,
            data : ajax.data,
            dataType : ajax.dataType,
            success : function(data){
                var cacheit= false;
                if(Configor.tc){
                    localStorage['tc_' + key] = Math.floor(+ new Date / 1000);
                    cacheit = true;
                }
                if(Configor.hc){
                    localStorage['hc_' + key] = get_local_num('counter::home');
                    cacheit = true;
                }
                if(Configor.kc){
                    localStorage['kc_' + key] = Configor.kc;
                    cacheit = true;
                }
                if(Configor.cc){
                    localStorage['cc_' + key] = get_local_num('counter::cross');
                    cacheit = true;
                }
                if(cacheit){
                    localStorage[key] = JSON.stringify(data);
                }
                if(!bgRet){
                    callback(data);
                }
            }
        });
        if(bgRet){
            callback(JSON.parse(localStorage[key]));
        }
        return;
    }            

    return {

        //'get_wish': ajax_getor_nopara('/ajax/comm/birthday'),
        //'get_section': ajax_getor_nopara('/ajax/section'),
        //'get_all_boardsname': ajax_getor_nopara('/ajax/board/all'),
        //'get_random_boardname': ajax_getor_nopara('/ajax/board/random'),
        //'get_readmark': '/ajax/board/readmark',

        'get_topten': function(callback){
            cache_ajax(
                { tc: 60, kc: 3, hc: 3 },
                '/ajax/comm/topten',
                {
                    url: '/ajax/comm/topten',
                },
                callback);
        },
        
        'get_all_boards': function(callback){
            cache_ajax(
                { tc: 3600, kc: 30, bg : true, bgi: 36000 },
                '/ajax/board/alls',
                {
                    url: '/ajax/board/alls',
                },
                callback);
        },

        'get_next_boardname': function(boardname, callback){
            cache_ajax(
                { tc: 3600, kc: 30, bg : true, bgi: 36000 },
                '/ajax/board/next:'+boardname,
                {
                    url : '/ajax/board/next',
                    data : {
                        boardname: boardname || '',
                    }
                },
                callback);
        },

        'get_board_info': function(boardname, callback){
            cache_ajax(
                { tc: 3600, bg : true, bgi: 36000 },
                '/ajax/board/get:'+boardname,
                {
                    url : '/ajax/board/get',
                    data : {
                        boardname: boardname,
                        www: true
                    }
                },
                callback);
        },
        
        'get_board_notes': function(boardname, callback){
            cache_ajax(
                { tc: 60, bg : true, bgi : 3600 },
                '/ajax/board/notes:'+boardname,
                {
                    url : '/ajax/board/notes',
                    data : {
                        boardname: boardname,
                    }
                },
                callback);
        },

        "get_boards_by_section": function(sec_code, callback){
            cache_ajax(
                { tc: 3600, bg : true },
                '/ajax/board/getbysec:'+sec_code,
                {
                    url : '/ajax/board/getbysec',
                    data : {
                        sec_code: sec_code
                    }
                },
                callback);
        },

        'get_goodboards': function(type, callback){
            cache_ajax(
                { tc: 3600, bg : true },
                '/ajax/board/good:'+type,
                {
                    url : '/ajax/board/good',
                    data: {
                        type: type
                    }
                },
                callback);
        },      
      
        'set_board_www_etc': function(boardname, data, callback){
            $.post('/ajax/board/setwww',
                   {
                       boardname: boardname,
                       data: data
                   },
                   callback);
        },

        'clear_board_unread': function(boardname, callback){
            $.post('/ajax/board/clear',
                   {
                       boardname: boardname
                   },
                   callback);
        },

        'get_postindex': function(boardname, type, start, callback){
            cache_ajax(
                { tc: 10, kc: 3, bg: true, bgi: 3 },
                '/ajax/post/list:'+boardname+':'+type+':'+start+':20',
                {
                    // type = normal | digest | topic
                    url : '/ajax/post/list',
                    data : {
                        boardname: boardname,
                        type: type,
                        start: start,
                        limit: 20
                    }
                },
                callback);
        },
        
        'get_postindex_limit': function(boardname, type, start,
                                        limit, callback){
            cache_ajax(
                { tc: 10, kc: 3, bg: true, bgi: 3 },
                '/ajax/post/list:'+boardname+':'+type+':'+start+':'+limit,
                {
                    // type = normal | digest | topic
                    url : '/ajax/post/list',
                    data : {
                        boardname: boardname,
                        type: type,
                        start: start,
                        limit: limit
                    }
                },
                callback);
        },
        
        'get_last_postindex': function(boardname, type, limit, callback){
            cache_ajax(
                { tc: 10, kc: 3, bg: true, bgi: 3 },
                '/ajax/post/list:'+boardname+':'+type+':0:'+limit,
                {
                    // type = normal | digest | topic
                    url : '/ajax/post/list',
                    data : {
                        boardname: boardname,
                        type: type,
                        limit: limit
                    }
                },
                callback);
        },
        
        'new_post': function(boardname, title, content,  callback){
            // type = new | reply | update
            $.post('/ajax/post/add',
                   {
                       boardname: boardname,
                       title: title,
                       content: content,
                       type: 'new'
                   },
                   callback);
        },

        'new_post_form': function(selector, argocc){
            $(selector).ajaxSubmit({
                url: '/ajax/post/add',
                type: 'POST',
                success: argocc,
                target: $('body'),
                dataType: 'json'
            });
        },                   

        'reply_post': function(boardname, title, content, refname, callback){
            $.post('/ajax/post/add',
                   {
                       boardname: boardname,
                       title: title,
                       articleid: refname,
                       content: content,
                       type: 'reply'
                   },
                   callback);
        },

        'update_post': function(boardname, title, content, upfname, callback){
            $.post('/ajax/post/add',
                   {
                       boardname: boardname,
                       title: title,
                       articleid: upfname,
                       content: content,
                       type: 'update'
                   },
                   callback);
        },            

        'delete_post': function(boardname, filename, callback){
            $.post('/ajax/post/del',
                   {
                       boardname: boardname,
                       filename: filename
                   },
                   callback);
        },

        'get_post': function(boardname, filename, callback){

            var real_callback = function(data){
                if(data.success){
                    var rd = data.data;
                    if(!$.isEmptyObject(rd['ah'])){
                        rd['ah'].link = rd['ah'].link.replace('/A.', '/').replace('.A', '');
                        data.data = rd;
                    }
                }
                callback(data);
            }

            cache_ajax(
                { tc: 60, bg: true },
                '/ajax/post/get:'+boardname+':'+filename,
                {
                    url : '/ajax/post/get',
                    data: {
                        boardname: boardname,
                        filename: filename
                    }
                },
                real_callback);
        },
        
        'get_near_postname': function(boardname, filename, direction, callback){
            cache_ajax(
                { tc: 60, bg: true },
                '/ajax/post/nearname:'+boardname+':'+filename+':'+direction,
                {
                    // direction = prev | next
                    url : '/ajax/post/nearname',
                    data : {
                        boardname: boardname,
                        filename: filename,
                        direction: direction
                    }
                },
                callback);
        },
        
        'get_post_topiclist': function(boardname, filename, callback){
            cache_ajax(
                { tc: 10, bg: true, bgi: 3 },
                '/ajax/post/topiclist:'+boardname+':'+filename,
                {
                    url : '/ajax/post/topiclist',
                    data : {
                        boardname: boardname,
                        filename: filename
                    }
                },
                callback);
        },
        
        'user_login': function(userid, password, callback){
            $.post('/ajax/login',
                  {
                      userid: userid,
                      passwd: password
                  },
                  callback);
        },

        'user_logout': function(callback){
            $.post('/ajax/logout', callback);
        },

        'query_user': function(userid, callback){
            cache_ajax(
                { tc: 3, bg: true, bgi: 60 },
                '/ajax/user/query:' + userid,
                {
                    url : '/ajax/user/query',
                    data: {
                        userid: userid
                    },
                },
                callback);
        },

        'update_user_info': function(newval, callback){
            /*
             * Update userinfo
             * @param: (all optional)
             *      - passwd: If change passwd, old-passwd and confirm-passwd should be provided.
             *          - old-passwd: The old passwd.
             *          - confirm-passwd: Should be the same with passwd.(The new passwd)
             *      - username
             *      - realname
             *      - gender: 'M' or 'F'
             *      - address
             *      - email
             *      - birthyear: 50-99
             *      - birthmonth: 1-12
             *      - birthday: 1-31
             *      - plan: Personal description.
             *      - signature 
             *      - www: Other web settings. */
            $.post('/ajax/user/update', newval, callback);
        },

        'get_message' : function(index, callback){
            cache_ajax(
                { tc: 60, cc: 10, kc: 3 },
                '/ajax/message/list:' + index,
                {
                    url : '/ajax/message/list',
                    data : {
                        start: index
                    }
                },
                callback);
        },

        'mark_message_read' : function(index, callback){
            $.post('/ajax/message/mark',
                   {
                       index: index
                   }, callback);
        },

        'get_topic_summary_by_board' : function(
            boardname, cursor, limit, callback){
            cache_ajax(
                { tc: 60, cc: 10, kc: 3, bgi: 60 },
                '/ajax/v2/post/byboard:' + boardname + ':' + cursor + ':' + limit,
                {
                    url: '/ajax/v2/post/byboard',
                    data : {
                        boardname : boardname,
                        cursor : cursor,
                        limit : limit
                    }
                },
                callback);
        },
        
        'get_my_part_topic':function(callback){
            cache_ajax(
                { tc: 60, cc: 10, kc: 3, bgi: 60 },
                '/ajax/v2/post/mine',
                {
                    url : '/ajax/v2/post/mine'
                },
                function(data){
                    if(data.items){
                        data.items = data.items.sort(function(a, b){
                            return b.lastupdate-a.lastupdate;
                        });
                    }
                    callback(data);
                });
        },

        'vote_topic':function(topicid, callback){
            $.post('/ajax/v2/post/vote/topic',
                   {
                       topicid : topicid
                   },
                   callback);
        },

        'get_topicinfo':function(boardname, filename, topicid, callback){
            cache_ajax(
                { tc: 60, cc: 10, kc: 3, bg: true, bgi: 60 },
                '/ajax/v2/post/topicinfo:' + boardname + ':' + filename + ':' + topicid,
                {
                    url: '/ajax/v2/post/topicinfo',
                    data : {
                        filename: filename || '',
                        boardname: boardname || '',
                        topicid : topicid || ''
                    }
                },
                callback);
        },

        'update_user_avatar': function(selector, callback){
            $(selector).ajaxSubmit({
                url: '/ajax/user/update',
                type: 'post',
                success : callback,
                timeout:   3000,
                dataType: 'json'
            });
        },

        'get_self_info': function(callback){
            cache_ajax(
                { tc: 60, cc: 10, kc: 3, bg: true, bgi: 60 },
                '/ajax/user/info',
                {
                    url : '/ajax/user/info'
                },
                callback);
        },

        'get_self_setting': function(callback){
            cache_ajax(
                { tc: 60, cc: 10, kc: 3, bg: true, bgi: 60 },
                '/ajax/user/setting/get',
                {
                    url : '/ajax/user/setting/get'
                },
                callback);
        },

        'get_self_inv': function(callback){
            cache_ajax(
                { tc: 60, cc: 10, kc: 3, bg: true, bgi: 60 },
                '/ajax/user/myinv',
                {
                    url : '/ajax/user/myinv'
                }, callback);
        },

        'update_self_setting': function(values, callback){
            $.post('/ajax/user/setting/update',
                   {
                       update: values
                   },
                   callback);
        },

        'get_self_info_aync': function(){
            return get_nc_sync('/ajax/user/info');
        },

        'get_self_fav': function(callback){
            cache_ajax(
                { tc: 60, cc: 10, kc: 3, bg: true, bgi: 60 },
                '/ajax/user/fav',
                {
                    url : '/ajax/user/fav'
                },
                callback);
        },

        'get_self_fav_aync' : function(){
            return get_nc_sync('/ajax/user/fav');
        },            

        'add_self_fav': function(boardname, callback){
            $.post('/ajax/user/addfav',
                   {
                       boardname: boardname
                   },
                   callback);
        },

        'remove_self_fav': function(boardname, callback){
            $.post('/ajax/user/delfav',
                   {
                       boardname: boardname
                   },
                   callback);
        },

        'set_self_fav': function(boards, callback){
            $.post('/ajax/user/setfav',
                   {
                       boards: boards
                   },
                   callback);
        },

        'get_mailbox_info': function(callback){
            cache_ajax(
                { tc: 60, cc: 10, kc: 3, bgi: 60 },
                '/ajax/mail/mailbox',
                {
                    url : '/ajax/mail/mailbox'
                },
                callback);
        },

        'check_has_new_mail': function(callback){
            cache_ajax(
                { },
                '/ajax/mail/check',
                {
                    url : '/ajax/mail/check'
                },
                callback);
        },

        'get_maillist': function(start, callback){
            cache_ajax(
                { },
                '/ajax/mail/list:' + start,
                {
                    url : '/ajax/mail/list',
                    data : {
                        start: start
                    }
                },
                callback);
        },

        'get_maillist_limit': function(start, limit, callback){
            cache_ajax(
                { },
                '/ajax/mail/list:' + start + ':' + limit,
                {
                    url : '/ajax/mail/list',
                    data : {
                        start: start,
                        limit: limit
                    }
                },
                callback);
        },

        'get_mail': function(index, callback){
            cache_ajax(
                { tc: 60 },
                '/ajax/mail/get:' + index,
                {
                    url : '/ajax/mail/get',
                    data : {
                        index: index
                    }
                },
                callback);
        },

        'send_mail': function(title, content, receiver, callback){
            $.post('/ajax/mail/send',
                   {
                       title: title,
                       content: content,
                       receiver: receiver
                   },
                   callback);
        },

        'reply_mail': function(title, content, receiver, articleid, callback){
            $.post('/ajax/mail/send',
                   {
                       title: title,
                       content: content,
                       receiver: receiver,
                       articleid: articleid
                   },
                   callback);
        },

        'delete_mail': function(indexes, callback){
            if(!(typeof indexes=="object")){ // is array
                indexes = [indexes];
            }
            $.post('/ajax/mail/del',
                   {
                       indexes: indexes
                   },
                   callback);
        },

        'get_www_etc': ajax_getor_nopara('/ajax/www/get'),

        'set_www_etc': function(data, callback){
            $.post('/ajax/www/set',
                   {
                       data: data
                   },
                   callback);
        },

        'get_ann_content': function(reqpath, callback){
            cache_ajax(
                { tc: 60, bg: true, bgi: 1200 },
                '/ajax/ann/content/:' + reqpath ,
                {
                    url : '/ajax/ann/content/',
                    data:{
                        reqpath: reqpath
                    }
                },
                callback);
        },

        '!update_user_title': function(userid, content, callback){
            $.post('/ajax/admin/update_title',
                   {
                       userid: userid,
                       content: content
                   },
                   callback);
        },

        'weibo_check_auth': ajax_getor_nopara('/ajax/weibo/check_auth'),

        'weibo_use_weibo_avatar': function(callback){
            $.post('/ajax/weibo/use_avatar',
                   callback);
        },
        'weibo_update1': function(callback){
            $.post('/ajax/weibo/update1', callback);
        },
        'get_fresh' : function(cursor, callback){
            cache_ajax(
                { tc: 60, bg: true, bgi: 60 },
                '/ajax/v2/top/topic:' + cursor,
                {
                    url : '/ajax/v2/top/topic',
                    data : {
                        cursor: cursor,
                    }
                },
                callback);
        }
    }
})

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
            get_nc(url, callback);
        }
    }
        
    return {
        'get_topten': ajax_getor_nopara('/ajax/comm/topten'),
        'get_wish': ajax_getor_nopara('/ajax/comm/birthday'),
        'get_section': ajax_getor_nopara('/ajax/section'),
        'get_all_boardsname': ajax_getor_nopara('/ajax/board/all'),
        'get_all_boards': ajax_getor_nopara('/ajax/board/alls'),
        'get_random_boardname': ajax_getor_nopara('/ajax/board/random'),
        'get_board_info': function(boardname, callback){
            get_nc('/ajax/board/get',
                  {
                      boardname: boardname,
                      www: true
                  },
                  callback);
        },
        "get_boards_by_section": function(sec_code, callback){
            get_nc('/ajax/board/getbysec',
                  {
                      sec_code: sec_code
                  },
                  callback);
        },
        'get_goodboards': function(type, callback){
            get_nc('/ajax/board/good',
                   {
                       type: type,
                   }, callback);
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
        'get_readmark': function(boardname, callback){
            get_nc('/ajax/board/readmark',
                   {
                       boardname: boardname
                   },
                   callback);
        },
        'get_postindex': function(boardname, type, start, callback){
            // type = normal | digest | topic
            get_nc('/ajax/post/list',
                  {
                      boardname: boardname,
                      type: type,
                      start: start
                  },
                  callback);
        },
        'get_postindex_limit': function(boardname, type, start,
                                        limit, callback){
            // type = normal | digest | topic
            get_nc('/ajax/post/list',
                  {
                      boardname: boardname,
                      type: type,
                      start: start,
                      limit: limit,
                  },
                  callback);
        },
        'get_last_postindex': function(boardname, type, limit, callback){
            // type = normal | digest | topic
            get_nc('/ajax/post/list',
                   {
                       boardname: boardname,
                       type: type,
                       limit: limit,
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
        'new_post_form': function(selector, callback){
            // need boardname, title, content, type==new, and else
            var formData = new FormData($(selector)[0]);
            $.ajax({
                url: '/ajax/post/add',
                type: 'POST',
                xhr: function(){
                    var myXhr = $.ajaxSettings.xhr();
                    return myXhr;
                },
                success: callback,
                data: formData,
                cache: false,
                contentType: false,
                processData: false
            }, 'json');
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
            get_nc('/ajax/post/get',
                   {
                       boardname: boardname,
                       filename: filename
                   },
                   function(data){
                       if(data.success){
                           var rd = data.data;
                           if(!$.isEmptyObject(rd['ah'])){
                               console.log(['ll', last = rd['ah'].link]);
                               rd['ah'].link = rd['ah'].link.replace('/A.', '/').replace('.A', '');
                               console.log(['d', rd]);
                               data.data = rd;
                           }
                       }
                       callback(data);
                   });
        },
        'get_near_postname': function(boardname, filename, direction, callback){
            // direction = prev | next
            get_nc('/ajax/post/nearname',
                  {
                      boardname: boardname,
                      filename: filename,
                      direction: direction
                  },
                  callback);
        },
        'get_post_topiclist': function(boardname, filename, callback){
            get_nc('/ajax/post/topiclist',
                  {
                      boardname: boardname,
                      filename: filename
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
            get_nc('/ajax/user/query',
                  {
                      userid: userid
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

        'update_user_avatar': function(selector, callback){
            var formData = new FormData($(selector)[0]);
            $.ajax({
                url: '/ajax/user/update',
                type: 'POST',
                xhr: function(){
                    var myXhr = $.ajaxSettings.xhr();
                    // if(myXhr.upload){
                    //     myXhr.upload.addEventListener(
                    //         'progress', progressHandlingFunction, false
                    //     );
                    // };
                    return myXhr;
                },
                success : callback,
                data: formData,
                cache: false,
                contentType: false,
                processData: false
            }, 'json');
        },

        'get_self_info': function(callback){
            get_nc('/ajax/user/info', callback);
        },

        'get_self_setting': function(callback){
            get_nc('/ajax/user/setting/get', callback);
        },

        'update_self_setting': function(values, callback){
            $.post('/ajax/user/setting/update',
                   {
                       update: values,
                   },
                   callback);
        },

        'get_self_info_aync': function(){
            return get_nc_sync('/ajax/user/info');
        },

        'get_self_fav': function(callback){
            get_nc('/ajax/user/fav', callback);
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

        'get_mailbox_info': function(callback){
            get_nc('/ajax/mail/mailbox', callback);
        },

        'check_has_new_mail': function(callback){
            get_nc('/ajax/mail/check', callback);
        },

        'get_maillist': function(start, callback){
            get_nc('/ajax/mail/list',
                  {
                      start: start
                  },
                  callback);
        },

        'get_maillist_limit': function(start, limit, callback){
            get_nc('/ajax/mail/list',
                  {
                      start: start,
                      limit: limit
                  },
                  callback);
        },

        'get_mail': function(index, callback){
            get_nc('/ajax/mail/get',
                  {
                      index: index
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
            get_nc('/ajax/ann/content/',
                   {
                       reqpath: reqpath,
                   },
                   callback);
        }
        
    }
})

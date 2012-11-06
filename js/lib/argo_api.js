$MOD('argo_api', function(){

    function ajax_getor_nopara(url){
        return function(callback){
            $.get(url, callback);
        }
    }
        
    return {
        'get_topten': ajax_getor_nopara('/ajax/comm/topten'),
        'get_wish': ajax_getor_nopara('/ajax/comm/birthday'),
        'get_section': ajax_getor_nopara('/ajax/section'),
        'get_all_boardsname': ajax_getor_nopara('/ajax/board/all'),
        'get_all_boards': ajax_getor_nopara('/ajax/board/alls'),
        'get_board_info': function(boardname, callback){
            $.get('/ajax/board/get',
                  {
                      boardname: boardname,
                  },
                  callback);
        },
        "get_boards_by_section": function(sec_code, callback){
            $.get('/ajax/board/getbysec',
                  {
                      sec_code: sec_code,
                  },
                  callback);
        },
        'clear_board_unread': function(boardname, callback){
            $.post('/ajax/board/clear',
                   {
                       boardname: boardname,
                   },
                   callback);
        },
        'get_postindex': function(boardname, type, start, callback){
            // type = normal | digest | topic
            $.get('/ajax/post/list',
                  {
                      boardname: boardname,
                      type: type,
                      start: start,
                  },
                  callback);
        },
        'new_post': function(boardname, title, content, type, callback){
            // type = new | reply | update
            $.post('/ajax/post/add',
                   {
                       boardname: boardname,
                       title: title,
                       content: content,
                       type: type,
                   },
                   callback);
        },
        'delete_post': function(boardname, filename, callback){
            $.post('/ajax/post/del',
                   {
                       boardname: boardname,
                       filename: filename,
                   },
                   callback);
        },
        'get_post': function(boardname, filename, callback){
            $.get('/ajax/post/get',
                  {
                      boardname: boardname,
                      filename: filename,
                  },
                  callback);
        },
        'get_near_postname': function(boardname, filename, direction, callback){
            // direction = prev | next
            $.get('/ajax/post/near',
                  {
                      boardname: boardname,
                      filename: filename,
                      direction: direction,
                  },
                  callback);
        },
        'get_post_topiclist': function(boardname, filename, callback){
            $.get('/ajax/post/topiclist',
                  {
                      boardname: boardname,
                      filename: filename,
                  },
                  callback);
        },

        'user_login': function(userid, password, callback){
            console.log([userid, password]);
            $.post('/ajax/login',
                  {
                      userid: userid,
                      passwd: password,
                  },
                  callback);
        },

        'user_logout': function(callback){
            $.post('/ajax/logout', callback);
        },

        'query_user': function(userid, callback){
            $.get('/ajax/user/query',
                  {
                      userid: userid,
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

        'get_self_info': function(callback){
            $.get('/ajax/user/info', callback);
        },

        'get_self_fav': function(callback){
            $.get('/ajax/user/fav', callback);
        },

        'add_self_fav': function(boardname, callback){
            $.post('/ajax/user/addfav',
                   {
                       boardname: boardname,
                   },
                   callback);
        },

        'remove_self_fav': function(boardname, callback){
            $.post('/ajax/user/delfav',
                   {
                       boardname: boardname,
                   },
                   callback);
        },

        'get_mailbox_info': function(callback){
            $.get('/ajax/mail/mailbox', callback);
        },

        'get_mail_list': function(start, callback){
            $.get('/ajax/mail/list',
                  {
                      start: start,
                  },
                  callback);
        },

        'get_mail': function(index, callback){
            $.get('/ajax/mail/get',
                  {
                      index: index,
                  },
                  callback);
        },

        'send_mail': function(title, content, callback){
            $.post('/ajax/mail/send',
                   {
                       title: title,
                       content: content,
                   },
                   callback);
        },

        'reply_mail': function(title, content, articleid, callback){
            $.post('/ajax/mail/send',
                   {
                       title: title,
                       content: content,
                       articleid: articleid,
                   },
                   callback);
        },

        'delete_mail': function(indexes, callback){
            if(!(typeof indexes=="object")){ // is array
                indexes = [indexes];
            }
            $.post('/ajax/mail/del',
                   {
                       indexes: indexes,
                   },
                   callback);
        },

    }
})

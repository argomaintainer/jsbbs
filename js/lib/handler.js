$MOD('func', function(){

    var localStorage = window.localStorage || {};
    var maxkey = 100;

    function check_isnew(boardname, topic, time){
        return !(localStorage['read::'+boardname+'//'+topic] > time);
    }

    function set_read(boardname, topic){
        localStorage['read::' + boardname + '//' + topic] =
            Math.floor(+(new Date()) / 1000);
    }
    
    window.check_isnew = check_isnew;
    window.set_read = set_read;

});

$MOD('frame.allp', function(){

    var submit = {};
    var local = {};

    function cmp_boards(a, b){
        return (b.unread - a.unread) || (a.secnum - b.secnum) ||
            (b.lastpost - a.lastpost);
    }

    function close_activeboard(kwargs, e){
        localStorage['f:home:activeboard'] = $('#activeboard').text();
         $("#activeboard-wrapper").remove();
    }
    submit['close-activeboard'] = close_activeboard;

    function format_number(x){
        x = Number(x);
        if(x < 10) return 'default';
        else if(x < 20) return 'success';
        else if(x < 50) return 'info';
        else if(x < 80) return 'warning';
        else return 'important';
    }

    function key_boardname(i){
        return i.boardname;
    }

    function key_title(i){
        return i.title;
    }

    function get_fresh_group(cursor, callback){
        $api.get_fresh(cursor, function(data){
            data.groups = group_by_lambda(
                filter_by_lambda(array_values(data.items), key_title),
                key_boardname);
            callback(data);
        });
    }
    window.get_fresh_group = get_fresh_group;

    function load_cursor(kwargs, e){
        var self = $(e.target);
        var t = $('<div class="load-more-post loading">载入中...</div>');
        self.replaceWith(t);
        var time = +(new Date);
        get_fresh_group(self.data('cursor'), function(data){
            var gap = 1000 - (+(new Date) - time);
            if(gap < 0){
                gap = 0;
            }
            setTimeout(function(){
                t.replaceWith(render_string('fresh-li', { data: data }));
            }, gap);
        });
    }
    submit['load-cursor'] = load_cursor;

    function load_board_more(kwargs, e){
        var self = $(e.target);
        self.parent().addClass('open');
        self.remove();
    }
    submit['load-board-more'] = load_board_more;

    submit['close-home-post'] = function(){
        localStorage['show-home-post'] = $('#show-home-post').data('label');
        $('#show-home-post').hide();
    }

    function load_new(callback){            
        get_fresh_group(null, function(data){
            render_template('fresh-g', { data: data });
            callback();
        });
    }        

    function load_focus(){
        $.get('/ajax/comp/www_home',
              function(data){
                  if(data.success){
                      // require_jslib('slides');
                      var n = $(render_string('focus', data.data));
                      $('#part-2').replaceWith(n);
                      // $(function(){
                      //     $("#slides").slides({
                      //         start: Math.floor(
                      //             Math.random() *
                      //                 data.data.www.posts.length) + 1
                      //     });
                      // });
                      local.rank = 0;
                      local.time = (new Date()).toLocaleString();
                      get_fresh_group(null, function(data){
                          data.groups = data.groups.sort(function(a, b){
                              var va = BOARD_VH[a[0].boardname] || 0;
                              var vb = BOARD_VH[b[0].boardname] || 0;
                              if(va == vb){
                                  return b[0].lastupdate - a[0].lastupdate;
                              }
                              return vb - va;
                          });
                          var n = render_string('fresh-home', { data: data });
                          $('#part-3').replaceWith(n);
                      });
                      load_widgets(data.data.www.widgets.concat([{type:'dowhat', group: DOWHAT}]));
                  }
              });
    }

    declare_frame({
        mark: 'home',
        enter: function(kwargs){
            // if($G.authed && ((!$G.userfav_a)||($G.userfav_a.length < 5))
            //    &&(!localStorage['bool::watched-tut'])){
            //     location = '#!tut-2';
            // }
            render_template('home');
            $api.get_fresh(0, function(data){
                var items = data.items.slice(0, 5);
                var buf = [];
                for(var i=0; i<items.length; ++i){
                    buf.push([items[i].title + ' » ' + items[i].boardname,
                              url_for_topic2(items[i].topicid)]);
                }
                load_widgets([{ type: 'links', links : buf, title : '新鲜贴子' }]);
            });
            if(localStorage['show-home-post']
               != $('#show-home-post').data('label')){
                $('#show-home-post').show();
            }
            load_focus();
        },
        local : local,
        submit: submit,
        marktop: 'home'
    });

    local.newrank = function(){
        return ++local.rank;
    }

    // auto load when #autoload is in viewport,
    //  WARNING: will just unbind window.onscroll
    // when #autoload is unexists now
    function autoload(){
        var t_body = $('body');
        var t_window = $(window);
        if(!$G.current.mark=='fresh'){
            $(window).off('scroll', autoload);
        }            
        if(t_body.height() - t_window.height() -
           t_window.scrollTop() < 300){
            var al = $('#autoload');
            if(al.data('lock')){
                return;
            }
            al.data('lock', 'loading');
            al.click();
        }
    }

    declare_frame({
        marktop: 'fresh',
        mark: 'fresh',
        submit: submit,
        local : local,
        enter: function(){
            local.rank = 0;
            local.time = (new Date()).toLocaleString();
            $(window).on('scroll', autoload);
            load_new(function(){});
            load_widgets([{type:'dowhat', group: DOWHAT}]);
        },
    })
    
});

$MOD('frame::section', function(){

    var submit = {};

    declare_frame({
        mark : 'fav',
        marktop : 'fav',
        enter : function(kwargs){
            render_template('fav');
        }
    });

    declare_frame({
        mark: 'section',
        submit: submit,
        marktop: 'section',
        enter: function(kwargs){
            $api.get_all_boards(function(data){
                if(data.success){
                    render_template('section', {
                        sections: data.data.all,
                        good: array_to_dict(data.data.good)
                    });
                    $('a[data-toggle="pill"]').on('shown', function (e) {
                        var num = $(e.target).attr('data-args');
                        $G.lastsection = num;
                        quite_set_hash('#!section?secnum='
                                       + $(e.target).attr('data-args'));
                        $('#pill-' + num +' .lazy').each(function(){
                            this.src = $(this).attr('data-src');
                            $(this).removeClass('.lazy');
                        });
                    })
                    var num = Number(kwargs.secnum) || $G.lastsection ;
                    if(isNaN(num))
                        num = 0;
                    if(num >=0){
                        $('#a-pill-' + num).tab('show');
                    }
                }
            });
        }
    });

})            

$MOD('frame::user', function(){

    var submit = {},
    local = {};

    function pop_new_mail(){
        if(!$G.authed){
            show_alert('请先登录再执行此操作：-）');
            return;
        }
        init_popwindow('popwindow/newmail', {touserid: local.userid });
    }
    submit.pop_new_mail = pop_new_mail;

    submit.send_mail = function(kwargs, e){
        $api.send_mail(kwargs.title,
                       kwargs.content,
                       kwargs.receiver,
                       function(data){
                           if(data.success){
                               show_alert('发表成功！', 'success');
                               close_popwindow();
                               refresh_frame();
                           }
                           else{
                               show_alert(ERROR[data.code], 'danger');
                               console.log(data);
                           }
                       });
    }                       
    
    declare_frame({
        mark : 'user',
        enter : function(args){
            $api.query_user(args.userid, function(data){
                if(data.success){
                    local.userid = args.userid;
                    data.data.htmlplan = $MOD.format.format(data.data.plan);
                    render_template('user', { u: data.data, data: data.data });
                }
                else{
                    raise404(ERROR[data.code])
                    console.error(data);
                }
            });
        },
        local: local,
        submit: submit
    });
});

$MOD('frame::board', function(){

    var PAGE_LIMIT = 25;
    var last_pagenum = {};
    var cur_board = {};
    var local = {};
    var submit = {};
    local.cur_board = cur_board;

    submit['newpost'] = function(){
        if(!$G.authed){
            show_alert('请先登录再执行此操作：-）');
            return;
        }
        if($G.authed.u.ban_post){
            init_popwindow('popwindow/ban_post');
        }
        else{
            init_popwindow('popwindow/newpost',
                           { boardname: cur_board.boardname});
            $('.editor textarea').keypress(function(event){
                if(event.ctrlKey && (event.keyCode==10)){
                    $('#new-post-form').submit();
                };
            });
        }
    }

    function check_pushlish(kwargs, e){
        var filename = $('[type=file]').val().split('\\').pop(),
        title = $('[name=title]').val() ,
        file = $('[type=file]');
        if(filename && file[0].files){
            file = file[0].files[0];
        }
        if(filename){
            if(file.size >= 1048576){            
                show_alert('上传文件过大，只接受1MB以下的文件 ～');
                return;
            }
            if(!title){
                title = '[文件]'+filename;
                $('.editor [name=title]').val(title);
            }
        }
        if(!title){
            show_alert('没有填写标题！');
            return false;
        }
        return true;
    }

    function handler_submit(data){
        if(data.success){
            show_alert('发表成功！', 'success');
            setTimeout(function(){
                location = url_for_topic(
                    data.data, local.cur_board.boardname);
            }, 1000);
        }
        else{
            show_alert(ERROR[data.code], 'danger');
        }
    }

    local['update_title_tag'] = function(target){
        var t = target.value;
        var dt = $(target).parents('form').find('[name=title]');
        dt.val('[' + t + ']' + dt.val().replace(/^[\[\【]([^\]]+)[\]\】]/, ''));
        dt.focus();
    }

    submit['publish_post'] = function(kwargs, e){
        if(e.target.tagName == 'FORM'){
            if(!check_pushlish(kwargs, e))
                return;
            $api.new_post_form('#new-post-form', handler_submit);
        }
    }

    // quickpost
    submit['publish_post2'] = function(kwargs, e){
        if(e.target.tagName == 'FORM'){
            if(!check_pushlish(kwargs, e))
                return;
            $api.new_post_form(
                '#new-post-form',
                function(data){
                    if(data.success){
                        show_alert('发表成功！', 'success');
                        location = url_for_board(kwargs.boardname);
                    }
                    else{
                        show_alert(ERROR[data.code], 'danger');
                    }                        
                });
        }
    }
    
    function getCaret(el) { 
        if (el.selectionStart) { 
            return el.selectionStart; 
        } else if (document.selection) { 
            el.focus(); 

            var r = document.selection.createRange(); 
            if (r == null) { 
                return 0; 
            } 

            var re = el.createTextRange(), 
            rc = re.duplicate(); 
            re.moveToBookmark(r.getBookmark()); 
            rc.setEndPoint('EndToStart', re); 

            return rc.text.length; 
        }  
        return 0; 
    }    

    submit['append-text'] = function(kwargs, e){
        var target = $('.editor textarea');
        target.val(target.val() + '\n\n' + $(e.target).attr('data-args'));
        target.focus();
    }

    function unbook_fav(kwargs, e){
        var boardname;
        if(!confirm('真的取消收藏改版?')){
            return;
        }
        if(cur_board && (boardname = cur_board.boardname)){
            $api.remove_self_fav(boardname, function(data){
                if(data.success){
                    $(e.target).parent().html('<button class="btn btn-info btn-mini" data-submit="book_fav">收藏该版</button>');
                }
                else{
                    show_alert(ERROR[data.code]);
                }
            });
        };
    }
    submit['unbook_fav'] = unbook_fav;

    function book_fav(kwargs, e){
        var boardname;
        if(cur_board && (boardname = cur_board.boardname)){
            $api.add_self_fav(boardname, function(data){
                if(data.success){
                    $(e.target).parent().html('我已收藏该版 > <a href="#" data-submit="unbook_fav">取消收藏改版</a>');
                }
                else{
                    show_alert(ERROR[data.code]);
                }
            });
        };
    }
    submit['book_fav'] = book_fav;

    function clear_board_unread(){
        if(!$G.authed){
            show_alert('请先登录再执行此操作：-）');
            return;
        }
        var boardname;
        if(cur_board && (boardname = cur_board.boardname)){
            $api.clear_board_unread(boardname, function(data){
                refresh_frame();
            });
        };
    }
    submit['clear_unread'] = clear_board_unread;

    function load_more(){
        var container = $('#topiclist');
        var cursor = local.cursor;
        var limit = (cursor >0) && (cursor < PAGE_LIMIT) ?
            cursor : PAGE_LIMIT;
        $api.get_postindex_limit(
            local.cur_board.boardname, 'topic',
            (cursor == 0)? 0 : cursor - limit + 1,
            limit,
            function(data){
                var list = data.data.reverse();
                local.cursor = list[list.length-1].index - 1;
                render_string(
                    'topiclist-simple',
                    { list : list,
                      boardname : local.cur_board.boardname }).replaceAll(
                          container.find('#loader'));
                if(local.cursor == 0){
                    container.find('#loader').remove();
                }
            }
        );
    }
    submit['load-more'] = load_more;

    function enter_board(kwargs){

        require_jslib('format');

        var boardname = kwargs.boardname, pagenum;

        local.cursor = 0;
        
        $api.get_board_info(boardname, function(data){
            var start_page, last;
            if(data.success){
                cur_board.data = data.data;
                cur_board.boardname = boardname = data.data.filename;
                if(data.data.notes){
                    var notes = data.data.notes;
                    if(notes.indexOf('\n----\n') >= 0){
                        notes = notes.split('\n----\n').slice(-1)[0];
                        cur_board.data.htmlnotes =
                            $MOD.format.format(notes);
                    }else{
                        cur_board.data.htmlnotes =
                            $MOD.format.ascii(notes);
                    }
                }
                console.log('board', data.data);
                
                render_template('board-simple',
                                {
                                    board: data.data,
                                    PAGE_LIMIT: PAGE_LIMIT
                                });


                $('.editor textarea').keypress(function(event){
                    if(event.ctrlKey && (event.keyCode==10)){
                        $('#new-post-form').submit();
                    };
                });


                load_more();

                // section for userbox
                $G.lastsection = cur_board.data.secnum;
                $G.last_seccode = cur_board.data.seccode;

                // near boards
                $api.get_boards_by_section(
                    cur_board.data.seccode,
                    function(data){
                        if(data.success){
                            var all = (data.data), near=[], b;
                            for(b in all){
                                if((all[b]).unread){
                                    near.push(all[b]);
                                    if(near.length >= 3){
                                        break;
                                    }
                                }
                            }
                            near.sort(function(a, b){
                                return b.lastpost - a.lastpost;
                            });
                            render_template('board-near-board',
                                            {
                                                boards: near,
                                                secnum : cur_board.data.secnum
                                            },
                                            '#dy-widgets');
                        }
                    });

                // digest
                $api.get_last_postindex(
                    boardname, 'digest', 5, function(data){
                    if(data.success){
                        var l = data.data.reverse();
                        render_template('widget/postlist', {
                            title: '最新文摘',
                            posts: l,
                            boardname: boardname,
                            more : '',
                            href: 'http://bbs.sysu.edu.cn/bbsgdoc?board=' + boardname,
                        }, '#dy-widgets');
                    }
                });
                
            }
            else{
                raise404(ERROR[data.code]);
                console.error(data);
            }
        });
        return local;

    }

    declare_frame({
        mark: 'board',
        isnew: true,
        keep_widgets: false,
        enter : enter_board,
        submit: submit,
        local: local
    });

})

$MOD('frame::flow', function(){

    require_jslib('format');

    var local = {},
    submit = {},
    cur_boardname = null;
    
    function handler_post(post){
        console.log(++$G.local.loaded);
	    post.ismarkdown = ((post.rawcontent[0] == '#')||(post.rawcontent[1] == '#'));
        post.closed = !!(post.title.substr(0,3) == 'Re:')&&($G.local.loaded > 10)&&(post.rawcontent.indexOf('\n')<=20)&&(post.rawcontent.indexOf('【 在 ')<=140);
        post.content = $MOD.format.format(post.rawcontent);
        post.signature = $MOD.format.format(post.rawsignature);
        return post;
    }

    function _load_post(){
        local.target = $($('#post-container')[0]);
        $api.get_post(
            cur_boardname, local.last_filename,
            function(data){
                if(data.success){
                    render_template(
                        'post',
                        handler_post(data.data),
                        local.target);
                }
                else{
                    raise404(ERROR[data.code]);
                }
            });
    }

    function update_hash(data){
        local.kwargs.last = data.data;
        // quite_set_hash('#!flow', local.kwargs);
    }

    function new_post_loader(direct, ref, handler, render,
                             failed, callback){
        var lock = false;
        var foo = function(){
            if(lock){
                return;
            }
            lock = true;
            $api.get_near_postname(
                cur_boardname, local[ref], direct,
                function(data){
                    if(data.success){
                        handler(data);
                        local[ref] = data.data;
                        $api.get_post(
                            cur_boardname, local[ref],
                            function(data){
                                render(
                                    'post',
                                    handler_post(data.data),
                                    local.target);
                                lock = false;
                                if(callback){
                                    callback(data);
                                }
                            });
                    }
                    else{
                        failed();
                    }
                    lock = false;
                }
            );
        }
        foo.lock = lock;
        return foo;
    }
    
    submit['load_prev'] = new_post_loader(
        'prev', 'oldest_filename',
        update_hash,
        render_template_prepend,
        function(){
            show_alert('o(∩_∩)o <br\> 已经是第一篇了', 'success');
        }
    );
    var load_next;
    load_next = submit['load_next'] = new_post_loader(
        'next', 'last_filename',
        update_hash,
        render_template,
        function(){
            // $('#post-down [data-submit]').remove();
            $('#post-down .hidden').removeClass('hidden');
        },
        function(){
            console.log('loading moremoremore');
            if($('body').height() - $(window).height() -
               $(window).scrollTop() < 2000){
                load_next();
            }
        }
    );

    bind_hook('after_scroll', function(){
        if($G.current.mark != 'flow' || load_next.lock){
            return;
        }
        if($('body').height() - $(window).height() -
           $(window).scrollTop() < 100){
            load_next();
        }
    });

    submit['delete_post'] = function(kwargs, e){
        modal_confirm('删除文章', '删除的文章将无法恢复，你真的要删除本文吗?',
                      function(){
                          $api.delete_post(
                              local.boardname, kwargs.filename,
                              function(data){                                  
                                  if(data.success){
                                      show_alert('删除文章成功！', 'success');
                                  }
                                  else{
                                      show_alert(ERROR[data.code], 'danger');
                                  }
                              });
                      });
    }

    require_jslib('format');
    var reply_post, publish_reply;
    submit['reply_post'] = reply_post = function(kwargs, e){
        if(!$G.authed){
            show_alert('请先登录再执行此操作：-）');
            return;
        }
        $api.get_post(local.boardname, kwargs.filename,
                      function(data){
                          if(data.success){
                              var quote = $MOD.format.gen_quote(data.data);
                              init_popwindow('popwindow/replypost', quote);
                          }
                          else{
                              show_alert(ERROR[data.code], 'danger');
                              console.error(data);
                          }                              
                      });                       
    }

    submit['publish_reply'] = publish_reply = function(kwargs, e){
        $api.reply_post(local.boardname, kwargs.title, kwargs.content,
                      kwargs.toreply, function(data){
                          if(data.success){
                              show_alert('回复成功！', 'success');
                              close_popwindow();
                          }
                          else{
                              show_alert(ERROR[data.code], 'danger');
                              console.error(data);
                          }
                      });
    }

    submit['editpost'] = function(kwargs, e){
        if(!$G.authed){
            show_alert('请先登录再执行此操作：-）');
            return;
        }
        $api.get_post(local.boardname, kwargs.filename,
                      function(data){
                          if(data.success){
                              var post = data.data;
                              init_popwindow('popwindow/editpost',
                                            {
                                                title: post.title,
                                                content: post.rawcontent,
                                                filename: post.filename
                                            });
                          }
                          else{
                              show_alert(ERROR[data.code], 'danger');
                          }
                      });
    }

    submit['publish_edit'] = function(kwargs){
        $api.update_post(local.boardname,
                         kwargs.title,
                         kwargs.content,
                         kwargs.toedit,
                         function(data){
                             if(data.success){
                                 show_alert('修改文章成功！', 'success');
                                 close_popwindow();
                             }
                             else{
                                 show_alert(ERROR[data.code], 'danger');
                             }
                         });
    }

    submit['share-post'] = function(kwargs, e){
        require_jslib('share_btn');
        $MOD.share_btn.share_window(
            url_for_url(url_for_topic(kwargs.filename, cur_boardname)),
            $('#title-'+kwargs.index).text() + ' » '
                + cur_boardname + ' - 逸仙时空',
            $(e.target).attr('data-args'));            
    }

    submit['toggle-quote'] = function(kwargs, e){
        var self=$(e.target)
        , parent = self.parent();
        if(parent.hasClass('open')){
            parent.removeClass('open');
            self.text(' : 显示引用文字');
        }
        else{
            parent.addClass('open');
            self.text(' : 隐藏引用文字');
        }
    }
    
    declare_frame({
        mark : 'flow',
        basetpl : 'post-framework',
        submit : submit,
        prepare : function(kwargs){
            local.boardname = cur_boardname = kwargs.boardname;
            local.oldest_filename = local.last_filename = kwargs.filename;
        },
        enter : function(kwargs){
            local.kwargs = kwargs;
            _load_post();
        },
        local : local
    });

    return {
        handler_post: handler_post,
        reply_post: reply_post,
        publish_reply: publish_reply,
        toggle_quote: submit['toggle-quote']
    }

})

$MOD('frame::topic', function(){

    var PAGE_LIMIT = 40;
    
    var submit = {},
    local = {};

    var handler_post = $MOD['frame::flow'].handler_post;

    var lock = false;

    submit['toggle-quote'] = $MOD['frame::flow'].toggle_quote;

    submit['back-to-board'] = function(){
        location = url_for_board_it(local.first.index, cur_boardname, local.first.id);
    }

    function new_loader(init, finish, get_filename, render, error){
        function load(counter){
            var filename;
            if(counter){
                if(filename = get_filename(counter)){
                    $api.get_post(cur_boardname, filename, function(data){
                        if(data.success){
                            if(!local.first){
                                local.first = data.data;
                            }
                            render('topic',
                                   handler_post(data.data),
                                   local.target);
                            if(--counter){
                                load(--counter);
                            }
                            else{
                                local.kwargs.last = filename;
                                // quite_set_hash('#!topic', local.kwargs);
                                lock = false;
                            }                                
                        }
                        else{
                            lock = false;
                            error();
                        }
                    });
                }
                else{
                    lock = false;
                    finish();
                }
            }
            else{
                lock = false;
            }
        }
        return function(){
            if(lock)
                return;
            lock = true;
            load(init);
        }
    }    
    
    var load_next = submit['load_next'] = new_loader(
        PAGE_LIMIT, function(){
        $('#post-down .load-next').remove();
        $('#post-down .hidden').removeClass('hidden');
    }, function(){
        return (local.last_index < local.topiclist.length)?
            local.topiclist[local.last_index++] : false;
    }, render_template);

    bind_hook('after_scroll', function(){
        if($G.current.mark != 'topic' || lock || !local.topiclist){
            return;
        }
        if($('body').height() - $(window).height() - $(window).scrollTop() < 1000){
            load_next();
        }
    });
    
    submit['load_prev'] = new_loader(
        PAGE_LIMIT, function(){
            $('#post-up [data-submit]').remove();
            $('#post-up .hidden').removeClass('hidden');
        }, function(){
            return (local.oldest_index>=0) ?
                local.topiclist[local.oldest_index--] : false;
    }, render_template_prepend);

    submit.reply_post = function(kwargs, e){
        if(!$G.authed){
            show_alert('请先登录再执行此操作：-）');
            return;
        }
        $api.get_post(local.boardname, kwargs.filename,
                      function(data){
                          if(data.success){
                              var quote = $MOD.format.gen_quote(data.data);
                              init_popwindow('popwindow/replypost', quote);
                          }
                          else{
                              show_alert(ERROR[data.code], 'danger');
                              console.error(data);
                          }                              
                      });                       
    }
    submit.publish_reply = function(kwargs, e){
        $api.reply_post(local.boardname, kwargs.title, kwargs.content,
                      kwargs.toreply, function(data){
                          if(data.success){
                              show_alert('回复成功！', 'success');
                              close_popwindow();
                          }
                          else{
                              show_alert(ERROR[data.code], 'danger');
                              console.error(data);
                          }
                      });
    }

    submit['delete_post'] = function(kwargs, e){
        modal_confirm('删除文章', '删除的文章将无法恢复，你真的要删除本文吗?',
                      function(){
                          $api.delete_post(
                              local.boardname, kwargs.filename,
                              function(data){
                                  if(data.success){
                                      show_alert('删除文章成功！', 'success');
                                  }
                                  else{
                                      show_alert(ERROR[data.code], 'danger');
                                  }
                              });
                      });
    }

    submit['editpost'] = function(kwargs, e){
        if(!$G.authed){
            show_alert('请先登录再执行此操作：-）');
            return;
        }
        $api.get_post(local.boardname, kwargs.filename,
                      function(data){
                          if(data.success){
                              var post = data.data;
                              init_popwindow('popwindow/editpost',
                                            {
                                                title: post.title,
                                                content: post.rawcontent,
                                                filename: post.filename
                                            });
                          }
                          else{
                              show_alert(ERROR[data.code], 'danger');
                          }
                      });
    }

    submit['publish_edit'] = function(kwargs){
        $api.update_post(local.boardname,
                         kwargs.title,
                         kwargs.content,
                         kwargs.toedit,
                         function(data){
                             if(data.success){
                                 show_alert('修改文章成功！', 'success');
                                 close_popwindow();
                             }
                             else{
                                 show_alert(ERROR[data.code], 'danger');
                             }
                         });
    }

    submit['share-post'] = function(kwargs, e){
        require_jslib('share_btn');
        $MOD.share_btn.share_window(
            url_for_url(url_for_topic(kwargs.filename, cur_boardname)),
            $('#title-'+kwargs.index).text() + ' » '
                + cur_boardname + ' - 逸仙时空',
            $(e.target).attr('data-args'));            
    }

    function get_filename(kwargs, callback){
        $api.get_topicinfo(kwargs.boardname,
                           kwargs.filename,
                           kwargs.topicid,
                           function(data){
                               var topicinfo = data.data;
                               if(topicinfo){
                                   local.topicinfo = topicinfo;
                                   set_read(topicinfo.boardname,
                                            topicinfo.topicid);
                                   if(!kwargs.boardname){
                                       kwargs.boardname = topicinfo.boardname;
                                   }
                                   if(!kwargs.filename){
                                       kwargs.filename = topicinfo.filename;
                                   }
                               }
                               callback(kwargs);
                           });
    }

    submit['vote'] = function(kwargs, event){
        var self = $(event.target);
        var topicid = self.data('topicid');
        $api.vote_topic(topicid, function(data){
            if(data.status){
                self.parent().html(
                    '<span class="vote-span">我认为值得一读 (共 ' +
                        (1+Number($G.local.topicinfo.vote)) + ' 人)</span>');
            }
        });
    }

    function open_post(e){
        var target = $(e.target);
        if(!target.hasClass('post-wrapper')){
            target = target.parents('.post-wrapper');
        }
        if(target.hasClass('post-close')){
            target.removeClass('post-close');
            target.find('div.toggle-quote').click();
            return false;
        }
    }
    
    declare_frame({
        mark: 'topic',
        submit : submit,
        enter : function(kwargs){
            local.isfirst = true;
            local.loaded = 0;
            get_filename(kwargs, function(kwargs){
                local.first = null;
                local.kwargs = kwargs;
                $api.get_post_topiclist(
                    kwargs.boardname, kwargs.filename, function(data){
                        if(data.success){
                            local.boardname = cur_boardname = kwargs.boardname;
                            local.from_filename = kwargs.filename;
                            local.topiclist = data.data;
                            local.last_index = local.from_index =
                                local.oldest_index = 
                                $.inArray(kwargs.filename, local.topiclist);
                            render_template('topic-framework');
                            $('#post-container').click(open_post);
                            local.target = $($('#post-container')[0]);
                            submit.load_next();
                        }
                        else{
                            raise404(ERROR[data.code]);
                            console.error(data);
                        }
                    });
            });
        },
        local: local
    });

})

$MOD('page_func', function(){

    function parse_kw(text){
        var s = text.split('\n'),
        kw = {};
        for_each_array(s, function(ele){
            var t = ele.split(' : ');
            kw[t[0]] = t[1];
        });
        return kw;
    }

    function parse_text(text){
        var s = text.split('\n---\n'),
        obj = parse_kw(s[0]);
        obj.text = s[1];
        return obj;
    }
    return {
        parse_kw : parse_kw,
        parse_text : parse_text
    }
});

$MOD('frame::message', function(){

    var submit = {};
    function load_more(kwargs, e){
        var cursor = kwargs && kwargs.cursor;
        if(cursor === undefined){
            cursor = $(e.target).data('cursor');
        }
        if (cursor != 1) {
            $api.get_message(cursor, function(data){
                $api.mark_message_read(data.data.mlist[0].index);
                render_string('messages', data.data).replaceAll('#loader');
            });
        }
    }        
        
    submit = {
        'load-more' : load_more
    }

    declare_frame({

        mark: 'message',

        enter: function(){
            render_template('message_framework');
            load_more({ cursor: 0 });
        },

        marktop: 'message',

        submit: submit
        
    });

});

$MOD('frame::setting', function(){

    var submit = {};

    submit['update-mailhint'] = function(){
        var i1=$('#input-imail').is(':checked')?0:1,
        i2=$('#input-fav').is(':checked')?0:1;
        if(i1 || i2){
            modal_confirm('取消邮件提醒',
                          '取消邮件提醒提醒可能会使您不能够即时处理您的站内信或者看到您喜欢的版块的更新，您确定要取消邮件提醒？',
                          function(){
                              $api.update_self_setting(
                                  {
                                      'no_hint_mail': i1,
                                      'no_hint_fav': i2
                                  },
                                  function(data){
                                      show_alert("操作成功");
                                  });
                          });
        }
        else{
            $api.update_self_setting(
                {
                    'no_hint_mail': i1,
                    'no_hint_fav': i2
                },
                function(data){
                    show_alert("操作成功");
                });
        };
    }

    declare_frame({
        mark: 'setting',
        enter: function(){
            $api.get_self_setting(function(data){
                render_template('setting',{ 'setting': data.data});
            })
        },
        submit: submit
    });

});                

$MOD('frame::profile', function(){

    var submit = {}

    submit['update-user'] = function(kwargs, e){
        if(kwargs.birthday){
            $api.update_user_info({
                birthyear: kwargs.birthday.substr(0, 4),
                birthmonth: kwargs.birthday.substr(5, 7),
                birthday: kwargs.birthday.substr(8)
            }, function(data){
                if(data.success){
                    show_alert('更新成功！', 'success');
                    refresh_frame();
                }
                else{
                    show_alert(ERROR[data.code]);
                }
            });
        }
        else{
            $api.update_user_info(
                kwargs, function(data){
                if(data.success){
                    show_alert('更新成功！', 'success');
                    refresh_frame();
                }
                else{
                    show_alert(ERROR[data.code]);
                }
            });
        };            
    }

    function before_avatar_submit(){
        var file = $('[name=avatar]')[0];
        if(file.files){
            file = file.files[0];
            if(!file){
                show_alert('还未选择文件！', 'danger');
                return false;
            }
            var name = file.name;
            var size = file.size;
            var type = file.type;
            if(file.name.length < 1) {
                show_alert('不是有效的文件！', 'danger');
                return false;
            }
            else if(file.size > 1048576) {
                show_alert('文件太大了！', 'danger');
                return false;
            }
            else if(file.type != 'image/jpg' && file.type != 'image/jpeg'){
                show_alert('目前只支持jpg文件 ：-（', 'danger');
                return false;
            }
        }
    }

    function update_avatar_success(data){
        if(data.success){
            show_alert('更新成功！');
            var d = $('<img style="position: fixed; visibility: hidden;" src="'+url_for_avatar($G.authed.u.userid)+'?_+'+ Number(new Date())+'"/>');
            d.appendTo($('body'));
            setTimeout(function(){
                location.reload(true);
            }, 2000);
        }
        else{
            show_alert(ERROR[data.code], 'danger');
        }
    }

    submit['update-avatar'] = function(kwargs, e){
        var file = $('[name=avatar]')[0];
        if(file.files){
            file = file.files[0];
            if(!file){
                show_alert('还未选择文件！', 'danger');
                return;
            }
            var name = file.name;
            var size = file.size;
            var type = file.type;
            if(file.name.length < 1) {
                show_alert('不是有效的文件！', 'danger');
                return;
            }
            else if(file.size > 1048576) {
                show_alert('文件太大了！', 'danger');
                return;
            }
            else if(file.type != 'image/jpg' && file.type != 'image/jpeg'){
                show_alert('目前只支持jpg文件 ：-（', 'danger');
                return;
            }
        }
        try{
            $api.update_user_avatar(
                '#update-avatar', function(data){
                    if(data.success){
                        show_alert('更新成功！');
                        location.reload();
                    }
                    else{
                        show_alert(ERROR[data.code], 'danger');
                    }
                });
        }catch(e){
            alert(e);
        };
        return false;
    }

    declare_frame({
        mark: 'profile',
        enter: function(){
            $api.get_self_info(function(data){
                if(data.success){
                    render_template('profile', { self: data.data });
                    $('#update-avatar').ajaxForm({
                        url : '/ajax/user/update',
                        beforeSubmit : before_avatar_submit,
                        success : update_avatar_success,
                        dataType : 'json'                        
                    });
                }
                else{
                    raise404(ERROR[data.code], 'danger');
                }
            });
        },
        submit: submit
    });
})

$MOD('frame::mail', function(){

    var PAGE_LIMIT = 20;

    var submit = {},
    local = {};

    function pop_new_mail(){
        if(!$G.authed){
            show_alert('请先登录再执行此操作：-）');
            return;
        }
        init_popwindow('popwindow/newmail');
    }
    submit.pop_new_mail = pop_new_mail;

    submit.send_mail = function(kwargs, e){
        $api.send_mail(kwargs.title,
                       kwargs.content,
                       kwargs.receiver,
                       function(data){
                           if(data.success){
                               show_alert('发表成功！', 'success');
                               close_popwindow();
                               refresh_frame();
                           }
                           else{
                               console.log(data);
                               show_alert(ERROR[data.code], 'danger');
                           }
                       });
    }                       

    function set_page(pagenum){
        var start = pagenum * PAGE_LIMIT - PAGE_LIMIT;
        var target = $($('#maillist-container')[0]);
        $api.get_maillist(start, function(data){
            if(data.success){
                $('#maillist-content').remove();
                render_template('mail-li', { mails: data.data},
                                target);
                local.start = data.data[0].index + 1;
            }
            else{
                console.error(data);
            }
        });
    }

    function set_page_anim(pagenum){
        $('#maillist-content').fadeTo(200, 0.61, function(){
            set_page(pagenum);
        });
    }

    declare_frame({
        mark: 'mail',
        marktop: 'mail',
        enter : function(kwargs){
            $api.get_mailbox_info(function(data){
                var index;
                if(kwargs.index){
                    local.hover = index = kwargs.index;
                }
                else{
                    index = data.data.total;
                }
                if(data.success){
                    render_template('mail-framework', { mailbox: data.data });
                    local.index = index;
                    var pagenum = Math.ceil(index / PAGE_LIMIT);
                    $('.bpagination').jqPagination({
		                page_string	: '第 {current_page} 页 / 共 {max_page} 页',
		                paged		: set_page_anim,
                        current_page: pagenum
		            });
                    set_page(pagenum);
                }
                else{
                    raise404(ERROR[data.code]);
                    console.error(data);
                }               
            });
        },
        submit: submit,
        local: local
    });

})

$MOD('frame::readmail', function(){

    var local = {},
    submit = {};

    submit['open-folding'] = function(kwargs, e){
        $('.folding').removeClass('folding');
        $('.folding-btn').remove();
    }

    submit['toggle-quote'] = $MOD['frame::flow'].toggle_quote;

    function pop_reply_mail(kwargs){
        if(!$G.authed){
            show_alert('请先登录再执行此操作：-）');
            return;
        }
        var quote = $MOD.format.gen_quote_mail(local.mail);
        init_popwindow('popwindow/replymail', quote);
    }
    submit.pop_reply_mail = pop_reply_mail;

    function reply_mail(kwargs){
        $api.reply_mail(kwargs.title,
                        kwargs.content,
                        kwargs.receiver,
                        kwargs.toreply,
                        function(data){
                            if(data.success){
                               show_alert('信件已经寄出！', 'success');
                               close_popwindow();
                               refresh_frame();
                           }
                           else{
                               console.log(data);
                               show_alert(ERROR[data.code], 'danger');
                           }
                        });
    }
    submit.reply_mail = reply_mail;

    function set_mail(index, success, failed){
        $api.get_mail(index, function(data){
            if(data.success){
                var text = $MOD.format.format(data.data);
                local.index = index;
                local.mail = data.data;
                $('#main').empty();
                data.data.htmlcontent = $MOD.format.format(data.data.content);
                render_template('readmail', {
                    mail: data.data
                });
                if(success)
                    success();
            }
            else{
                failed();
            }
        });
    }

    function new_no_mail_alerter(msg){
        return function(){
            show_alert(msg, 'success');
            $('.post-wrapper').fadeTo(255, 1);
        }
    }

    var last_alerter = new_no_mail_alerter('没有新的邮件了！'),
    oldest_alerter = new_no_mail_alerter('已经是第一封了哟！');

    submit.next_mail = function(){
        $('.post-wrapper').fadeTo(200, 0.61, function(){
            set_mail(Number(local.index) + 1, function(){
                quite_set_hash(url_for_readmail(local.index));
            }, last_alerter);
        });
    }

    submit.prev_mail = function(){
        $('.post-wrapper').fadeTo(200, 0.61, function(){
            set_mail(Number(local.index) - 1, function(){
                quite_set_hash(url_for_readmail(local.index));
            }, oldest_alerter);
        });
    }

    declare_frame({
        mark: 'readmail',
        enter: function(kwargs){
            set_mail(kwargs.index);
        },
        local: local,
        submit: submit
    })
    
});

$MOD('frame::page', function(){
    declare_frame({
        mark: 'page',
        enter: function(kwargs){
            var path = kwargs.path;
            $.get('page/' + path,
                  function(data){
                      $('#main').html(data);
                      $('.format').format();
                  });
        }
    });
});                   

$MOD('frame::anc', function(){
    declare_frame({
        mark: 'anc',
        enter: function(kwargs){
            $api.get_anc(kwargs.path, function(data){
                if(data.success){
                    $('#main').html($MOD.format.format(data.data));
                }
            });
        }
    });
})
                   
$MOD('frame::admin_board', function(){

    var submit = {};

    function links2str(links){
        var buf='';
        for_each_array(links, function(element){
            if(typeof element == "string"){
                buf.concat(element +'\n');
                return;
            }
            buf.concat(element[0] + ',' + element[1]);
        });
        return buf;
    }
    
    function get_simple_setting(kwargs){
        var ret={}, widgets=kwargs.widgets;
        if(kwargs.brand_url){
            ret.logo = kwargs.brand_url;
        }
        if(!widgets){
            return ret;
        }
        if(widgets.length < 2){
            widgets.length = 2;
        }
        if(widgets[0] && (widgets[0].title=="版主的话")){
            ret.intro = widgets[0].text;
        }
        else{
            ret.intro = "这是一个充满爱的版块！";
        }
        if(widgets[1] && (widgets[1].title=="一些链接")){
            ret.links = links2str(widgets[1].links);
        }
        return ret;
    }

    function parse_links(text){
        var a = text.split('\n');
        var links = [];
        for_each_array(a, function(ele){
            if($.inArray(',', ele)!=-1){
                links.push(ele.split(',').slice(0, 2));
            }
            else{
                links.push(ele);
            }
        });
        return links;
    }
    
    function built_simple_setting(kwargs){
        var t = {}, widgets=[], w;
        if(kwargs.logo)
            t.brand_url = kwargs.logo;
        if(kwargs.intro)
            widgets.push({
                type: 'text',
                title: '版主的话',
                text: kwargs.intro
            });
        if(kwargs.links)
            widgets.push({
                type: 'links',
                title: '一些链接',
                links: parse_links(kwargs.links)
            });
        if(widgets.length)
            t.widgets = widgets;
        return t;
    }

    submit['update_board_setting'] = function(kwargs){
        var t = built_simple_setting(kwargs);
        if($.isEmptyObject(t)){
            t = '';
        }
        $api.set_board_www_etc(kwargs.boardname, t, function(data){
            if(data.success){
                show_alert('更新版块设定成功！');
            }
            else{
                show_alert(ERROR[data.code], 'danger');
            }
        });
    }
    
    declare_frame({
        mark: 'admin_board',
        enter: function(kwargs){
            $api.get_board_info(kwargs.boardname, function(data){
                if(data.success && data.data.isadmin){
                    var args = {}, boardname=kwargs.boardname;
                    // args = get_simple_setting(data.data.www);
                    render_template('admin_board', {
                        boardname: boardname,
                        args: args
                    });
                }
                else{
                }
            });
        },
        submit: submit
    });

    return {
        get_simple_setting: get_simple_setting,
        built_simple_setting: built_simple_setting
    }
    
})

$MOD('frame::bm_selection', function(){

    var submit = {};


    function render_post(data){
        return {
            title: data.userid + ' 申请 ' + data.boardname + '版务',
            content:
            '\n申请看版： ' + data.boardname + ' \n'
                + '申请人id： ' + data.userid + ' \n'
                + '院系年级： ' + data.cls + '\n\n\n'
                + '联系邮箱： ' + data.email + ' \n'
                + data.intro,
            boardname: 'New_boardmanager'
        }
    }

    function render_mail(data){
        return {
            title: data.userid + ' 申请 ' + data.boardname + '版务',
            content:
            '真实姓名： ' + data.realname + '\n'
                + '申请看版： ' + data.boardname + ' \n'
                + '申请人id： ' + data.userid + ' \n'
                + '联系邮箱： ' + data.email + ' \n'
                + '院系年级： ' + data.cls + '\n\n\n'
                + data.intro,
            receiver: DATA_ADMIN
        }
    }

    submit['post-selpost'] = function(kwargs, e){
        if(!confirm('确认发表竞选帖？')){
            return;
        }
        var data = {}, content;
        data.boardname = $('[name=boardname]').val();
        data.intro = $('[name=intro]').val();
        data.realname = $('[name=name]').val();
        data.email = $('[name=email]').val();
        data.cls = $('[name=class]').val();
        data.userid = $G.authed.u.userid;
        post = render_post(data);
        $api.new_post(
            post.boardname, post.title, post.content,
            function(data){
                if(data.success){
                    show_alert('竞选帖已发至 New_boardmanager 版');
                    setTimeout(function(){
                        location = url_for_board('New_boardmanager');
                    }, 1000);
                    var mail = render_mail(data);
                    $api.send_mail(data.title,
                                   data.content,
                                   data.receiver);
                }
                else{
                    show_alert(ERROR[data.code]);
                }
            });
    }

    declare_frame({
        mark: 'bm_selection',
        submit: submit,
        enter: function(kwargs){
            render_template('bm_selection');
        }
    });
    
});

$MOD('frame::admin', function(){

    var submit = {};

    submit['get-target'] = function(kwargs, e){
        var target = $(e.target),
        t = target.attr('data-targetname');
        $.get('/ajax/etc/get', 
              {
                  target: t
              },
              function(data){
                  if(data.success){
                      $('#etc-container').val(data.data.data).attr('targetname', t);
                  }
                  else{
                      console.log(['ERROR', data]);
                  }
              });
    }

    submit['update-target'] = function(){
        var t = $('#etc-container').attr('targetname'),
        content = $('#etc-container').val();
        $.post('/ajax/etc/update', 
               {
                   target: t,
                   content: content
               },
               function(data){
                   if(data.success){
                       show_alert('更新成功！');
                   }
                   else{
                       show_alert('更新失败', 'danger');
                   }
               });
    }

    submit['update-user-title'] = function(){
        var userid = $('#etc-inputer').val();
        var content = $('#etc-title-content').val();
        $api['!update_user_title'](userid, content, function(data){
            if(data.success){
                show_alert('更新成功！');
            }
            else{
                show_alert('更新失败！', 'danger');
            }
        });
    }

    submit['check-user-title'] = function(){
        var userid = $('#etc-inputer').val(), title;
        $api.query_user(userid, function(data){
            if(data.success){
                title = data.data.title;
                if(title){
                    var i, content='';
                    for(i=0; i<title.length; ++i){
                        content = content + title[i].join(' ') + '\n';
                    }
                    $('#etc-title-content').val(content);
                }
            }
        });
    }

    declare_frame({
        mark: 'admin',
        submit: submit,
        enter: function(kwargs){
            $.get('/ajax/etc/alltarget', function(data){
                if(data.success){
                    render_template('admin', {
                        'desc': data.data.desc
                    });
                }
            });
        }
    });

    submit['authinvcode'] = function(){
        $.post('/ajax/auth/invcode',
               {
                   invcode: $('#invcode').val()
               },
               function(data){
                   if(data.success){
                       show_alert('邀请码激活成功！现在开始畅游逸仙！');
                       setTimeout(function(){
                           location.hash = '';
                           location.reload(true);
                       }, 1000);
                   }
                   else{
                       show_alert(ERROR[data.code] || data.error);
                   }
               });
    }

    declare_frame({
        mark : 'invcode',
        submit : submit,
        enter : function(){
            render_template('invcode');
        }
    });

    declare_frame({
        mark : 'mine',
        enter : function(){
            $api.get_my_part_topic(function(data){
                render_template('mine', data);
            });
        },
        marktop: 'mine'
    });

    declare_frame({
        mark : 'myinv',
        enter : function(){
            $api.get_self_inv(function(data){
                if(data.success){
                    render_template('myinv', data.data);
                }
            });
        }
    });

    declare_frame({
        mark: 'freshmen',
        submit: submit,
        enter: function(kwargs){
            var type = (kwargs.type=='topic')?('topic'):('digest');
            $api.get_board_info('Freshmen', function(data){
                var info = data.data;
                var intro = $MOD.format.format(info.www.widgets[0].text);
                $api.get_postindex(
                    'Freshmen', type, 0, function(data){
                        var digest = data.data.reverse();
                        $api.get_postindex(
                            'Freshmen', 'topic', 0, function(data){
                                var topic = data.data.reverse();
                                render_template('freshmen', {
                                    info: info,
                                    intro: intro,
                                    type: type,
                                    digest: digest,
                                    topic: topic
                                })
                        });
                    });                                         
            });            
        }
    });

});

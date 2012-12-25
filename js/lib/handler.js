$MOD('frame.home', function(){

    function format_number(x){
        x = Number(x);
        if(x < 10) return 'default';
        else if(x < 20) return 'success';
        else if(x < 50) return 'info';
        else if(x < 80) return 'warning';
        else return 'important';
    }

    var TPL_BOARDNAV = 'home-boardnav',
    TPL_TOPTEN = 'home-topten';

    declare_frame({
        mark: 'home',
        enter: function(){
            $.get('/ajax/comp/www_home',
                  function(data){
                      var secg;
                      if(data.success){
                          secg = data.data.boardnav;
                          for(s in secg){
                              secg[s].boards.sort(function(a, b){
                                  return (b.lastpost - a.lastpost);
                              });
                          }
                          render_template('home', data.data);
                          load_widgets(data.data.www.widgets);
                      }
                  });
        }
    });

});

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

    require_jslib('jquery.jqpagination');

    // var Range = $MOD.range.Range,
    BoardStatus = $Type('BoardStatus', ['boardname',
                                        'loader',
                                        'render',
                                        'start',
                                        'isnull']);
    
    var cur_board = BoardStatus({ isnull: true }),
    ajax, local = {}, 
    submit = {};

    local.cur_board = cur_board;

    // get_range_start = $MOD.range.range_start;
    // range_update = $MOD.range.range_update;

    function get_current_board(){
        return cur_board;
    }

    // function get_first_unread_range(boardname){
    //     return PostRange(0, 20);
    // }

    function new_api_loader(type){
        return function(boardname, start, success, failed){
            $api.get_postindex_limit(boardname, type, start, PAGE_LIMIT,
                               function(data){
                                   if(data.success){
                                       success(data.data);
                                   }
                                   else{
                                       failed();
                                   }
                               });
        }
    }

    load_normal_post = new_api_loader('normal');
    load_topic_post = function(boardname, start, success, failed){
        $api.get_postindex_limit(
            boardname, 'topic',
            start,
            PAGE_LIMIT,
            function(data){
                if(data.success){
                    success(data.data);
                }
                else{
                    failed();
                }
            });
    }
    load_digest_post = new_api_loader('digest');

    function new_postlist_render(tpler){
        return function(boardname, data, pagenum){
            $('#postlist-content').remove();
            render_template(tpler, {
                posts: data,
                boardname: boardname,
                has_next_page: (pagenum < local.max_page),
                has_prev_page: (pagenum > 1)
            }, local.postlist_container);
        }
    }

    render_normal_post = new_postlist_render('board-postlist-normal'); 
    render_topic_post = new_postlist_render('board-postlist-topic'); 
    render_digest_post = new_postlist_render('board-postlist-digest'); 

    function trim_pagenum(number){
        number = Number(number);
        if(!(number >0))
            number = 0;
        return Math.ceil(number / PAGE_LIMIT);
    }

    function set_page(pagenum){
        var start = pagenum * PAGE_LIMIT - PAGE_LIMIT + 1;
        local.pagenum = pagenum;
        cur_board.loader(cur_board.boardname, start, function(data){
            cur_board.render(cur_board.boardname, data, pagenum);
            // range_update(cur_board.range, data[0].index,
            //              data[data.length-1].index);
        });
    }

    function new_wrapper_loader(loader, callback){
        return function(){
            loader(cur_board.boardname, 0, function(data){
                var total = data[data.length-1].index,
                pagetotal = Math.ceil(total / PAGE_LIMIT),
                curnum = (total % PAGE_LIMIT) || PAGE_LIMIT;
                local.max_page = pagetotal;
                data = data.slice(-curnum);
                cur_board.loader = loader;
                if($('.pagination').jqPagination('option',
                                                 'max_page') < pagetotal){
                    $('.pagination').jqPagination('option', 'max_page', 
                                               pagetotal);
                    $('.pagination').jqPagination('option', 'current_page',
                                                  pagetotal);
                }
                else{
                    $('.pagination').jqPagination('option', 'current_page',
                                                  pagetotal);
                    $('.pagination').jqPagination('option', 'max_page', 
                                               pagetotal);
                }                    
                set_page(local.max_page);
                callback();
            });
        }
    }

    submit['next_page'] = function(){
        window.scrollTo(0,0);
        $('.pagination').jqPagination(
            'option', 'current_page',
            $('.pagination').jqPagination('option', 'current_page') + 1);
    }
    submit['prev_page'] = function(){
        window.scrollTo(0,0);
        $('.pagination').jqPagination(
            'option', 'current_page',
            $('.pagination').jqPagination('option', 'current_page') - 1);
    }
    submit['set_normal_loader'] = set_normal_loader
        = new_wrapper_loader(load_normal_post, function(){
            local.kwargs.view = 'normal';
            $.cookie('boardview', 'normal');
            quite_set_hash('#!board', local.kwargs);
            delete local.kwargs['index'];
            cur_board.render = render_normal_post;
            delete cur_board.hover;
            $('#loader-wrapper .active').removeClass('active');
            $('#normal-loader').addClass('active');
        });
    submit['set_digest_loader'] = set_digest_loader
        = new_wrapper_loader(load_digest_post, function(){
            local.kwargs.view = 'digest';
            $.cookie('boardview', 'digest');
            delete local.kwargs['index'];
            quite_set_hash('#!board', local.kwargs);
            cur_board.render = render_digest_post;
            delete cur_board.hover;
            $('#loader-wrapper .active').removeClass('active');
            $('#digest-loader').addClass('active');
        });
    submit['set_topic_loader'] =  set_topic_loader
        = new_wrapper_loader(load_topic_post, function(){
            local.kwargs.view = 'topic';
            $.cookie('boardview', 'topic');
            delete local.kwargs['index'];
            quite_set_hash('#!board', local.kwargs);
            cur_board.render = render_topic_post;
            delete cur_board.hover;
            $('#loader-wrapper .active').removeClass('active');
            $('#topic-loader').addClass('active');
        });
    
    function set_page_anim(pagenum){
        $('#postlist-content').fadeTo(200, 0.61, function(){
            set_page(pagenum);
        });
    }

    function refresh_current_page(){
        // location.hash = url_for_board(cur_board.boardname);
        refresh_frame();
    }
    submit['refresh_current_page'] = refresh_current_page;

    submit['newpost'] = function(){
        if(!$G.authed){
            show_alert('请先登录再执行此操作：-）');
            return;
        }
        init_popwindow('popwindow/newpost',
                       { boardname: cur_board.boardname});
    }

    submit['publish_post'] = function(kwargs, e){
        if(e.target.tagName == 'FORM'){
            $api.new_post_form('#new-post-form',
                               // $api.new_post(cur_board.boardname,
                               //               kwargs.title,
                               //               kwargs.content,
                               function(data){
                                   if(data.success){
                                       show_alert('发表成功！', 'success');
                                       close_popwindow();
                                       refresh_current_page();
                                   }
                                   else{
                                       show_alert(ERROR[data.code], 'danger');
                                   }
                               });
        }
    }

    var MAYBE_VIEW = { 'topic': true, 'digest': true, 'normal': true}

    function set_default_loader(cur_board, kwargs){
        var start_page, last, total;
        if(typeof kwargs.view == "undefined"){
            kwargs.view = $.cookie('boardview');
            if(!MAYBE_VIEW[kwargs.view]){
                $.cookie('boardview', 'normal');
                kwargs.view = 'normal';
            }
        }
        if(!MAYBE_VIEW[kwargs.view]){
            kwargs.view = 'normal';
        }            
        if(kwargs.view == 'topic'){
            cur_board.loader = load_topic_post;
            cur_board.render = render_topic_post;
            $('#topic-loader').addClass('active');
            total = last = cur_board.data.total_topic;
        }
        else if(kwargs.view == 'digest'){
            cur_board.loader = load_digest_post;
            cur_board.render = render_digest_post;
            $('#digest-loader').addClass('active');
            total = last = cur_board.data.total_digest;
        }
        else{
            cur_board.loader = load_normal_post;
            cur_board.render = render_normal_post;
            $('#normal-loader').addClass('active');
            last = cur_board.data.lastread;
            if(last==-1){
                last = cur_board.data.total;
            }
            else{
                local.hover = Math.min(last+1, cur_board.data.total);
            }
            total = cur_board.data.total;
        }
        cur_board.isnull = false;
        if(local.hover = kwargs.index){
            start_page = trim_pagenum(local.hover);
        }
        else{
            start_page = Math.ceil(last / PAGE_LIMIT);
        }
        local.max_page = Math.ceil(total / PAGE_LIMIT);
        $('.pagination').jqPagination({
		    page_string	: '第 {current_page} 页 / 共 {max_page} 页',
		    paged		: set_page_anim,
            current_page: start_page,
            max_page: local.max_page
		});
        set_page(start_page);
        local.kwargs = kwargs;
    }

    function read_post(kwargs, e){
        var filename = $(e.target).attr('data-filename');
        if(local.mode_title == '只显示主题第一贴'){
            window.location = url_for_topic(filename,
                                            cur_board.boardname);
        }
        else{
            window.location = url_for_post(filename,
                                           cur_board.boardname);
        }
    }
    submit['read_post'] = read_post;

    // function get_default_range(){
    //     return $Type.Range([0, NaN]);
    // }

    function enter_board(kwargs){

        var boardname = kwargs.boardname, pagenum;
        cur_board.boardname = boardname;
        
        $api.get_board_info(boardname, function(data){
            var start_page, last;
            if(data.success){
                cur_board.data = data.data;
                render_template('board-boardinfo',
                                {
                                    board: data.data,
                                    PAGE_LIMIT: PAGE_LIMIT
                                });
                local.postlist_container = $('#postlist-container');
                set_default_loader(cur_board, kwargs);
                if(data.data.www.widgets){
                    load_widgets(data.data.www.widgets);
                }
                if(data.data.www.brand_url){
                    $('.board-header-inner').css(
                        'background-image',
                        'url("' + data.data.www.brand_url +'")');
                }
                $api.get_last_postindex(boardname, 'digest', 5, function(data){
                    if(data.success){
                        var l = data.data.reverse();
                        render_template('widget/postlist', {
                            title: '最新文摘',
                            posts: l,
                            boardname: boardname,
                            more: 'set_digest_loader',
                        }, '#dy-widgets');
                    }
                });
                var sec_con = $('#near-board');
                $api.get_boards_by_section(
                    cur_board.data.seccode,
                    function(data){
                        if(data.success){
                            data.data.sort(function(a, b){
                                return b.lastpost - a.lastpost;
                            });
                            render_template('board-near-board',
                                            {
                                                boards: data.data,
                                                secnum : cur_board.data.secnum
                                            },
                                            sec_con);
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

    function book_fav(){
        var boardname;
        if(cur_board && (boardname = cur_board.boardname)){
            $api.add_self_fav(boardname, function(data){
                if(data.success){
                    show_alert('收藏' + boardname + '版成功！', 'success');
                    refresh_fav();
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
                refresh_fav();
            });
        };
    }
    submit['clear_unread'] = clear_board_unread;

    declare_frame({
        mark: 'board',
        isnew: true,
        keep_widgets: false,
        enter : enter_board,
        ajax : ajax,
        submit: submit,
        local: local
    });

})

$MOD('frame::post', function(){

    require_jslib('format');

    var local = {},
    submit = {},
    cur_boardname = null;
    
    function handler_post(post){
        post.content = $MOD.format.format(post.rawcontent);
        post.signature = $MOD.format.format(post.rawsignature);
        return post;
    }

    function _load_post(){
        var target = $('#post-container');
        $api.get_post(
            cur_boardname, local.last_filename,
            function(data){
                if(data.success){
                    render_template(
                        'post',
                        handler_post(data.data),
                        target);
                }
                else{
                    raise404(ERROR[data.code]);
                }
            });
    }

    function update_hash(data){
        local.kwargs.last = data.data;
        quite_set_hash('#!flow', local.kwargs);
    }

    function new_post_loader(direct, ref, handler, render, failed, callback){
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
                                    '#post-container');
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
    var load_next = submit['load_next'] = new_post_loader(
        'next', 'last_filename',
        update_hash,
        render_template,
        function(){
            $('#post-down [data-submit]').remove();
            $('#post-down .hidden').removeClass('hidden');
        }
    );

    bind_hook('after_scroll', function(){
        if($G.current.mark != 'flow' || load_next.lock){
            return;
        }
        if($('body').height() - $(window).height() - $(window).scrollTop() < 100){
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

    // submit['
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
        publish_reply: publish_reply
    }

})

$MOD('frame::topic', function(){

    var PAGE_LIMIT = 5;
    
    var submit = {},
    local = {};

    var handler_post = $MOD['frame::post'].handler_post;

    var lock = false;

    function new_loader(init, finish, get_filename, render, error){
        function load(counter){
            var filename;
            if(counter){
                if(filename = get_filename(counter)){
                    $api.get_post(cur_boardname, filename, function(data){
                        if(data.success){
                            render('topic',
                                   handler_post(data.data),
                                   '#post-container');
                            if(--counter){
                                load(--counter);
                            }
                            else{
                                local.kwargs.last = filename;
                                quite_set_hash('#!topic', local.kwargs);
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
        $('#post-down [data-submit]').remove();
        $('#post-down .hidden').removeClass('hidden');
    }, function(){
        return (local.last_index < local.topiclist.length)?
            local.topiclist[local.last_index++] : false;
    }, render_template);

    bind_hook('after_scroll', function(){
        if($G.current.mark != 'topic' || lock || !local.topiclist){
            return;
        }
        if($('body').height() - $(window).height() - $(window).scrollTop() < 100){
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

    declare_frame({
        mark: 'topic',
        submit : submit,
        enter : function(kwargs){
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
                        submit.load_next();
                    }
                    else{
                        raise404(ERROR[data.code]);
                        console.error(data);
                    }
                })
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

$MOD('frame::profile', function(){

    submit = {}

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

    submit['update-avatar'] = function(kwargs, e){

        var file = $('[name=avatar]')[0].files[0],
        name = file.name,
        size = file.size,
        type = file.type;

        if(file.name.length < 1) {
            show_alert('不是有效的文件！', 'danger');
        }
        else if(file.size > 100000) {
            show_alert('文件太大了！', 'danger');
        }
        else if(file.type != 'image/jpg' && file.type != 'image/jpeg'){
            show_alert('目前只支持jpg文件 ：-（', 'danger');
        }
        else {
            $api.update_user_avatar(
                '[data-submit=update-avatar]', function(data){
                    if(data.success){
                        show_alert('更新成功！');
                    }
                    else{
                        show_alert(ERROR[data.code], 'danger');
                    }
                });
        };
    }

    declare_frame({
        mark: 'profile',
        enter: function(){
            $api.get_self_info(function(data){
                if(data.success){
                    render_template('profile', { self: data.data });
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
        var target = $('#maillist-container');
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
                    $('.pagination').jqPagination({
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
                    args = get_simple_setting(data.data.www);
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

$MOD('frame::admin', function(){

    var www
    , submit = {};

    submit['update-www'] = function(kwargs){        
        var d = jQuery.parseJSON(kwargs.data);
        $api.set_www_etc(d, function(data){
            if(data.success){
                show_alert('更新成功！', 'success');
            }
            else{
                show_alert(ERROR[data.code], 'danger');
            }
        });
    }

    declare_frame({
        mark: 'admin',
        enter: function(kwargs){
            $api.get_www_etc(function(data){
                if(data.success){
                    www = data.data;
                    render_template('admin',  { d: json_encode(www) });
                }
                else{
                    show_alert(ERROR[data.code], 'danger');
                }
            });
        },
        submit: submit
    });

});

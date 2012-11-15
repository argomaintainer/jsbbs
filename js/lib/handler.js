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

    var ajax = {
        all_boards : function(container){
            $api.get_all_boards(function(data){
                var s;
                if(data.success){
                    for(s in data.data){
                        data.data[s].boards.sort(function(a, b){
                            return (Number(a.lastpost) - Number(b.lastpost));
                        });
                    }
                    $(container).empty();
                    render_template(TPL_BOARDNAV, { boards : data.data },
                                    container);
                }
            });
        },
        topten : function(container){
            $api.get_topten(function(data){
                $(container).empty();
                render_template(TPL_TOPTEN,
                                {
                                    posts: data.data,
                                },
                                container);
            });
        },            
    }
    declare_frame({
        mark: 'home',
        basetpl : 'home-framework',
        isnew : true,
        keep_widgets: false,
        enter: function(){},
        ajax: ajax,
        local: {
            format_number: format_number,
        },
        widgets_loader : function(){
            return DATA_WIDGETS.home;
        },
    });
    
});

$MOD('frame::user', function(){
    declare_frame({
        mark : 'user',
        enter : function(args){
            $api.query_user(args.userid, function(data){
                if(data.success){
                    render_template('user', { u: data.data, data: data.data });
                }
            });
        },
    });
});
                            
// $MOD('frame::mail', function(){

//     $Type('MailRange', ['start', 'end']);
    
//     $G.local.cur_range = null;
    
//     function append_next(tolast){
//         var arr, start;
//         start = $G.local.cur_range.end==NaN ? 0 :
//             $G.local.cur_range.end + 1;
//         $api.get_maillist(start, function(data){
//             if(data.success && (arr=data.data)){
//                 render_template('mail-li', arr, '#maillist-container');
//                 $G.local.cur_range.end = arr[arr.length-1].index;
//                 if(tolast){
//                     $('#maillist-ctrl').mCustomScrollbar("scrollTo", "last");
//                 }
//             }
//         });
//     }

//     function prepend_prev(){
//         var arr, start;
//         start = $G.local.cur_range.start==NaN ? 0 :
//             $G.local.cur_range.start - 20;
//         $api.get_maillist(start, function(data){
//             if(data.success && (arr = data.data)){                
//                 render_template_prepend('mail-li', arr, '#maillist-container');
//                 $G.local.cur_range.start = arr[0].index;
//             }
//         })
//     }

//     require_jslib('format');

//     function read_mail(index){
//         var content;
//         $api.get_mail(index, function(data){
//             if(data.success){
//                 content = data.data;
//                 // content = $MOD.format.format(content);
//                 $('#mail-contentbox').empty();
//                 render_template('mail-content', { data: content },
//                                 '#mail-contentbox');
//                 $('#mail-' + index).find('i.unread').removeClass('unread').addClass('read');
//             }
//         });
//     }

//     $G.submit.read_mail = function(e){
//         var target = $(e.target),
//         index = target.attr('data-index');
//         read_mail(index);
//     }

//     return {
//         __enter__ : function(kwargs){
//             $api.get_mailbox_info(function(data){
//                 $G.local.cur_range = $Type.MailRange([NaN, NaN]);
//                 if(data.success){
//                     render_template('mail-framework', { mailbox: data.data });
//                     append_next(true);
//                 }
//                 else{
//                     show_alert(data.error);
//                 }
//             })
//         },
//         append_next: append_next,
//         prepend_prev: prepend_prev,
//         read_mail: read_mail,
//     }
// })


$MOD('frame::board', function(){

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
            $api.get_postindex(boardname, type, start,
                               function(data){
                                   if(data.success){
                                       success(data.data);
                                   }
                               });
        }
    }

    load_normal_post = new_api_loader('normal');
    load_topic_post = new_api_loader('topic');
    load_digest_post = new_api_loader('digest');

    function new_postlist_render(tpler){
        return function(boardname, data){
            $('#postlist-content').remove();
            render_template(tpler, { posts: data, boardname: boardname},
                            '#postlist-container');
        }
    }

    render_normal_post = new_postlist_render('board-postlist-normal'); 

    function trim_pagenum(number){
        number = Number(number);
        if(!(number >0))
            number = 0;
        return Math.ceil(number / 20);
    }

    function set_page(pagenum){
        var start = pagenum * 20 - 19;
        local.pagenum = pagenum;
        cur_board.loader(cur_board.boardname, start, function(data){
            cur_board.render(cur_board.boardname, data);
            // range_update(cur_board.range, data[0].index,
            //              data[data.length-1].index);
        });
    }

    function new_wrapper_loader(loader){
        return function(){
            loader(cur_board.boardname, 0, function(data){
                var total = data[data.length-1].index,
                pagetotal = Math.ceil(total / 20),
                curnum = (total % 20) || 20;
                data = data.slice(-curnum);
                cur_board.loader = loader;
                $('.vpagination').jqPagination('option', 'current_page',
                                               pagetotal);
                $('.vpagination').jqPagination('option', 'max_page',
                                               pagetotal);
            });
        }
    }

    submit['set_normal_loader'] = set_normal_loader
        = new_wrapper_loader(load_normal_post);
    submit['set_digest_loader'] = set_digest_loader
        = new_wrapper_loader(load_digest_post);
    submit['set_topic_loader'] =  set_topic_loader
        = new_wrapper_loader(load_topic_post);

    function set_page_anim(pagenum){
        $('#postlist-content').fadeTo(200, 0.61, function(){
            set_page(pagenum);
        });
    }

    function refresh_current_page(){
        set_page_anim(local.pagenum);
    }
    submit['refresh_current_page'] = refresh_current_page;

    submit['newpost'] = function(){
        init_popwindow('popwindow/newpost');
    }

    submit['publish_post'] = function(kwargs, e){
        $api.new_post(cur_board.boardname,
                      kwargs.title,
                      kwargs.content,
                      function(data){
                          if(data.success){
                              show_alert('发表成功！', 'success');
                              close_popwindow();
                              refresh_current_page();
                          }
                          else{
                              show_alert(data.error, 'danger');
                          }
                      });
    }

    function get_default_postloader(){
        return load_normal_post;
    }

    // function get_default_range(){
    //     return $Type.Range([0, NaN]);
    // }

    function enter_board(kwargs){

        var boardname = kwargs.boardname, pagenum;
        cur_board.boardname = boardname;
        cur_board.loader = get_default_postloader();
        cur_board.render = render_normal_post;
        // cur_board.range = Range({isnull: true});
        cur_board.isnull = false;
        
        $api.get_board_info(boardname, function(data){
            var start_page;
            if(data.success){
                cur_board.data = data.data;
                render_template('board-boardinfo',
                                {
                                    board: data.data,
                                });
                if(local.hover = kwargs.index){
                    start_page = trim_pagenum(local.hover);
                }
                else{
                    start_page = Math.ceil(data.data.total / 20);
                }
                $('.vpagination').jqPagination({
		            page_string	: '第 {current_page} 页 / 共 {max_page} 页',
		            paged		: set_page_anim,
                    current_page: start_page,
		        });
                set_page(start_page);
            };
        });                                
    }

    function book_fav(){
        var boardname;
        if(cur_board && (boardname = cur_board.boardname)){
            $api.add_self_fav(boardname, function(data){
                if(data.success){
                    show_alert('收藏' + boardname + '版成功！', 'success');
                }
                else{
                    show_alert(data.error);
                }
            });
        };
    }
    submit['book_fav'] = book_fav;

    function clear_board_unread(){
        var boardname;
        if(cur_board && (boardname = cur_board.boardname)){
            $api.clear_board_unread(boardname, function(data){
                refresh_frame();
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
        local: local,
    });

    return {
    }

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
        $api.get_post(
            cur_boardname, local.last_filename,
            function(data){
                render_template(
                    'post',
                    handler_post(data.data),
                    '#post-container');
            });
    }

    function update_hash(data){
        quite_set_hash(url_for_post(data.data, cur_boardname));
    }

    function new_post_loader(direct, ref, handler, render, failed, callback){
        return function(){
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
                                if(callback){
                                    callback(data);
                                }
                            });
                    }
                    else{
                        failed();
                    }
                }
            );
        }
    }
    
    submit['load_prev'] = new_post_loader(
        'prev', 'oldest_filename',
        update_hash,
        render_template_prepend,
        function(){
            show_alert('o(∩_∩)o <br\> 已经是第一篇了', 'success');
        }
    );
    submit['load_next'] = new_post_loader(
        'next', 'last_filename',
        update_hash,
        render_template,
        function(){
            $('#post-down [data-submit]').remove();
            $('#post-down .hidden').removeClass('hidden');
        }
    );
    require_jslib('format');
    submit['reply_post'] = function(kwargs, e){
        $api.get_post(local.boardname, kwargs.filename,
                      function(data){
                          if(data.success){
                              var quote = $MOD.format.gen_quote(data.data);
                              init_popwindow('popwindow/replypost', quote);
                          }
                      });                       
    }

    submit['publish_reply'] = function(kwargs, e){
        $api.reply_post(local.boardname, kwargs.title, kwargs.content,
                      kwargs.toreply, function(data){
                          if(data.success){
                              show_alert('回复成功！', 'success');
                              close_popwindow();
                          }
                      });
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
            _load_post();
        },
        local : local,
    });

    return {
        handler_post: handler_post,
    }

})

$MOD('frame::topic', function(){
    
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
                                quite_set_hash(url_for_topic(filename,
                                                             cur_boardname));
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
    
    submit['load_next'] = new_loader(
        20, function(){
        $('#post-down [data-submit]').remove();
        $('#post-down .hidden').removeClass('hidden');
    }, function(){
        return (local.last_index < local.topiclist.length)?
            local.topiclist[local.last_index++] : false;
    }, render_template);

    submit['load_prev'] = new_loader(
        20, function(){
            $('#post-up [data-submit]').remove();
            $('#post-up .hidden').removeClass('hidden');
        }, function(){
            return (local.oldest_index>=0) ?
                local.topiclist[local.oldest_index--] : false;
    }, render_template_prepend);

    declare_frame({
        mark: 'topic',
        submit : submit,
        enter : function(kwargs){
            $api.get_post_topiclist(
                kwargs.boardname, kwargs.filename, function(data){
                    if(data.success){
                        local.boardname = cur_boardname = kwargs.boardname;
                        local.from_filename = kwargs.filename;
                        local.topiclist = data.data;
                        local.last_index = local.from_index =
                            local.oldest_index = 
                            local.topiclist.indexOf(kwargs.filename);
                    }
                    else{
                        console.log(data);
                    }
                    render_template('topic-framework');
                    submit.load_next();
                })
        },
        local: local,
    });

})

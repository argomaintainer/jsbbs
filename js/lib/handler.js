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

// $MOD('frame::post', function(){
//     require_jslib('format');
//     function handler_post(post){
//         post.content = $MOD.format.format(post.rawcontent);
//         post.signature = $MOD.format.format(post.rawsignature);
//         return post;
//     }
//     declare_frame({
//         mark : 'post',
//         enter : function(kwargs){
//             $api.get_post(kwargs.boardname, kwargs.filename,
//                           function(data){
//                               render_template('post', handler_post(data.data));
//                           });
//         },
//     });
// })

$MOD('frame::user', function(){
    declare_frame({
        mark : 'user',
        enter : function(args){
            $api.query_user(args.userid, function(data){
                if(data.success){
                    console.log(data.data);
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
    ajax,
    submit = {};

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
        return Math.floor(number / 20) + 1;
    }

    function set_page(pagenum){
        var start = pagenum * 20 - 19;
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
            if(data.success){
                cur_board.data = data.data;
                render_template('board-boardinfo',
                                {
                                    board: data.data,
                                });
                $('.vpagination').jqPagination({
		            page_string	: '第 {current_page} 页 / 共 {max_page} 页',
		            paged		: set_page_anim,
                    current_page: 1,
		        });
                set_page(1);
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
        local: {
            cur_board: cur_board,
        }
    });

    return {
    }

})

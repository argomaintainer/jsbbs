$MOD('frame::home', function(){

    function format_number(x){
        x = Number(x);
        if(x < 10) return 'default';
        else if(x < 20) return 'success';
        else if(x < 50) return 'info';
        else if(x < 80) return 'warning';
        else return 'important';
    }
    return {
        __enter__ : function(){
            render_template('home-framework');
            load_widgets(DATA_WIDGETS.home);
            $api.get_all_boards(function(data){
                var s;
                if(data.success){
                    for(s in data.data){
                        data.data[s].boards.sort(function(a, b){
                            return (Number(a.lastpost) - Number(b.lastpost));
                        });
                    }                            
                    render_template('home-boardnav', { boards : data.data },
                                    '#part-boardnav');
                }
            });
            $api.get_topten(function(data){
                if(data.success){
                    render_template('home-topten',
                                    {
                                        posts: data.data,
                                        format_number: format_number,
                                    },
                                    '#part-topten');
                }
            });
        },
    };

})

$MOD('frame::board', function(){

    $Type('BoardStatus', ['type', 'boardname', 'start']);
    $Type('BoardPostRange', ['start', 'end']);

    $G.local.cur_board = null;
    $G.local.cur_range = null;

    var TPLTOR = {
        'normal': 'board-postlist-normal',
    }

    function fix_board_status(kwargs){
        if(!kwargs.boardname){
            throw "Unvail boardname";
        }        
        kwargs.type = kwargs.type || "normal";
        if(NaN == (kwargs.start = Number(kwargs.start))){
            kwargs.start = 0;
        }
        return {
            'type': kwargs.type,
            'boardname': kwargs.boardname,
            'start': kwargs.start,
        };
    }

    function handler_posts(start, handler){
        var cur_board = $G.local.cur_board;
        $api.get_postindex(
            cur_board.boardname, cur_board.type,
            start, function(data){
                var arr;
                if(data.success){
                    arr = data.data;
                    handler(TPLTOR[cur_board.type],
                            {
                                posts: arr,
                                boardname:
                                cur_board.boardname,
                            },
                            '#postlist-container');
                    if(arr){
                        start = Number(arr[0].index);
                        if(!($G.local.cur_range.start < start)){
                            $G.local.cur_range.start = start;
                        }
                        var lastindex = Number(arr[arr.length-1].index);
                        if(!($G.local.cur_range.end > lastindex)){
                            $G.local.cur_range.end = lastindex;
                        }
                    }
                }
                else{
                    if(data.status == 1){
                        show_alert("没有新数据啦！");
                    }
                }
            });
    }

    function append_postlist_li(){
        handler_posts($G.local.cur_range.end + 1, render_template);
    }

    function prepend_postlist_li(){
        if(!$G.local.cur_range.start || $G.local.cur_range.start==1 ){
            show_alert('上面没有帖子了！');
            return;
        }
        handler_posts($G.local.cur_range.start - 19, render_template_prepend);
    }

    function book_fav(){
        var boardname;
        if($G.local.cur_board && (boardname=$G.local.cur_board.boardname)){
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

    $G.submit['book_fav'] = book_fav;

    $G.submit['append_postlist_li'] = append_postlist_li;
    $G.submit['prepend_postlist_li'] = prepend_postlist_li;
    $G('default_board_start', {});

    return {
        append_postlist_li: append_postlist_li,
        prepend_postlist_li: prepend_postlist_li,
        __enter__ : function(kwargs){
            if(!('start' in kwargs)){
                if(kwargs.boardname in $G.default_board_start){
                    kwargs.start = $G.default_board_start[kwargs.boardname];
                    kwargs.start -= (kwargs.start % 20);
                }
            }
            var cur_board = $G.local.cur_board
                = $Type.BoardStatus(fix_board_status(kwargs));
            $G.local.cur_range = $Type.BoardPostRange([NaN, NaN]);
            init_frame_page(['boardinfo']);
            console.log(['cbs', cur_board.start]);
            $api.get_board_info(cur_board.boardname, function(data){
                if(data.success){
                    render_template('board-boardinfo',
                                    {
                                        board: data.data
                                    },
                                    '#part-boardinfo');
                    handler_posts(cur_board.start, render_template);
                }
            });
        },
        __leave__ : function(hash, kwargs){
            if(hash == 'post'){
                last = kwargs;
                $G.default_board_start[$G.local.cur_board.boardname] =
                    Number(kwargs.index);
            }
        },
    };
})

$MOD('frame::post', function(){
    require_jslib('format');
    function handler_post(post){
        post.content = $MOD.format.format(post.rawcontent);
        post.signature = $MOD.format.format(post.rawsignature);
        return post;
    }
    return {
        __enter__ : function(kwargs){
            $api.get_post(kwargs.boardname, kwargs.filename,
                          function(data){
                              render_template('post', handler_post(data.data));
                          });
        },
        __leave__ : function(newhash){
        },
    }
})

$MOD('frame::user', function(){
    return {
        __enter__ : function(kwargs){
            $api.query_user(kwargs.userid, function(data){
                if(data.success){
                    console.log(data.data);
                    render_template('user', { u: data.data, data: data.data });
                }
            });
        },
    }
})
                            
                            
$MOD('frame::mail', function(){

    $Type('MailRange', ['start', 'end']);
    
    $G.local.cur_range = null;
    
    function append_next(tolast){
        var arr, start;
        start = $G.local.cur_range.end==NaN ? 0 :
            $G.local.cur_range.end + 1;
        $api.get_maillist(start, function(data){
            if(data.success && (arr=data.data)){
                render_template('mail-li', arr, '#maillist-container');
                $G.local.cur_range.end = arr[arr.length-1].index;
                if(tolast){
                    $('#maillist-ctrl').mCustomScrollbar("scrollTo", "last");
                }
            }
        });
    }

    function prepend_prev(){
        var arr, start;
        start = $G.local.cur_range.start==NaN ? 0 :
            $G.local.cur_range.start - 20;
        $api.get_maillist(start, function(data){
            if(data.success && (arr = data.data)){                
                render_template_prepend('mail-li', arr, '#maillist-container');
                $G.local.cur_range.start = arr[0].index;
            }
        })
    }

    require_jslib('format');

    function read_mail(index){
        var content;
        $api.get_mail(index, function(data){
            if(data.success){
                content = data.data;
                // content = $MOD.format.format(content);
                $('#mail-contentbox').empty();
                render_template('mail-content', { data: content },
                                '#mail-contentbox');
                $('#mail-' + index).find('i.unread').removeClass('unread').addClass('read');
            }
        });
    }

    $G.submit.read_mail = function(e){
        var target = $(e.target),
        index = target.attr('data-index');
        read_mail(index);
    }

    return {
        __enter__ : function(kwargs){
            $api.get_mailbox_info(function(data){
                $G.local.cur_range = $Type.MailRange([NaN, NaN]);
                if(data.success){
                    render_template('mail-framework', { mailbox: data.data });
                    append_next(true);
                }
                else{
                    show_alert(data.error);
                }
            })
        },
        append_next: append_next,
        prepend_prev: prepend_prev,
        read_mail: read_mail,
    }
})

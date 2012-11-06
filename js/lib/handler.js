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
            init_frame_page(['topten', 'boardnav', 'wish']);
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
    return {
        __enter__ : function(kwargs){
        },
    }
})

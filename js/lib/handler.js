$MOD('func', function(){

    var localStorage = window.localStorage || {};
    var maxkey = 100;

    function check_isnew(boardname, topic, time){
        var d = localStorage['unread::'+boardname];
        if(d){
            d = $.parseJSON(d);
            return !d[topic] || d[topic] < time;
        }
        return true;
    }

    function set_read(boardname, topic, time){
        var key = 'unread::'+boardname;
        var d = localStorage[key];
        if(d){
            d = $.parseJSON(d);
            if(topic in d){
                if(time > d[topic])
                    d[topic] = time;
                localStorage[key] = $.toJSON(d);
            }
            else{
                if(topic <= d.$min)
                    return;
                if(d.$size > maxkey){
                    d = { $min: time, $size : 1};
                    d[topic] = time;
                }
                else{
                    d.$size ++;
                    d[topic] = title;
                }
                localStorage[key] = $.toJSON(d);
                return;
            }
        }                    
        if(!d){
            d = { $min : time, $size: 1};
            d[topic] = time;
            localStorage[key] = $.toJSON(d);
        }
        return;
    }

    window.check_isnew = check_isnew;
    window.set_read = set_read;

});

$MOD('frame.allp', function(){

    var submit = {};

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

    function load_new(callback){
        $api.get_fresh(function(data){
            render_template('fresh', { data: data.items });
            callback();
        });
        
        // $api.get_goodboards('new', function(data){
        //     var acb = data.activeboard;
        //     if(data.success){
        //         data = data.data;
        //         boards = data.boards.sort(cmp_boards);
        //     }
        //     else{
        //         boards = [];
        //     }
        //     if(acb && acb.length){
        //         acb = acb[acb.length-1];
        //         if(localStorage['f:home:activeboard'] == acb.title ){
        //             acb = null;
        //         }
        //     }
        //     render_template('allp', {
        //         boards: boards,
        //         www: data.www,
        //         activeboard : acb
        //     });
        //     if(data.www && data.www.widget){
        //         load_widgets(data.www.widgets);
        //     }
        //     callback();
        // });
    }

    function load_focus(){
        $.get('/ajax/comp/www_home',
              function(data){
                  if(data.success){
                      require_jslib('slides');
                      var n = $(render_string('focus', data.data));
                      $('#part-2').replaceWith(n);
                      $(function(){
                          $("#slides").slides({
                              start: Math.floor(
                                  Math.random() *
                                      data.data.www.posts.length) + 1
                          });
                      });
                      load_widgets(data.data.www.widgets);
                  }
              });
    }

    declare_frame({
        mark: 'home',
        enter: function(kwargs){
            if($G.authed && ((!$G.userfav_a)||($G.userfav_a.length < 5))
               &&(!localStorage['bool::watched-tut'])){
                location = '#!tut-2';
            }
            load_new(load_focus);
        },
        submit: submit,
        marktop: 'home'
    });

});

$MOD('frame::section', function(){

    var submit = {};

    submit['book_fav'] = function(kwargs, e){
        var boardname = $(e.target).attr('data-args');
        $api.add_self_fav(boardname, function(data){
            if(data.success){
                show_alert('收藏' + boardname + '版成功！', 'success');
                refresh_fav();
                $(e.target).removeClass('btn-info').addClass('disabled').text('取消收藏');
            }
            else{
                show_alert(ERROR[data.code]);
            }
        });
    }

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

    submit['open-folding'] = function(kwargs, e){
        $('.folding').removeClass('folding');
        $('.folding-btn').remove();
    }

    function new_postlist_render(tpler){
        return function(boardname, data, pagenum){
            $('#postlist-content').remove();
            var fold = 0, i;
            for(i in data){
                if(data[i].unread == 1){
                    fold = i;
                    break;
                }
            }
            render_template(tpler, {
                posts: data,
                fold: fold,
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
            last_pagenum[cur_board.boardname+':'+cur_board.view] = pagenum;
            cur_board.render(cur_board.boardname, data, pagenum);
            // range_update(cur_board.range, data[0].index,
            //              data[data.length-1].index);
        });
    }

    function new_wrapper_loader(loader, init, name){
        return function(){
            loader(cur_board.boardname, 0, function(data){
                var total = data[data.length-1].index,
                pagetotal = Math.ceil(total / PAGE_LIMIT),
                curnum = (total % PAGE_LIMIT) || PAGE_LIMIT;
                local.max_page = pagetotal;
                data = data.slice(-curnum);
                cur_board.loader = loader;
                // ugly a lot.
                var base = $('.bpagination').data('jqPagination');
                base.options.current_page = pagetotal;
                base.options.max_page = pagetotal;
                base.updateInput(true);
                init();
                cur_board.view = name;
                localStorage['lastview'] = name;
                cur_board.render(cur_board.boardname, data, pagetotal);
            });
        }
    }

    submit['next_page'] = function(){
        window.scrollTo(0,0);
        $('.bpagination').jqPagination(
            'option', 'current_page',
            $('.bpagination').jqPagination('option', 'current_page') + 1);
    }
    submit['prev_page'] = function(){
        window.scrollTo(0,0);
        $('.bpagination').jqPagination(
            'option', 'current_page',
            $('.bpagination').jqPagination('option', 'current_page') - 1);
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
        }, 'normal');
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
        }, 'digest');
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
        }, 'topic');
    
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


    submit['setb'] = function(kwargs, e){
        var self = $(e.target);
        var data = self.data('boardname');
        if(data){
            $('#qboardname').val(data);
        }
    }

    submit['see-more'] = function(){
        $('#see-more').text('加载中...');
        $api.get_all_boards(function(data){
            $('#allboards').html(render_string('qp-seemore', data.data));
            $('#see-more').remove();
        }, '#allboards');
    }

    declare_frame({
        mark: 'quickpost',
        submit: submit,
        enter : function(kwargs){
            render_template('quickpost');
        }
    });

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
            close_popwindow();
            refresh_current_page();
        }
        else{
            show_alert(ERROR[data.code], 'danger');
        }
    }

    submit['publish_post'] = function(kwargs, e){
        if(e.target.tagName == 'FORM'){
            if(!check_pushlish(kwargs, e))
                return;
            $api.new_post_form('#new-post-form', handler_submit);
        }
    }

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

    function add_appender(name, text){
        $('<a href="#" data-submit="append-text"></a>').attr('data-args', text).text(name).appendTo('#appender-container');
    }

    last = add_appender;

    submit['submit-as-file'] = function(kwargs, e){
        var filename = $('[type=file]').val().split('\\').pop(),
        file = ($('[type=file]')[0].files[0]);
        if(!check_pushlish(kwargs, e))
            return false;
        $api.new_post_form('#new-post-form',
                           function(data){
                               if(data.success){
                                   show_alert('发表成功！', 'success');
                                   if(filename){
                                       var link = url_for_root(url_for_attach(
                                           cur_board.boardname,
                                           data.data.substring(2, 12)
                                               + '.'+ filename.split('.').pop()));
                                       $('[type=file]').val('')
                                       add_appender(filename, link);
                                   }
                                   $('.editor [name=title]').val('').focus();
                                   $('.editor textarea').val('');
                               }
                               else{
                                   show_alert(ERROR[data.code], 'danger');
                               }
                           },
                           function(e){
                               show_alert('请确保文件小于1MB的后缀为png/pdf/jpg/gif/zip/txt/gz/bz2文件', 'danger')
                           });
        e.preventDefault();
    }

    var MAYBE_VIEW = { 'topic': true, 'digest': true, 'normal': true}

    function set_default_loader(cur_board, kwargs){
        var start_page, last, max_page;
        if(typeof kwargs.view == "undefined"){
            if(!localStorage['lastview']){
                localStorage['lastview'] = 'topic';
            }
            kwargs.view = localStorage['lastview'];
        }
        if(!MAYBE_VIEW[kwargs.view]){
            kwargs.view = 'topic';
        }

        if(kwargs.view != 'normal'){
            delete kwargs.index;
        }

        if(kwargs.view == 'topic'){
            cur_board.loader = load_topic_post;
            cur_board.render = render_topic_post;
            cur_board.view = 'topic';
            $('#topic-loader').addClass('active');
            start_page = last_pagenum[cur_board.boardname+':'+cur_board.view];
            max_page = Math.ceil(cur_board.data.total_topic / PAGE_LIMIT);
            if(!(start_page < max_page))
                start_page = max_page;
        }
        else if(kwargs.view == 'digest'){
            cur_board.loader = load_digest_post;
            cur_board.render = render_digest_post;
            cur_board.view = 'digest';
            $('#digest-loader').addClass('active');
            start_page = last_pagenum[cur_board.boardname+':'+cur_board.view];
            max_page = Math.ceil(cur_board.data.total_digest / PAGE_LIMIT);
            if(!(start_page < max_page))
                start_page = max_page;
        }
        else{
            cur_board.loader = load_normal_post;
            cur_board.render = render_normal_post;
            cur_board.view = 'normal';
            $('#normal-loader').addClass('active');
            var last;
            last = cur_board.data.lastread + 1;
            if((last==0) || (last > cur_board.data.total)){
                last = cur_board.data.total;
            }
            if(local.hover = kwargs.index){
                start_page = trim_pagenum(local.hover);
            }
            else{
                start_page = last_pagenum[cur_board.boardname
                                          +':'+cur_board.view];
            }
            max_page = Math.ceil(cur_board.data.total / PAGE_LIMIT);
            if(!(start_page < max_page))
                start_page = max_page;
        }
        cur_board.isnull = false;

        local.max_page = max_page;
        $('.bpagination').jqPagination({
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

    submit['remove_notes'] = function(){
        $('.board-notes').remove();
        localStorage['notes::'+local.cur_board.boardname] =
            Math.floor(Number(new Date()) / 1000);
        window.scrollTo(0, 0);
    }

    function count_down_enter(f, s){
        var cid = setInterval(function(){
            var r = f.data('remain');
            if(r <= 0){
                clearInterval(cid);
                $('.board-notes', s).remove();
            }
            else{
                r--;
                f.data('remain', r);
                f.text(''+r+'秒钟后自动进入看版');
            }
        }, 1000);
    }

    function show_notes(boardname){
        $('.board-notes').show();
        $api.get_board_notes(boardname, function(data){
            if(data.success){
                data = data.data;
                var t = $MOD.format.ascii(data.content), f=false;
                if((!$G.userfav
                    || !($G.local.cur_board.boardname in $G.userfav))
                   || (localStorage['switch::say-hello'] &&
                       (localStorage['switch::say-hello'] <
                        (Number(new Date()) / 1000 + 2592000)))){
                    t += '<div class="say-hello">欢迎来到 <strong>'+$G.local.cur_board.data.title+'</strong><br><a class="btn btn-large btn-success" href="#" data-submit="remove_notes">进入看版</a></div>';
                }
                else{
                    t += '<div class="say-hello">欢迎回到 <strong>'+$G.local.cur_board.data.title+'</strong> , 跟版友们打个招呼？<br><a href="#" data-submit="remove_notes" class="btn btn-success">我待会就发个贴子打个招呼</a><a data-submit="remove_notes" class="btn">我不打招呼</a><div>';
                    localStorage['switch::say-hello'] = true;
                }
                $('.board-notes').html(t);
            }
        });
    }

    function enter_board(kwargs){

        require_jslib('format');

        var boardname = kwargs.boardname, pagenum;
        
        $api.get_board_info(boardname, function(data){
            var start_page, last;
            if(data.success){
                cur_board.data = data.data;
                cur_board.boardname = boardname = data.data.filename;
                render_template('board-boardinfo',
                                {
                                    board: data.data,
                                    PAGE_LIMIT: PAGE_LIMIT
                                });
                $('#fn-'+boardname).addClass('active disabled').find('a').addClass('onactive');
                local.postlist_container = $('#postlist-container');
                set_default_loader(cur_board, kwargs);
                if(data.data.www.widgets){
                    load_widgets(data.data.www.widgets);
                }
                if(data.data.www.brand_url){
                    $('.board-header-img').addClass('hasimg').css(
                        'background-image', 'url("' +
                            data.data.www.brand_url + '")');
                    
                }
                var sec_con = $('#near-board');
                $G.lastsection = cur_board.data.secnum;
                $G.last_seccode = cur_board.data.seccode;
                render_template(
                    'widget/links',
                    {
                        links: [
                            ['进入 ' + boardname + ' 版精华区',
                             url_for_ann(':' + boardname + '/')],
                            ['本版RSS文件',
                             'http://bbs.sysu.edu.cn/rss/' +
                             boardname + '.xml']
                        ]
                    }, '#dy-widgets');
                render_template(
                    'widget/text',
                    {
                        text: '收藏本版人数： ' + cur_board.data.favnum
                            + '\n' + '累计发文篇数： ' + cur_board.data.total
                    }, '#dy-widgets');

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
                $api.get_last_postindex(boardname, 'digest', 5, function(data){
                    if(data.success){
                        var l = data.data.reverse();
                        render_template('widget/postlist', {
                            title: '最新文摘',
                            posts: l,
                            boardname: boardname,
                            more: 'set_digest_loader'
                        }, '#dy-widgets');
                    }
                });
                if(data.data.lastnotes &&
                   !((localStorage['notes::'+boardname] >
                      data.data.lastnotes))){
                    localStorage['notes::'+boardname] =
                        Math.floor((new Date())/1000);
                    show_notes(boardname);
                }
            }
            else{
                raise404(ERROR[data.code]);
                console.error(data);
            }
        });
        return local;

    }

    function book_fav(kwargs, e){
        var boardname;
        if(cur_board && (boardname = cur_board.boardname)){
            $api.add_self_fav(boardname, function(data){
                if(data.success){
                    show_alert('收藏' + boardname + '版成功！', 'success');
                    refresh_fav();
                    $(e.target).parent().text(' - 已收藏该版');
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

$MOD('frame::flow', function(){

    require_jslib('format');

    var local = {},
    submit = {},
    cur_boardname = null;
    
    function handler_post(post){
	    post.ismarkdown = ((post.rawcontent[0] == '#')||(post.rawcontent[1] == '#'));
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

    var PAGE_LIMIT = 5;
    
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

    function get_filename(kwargs, callback){
        $api.get_topicinfo(kwargs.boardname,
                           kwargs.filename,
                           kwargs.topicid,
                           function(data){
                               var topicinfo = data.data;
                               if(topicinfo){
                                   local.topicinfo = topicinfo;
                                   set_read(topicinfo.boardname,
                                            topicinfo.topicid,
                                            Math.floor((new Date()) / 1000));
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
                var t = self.parent().find('span');
                t.text(Number(t.text()) + 1);
                self.remove();
            }
        });
    }
    
    declare_frame({
        mark: 'topic',
        submit : submit,
        enter : function(kwargs){
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

$MOD('frame::tut', function(){

    var submit = {};
    var selected = {};
    var count = 0;

    function add_board(boardname){
        if(selected[boardname] || (count >= 50)) return;
        $('#board-container').append('<a href="#" id="b-'+boardname+'" data-submit="remove-board">'+boardname+'</a>');
        selected[boardname] = true;
        ++count;
    }

    function remove_board(boardname){
        if(selected[boardname]){
            $('#b-'+boardname).remove();
            delete selected[boardname];
            --count;
        }
    }

    function reset_board(collect){
        var i;
        selected = {};
        count = 0;
        $('#board-container').empty();        
        for(i=0; i<collect.length; ++i)
            add_board(collect[i]);
        update_count();
    }

    function update_count(){
        if(count<15){
            $('#num-counter').text('您只关注了 '+count+' 个看版，好少哟～');
        }
        else if(count>30){
            $('#num-counter').text('您已经关注了 '+count+' 个看版，太多啦！');
        }
        else{
            $('#num-counter').text('您关注了 '+count+' 个看版。');
        }
        if(count<1){
            $('#goto-tut3').removeClass('btn-success').addClass('disabled').text('要关注至少一个看版哟！');
        }
        else{
            $('#goto-tut3').removeClass('disabled').addClass('btn-success').text('收藏这些看版，下一步');
        }
    }            

    function coll_board(){
        var coll = [], x;
        for(x in selected)
            if(selected[x] === true)
                coll.push(x);
        return coll;
    }

    function remove_board_iter(kwargs, e){
        var text=$(e.target).text();
        remove_board(text);
        update_count();
    }
    submit['remove-board'] = remove_board_iter;

    function select(kwargs, e){
        var self = $(e.target), i, $e=$(e.target);
        var para = self.attr('data-para').split(';');
        if($e.hasClass('active')){
            for(i=0; i<para.length; ++i) remove_board(para[i]);
            $e.removeClass('active');
        }
        else{
            for(i=0; i<para.length; ++i) add_board(para[i]);
            $e.addClass('active');
        }
        update_count();
    }
    submit['select-tag'] = select;

    function check_weibo_auth(){
        $api.weibo_check_auth(function(data){
            if(data.success && data.data){
                $('#is_weibo_auth').removeClass('hidden');
            }
        });
    }

    function auth_weibo(){
        var nw = window.open("/weibo/auth", 'auth',
                             config='width=600,height=380,left=100,top=100');
        $(nw).unload(check_weibo_auth);
    }
    submit['auth-weibo'] = auth_weibo;

    function goto_tut2(kwargs, e){
        if(!$('#is_weibo_auth').hasClass('hidden') &&
           $('#use-weibo-avatar')[0].checked){
            $api.weibo_use_weibo_avatar(function(){
                $G.refresh = false;
                location = '#!tut-2';
                location.reload(true);
            });
        }
        else if($('#use-weibo-avatar')[0].checked){
            var nw = window.open(
                "/weibo/auth", 'auth',
                config='width=600,height=380,left=100,top=100');
            $(nw).unload(function(){
                $api.weibo_check_auth(function(data){
                    if(data.success && data.data){
                        $api.weibo_use_weibo_avatar(function(){
                            $G.refresh = false;
                            location = '#!tut-2';
                            location.reload(true);
                        });
                    }
                    else
                        location = '#!tut-2';
                });
            });
        }
        else
            location = '#!tut-2';
    }
    submit['goto-tut2'] = goto_tut2;

    function _goto_tut3(){
        var d = coll_board();
        $api.set_self_fav(d, function(){
            $G.submit.refresh_fav();
            location = '#!tut-3';
        });
    }        

    function goto_tut3(){
        if(count < 6){
            modal_confirm('你只关注了很少的看版',
                          '你只关注了很少的看版，真的不想再多关注几个了？',
                          _goto_tut3);
        }
        else{
            _goto_tut3();
        }
    }
    submit['goto-tut3'] = goto_tut3;

    submit['submit-fav'] = function(){
        var d = coll_board();
        $api.set_self_fav(d, function(){
            show_alert('更新收藏夹成功！', 'success');
            $G.submit.refresh_fav();
            refresh_frame();
        });
    }

    function finish_tut_success(){
        if($('#is-send-weibo input')[0].checked){
            var nw = window.open(
                "/weibo/auth", '_blank',
                config='width=600,height=380,left=100,top=100');
            $(nw).unload(function(e){
                var cid = setInterval(function(){
                    if(nw.closed){
                        $api.weibo_check_auth(function(data){
                            if(data.success && data.data){
                                $api.weibo_update1();
                            }
                            clearInterval(cid);
                            localStorage['bool::watched-tut'] = 1;
                            window.location = url_for_board('Test');
                        });
                    }
                }, 1000);
            });
        }
        else{
            localStorage['bool::watched-tut'] = 1;            
            location = url_for_board('Test');
        }
    }
    submit['finish-tut-success'] = finish_tut_success;

    // declare_frame({
    //     mark: 'tut-1',
    //     submit: submit,
    //     enter: function(kwargs){
    //         render_template('tut-1');
    //         check_weibo_auth();
    //     }
    // });

    declare_frame({
        mark: 'admin-fav',
        submit: submit,
        enter: function(kwargs){
            render_template('admin-fav');
            var d = coll_board();
            if(d.length) reset_board(d);
            $('.tag.default').each(function(){ $(this).click(); });
            $api.get_self_fav(function(data){
                if(data.success){
                    var i;
                    data = data.data;
                    for(i=0; i<data.length; ++i)
                        add_board(data[i].boardname);
                }
                update_count();
            });
            update_count();            
        }
    });

    declare_frame({
        mark: 'tut-2',
        submit: submit,
        enter: function(kwargs){
            render_template('tut-2');
            var d = coll_board();
            if(d.length) reset_board(d);
            $('.tag.default').each(function(){ $(this).click(); });
            $api.get_self_fav(function(data){
                if(data.success){
                    var i;
                    data = data.data;
                    for(i=0; i<data.length; ++i)
                        add_board(data[i].boardname);
                }
                update_count();
            });
            update_count();            
        }
    });

    declare_frame({
        mark: 'tut-3',
        submit: submit,
        enter: function(kwargs){
            render_template('tut-3');
        }
    });

    declare_frame({
        mark: 'tut-4',
        submit: submit,
        enter: function(kwargs){
            render_template('tut-4');
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

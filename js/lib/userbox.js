$MOD('jsbbs.userbox', function(){

    require_jslib('cookie');

    $G('lastsection', 0);
    $G('last_seccode', 0);
    
    $G.submit.logout = function(){
        modal_confirm('登出帐号', '你确认要取消登录？',
                      function(){
                          $api.user_logout(function(){
                              location.reload();
                          });
                      });
    }
    $G.submit.login = function(kwargs){
        $api.user_login(kwargs.userid, kwargs.password, function(data){
            if(data.success){
                $('#userbox').empty();
                location.reload();
            }
            else{
                show_alert(data.error, 'danger');
            }
        })
    }
    $G.submit['add-more-fav'] = function(){
        var a = $('#more-fav input');
        a.each(function(){
            if(this.checked){
                var favname = $(this).attr('name');
                $(document).queue('add-more-fav', function(){
                    $api.add_self_fav(favname, function(data){
                        if(data.success){
                            $(document).dequeue('add-more-fav');
                        }
                    });
                });
            };
        });
        $(document).queue('add-more-fav', function(){
            $('#big-modal').modal('hide').queue(function(){
                show_alert('添加到收藏夹成功！');
                $G.submit.refresh_fav();
            });
        });
        $(document).dequeue('add-more-fav');
    }
    function sort_favitem(a, b){
        if(a.unread == b.unread)
            return b.lastpost - a.lastpost;
        return a.unread?-1:1;
    }

    function handler_fav(data){
        if(data.success){
            var myfav = data.data, t={};
            for(x in myfav){
                t[myfav[x].boardname] = true;
            }
            $G.userfav = t;
            $G.userfav_a = data.data;
        }
    };

    register_hook('after_refresh_fav');
    function refresh_fav(){
        $api.get_self_fav(handler_fav)
    }
    $G.submit.refresh_fav = refresh_fav;

    function refresh_fav_sync(){
        handler_fav($api.get_self_fav_aync());
    }

    var lastdelay = 0;
    function check_has_new_mail(callback){
        var d = +new Date();
        $api.check_has_new_mail(function(data){
            lastdelay = +new Date() - d;
            if(data.success){
                if(data.data[0]=='1'){
                    $('#userbox-nav').addClass('hasnewmail');
                }
                else{
                    $('#userbox-nav').removeClass('hasnewmail');
                }
                if(data.data[1]=='1'){
                    $('#userbox-nav').addClass('hasmessage');
                }
                else{
                    $('#userbox-nav').removeClass('hasmessage');
                }
                if(callback){
                    callback();
                }
            }
        });
    }

    var mail_checker;
    function launch_mail_checker(){
        if(mail_checker){
            clearInterval(mail_checker);
        }
        check_has_new_mail(function(){
            mail_checker = setTimeout(
                launch_mail_checker,
                15000 + 120 * Math.min(lastdelay, 3000));
        });
    }

    register_hook('after_login_success');
    register_hook('after_refresh_userbox');
    bind_hook('after_login_success', refresh_fav_sync);
    bind_hook('after_refresh_userbox', function(data){
        if(data.success){
            launch_mail_checker();
        }
        if(!$G.authed){
            $(render_string(
                'widget/login', {}
            )).insertBefore('#dy-widgets');
        }
    });
    
    $G('authed', false);
    $G('userfav', {});
    $G('simple-userbox', false);

    function refresh_userbox(){
        var data = $api.get_self_info_aync();
        var udata;
        if(data.success){
            udata = { u: data.data, authed: true};
            $G.authed = udata;
        }
        else{
            $G.authed = false;
            $G.userfav = {};

        }
        var simple = $G['simple-userbox'];
        console.log(['ud', udata]);
        $('#userbox-nav').empty();
        render_template('userbox-nav', udata, '#userbox-nav');
        if(!simple){
            $('#userbox').empty();
            render_template('userbox', udata, '#userbox');
            if(data.success){
                $G.hooks.after_login_success();
            }
            $G.hooks.after_refresh_userbox(data);
        }
        else{
            $('html').addClass('simple');
        }
    }
    
    bind_hook('before_boot', refresh_userbox);

    function update_tips(){
        if(Math.random() * 3 > 2){
            $api.get_tips(function(data){
                console.log('tips', data);
                render_string('tips', { htmltips : $MOD.format.format_md(data.data) }).replaceAll('#tips');
            });
        }
    }
    bind_hook('frame_change', update_tips);        

    function go_next_board(){
        var boardname;
        try{
            boardname = $G.current.local.cur_board.boardname;
        }
        catch(e){
            boardname = null;
        }        
        $api.get_next_boardname(boardname, function(data){
            if(data.success){
                location = url_for_board(data.data);
            }
        });
    }

    function go_section(){
        location.hash = '#!section?secnum=' + (Number($G.lastsection) || 0);
    }

    $G.submit['go-next-board'] = go_next_board;
    $G.submit['go-section'] = go_section;
        
    return {
        'refresh_fav': refresh_fav,
        'refresh_userbox' : refresh_userbox,
        'go_next_board': go_next_board
    }

})

$MOD('jsbbs.userbox', function(){

    require_jslib('cookie');
    
    $G.submit.logout = function(){
        modal_confirm('登出帐号', '你确认要取消登录？',
                      function(){
                          $api.user_logout(refresh_userbox);
                      });
    }
    $G.submit.login = function(kwargs){
        $api.user_login(kwargs.userid, kwargs.password, function(data){
            if(data.success){
                $('#userbox').empty();
                refresh_userbox();
                show_alert('登录成功！', 'success');
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

    register_hook('after_refresh_fav');
    function refresh_fav(){
        $('[data-submit=refresh_fav]').addClass('refreshing');
        $api.get_self_fav(function(data){
            if(data.success){
                $('#favbox').hempty('');
                setTimeout(function(){
                    $('#favbox').empty();
                    data.data.sort(sort_favitem);
                    render_template('widget/fav', { fav: data.data },
                                    '#favbox');
                    var height = 20 * data.data.length;
                    if(height > 200){
                        height = 200;
                    }
                    $('#favbox-outer').height(height);
                    $('[data-submit=refresh_fav]').removeClass('refreshing');
                    $G.hooks.after_refresh_fav();
                    var cookiename = 'hint-more@' + $G.authed.u.userid;
                    if(!$.cookie(cookiename)){
                        $.cookie(cookiename, 1);                        
                        if(data.data.length<5){
                            $api.get_all_boards(function(data){
                                var d;                            
                                if(data.success){
                                    d = data.data;
                                    for(s in d){
                                        d[s].boards.sort(function(a, b){
                                            return (b.lastpost - a.lastpost);
                                        });
                                        d[s].boards = d[s].boards.slice(0, 5);
                                    }                                
                                    var html = render_string('morefav', {b: d});
                                    show_modal(html);
                                };
                            });
                        };
                    }
                }, 500);
            }
        });
    }                             
    $G.submit.refresh_fav = refresh_fav;

    function check_has_new_mail(callback){
        $api.check_has_new_mail(function(data){
            if(data.success){
                if(data.data=='1'){
                    $('#userbox').addClass('hasnewmail');
                }
                else{
                    $('#userbox').removeClass('hasnewmail');
                }
                if(callback){
                    callback();
                }
            }
        });
    }

    var mail_checker;
    function launch_mail_checker(enable){
        if(mail_checker){
            clearInterval(mail_checker);
        }
        if(enable){
            check_has_new_mail();
            mail_checker = setInterval(check_has_new_mail, 30000);
        }
    }

    register_hook('after_login_success');
    register_hook('after_refresh_userbox');
    bind_hook('after_login_success', refresh_fav);
    bind_hook('after_refresh_userbox', function(data){
        launch_mail_checker(data.success);
    });
    
    $G('authed', false);
    function refresh_userbox(){
        $api.get_self_info(function(data){
            var udata;
            if(data.success){
                udata = { u: data.data, authed: true};
                $G.authed = udata;
                $G.hooks.after_login_success();
            }
            else{
                $G.authed = false;
            }
            $('#userbox').empty();
            render_template('userbox', udata, '#userbox');
            $G.hooks.after_refresh_userbox(data);
        });
    }
    bind_hook('after_boot', refresh_userbox);
    return {
        'refresh_fav': refresh_fav,
        'refresh_userbox' : refresh_userbox
    }

})

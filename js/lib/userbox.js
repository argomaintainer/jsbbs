$MOD('jsbbs.userbox', function(){
    $G.submit.logout = function(){
        $api.user_logout(refresh_userbox);
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
    function sort_favitem(a, b){
        if(a.unread == b.unread)
            return a.total - b.total;
        return a.unread?0:1;
    }

    register_hook('after_refresh_fav');
    function refresh_fav(){
        $('[data-submit=refresh_fav]').addClass('refreshing');
        $api.get_self_fav(function(data){
            if(data.success){
                $('#favbox').hempty('努力地读取收藏夹中...');
                setTimeout(function(){
                    $('#favbox').empty();
                    data.data.sort(sort_favitem);
                    render_template('widget/fav', { fav: data.data },
                                    '#favbox');
                    $('[data-submit=refresh_fav]').removeClass('refreshing');
                    $G.hooks.after_refresh_fav();
                }, 500);
            }
        });
    }                             
    $G.submit.refresh_fav = refresh_fav;

    $G('authed', false);
    function refresh_userbox(){
        var fav;
        $api.get_self_info(function(data){
            if(data.success){
                $G.authed = true;
                data = { u: data.data, authed: true};
            }
            else{
                $G.authed = false;
                data = { authed: false };
            }
            $('#userbox').empty();
            render_template('userbox', data, '#userbox');
            refresh_fav();
        });
    }                           
    return {
        'refresh_fav': refresh_fav,
        'refresh_userbox' : refresh_userbox,
    }
})

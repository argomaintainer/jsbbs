(function(){

    function logout(){
        good_confirm(
            '登出帐号', '你确认要取消登录吗？',
            function(){
                $api.user_logout(function(){
                    delete localStorage['userid'];
                    location.reload(true);
                });
            });
    }

    function login(userid, password){
        $api.user_login(userid, password,
            function(data){
                if(data.success){
                    good_alert('登录成功！', 'success');
                    localStorage['userid'] = userid;
                }else{
                    good_alert(data.error, 'danger');
                }
            });
    }

    function check_new_mail(callback){
        var el = this.el;
        $api.check_has_new_mail(function(data){
            if(data.success){
                if(data.data=='1'){
                    el.addClass('hasnewmail');
                }
                else{
                    el.removeClass('hasnewmail');
                }
                if(callback){
                    callback();
                }
            }else{
                if(localStorage['userid']){
                    delete localStorage['userid'];
                    alert('掉线啦！');
                    location.reload(true);
                }
            }
        });
    }
                        
    var Topbar = declare_frame({
        deps : ['topbar.tpl'],
        tpl : 'topbar',
        events : {
            'div.loginbtn' : {
                'click' : function(event){
                    var args = this.dumpArgs('Fuserid;Fpassword');
                    this.login(args.userid, args.password);
                }
            },
            'div.logoutbtn' : {
                'click' : function(event){
                    this.logout();
                }
            }
        },
        login : login,
        logout : logout,
        check_new_mail : check_new_mail,
        init : function(){
            this.check_new_mail();
            this.mailchecker = setInterval(_.bind(this.check_new_mail, this),
                                           30000);
            if(localStorage['userid']){
                this.buildElement('#topbar');
            }
        }
    });

    exports({ Topbar: Topbar });
    
})();

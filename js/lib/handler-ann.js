$MOD('jsbbs-ann', function(){

    require_jslib('format');

    var format = $MOD['format'].format;

    function basename(s){
        var pos = s.lastIndexOf('/');
        return s.substring(0, pos+1);
    }

    function wrap_metatitle(metainfo){
        if(metainfo.type == 'personal'){
            return metainfo.title;
        }
        if(metainfo.type == 'board'){
            return metainfo.boardname + ' 版精华区';
        }
        return metainfo.title;
    }

    function startswith(str, pat){
        return str.indexOf(pat) == 0;
    }

    declare_frame({
        mark: 'home',
        enter: function(){
            location.href = url_for_ann('site/');
        }});

    declare_frame({
        mark: 'read',
        enter: function(kwargs){
            if(startswith(kwargs.reqpath, 'site/boards/')){
                kwargs.reqpath = ':' + kwargs.reqpath(12);
                quite_set_hash('#!read', kwargs);
            }
            if(startswith(kwargs.reqpath, 'site/boards/Personal_corpus/')){
                kwargs.reqpath = '~' + kwargs.reqpath(29);
                quite_set_hash('#!read', kwargs);
            }
            $api.get_ann_content(kwargs.reqpath, function(data){
                if(data.success){
                    var reqpath = kwargs.reqpath;
                    if(reqpath[reqpath.length-1] == '/')
                        reqpath = reqpath.substr(0, reqpath.length-1);
                    var url_prefix = data.data.post?
                        basename(reqpath):(reqpath + '/');
                    var title = data.data.bt[data.data.bt.length-1];
                    data.data.bt[0] = data.data.metainfo.title = wrap_metatitle(data.data.metainfo);
                    data.data.post = format(data.data.post);
                    render_template('ann', {
                        'data': data.data,
                        'title': title,
                        'url_prefix': url_prefix
                    });
                }
            });
        }
    });                  
    
})

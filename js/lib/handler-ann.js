$MOD('jsbbs-ann', function(){

    require_jslib('format');

    var format = $MOD['format'].format;

    function basename(s){
        var pos = s.lastIndexOf('/');
        return s.substring(0, pos+1);
    }

    declare_frame({
        mark: 'home',
        enter: function(){
        }});

    declare_frame({
        mark: 'read',
        enter: function(kwargs){
            console.log('fxxxxxx');
            $api.get_ann_content(kwargs.reqpath, function(data){
                if(data.success){
                    console.log([kwargs.reqpath, basename(kwargs.reqpath)]);
                    var reqpath = kwargs.reqpath;
                    if(reqpath[reqpath.length-1] == '/')
                        reqpath = reqpath.substr(0, reqpath.length-1);
                    var url_prefix = data.data.post?
                        basename(reqpath):(reqpath + '/');
                    console.log(['url', url_prefix]);
                    $('#container').empty();
                    data.data.bt[0] = data.data.metainfo.title;
                    data.data.post = format(data.data.post);
                    render_template('ann', {
                        'data': data.data,
                        'url_prefix': url_prefix
                    }, '#container');
                }
            });
        }
    });                  
    
})

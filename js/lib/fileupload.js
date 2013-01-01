$MOD('fileupload', function(){
    $.fn.ajax_submit = function(options){
        $(this).each(function(){
            var self = $(this);
            console.log(this);
            var form_data = new FormData(this);
            if(options['xhr']){
                console.error('No allow custom xhr in ajax_submit.');
                return;
            }
            options['xhr'] = function(){
                var t = $.ajaxSettings.xhr();
                t.addEventListener(
                    'progress',
                    function(e){
                        var done = e.loaded,
                        total = e.total;
                        console.log(e);
                        options['progress'](done, total);
                    })
                return t;
            }
            if(options['data'])
                for(x in options['data']){
                    form_data.append(x, options['data'][x]);
                }
            options['data'] = form_data;
            console.log(options);
            $.ajax(options);
        });
    };
});

$MOD('format', function(){

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function format_escape(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    format_blank = function(s){
        return s.replace(/ /g, '&nbsp;');
    }
    format_cr = function(s){
        return s.replace(/\r\n/gm, '\n').replace(/\r/gm, '\n');
    }
    format_br = function(s){
        return s.replace(/\n/gm, '<br\>\n');
    }
    format_quote = function(s){
        last = s;
        return s.replace(/^【&nbsp;在.*的大作中提到:&nbsp;】(\n[:：].*)*/gm, function(s){
            return '<div class="postquote">' + s.replace(/^:/gm, '') + '</div>';
            });
    }
    format_color = function(s){
        return s.replace(/\[%\d+(;\d+)*#\]/gm, function(s){
            return s.replace('[%', '<span class="ac').replace(/;/gm, ' ac').replace('#]', '">');
        }).replace(/\[#%\]/gm, '</span>');
    }
    function format(text){
        text = format_escape(text);
        text = format_blank(text);
        text = format_cr(text);
        text = format_quote(text);
        text = format_br(text);
        return text;
    }
    $.fn.telnet = function(){
        $(this).each(function(){
            var self=$(this);
            var text=self.text();
            text = format(text);
            self.html(text);
        })
    }
    return {
        'format': format,
    };
})

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
        return s.replace(/^(【&nbsp;在.*的大作中提到:&nbsp;】)?(\n[:：].*)+/gm, function(s){
            return '<div class="postquote">' +
                s.replace(/^【&nbsp;在.*的大作中提到:&nbsp;】/, function(t){
                    return '<div class="postquote-header">' + t + '</div>';
                }).replace(/(\n[:：].*)+/gm, function(t){
                    return '<div class="postquote-content">' + t + '</div>';
                }) + '</div>';
        });
    }
    format_color = function(s){
        return s.replace(/\[%\d+(;\d+)*#\]/gm, function(s){
            return s.replace('[%', '<span class="ac').replace(/;/gm, ' ac').replace('#]', '">');
        }).replace(/\[#%\]/gm, '</span>');
    }

    require_jslib('markdown');
    function format(text){
        if(text[0] == '\n')
            text = text.slice(1);
        if(text[0] == '#' ){
            if(text.substr(0, 9) == '#markdown'){
                return '<div class="markdown">' +
                    markdown.toHTML(text.substr(9)) + '</div>';
            }
        }            
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

    function gen_quote(post){
        var title = post.title, quote;
        if(title.substr(0, 4) != 'Re: '){
            title = 'Re: ' + title;
        }
        quote = post.rawcontent.split('\n').slice(0, 5).join('\n:')
        return {
            title: title,
            quote: quote,
            userid: post.userid,
            username: post.username,
            filename: post.filename,
        }
    }

    function gen_quote_mail(mail){
        var title = mail.title, quote;
        if(title.substr(0, 4) != 'Re: '){
            title = 'Re: ' + title;
        }
        quote = mail.content.split('\n').slice(4, 15).join('\n:');
        return {
            title: title,
            quote: quote,
            from: mail.owner,
            index: mail.index,
        }
    }
    
    return {
        'format': format,
        gen_quote: gen_quote,
        gen_quote_mail: gen_quote_mail,
    };
})

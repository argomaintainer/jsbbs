$MOD('format', function(){

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    var urls = [

        // 0. force url
        [/(^|\s|<br>|&nbsp;|\n|>)&lt;(((https?|ftp):&#x2F;&#x2F;).+?)&gt;(\s|$|<br>|&nbsp;|<)/g,	'$1<a target="_blank" href="$2">$2</a>$5'],


        // 1. jpg|png|gif pic to <img> tag, class from link
        [/(^|\s|<br>|&nbsp;|\n|>)(http:&#x2F;&#x2F;.+?\.)(jpg|png|gif|jpeg)/ig, '$1<img src="$2$3" class="" alt="" />'],
        [/(^|\s|<br>|&nbsp;|\n|>)(http:&#x2F;&#x2F;.+\.)(mp3)/g, 
         '<audio src="$2$3" controls="controls" />'],

        // 2. (http://)v.youku.com... to <embed> tag
        [/(http:&#x2F;&#x2F;)?v\.youku\.com&#x2F;v_show&#x2F;id_(\w+)\.(html|htm)/g,
         '<embed wmode="opaque" src="http://player.youku.com/player.php/sid/$2/v.swf" allowFullScreen="true" quality="high" width="480" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>'],

        // youku.swf
        [/(http:&#x2F;&#x2F;player.youku.com&#x2F;player.php&#x2F;sid&#x2F;\w*&#x2F;v.swf)/g,
         '<embed wmode="opaque" src="$1" allowFullScreen="true" quality="high" width="480" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>'],         

        // xiami
        [/(http:&#x2F;&#x2F;www.xiami.com&#x2F;widget&#x2F;\d*_\d*&#x2F;singlePlayer\.swf)/g,
         '<embed wmode="opaque" src="$1" align="middle" width="257" height="33" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>'],

        // tudou
        [/(http:&#x2F;&#x2F;www\.tudou\.com&#x2F;\w&#x2F;[\w\d\-]*(&#x2F;?)(&amp;[\w\d=_]*)*&#x2F;v\.swf)/g,
         '<embed src="$1" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" wmode="opaque" width="480" height="400"></embed>'],        

        // url
	    [/(^|\s|<br>|&nbsp;|\n|>)(www\..+?\..+?)(\s|$|<br>|&nbsp;|<)/g,		'$1<a target="_blank" href="http://$2">$2</a>$3'],
	    [/(^|\s|<br>|&nbsp;|\n|>)(((https?|ftp):&#x2F;&#x2F;).+?)(\s|$|<br>|&nbsp;|<)/g,	'$1<a target="_blank" href="$2">$2</a>$5'],
        //@gcc
        [/(^|&nbsp;|<br>|\n)@([a-zA-Z]{2,12})/g,	'$1<a href="#!user?userid=$2">@$2</a>']
        
    ];

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

    format_esc = function(s) {
        var segments = s.replace(/\x1b\[(?:\d{1,2};?)+m/gm, function(t) {
            //console.log(['zz', t.substring(2, t.length-1)]);
            var colors = t.substring(2, t.length-1).split(';');
            console.log(colors);
            for (var i = 0; i< colors.length; i++) {
              colors[i] = 'c'+colors[i];
            }
            return '<span class="'+ colors.join(' ') + '">';
        });
        segments = segments.split(/\x1b\[m/gm);
        var res = '';
        for (var i = 0; i < segments.length; i++) {
           var seg = segments[i];
           var matches = seg.match(/<span class=\"(c\d{1,2}\s?)+\"/gm);
           var cnt = 0;
           if (matches) cnt = matches.length;
           res += seg;
           while(cnt--) res += '</span>';
        }
        //console.log(['split', s, segments, res]);
        return res;
    }
    
    format_linkify = function(s) {
        var before = s;
        for (u in urls)  {
            var s = s.replace(urls[u][0], urls[u][1]);
        }
        //console.log(["debug-linkify", before, s]);
        return s;
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
        last = text;
        text = format_esc(text);
        text = format_linkify(text);
        return text;
    }
    $.fn.format = function(){
        $(this).each(function(){
            var self=$(this);
            var text=self.text();
            text = format(text);
            self.html(text);
        });
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
            filename: post.filename
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
            index: mail.index
        }
    }
    
    return {
        'format': format,
        gen_quote: gen_quote,
        gen_quote_mail: gen_quote_mail
    };
})

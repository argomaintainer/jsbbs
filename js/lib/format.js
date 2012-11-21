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

  // 1. jpg|png|gif pic to <img> tag, class from link
  [/(http:&#x2F;&#x2F;.+?\.)(jpg|png|gif|jpeg)/ig, '<img src="$1$2" class="" alt="" />'],
  [/(http:&#x2F;&#x2F;.+\.)(mp3)/g, 
    '<audio src="$1$2" controls="controls" />'],

  // 2. (http://)v.youku.com... to <embed> tag
  //[/(http:&#x2F;&#x2F;)?v\.youku\.com&#x2F;v_show&#x2F;id_(\w+)\.(html|htm)/g,
  //'$1<embed wmode="opaque" src="http://player.youku.com/player.php/sid/$3/v.swf" allowFullScreen="true" quality="high" width="480" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>'],

  // url
	[/(^|\s|<br>|&nbsp;|\n|>)(www\..+?\..+?)(\s|$|<br>|&nbsp;|<)/g,		'$1<a target="_blank" href="http://$2">$2</a>$3'],
	[/(^|\s|<br>|&nbsp;|\n|>)(((https?|ftp):&#x2F;&#x2F;).+?)(\s|$|<br>|&nbsp;|<)/g,	'$1<a target="_blank" href="$2">$2</a>$5'],
   //@gcc
  [/(^|&nbsp;|<br>|\n)@([a-zA-Z]{2,12})/g,	'$1<a href="#!user?userid=$2">@$2</a>'],
  
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
      return s.replace(/\x1b\[(?:\d{1,2};?)+m/gm, function(t) {
        console.log(['zz', t.substring(2, t.length-1)]);
        return '<span class="c' +
        t.substring(2, t.length-1).replace(';', ' c')
        + '">';
      }).replace(/\x1b\[m/gm, '</span>');
    }
  
    format_linkify = function(s) {
      var before = s;
        for (u in urls)  {
          var s = s.replace(urls[u][0], urls[u][1]);
        }
        console.log(["debug-linkify", before, s]);
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

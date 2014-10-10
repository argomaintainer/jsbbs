$MOD('format', function(){

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;',
        " ": '&nbsp;'
    };

    var urls = [

        // 0. force url
        [/(^|\s|<br>|&nbsp;|\n|>)&lt;(((https?|ftp):&#x2F;&#x2F;).+?)&gt;(\s|$|<br>|&nbsp;|<)/g,	'$1<a target="_blank" href="$2">$2</a>$5'],


        // 1. jpg|png|gif pic to <img> tag, class from link
        [/(^|\n(&nbsp;)*)(http:&#x2F;&#x2F;.+?\.)(jpg|png|gif|jpeg)/ig, '$1<img src="$3$4" class="" alt="" />'],
        [/(^|\s|<br>|&nbsp;|\n|>)(http:&#x2F;&#x2F;.+\.)(mp3)/g, 
         '<audio src="$2$3" controls="controls" />'],

        // 2. (http://)v.youku.com... to <embed> tag
        [/(^|\n)(http:&#x2F;&#x2F;)?v\.youku\.com&#x2F;v_show&#x2F;id_(\w+)\.(html|htm)/g,
         '<embed wmode="opaque" src="http://player.youku.com/player.php/sid/$3/v.swf" allowFullScreen="true" quality="high" width="480" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>'],

        // youku.swf
        [/(^|\n)(http:&#x2F;&#x2F;player.youku.com&#x2F;player.php&#x2F;sid&#x2F;\w*&#x2F;v.swf)/g,
         '<embed wmode="opaque" src="$2" allowFullScreen="true" quality="high" width="480" height="400" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>'],         

        // xiami
        [/(^|\n)(http:&#x2F;&#x2F;www.xiami.com&#x2F;widget&#x2F;\d*_\d*&#x2F;singlePlayer\.swf)/g,
         '<embed wmode="opaque" src="$2" align="middle" width="257" height="33" allowScriptAccess="always" type="application/x-shockwave-flash"></embed>'],

        // tudou
        [/(^|\n)(http:&#x2F;&#x2F;www\.tudou\.com&#x2F;\w&#x2F;[\w\d\-]*(&#x2F;?)(&amp;[\w\d=_]*)*&#x2F;v\.swf)/g,
         '<embed src="$2" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" wmode="opaque" width="480" height="400"></embed>'],

        // gist
        [/(^|\n)(https?:&#x2F;&#x2F;gist\.github\.com&#x2F;([0-9]+)\.js)/g,
         '<div class="gist" data-submit="load-gist" data-gistid="$3">: 点击打开gist代码</div>'],

        // url
	    [/(^|\s|<br>|&nbsp;|\n|>)(www\..+?\..+?)(\s|$|<br>|&nbsp;|<)/g,		'$1<a target="_blank" href="http://$2">$2</a>$3'],
	    [/(^|\s|<br>|&nbsp;|\n|>)(((https?|ftp):&#x2F;&#x2F;).+?)(\s|$|<br>|&nbsp;|<)/g,	'$1<a target="_blank" href="$2">$2</a>$5'],
        //@gcc
        [/(^|&nbsp;|<br>|\n)@([a-zA-Z]{2,12})/g,	'$1<a href="#!user?userid=$2">@$2</a>'],

        // xxx 讨论区
        [/&nbsp;(<span class="c32">)?([a-zA-Z]{3,20})&nbsp;(<span class="c37">)?讨论区/g,
         '&nbsp;$1<a href="#!board?boardname=$2">$2</a>&nbsp;$3讨论区']
        
    ];

    function format_escape(string) {
        return String(string).replace(/[&<>"'\/\ ]/g, function (s) {
            return entityMap[s];
        });
    }

    format_cr = function(s){
        return s.replace(/\r\n/gm, '\n').replace(/\r/gm, '\n');
    } 
    format_br = function(s){
        return s.replace(/\n/gm, '<br\>\n');
    }
    format_quote = function(s){
        return s.replace(/(\n*)^(【&nbsp;在.*的大作中提到:&nbsp;】\n)?\n*(([:：].*\n)+)(\n*)/gm, '<div class="postquote"><div class="postquote-header">$2</div><div data-submit="toggle-quote" class="toggle-quote"> : 显示引用文字 </div><div class="postquote-content">$3</div></div>')
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
//        if(text && text.match && text.match('\x1b') && !text.match("※ 来源:．逸仙时空 Yat-Sen Channel") && !text.match("※ 来源:．Yat-sen Channel") && !text.match("※ 转载:.Yat-sen Channel") && !text.match("※ 来源:．Yat-sen Channel") && !text.match("【 以下文字转载自"))
//            return ascii(text);
        if(text[0] == '\n')
            text = text.slice(1);
        if(text[0] == '#' ){
            if(text.substr(0, 9) == '#markdown'){
                return '<div class="markdown">' +
                    markdown.toHTML(text.substr(9)) + '</div>';
            }
        }            
        text = format_escape(text);
        text = format_cr(text);
        text = format_quote(text);
        text = format_br(text);
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
        quote = post.rawcontent.split('\n').slice(0, 5).join('\n: ')
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
        quote = mail.content.split('\n').slice(4, 15).join('\n: ');
        return {
            title: title,
            quote: quote,
            from: mail.owner,
            index: mail.index
        }
    }

    var widths = [
        [126,    1], [159,    0], [687,     2], [710,   0], [711,   2], 
        [727,    0], [733,    2], [879,     0], [1154,  2], [1161,  0], 
        [4347,   2], [4447,   2], [7467,    2], [7521,  0], [8369,  2], 
        [8426,   0], [9000,   1], [9002,    2], [11021, 2], [12350, 2], 
        [12351,  1], [12438,  2], [12442,   0], [19893, 2], [19967, 1],
        [55203,  2], [63743,  1], [64106,   2], [65039, 1], [65059, 0],
        [65131,  2], [65279,  1], [65376,   2], [65500, 1], [65510, 2],
        [120831, 1], [262141, 2], [1114109, 1],
    ]

    function get_width( o ){
        o = o.charCodeAt();
        if( o == 0xe || o == 0xf){
            return 0;
        }
        for(var i=0; i<widths.length; ++i){
            if( o <= widths[i][0] )
                return widths[i][1];
        }
        return 1;
    }

    function apply_effect(a, b){
        for(var i=0; i<b.length; ++i){
            if(b[i] == 0){
                delete a.fc;
                delete a.bc;
                delete a.ss;
            }else if((b[i] >= 30) && b[i] <= 39){
                a.fc = b[i];
            }else if((b[i] >= 40) && b[i] <= 49){
                a.bc = b[i];
            }else if((b[i] < 10)){
                if(!a.ss) a.ss = {};
                a.ss[b[i]] = true;
            }
        }
        var c = [];
        if(a.fc) c.push('c'+a.fc);
        if(a.bc) c.push('c'+a.bc);
        if(a.ss){
            for(i in a.ss){
                if(a.ss.hasOwnProperty(i)){
                    c.push('c'+i);
                }
            }
        }
        return c.join(' ');
    }            
    
    function ascii(s){
        var x = 0, i=0, j=0, ca = {}, c='', r=[], maxx=s.length,
        x2, x1, w, mi=0, mj=0;
        var gw = 8;
        var gh = 20;
        while(x < maxx){
            if(s[x] == '\r'){
                x ++;
                j = 0;
            }else if(s[x] == '\n'){
                x ++;
                j = 0;
                i += 1;
            }else if(s[x] == '\x1b'){
                if(s[x+1] != '['){
                    x += 1;
                    continue;
                }
                x += 2;
                x1 = x;
                for(x2=x; x2<maxx; ++x2){
                    if(s[x2] == 'm'){
                        x = x2+1;
                        break;
                    }else if(!((s[x2] == ';') ||
                               ((s[x2] <= '9') && (s[x2] >= '0')))){
                        x = x2;
                        break;
                    }
                }
                console.log(x1, x2, x);
                console.log(s.slice(x1, x2).split(';'));
                c = apply_effect(ca, s.slice(x1, x2).split(';'));
            }
            else{
                w = get_width(s[x]);
                r.push('<span class="w'+w+' p'+i+'-'+j+' '+c
                       +'" style="top:'+(i*gh)+'px; '
                       +'left:'+(j*gw)+'px;"'+'>'+format_escape(s[x])
                       +'</span>');
                j += w;
                if(j > mj) mj = j;
                x ++;
            }
        }
        return '<div style="height:'+((i+1) * gh)+' ; width:'
            +(mj * gw)+' ;" class="ascii-box">' + r.join(' ') + '</div>';
    }
    
    return {
        format: format,
        gen_quote: gen_quote,
        gen_quote_mail: gen_quote_mail,
        ascii: ascii,
        format_escape : format_escape
    };

})

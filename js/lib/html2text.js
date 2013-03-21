function html2text(dom){
    var ch = dom.children();
    if(ch.length){
        ch.each(function(e){
            var $e = $(e);
            $e.replaceWith('<span>' + html2text($e) + '</span>');
        });
    }
    if(dom.length==1){
        var rd = dom[0],
        tagname = rd.tagName,
        rep;
        if(tagname == 'IMG'){
            rep = ' ! '+dom.attr('src') + ' ';
        }
        else if(tagname == 'A'){
            rep = dom.text() + ' ' + dom.href + ' ';
        }
        else if(dom.attr('href')){
            rep = dom.attr('href') + '\n' + dom.text();
        }
        else if(dom.attr('src')){
            rep = dom.attr('src') + '\n' + dom.text();
        }
        else{
            rep = dom.text() + '\n';
        }
        return rep;       
    }
}

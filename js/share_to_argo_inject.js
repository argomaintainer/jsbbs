(function(){
    function click_handler(e){
        var text = '来自 ' + location + ' \n\n'
            + window.jQuery(e).text()
        , title = '[转载]' + document.title
        , boardname = ''
        , para = $('#share-to-argo').attr('src').match(/boardname=(\w*)/);        
        if(para.length >= 1){
            boardname = para[1];
        }
        console.log([boardname, title, text]);
        last = text;
        window.open('http://localhost/n/share.html?'
                    + encodeURIComponent(boardname)
                    + '&&' + encodeURIComponent(title)
                    + '&&' + encodeURIComponent(text.replace(/[ \t]{3,}/g, ' ').substring(0, 500) + '...'));
    }
    function main(){
        if(!window.jQuery || !window.DomOutline){
            return;
        }
        var $=window.jQuery;
        var myDomOutline = DomOutline({ onClick: click_handler});
        myDomOutline.start();
    }
    if (!window.jQuery) {
        script=document.createElement( 'script' );
        script.src='http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';
        script.onload=main;
        document.body.appendChild(script);
    }
    if (!window.DomOutline) {
        script=document.createElement( 'script' );
        script.src='http://localhost/n/js/lib/jquery.dom-outline.js';
        script.onload=main;
        document.body.appendChild(script);
    }
    main();
})();

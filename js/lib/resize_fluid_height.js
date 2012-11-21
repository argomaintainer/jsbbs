$MOD('resize_fluid_height', function(){

    require_module('jsbbs.hook');
    
    register_hook('resize_fluid_height');
    function resize_fluid_height(){
        var screen_heigh = $("#container").height();
        $('.fluid-height').each(function(){
            var obj = $(this),
            top = obj.offset().top;
            var height = screen_heigh - top - 4;
            obj.height(height);
        });
        if($G.hooks.resize_fluid_height){
            $G.hooks.resize_fluid_height()
        }
    };
    do_while_load(resize_fluid_height);
    bind_hook("render_frame", resize_fluid_height);
    $(window).resize(resize_fluid_height);

    return {
        "resize_fluid_height": resize_fluid_height
    }
    
});

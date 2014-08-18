function get_fresh_group(cursor, callback){
    var group = [];
    var group_index = {};
    $api.get_fresh(cursor || null, function(data){
        if(data.items){
            _.each(data.items, function(item){
                if(!group_index.hasOwnProperty(item.boardname)){
                    group_index[item.boardname] = group.length;
                    group[group_index[item.boardname]] = [];
                }
                group[group_index[item.boardname]].push(item);
            });
            callback(group);
        }else{
            console.log(data);
            good_alert('Error');
        }
    });
}                    

declare_frame({
    fname : 'home',
    deps : ['home.tpl'],
    tpl : 'home',
    _loadData : function(args, callback){
        var self = this;
        get_fresh_group(null, function(data){
            self.data.group = data;
            console.log(data);
            callback();
        });
    },            
    init : function(){
        this.el.addClass('fresh');
    }        
        
});

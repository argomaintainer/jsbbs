/*
  Thinist v0.1
  ===========

  Thinist is A mirco and non-OO javascript framework.

*/

(function(window){

    var ready=false;
    $(document).ready(function(){
        ready=true;
    })
    function do_while_load(fun){
        if(ready){
            return fun();
        }
        else{
            $(document).ready(fun);
        }
    }
    window.do_while_load = do_while_load;

    /*
      Type System
      ~~~~~~~~~~~

      like c-struct. Usage:

      declare a new Type:
          $Type('Pig', ['size', 'age', 'weight'])
          $Type('Car', ['brand', 'owner'])

      instance a new var:
          p = $Type.Pig([11, 12, 140])
          c = $Type.Car({ owner: 'Chairman', 'brand': 'Redflag' })

      get the type/attr of Typer:
          p.__type__ == 'Pig'
          c.__attrs__ == ['brand', 'owner']

    */
    var $Type;
    $Type = function(typename, attrnames){
        var Typer = function(){
            return typename;
        }
        Typer.prototype.__type__ = typename;
        Typer.prototype.__attrs__ = attrnames;
        Typer.prototype.create = function(vals){
            var obj = new Typer;
            if(vals instanceof Array){
                for(var i in attrnames){
                    obj[attrnames[i]] = vals[i];
                }
            }
            else{
                for(var i in attrnames){
                    obj[attrnames[i]] = vals[attrnames[i]];
                }
            }
            return obj;
        }
        Typer.prototype.create.Typer = Typer;
        $Type[typename] = Typer.prototype.create;
        return Typer;
    }
    window.$Type = $Type;

    /*
      Global Variables System
      ~~~~~~~~~~~~~~~~~~~~~~~

      Manage the global variables.

      usage :

      declare a new global variables:
      
          $G('current_user', initval, [builder]);
 
      builder is a function or object that contain `set` and `get`
      (use as property)
      
      i.e. :
          $G('current_user', 'LTaoist');
          alert($G.current_user)

      Principle :

          1. Less global variables more better.
          2. Global variables is not trustworthy.
          3. Const should not be in $G.

    */
    var $G;
    function Empty(){}
    $G = function(varname, initval, builder){
        if(typeof builder == "undefined"){
            $G[varname] = initval;
            return;
        }
        else{
            if(typeof builder == "object"){
                if(builder.set==null)
                    builder.set = Empty;
                Object.defineProperty($G, varname, builder);
            }
            else{
                var obj = builder();
                if(obj.set==null)
                    obj.set = Empty;
                Object.defineProperty($G, varname, obj);
            }
            if(typeof initval != "undefined"){
                $G[varname] = initval;
            }
        };
    }
    window.$G = $G;

    /*
      Module System
      ~~~~~~~~~~~~~

      Manage the module.

      usage :

      declare a new module:
          $MOD('Counter', function(){
              var counter=0;
              return {
                  'delta': function(num){ return counter += num; },
                  'set' : function(num){ return counter=num ;},
                  'get' : function(){ return counter; },
              }
          });

      access the module:
          $MOD.Counter.delta(20)

        |some trick :
            Counter = $Mode.Counter
            delta = Counter.delta
            delta(20)
            alert(Counter.get(30))

      require another module declare:
          $MOD.__require__('Require module name')

      Principle :
          1. Every code should be in one module.
          2. Never push a variables into module.
             A module should only has Type, function or const.
             
    */
    var $MOD;
    $MOD = function(modname, builder){
        if(typeof builder=="function"){
            $MOD[modname] = builder();
        }
        else{
            $MOD[modname] = builder;
        }
    }
    $MOD.__require__ = function(modname){
        if(!(modname in $MOD)){
            throw 'Require a unexists mod.[' + modname + ']';
        }
        return $MOD[modname];
    }
    window.$MOD = $MOD

})(window)

$MOD('__buildin__', {

    using : function(modname, prefix){
        var mod = $MOD[modname];
        if(prefix){
            for(var fun in mod){
                window[prefix + fun] = mod[fun];
            }
        }
        else{
            for(var fun in mod){
                window[fun] = mod[fun];
            }
        }
    },

    import_module: function(modname, as){
        $MOD.__require__(modname);
        if(typeof as == "undefined"){
            as = modname;
        }
        return window[as] = $MOD[modname];
    },

    require_module: $MOD.__require__,

})

$MOD.__buildin__.using('__buildin__');

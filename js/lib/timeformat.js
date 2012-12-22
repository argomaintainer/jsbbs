/*

  Copyright 2012, Mo Norman.
  Licensed under the MIT license.
  
  A nicer time format outlook. Base on argo phpbbs implement.
  
  Calculating the distance to current time, return it if is
  not too long, else return the date and time.

  Usage:
      $(selector).nicetime()

  i.e.
      <time>2012-10-11T04:52:16</time>
      ----
      $('time').nicetime()
      
*/

$MOD('timeformat', function(){

    var now = new Date()
    , today = new Date(now.getFullYear(),
                       now.getMonth(),
                       now.getDate())
    , yesterday = new Date(now.getFullYear(),
                           now.getMonth(),
                           now.getDate()-1)
    , thisYear = new Date(now.getFullYear(), 0, 0)
    , TSYesterday = Math.ceil(Number(yesterday) / 1000);

    function toTwoBit(num){
        return (num<10?('0'+num):num);
    }

    function toHoursMinutes(date){
        return toTwoBit(date.getHours()) + ":" + toTwoBit(date.getMinutes());
    }

    function toThreeBit(n) {
        if (n < 100) {
            n = '0' + n;
        }
        if (n < 10) {
            n = '0' + n;
        }
        return n;     
    }    

    function toISOString(d) {
        return d.getUTCFullYear() + '-' +  toTwoBit(d.getUTCMonth() + 1)
            + '-' + toTwoBit(d.getUTCDate()) + ' ' + toTwoBit(d.getUTCHours())
            + ':' +  toTwoBit(d.getUTCMinutes()) + ':'
            + toTwoBit(d.getUTCSeconds());
    }        

    function niceTimeWord(time){
        var now = new Date() ,
        distance = Math.round((Math.abs(now - time) / 1000));

        /*

          43200:3600            3500:60    60:1 
          ... |_____________________|__________|_____| <-now
          12h                  60min        1s

          return the distance if less that 12hour
          
        */
        if(distance<60){
            return distance + '秒前';
        }
        else if(distance < 3600){
            return Math.round(distance/60) + '分钟前';
        }
        else if(distance < 43200){
            return Math.round(distance/3600) + '小时前';
        }

        /* Today, Yesterday, This Year, or other. */
        if( time > today ){
            return '今天 ' + toHoursMinutes(time);
        }
        else if ( time > yesterday){
            return '昨天 ' + toHoursMinutes(time);
        }
        else if ( time > thisYear){
            return (time.getMonth() + 1) + '月' + time.getDate() + '日 '
                + toHoursMinutes(time);
        }
        else{
            return toISOString(time);
        }
    }

    function niceTimestamp(timestamp){
        var time = new Date(timestamp * 1000);
        return niceTimeWord(time);
    }

    function afterYesterdayTS(timestamp){
        return timestamp > TSYesterday;
    }

    $.fn.nicetime = function(options){
        return this.each(function(){
            var self = $(this);
            var time = new Date(self.html());
            self.html(niceTimeWord(time));                       
        });
    };

    return {
        "nice_timestamp": niceTimestamp,
        "nice_time": niceTimeWord,
        afterYesterdayTS: afterYesterdayTS
    }

})

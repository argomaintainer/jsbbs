(function($) {
	var blockelement;
	
	$.fn.achieve = function(callerArray, callerSettings) {
		var settings = {};
		var itemArray = new Array();
		var itemData = new Array();
		var mouseDownOnSelect = false;
		
		itemArray = callerArray;
		var defaults = {
			inputClass: "ac_input",
			resultsClass: "ac_results",
			loadingClass: "ac_loading",
			overClass: "ac_over",
			width: 220,
			height: 200,
			minChars: 1,
			max: 100,
			delay: 10,
			left: 0,
			top: 0,
			formatItem: function(row) { return row.name; },
			formatMatch: function(row) { return row.name; },
			formatMatch2: function(row) { return row.name; },
			formatResult: function(itemData, input, i) {
				input.val(itemData[i].name);
			}
			
		};
		settings = $.extend(defaults, callerSettings);
		
		return this.each(function() {
			var $this = $(this);
			$.fn.achieve.action($this, settings, itemArray, itemData, mouseDownOnSelect);
		});
		
	}
	
	
	$.fn.achieve.action = function(input, settings, itemArray, itemData, mouseDownOnSelect) {
		var KEY = {
			UP: 38,
			DOWN: 40,
			DEL: 46,
			TAB: 9,
			RETURN: 13,
			ESC: 27,
			PAGEUP: 33,
			PAGEDOWN: 34,
			BACKSPACE: 8
		};
		
		var element = false;
        var list;
        var active;
        
		input.bind("keyup", function(event) {
			var event = event || window.event;
            var evtTarget = event.target || event.srcElement;
            var tag = evtTarget.nodeName;
            var lastKeyPressCode = event.keyCode;
            
            if(element && element.is(":visible")) {
            	blockelement = true;
            } else {
            	blockelement = false;
            }
            
            if(!element) init();
			
            switch(lastKeyPressCode) {
            	case KEY.UP:
	            	event.preventDefault();
	            	if (element && element.is(":visible")) {
	            		active--;
	            		if(active < 0) active = 0; 
	            		
	            		$("li", list).removeClass(settings.overClass);
						$('div li[key=' + String(active) + ']').addClass(settings.overClass);
						
						var activeItem = listItems.slice(active, active + 1).addClass(settings.overClass);
						var offset = 0;
						listItems.slice(0, active).each(function() {
							offset += this.offsetHeight;
						});
						if((offset + activeItem[0].offsetHeight - list.scrollTop()) > list[0].clientHeight) {
							list.scrollTop(offset + activeItem[0].offsetHeight - list.innerHeight());
						} else if(offset < list.scrollTop()) {
							list.scrollTop(offset);
						}
						return false;
	            	}
	            	break;

            	case KEY.DOWN:
	            	event.preventDefault();
	            	if (element && element.is(":visible")) {
	            		active++;
	            		if(active > itemData.length-1) active = itemData.length - 1; 
	            		
	            		$("li", list).removeClass(settings.overClass);
						$('div li[key=' + String(active) + ']').addClass(settings.overClass);
						
						var activeItem = listItems.slice(active, active + 1).addClass(settings.overClass);
						var offset = 0;
						listItems.slice(0, active).each(function() {
							offset += this.offsetHeight;
						});
						
						if((offset + activeItem[0].offsetHeight - list.scrollTop()) > list[0].clientHeight) {
							list.scrollTop(offset + activeItem[0].offsetHeight - list.innerHeight());
						} else if(offset < list.scrollTop()) {
							list.scrollTop(offset);
						}
						return false;
	            	}
	            	break;

            	case KEY.PAGEUP:
	            	event.preventDefault();
	            	break;

            	case KEY.PAGEDOWN:
	            	event.preventDefault();
	            	break;
	            	
            	case KEY.TAB:
            	case KEY.RETURN:
            		if (element && element.is(":visible")) {
		            	event.preventDefault();
		            	settings.formatResult(itemData, input, Number(active));
		            	element.hide();
		            	blockelement = false;
		            	return false;
            		}
            		break;

            	case KEY.ESC:
	            	element.hide();
	            	break;
	            	
				case 37:
				case 39:
	            	break;
	            	
            	default:
            		var str = input.val();
            		achieve_data(str);
            		if(itemData.length != 0) {
            			setTimeout(fillList, settings.delay);
            		} else {
            			element.hide();
            		}
	            	break;
            }
            
		}).blur(function() {
			if (!mouseDownOnSelect) {
				if(element) element.hide();
			}
		}).dblclick(function() {
			if(input.val().length >= settings.minChars && element && !element.is(":visible")) {
				var str = input.val();
				achieve_data(str);
				if(itemData.length != 0) {
					setTimeout(fillList, settings.delay);
				} else {
					element.hide();
				}
			}
		});
		
		function init() {
			if(!$('#ac_achieve').length) {
				element = $("<div id=\"ac_achieve\" />")
				.hide()
				.addClass(settings.resultsClass)
				.css("position", "absolute")
				.css("left","20px")
				.appendTo(document.body);
	
				list = $("<ul/>").appendTo(element).css({"overflow":"auto", "max-height": settings.height
				}).mouseover( function (event) {
					var event = event || window.event;
					var evtTarget = event.target || event.srcElement;
					var tag = evtTarget.nodeName;
					if(tag && tag.toUpperCase() == 'LI') {
						active = $("li", list).removeClass(settings.overClass).index(evtTarget);
						$(evtTarget).addClass(settings.overClass);
					}
				}).click(function(event) {
					var event = event || window.event;
					var evtTarget = event.target || event.srcElement;
					var tag = evtTarget.nodeName;
					$(evtTarget).addClass(settings.overClass);
					settings.formatResult(itemData, input, Number($(evtTarget).attr('key')));
					input.focus();
					element.hide();
					return false;
				}).mousedown(function() {
					mouseDownOnSelect = true;
				}).mouseup(function() {
					mouseDownOnSelect = false;
				});
			} else {
				element = $('#ac_achieve');
				list = $('#ac_achieve ul').unbind(
				).css({
					"overflow":"hidden"
				}).css({
					"overflow":"auto"
				}).mouseover( function (event) {
					var event = event || window.event;
					var evtTarget = event.target || event.srcElement;
					var tag = evtTarget.nodeName;
					if(tag && tag.toUpperCase() == 'LI') {
						active = $("li", list).removeClass(settings.overClass).index(evtTarget);
						$(evtTarget).addClass(settings.overClass);
					}
				}).click(function(event) {
					var event = event || window.event;
					var evtTarget = event.target || event.srcElement;
					var tag = evtTarget.nodeName;
					$(evtTarget).addClass(settings.overClass);
					settings.formatResult(itemData, input, Number($(evtTarget).attr('key')));
					input.focus();
					element.hide();
					return false;
				}).mousedown(function() {
					mouseDownOnSelect = true;
				}).mouseup(function() {
					mouseDownOnSelect = false;
				});
			}
				
		}
		
		function fillList() {
			if( settings.width > 0 ) element.css("width", settings.width);
			
			list.empty();
			var max = 0;
			var li = '';
			for (var i in itemData) {
			    if(i == 'remove' ||  i == 'indexOf') continue;
			    max++;
				if (!itemData[i]) continue;
				var formatted = settings.formatItem(itemData[i]);
				if ( formatted === false ) continue;
				if(i%2 == 0) {
					li += '<li class="ac_even" key="' + i + '">' + formatted + '</li>';
				} else {
					li += '<li class="ac_odd" key="' + i + '">' + formatted + '</li>';
				}
			}
			list.append(li);
			listItems = list.find("li");
			listItems.slice(0, 1).addClass(settings.overClass);
			
			active = 0;
			var inputHieght = input.css('height').replace('px', '');//.height();
			if(inputHieght == 'auto') inputHieght = input.height();
			element.css({
				top: String(Number(input.offset().top) + Number(inputHieght) + Number(settings.top)) + 'px',
				left: String(Number(input.offset().left) + Number(settings.left)) + 'px'
			});
			if($.browser.msie && Number(jQuery.browser.version) < 7) {
				if(max < 10) {
					element.find('ul').css({'height':'', "overflow":"auto", "max-height": settings.height});
				} else {
					element.find('ul').css({height: settings.height});
				}
			}
			element.show();
			list.scrollTop(0);
		}
		
		function achieve_data(str) {
			itemData = new Array();
			str = str.toLowerCase();
			if(str == '') return;
			var n = 0;
			for(var i in itemArray) {
			    if(i == 'remove' || i == 'indexOf') continue;
				var match = settings.formatMatch(itemArray[i]).toLowerCase();
				var match2 = settings.formatMatch2(itemArray[i]).toLowerCase();
				if(match.indexOf(str) == 0 || match2.indexOf(str) >= 0) {
					itemData[n] = itemArray[i];
					n++;
					if(n >= settings.max) break;
				}
			}
		}
		
	};
	
	$.fn.visible = function () {return blockelement; }
		
})(jQuery);

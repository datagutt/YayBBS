(function(global){
	var YAY = {},
		textarea = document.createElement('textarea');
	YAY.controllers = {};
	YAY.Utils = {};
	YAY.loaded = false;
	YAY.queue = [];
	YAY.config = {};
	
	if(document.selection && typeof document.selection.createRange == 'function'){
		YAY.Utils.insertAtCaret = function(el, value){
			el.focus();
			sel = document.selection.createRange();
			sel.text = value;
			el.focus();
		};
	}else if(textarea.selectionStart || textarea.selectionStart == '0'){
		YAY.Utils.insertAtCaret = function(el, value){
			var startPos = el.selectionStart;
			var endPos = el.selectionEnd;
			var scrollTop = el.scrollTop;

			el.value = [
				el.value.substring(0, startPos),
				value,
				el.value.substring(endPos, el.value.length)
			].join('');
			
			el.focus();
			el.selectionStart = startPos + value.length;
			el.selectionEnd = startPos + value.length;
			el.scrollTop = scrollTop;
		};
	}
	
	if(YAY.Utils.insertAtCaret){
		if(textarea.selectionStart || textarea.selectionStart == '0'){
			YAY.Utils.wrapText = function(el, left, right){
				var startPos = el.selectionStart;
				var endPos = el.selectionEnd;
				var scrollTop = el.scrollTop;
				
				return YAY.Utils.insertAtCaret(el, left + el.value.substring(startPos, endPos) + right);	
			};
		}
	}
	
	YAY.init = function(){
		if(YAY.loaded){
			return;
		}
		window.onload = function(){
			if(YAY.queue.forEach){
				YAY.queue.forEach(function(func){
					if(typeof func == 'function'){
						func();
					}
					YAY.queue.pop();
				});
			}else{
				for(key in YAY.queue){
					var func = YAY.queue[key];
					if(typeof func == 'function'){
						func();
					}
					YAY.queue.pop();
				}
			}
		};
		self.loaded = true;
	};
	
	global.YAY = YAY;
})(window);
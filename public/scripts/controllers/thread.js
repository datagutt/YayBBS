(function(global){
	if(!global.YAY){
		var YAY = {};
	}else{
		var YAY = global.YAY;
	}
	
	if(!YAY.controllers){
		YAY.controllers = {};
	}
	
	YAY.controllers['thread'] = {
		init: function(){
			var url_shortcut = document.getElementById('url-shortcut'),
				image_shortcut = document.getElementById('image-shortcut'),
				textarea = document.getElementsByName('comment')[0];
			if(url_shortcut){
				url_shortcut.onclick = function(){
					if(YAY.Utils.wrapText){
						YAY.Utils.wrapText(textarea, '[](', ')');
					}
				};
			}
			if(image_shortcut){
				image_shortcut.onclick = function(){
					if(YAY.Utils.wrapText){
						YAY.Utils.wrapText(textarea, '![](', ')');
					}
				};
			}
			
			var close_thread = document.getElementById('close-thread'),
				delete_thread = document.getElementById('delete-thread');
			close_thread.onclick = function(){
				if(close_thread.parentNode){
					close_thread.parentNode.submit();
				}
			}
			delete_thread.onclick = function(){
				if(delete_thread.parentNode){
					if(confirm('Are you sure you want to delete this thread?')){
						delete_thread.parentNode.submit();
					}
				}
			}
		}
	};
	
	global.YAY = YAY;
})(window);
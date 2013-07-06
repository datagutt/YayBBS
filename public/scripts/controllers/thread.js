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
			url_shortcut.onclick = function(){
				if(YAY.Utils.wrapText){
					YAY.Utils.wrapText(textarea, '[](', ')');
				}
			};
			image_shortcut.onclick = function(){
				if(YAY.Utils.wrapText){
					YAY.Utils.wrapText(textarea, '![](', ')');
				}
			};
		}
	};
	
	global.YAY = YAY;
})(window);
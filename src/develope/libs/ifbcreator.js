window.onpwgt___idx = 0;

if( !window.ONPWGT ) {
	window.ONPWGT = {

		callbacks: {},

		init: function(id, widgetType, options, callback) {
			'use strict';

			var self = this;

			if( !id || !widgetType ) {
				throw new Error("Параметры id и widgetType являются обязательным!");
			}

			if( !options ) {
				options = {};
			}

			options.name = widgetType;

			var widget = document.createElement('iframe'),
				widgetContanier = document.createElement('div'),
				widgetName = this._genWidgetName(widgetType),
				widgetSrc = '//cdn.sociallocker.ru/service/buttons/' + widgetType + '.html';
			// widgetSrc = 'http://opanda-develope.dev/iframe-buttons/html/' + widgetType + '.html';

			while( window.ONPWGT.callbacks[widgetName] || document.getElementsByName(widgetName)[0] ) {
				widgetName = this._genWidgetName(widgetType);
			}

			window.onpwgt___idx += 1;

			widgetContanier.style.display = "inline-block";
			widgetContanier.style.position = "relative";
			widgetContanier.style.zIndex = "9";
			widgetContanier.style.verticalAlign = "bottom";
			widgetContanier.style.overflow = "hidden";
			widgetContanier.style.display = "none";

			widget.setAttribute("id", "onpwgt" + window.onpwgt___idx);
			widget.setAttribute("name", widgetName);
			widget.setAttribute("src", widgetSrc);
			widget.setAttribute("frameborder", "0");
			widget.setAttribute("scrolling", "no");
			widget.setAttribute("width", "180");
			widget.setAttribute("height", "20");

			widgetContanier.appendChild(widget);

			if( !document.getElementById(id) ) {
				return;
			}

			document.getElementById(id).appendChild(widgetContanier);

			var win = window.frames[widgetName];
			widget.onload = function() {
				var postMessageData = {
					onpwgt_to: {
						button: options
					}
				};

				win.postMessage(JSON.stringify(postMessageData), '*');
			};

			window.ONPWGT.callbacks[widgetName] = function(data) {

				if( data.event === 'resize' ) {
					if( !data.iframe || (data.width == 0 && data.height == 0)) {
						return;
					}

					var el = document.getElementsByName(data.iframe)[0];
					el.parentNode.style.width = data.width + "px";
					el.parentNode.style.height = data.height + "px";

					if( data.name === 'vk-like' ) {
						el.style.width = "350px";
						el.style.height = "250px";
						el.style.zIndex = "10";
					} else {
						el.style.width = data.width + "px";
						el.style.height = data.height + "px";
					}
				}

				if( data.event === 'alert' ) {
					if( data.status === 'show' ) {
						widgetContanier.style.overflow = 'visible';
						widgetContanier.style.zIndex = "99";
					} else {
						widgetContanier.style.overflow = 'hidden';
						widgetContanier.style.zIndex = "10";
					}
				}

				if( data.event === 'loaded' ) {
					widgetContanier.style.display = "inline-block";
				}

				callback && callback(data);
			};

			return widgetContanier;
		},

		_genWidgetName: function(widgetType) {
			return this.hash(
					widgetType + Math.floor((Math.random() * 999999) + 1)
				) + 'ab';
		},

		hash: function(str) {
			'use strict';

			var hash = 0;

			if( !str || str.length === 0 ) {
				return hash;
			}
			for( var i = 0; i < str.length; i++ ) {
				var charCode = str.charCodeAt(i);
				hash = ((hash << 5) - hash) + charCode;
				hash = hash & hash;
			}
			hash = hash.toString(16);
			hash = hash.replace("-", "");
			return hash;
		}
	};
}

function onpwgt___create_button_stream(event) {
	'use strict';

	if( typeof event.data != 'string' || event.data.indexOf('onpwgt') === -1 ) {
		return;
	}

	var data = JSON.parse(event.data);

	if( !data.onpwgt.button ) {
		return;
	}

	window.ONPWGT.callbacks[data.onpwgt.button.iframe](data.onpwgt.button);
}

if( window.addEventListener ) {
	window.addEventListener("message", onpwgt___create_button_stream);
} else {
	// IE8
	window.attachEvent("onmessage", onpwgt___create_button_stream);
}

if( window.onpwgt___asyncInit ) {
	setTimeout(window.onpwgt___asyncInit, 0);
}
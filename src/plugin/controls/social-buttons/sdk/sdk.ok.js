/*!
 * Twitter SDK Connector
 * Copyright 2014, OnePress, http://byonepress.com
*/
(function($) {
	'use strict';

	if( !$.onepress ) {
		$.onepress = {};
	}
	if( !$.pandalocker.sdk ) {
		$.pandalocker.sdk = {};
	}

	$.pandalocker.sdk.ok = $.pandalocker.sdk.ok || {
		name: 'ok',
		url: '//connect.ok.ru/connect.js',
		scriptId: 'ok-jssdk',
		hasParams: true,
		isRender: true,
		// a timeout to load
		timeout: 10000,

		isLoaded: function() {
			return (typeof (window.OK) === "object");
		},

		createEvents: function() {
			var self = this;
			var isLoaded = this.isLoaded();

			var load = function() {

				var onShare = function(e) {
					if( !e.origin || e.origin.indexOf('odnoklassniki') === -1 ) {
						return;
					}

					var args = e.data.split("$");
					if( args[0] === "ok_shared" ) {
						var url = $('#' + args[1]).parent().data('url-to-verify');
						$(document).trigger('onp-sl-ok-share', [url]);
					}
				};

				if( window.addEventListener ) {
					window.addEventListener('message', onShare, false);
				} else {
					window.attachEvent('onmessage', onShare);
				}

				$(document).trigger(self.name + '-init');
			};

			if( isLoaded ) {
				load();
				return;
			}

			$(document).bind('ok-script-loaded', function() {
				load();
			});
		}

	};

})(jQuery);
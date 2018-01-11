/*!
 * Vkontakte SDK Connector
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

	$.pandalocker.sdk.vk = $.pandalocker.sdk.vk || {
		name: 'vk',
		url: '//vk.com/js/api/openapi.js',
		scriptId: 'vk-jssdk',
		hasParams: true,
		isRender: true,
		// a button container
		container: 'iframe',
		// a timeout to load
		timeout: 10000,

		isLoaded: function() {
			return ( window.VK && window.VK.Cookie && typeof (window.VK.Cookie) === "object" );
		},

		prepare: function() {
			$("#vk_api_transport").length == 0 && $('<div id="vk_api_transport"></div>').appendTo($("body"));
		},

		createEvents: function() {
			var self = this;
			var isLoaded = this.isLoaded();

			var load = function() {

				window.VK.init({
					apiId: self.options.appId,
					onlyWidgets: true
				});

				var vkLikeEvent = 'widgets.like.liked';

				if( self.options.like.requireSharing ) {
					vkLikeEvent = 'widgets.like.shared';

					window.VK.Observer.subscribe('widgets.like.liked', function(response) {
						$(document).trigger('vk-like-alert-' + $.pandalocker.sociallocker.vk.like.lastHoverWidget._idx, [$.pandalocker.sociallocker.vk.like.lastHoverWidget]);
					});
				}

				window.VK.Observer.subscribe(vkLikeEvent, function(response) {
					$(document).trigger('vk-like', [$.pandalocker.sociallocker.vk.like.lastHoverWidget.url]);
				});

				window.VK.Observer.subscribe('widgets.groups.joined', function(response) {
					var verify_id = $('#vkwidget' + response).parent().data('owner-to-verify');

					$(document).trigger('vk-subscribe', [verify_id]);
				});

				window.VK.Observer.subscribe('widgets.groups.leaved', function(response) {
					var pseudoButton = $('#vkwidget' + response).closest('.onp-vk-subscribe-button').find('.onp-pseudo-subscribe-button');

					$(document).trigger('vk-unsubscribe', [pseudoButton]);
				});

				$(document).trigger(self.name + '-init');

			};

			if( isLoaded ) {
				load();
				return;
			}

			if( window.vkAsyncInit ) {
				var predefined = window.vkAsyncInit;
			}

			window.vkAsyncInit = function() {
				load();
				predefined && predefined();
				window.vkAsyncInit = function() {
				};
			};

		}
	};
})(jQuery);
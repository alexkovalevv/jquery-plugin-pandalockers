/**
 * Mail SDK Connector
 * Copyright 2014, OnePress, http://byonepress.com

 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:15
 * @!lang:[]
 * @!build:['free','premium']
 */

(function($) {
	'use strict';

	if( !$.pandalocker || !$.pandalocker.sdk ) {
		throw new Error('[Ошибка]: Не подключен основной плагин.');
	}

	$.pandalocker.sdk.mail = $.pandalocker.sdk.mail || {
		name: 'mail',

		url: '//connect.mail.ru/js/loader.js',

		scriptId: 'mail-jssdk',

		hasParams: true,

		isRender: true,

		// a timeout to load
		timeout: 10000,

		isLoaded: function() {
			return ( window.mailru && typeof (window.mailru) === "object" );
		},

		prepare: function() {
			var checker = function(e) {
				if( !e && !e.data ) {
					return;
				}

				if( typeof e.data === "string" && e.data.indexOf('event=plugin.liked') !== -1 ) {
					$(document).trigger('onp-sl-mail-share');
				}

				/*if( typeof e.data === "string" && e.data.indexOf('event=plugin.closeComment') !== -1 ) {
				 $(document).trigger('onp-sl-mail-share');
				 }*/

				if( typeof e.data === "string" && e.data.indexOf('event=plugin.unliked') !== -1 ) {
					$(document).trigger('onp-sl-mail-unlike');
				}
			};

			window.addEventListener
				? window.addEventListener("message", checker, !1)
				: window.attachEvent("onmessage", checker);
		},

		createEvents: function() {
			var self = this;
			var isLoaded = this.isLoaded();

			var load = function() {
				$(document).trigger(self.name + '-init');
			};

			if( isLoaded ) {
				load();
				return;
			}

			$(document).bind('mail-script-loaded', function() {
				load();
			});
		}
	};
})(__$onp);
/**
 * Twitter SDK Connector
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

})(__$onp);
/**
 * Vkontakte SDK Connector
 * Copyright 2017, OnePress, http://byonepress.com
 *
 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:51
 * @!uglify:true
 * @!lang:[]
 * @!build:['full-free', 'full-premium']
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
})(__$onp);
/**
 * Onepress SDK Connector
 * Предназначен для подключения облачной версии социальных кнопок
 * @author Alex Kovalev <alex.kovalevv@gmail.com>

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

	$.pandalocker.sdk.onp = $.pandalocker.sdk.onp || {
		name: 'onp',
		url: '//cdn.sociallocker.ru/service/ifbcreator.js',
		scriptId: 'onp-jssdk',
		hasParams: true,
		isRender: true,

		// a timeout to load
		timeout: 10000,

		isLoaded: function() {
			return ( window.ONPWGT && typeof (window.ONPWGT) === "object" );
		},

		prepare: function() {
			this.url = this.options.globalOptions.debug && this.options.globalOptions.debugOptions
				? this.options.globalOptions.debugOptions.onpSdkUrl
				: this.url;
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

			if( window.onpwgt___asyncInit ) {
				var predefined = window.onpwgt___asyncInit;
			}

			window.onpwgt___asyncInit = function() {
				load();
				predefined && predefined();
				window.onpwgt___asyncInit = function() {
				};
			};
		}
	};
})(__$onp);
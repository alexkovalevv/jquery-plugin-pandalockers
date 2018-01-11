/**
 * Google SDK Connector
 * Copyright 2014, OnePress, http://byonepress.com

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:51
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	if( !$.onepress ) {
		$.onepress = {};
	}
	if( !$.pandalocker.sdk ) {
		$.pandalocker.sdk = {};
	}

	$.pandalocker.sdk.google = $.pandalocker.sdk.google || {

		// a name of a social network
		name: 'google',
		// a script to load

		url: '//apis.google.com/js/platform.js',

		// a script id to set
		scriptId: 'google-jssdk',
		// a timeout to load
		timeout: 10000,

		/**
		 * Returns true if an sdk is currently loaded.
		 *
		 * @since 1.5.5
		 * @returns boolean
		 */
		isLoaded: function() {
			return (typeof (window.gapi) === "object");
		},

		/**
		 * Creates a function for Google callbacks.
		 *
		 * @since 1.5.5
		 * @returns void
		 */
		prepare: function() {
			var self = this;
			self.notAuthed = false;

			// sets sdk language
			var lang = (this.options && this.options.lang) || "en";
			window.___gcfg = window.___gcfg || {lang: lang};

			window.OPanda_GooglePlusOne_Callback = function(data) {
				if( data.state === "on" ) {
					$(document).trigger('onp-sl-google-plus', [data.href]);
				}
			};

			window.OPanda_GoogleShare_StartInteraction = function(data) {
				$.pandalocker.data.__googleShareUrl = data.id;
			};

			var checker = function(e) {
				try {

					if( !e && !e.data ) {
						return;
					}

					if( typeof e.data !== 'string' ) {
						return;
					}
					if( e.data.indexOf('oauth2relay') !== -1 ) {
						return;
					}

					if( !$.pandalocker.tools.isTabletOrMobile() ) {
						if( e.data.indexOf('::drefresh') !== -1 ) {
							self.notAuthed = true;
							return;
						}

						/**
						 * Фикс для кнопки google поделиться. Когда мы открываем окно коммантария google, при этом
						 * если нажать на кноки вк, всплывающее окно вызывает _g_wasClosed и замок разблокируется.
						 * Поэтому мы проверим, открыто ли у нас вк окно ил сделаем пометку, если оно будет закрыто.
						 */
						if( e.data.indexOf('onpwgt') > -1 ) {
							var data = JSON.parse(e.data);
							if( data.onpwgt && data.onpwgt.button && [
									'vk-subscribe',
									'vk-share',
									'facebook-share'
								].indexOf(data.onpwgt.button.name) > -1 ) {
								if( data.onpwgt.button.event == 'click' ) {
									self.isOpenWindow = true;
								} else if( [
										'shared',
										'notshared',
										'subscribe',
										'notsubscribe',
										'error'
									].indexOf(data.onpwgt.button.event) > -1 ) {
									self.isOpenWindow = false;
								}
							}

						}

						if( e.data.indexOf('::_g_wasClosed') !== -1 || e.data.indexOf('::_g_closeMe') !== -1 ) {
							if( self.notAuthed ) {
								self.notAuthed = false;
								return;
							}

							if( self.isOpenWindow ) {
								return;
							}

							$(document).trigger('onp-sl-google-share');
						}
					}
				}
				catch( error ) {
					return false;
				}
			};

			window.addEventListener
				? window.addEventListener("message", checker, false)
				: window.attachEvent("onmessage", checker);

		}
	};

})(__$onp);

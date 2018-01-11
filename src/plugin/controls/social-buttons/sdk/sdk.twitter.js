/**
 * Twitter SDK Connector
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

	$.pandalocker.sdk.twitter = $.pandalocker.sdk.twitter || {

		// a name of a social network
		name: 'twitter',
		// a script to load
		url: '//platform.twitter.com/widgets.js',
		// a script id to set
		scriptId: 'twitter-wjs',
		// a timeout to load
		timeout: 10000,

		/**
		 * Returns true if an sdk is currently loaded.
		 *
		 * @since 1.5.5
		 * @returns boolean
		 */
		isLoaded: function() {
			return (typeof (window.__twttrlr) !== "undefined");
		},

		/**
		 * Creates subscribers for Twitter events.
		 *
		 * @returns void
		 */
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

			if( !window.twttr ) {
				window.twttr = {};
			}
			if( !window.twttr.ready ) {
				window.twttr = $.extend(window.twttr, {
					_e: [],
					ready: function(f) {
						this._e.push(f);
					}
				});
			}

			twttr.ready(function(twttr) {
				load();
			});
		},

		prepare: function() {

			var checker = function(e) {

				if( !e && !e.data ) {
					return;
				}
				if( typeof e.data !== 'string' ) {
					return;
				}

				if( e.data.indexOf(':["tweet"') !== -1 ) {
					return $(document).trigger('onp-sl-twitter-tweet');
				}
				if( e.data.indexOf(':["follow"') !== -1 ) {
					return $(document).trigger('onp-sl-twitter-follow');
				}
			};

			window.addEventListener
				? window.addEventListener("message", checker, false)
				: window.attachEvent("onmessage", checker);

		}
	};

})(__$onp);

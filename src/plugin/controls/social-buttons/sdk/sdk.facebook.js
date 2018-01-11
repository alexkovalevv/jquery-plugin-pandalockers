/**
 * Facebook SDK Connector
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

	$.pandalocker.sdk.facebook = $.pandalocker.sdk.facebook || {

		// a name of a social network
		name: 'facebook',

		// a script to load (v1.0)
		url1: '//connect.facebook.net/{lang}/all.js',

		// a script to load (v2.0)
		url2: '//connect.facebook.net/{lang}/sdk.js',

		// a script id to set
		scriptId: 'facebook-jssdk',

		// a timeout to load
		timeout: 10000,

		/**
		 * Returns true if an sdk is currently loaded.
		 *
		 * @since 1.5.5
		 * @returns boolean
		 */
		isLoaded: function() {
			return (typeof (window.FB) === "object");
		},

		/**
		 * Creates fb-root element before calling a Facebook sdk.
		 *
		 * @since 1.5.5
		 * @returns void
		 */
		prepare: function() {

			// root for facebook sdk
			$("#fb-root").length === 0 && $("<div id='fb-root'></div>").appendTo($("body"));

			// sets sdk language
			var lang = (this.options && this.options.lang) || "en_US";

			this.url1 = this.url1.replace("{lang}", lang);
			this.url2 = this.url2.replace("{lang}", lang);

			this.url = this.options.version === 'v1.0' ? this.url1 : this.url2;
		},

		_setup: false,

		/**
		 * Executed when SDK is loaded.
		 */
		setup: function() {
			if( this._setup ) {
				return;
			}
			var self = this;

			window.FB.init({
				appId: (self.options && self.options.appId) || null,
				status: true,
				cookie: true,
				xfbml: true,
				version: self.options.version
			});

			window.FB.Event.subscribe('edge.create', function(url) {
				$(document).trigger('onp-sl-facebook-like', [url]);
			});

			// the initialization is executed only one time.
			// any others attempts will call an empty function.
			window.FB.init = function() {
			};
			$(document).trigger(self.name + '-init');

			this._setup = true;
		},

		/**
		 * Creates subscribers for Facebook evetns.
		 *
		 * @returns void
		 */
		createEvents: function() {
			var self = this;
			var isLoaded = this.isLoaded();

			if( isLoaded ) {
				self.setup();
			} else {
				if( window.fbAsyncInit ) {
					var predefined = window.fbAsyncInit;
				}
				window.fbAsyncInit = function() {
					self.setup();
					predefined && predefined();
					window.fbAsyncInit = function() {
					};
				};
			}
		}
	};

})(__$onp);
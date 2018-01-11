/*!
 * Google Client SDK
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

	$.pandalocker.sdk.googleClient = $.pandalocker.sdk.googleClient || {

		// a name of a social network
		name: 'google-client',
		// a script to load
		url: '//apis.google.com/js/client:platform.js?onload=OPanda_GoogleClient_Callback',
		// a script id to set
		scriptId: 'google-client-jssdk',
		// a timeout to load
		timeout: 10000,

		/**
		 * Returns true if an sdk is currently loaded.
		 *
		 * @since 1.5.5
		 * @returns boolean
		 */
		isLoaded: function() {
			return ( window.gapi && typeof (window.gapi.auth) === "object");
		},

		/**
		 * Creates a function for Google callbacks.
		 */
		prepare: function() {
			var self = this;
			window.OPanda_GoogleClient_Callback = function() {
				$(document).trigger(self.name + "-script-loaded");
			};
		}
	};
})(jQuery);
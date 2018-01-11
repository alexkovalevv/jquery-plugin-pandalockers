/**
 * LinkedIn SDK Connector
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

	$.pandalocker.sdk.linkedin = $.pandalocker.sdk.linkedin || {

		// a name of a social network
		name: 'linkedin',
		// a script to load
		url: '//platform.linkedin.com/in.js',
		// a script id to set
		scriptId: 'linkedin-jssdk',
		// a timeout to load
		timeout: 10000,

		/**
		 * Returns true if an sdk is currently loaded.
		 *
		 * @since 1.5.5
		 * @returns boolean
		 */
		isLoaded: function() {
			return (typeof (window.IN) === "object");
		},

		/**
		 * Creates callback for linkedin.
		 *
		 * @since 1.5.5
		 * @returns void
		 */
		prepare: function() {

			window.OPanda_LinkedinShare_Callback = function(data) {
				$(document).trigger('onp-sl-linkedin-share', [data]);
			};

			// #SLJQ-26: A fix for the LinkedIn button.
			// Saves a link to the current share windlow.

			var funcOpen = window.open;
			window.open = function(url, name, params) {

				var winref = funcOpen(url, name, params);
				if( !winref ) {
					return winref;
				}

				var windowName = name || winref.name;
				if( !windowName ) {
					return winref;
				}
				if( windowName.substring(0, 10) !== "easyXDM_IN" ) {
					return winref;
				}

				$.pandalocker.sdk.linkedin._activePopup = winref;
			};
		}
	};

})(__$onp);

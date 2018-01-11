/*!
 * SDK Connector
 * Copyright 2014, OnePress, http://byonepress.com
 * 
 * @since 1.0.0
 * @pacakge core

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:80
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	$.pandalocker.sdk = $.pandalocker.sdk || {

		/**
		 * Contains dictionary sdk_name => is_sdk_ready (bool)
		 *
		 * @since 1.0.0
		 * @return object
		 */
		_ready: {},

		/**
		 * Contains dictionaty sdk_name => is_sdk_connected (bool)
		 *
		 * @since 1.0.0
		 * @return object
		 */
		_connected: {},

		/**
		 * Contains dictionaty sdk_name => is_sdk_fired_error (bool)
		 *
		 * @since 1.0.0
		 * @return object
		 */
		_error: {},

		/**
		 * Get a SDK object by its name.
		 *
		 * @since 1.0.0
		 * @return object
		 */
		getSDK: function(name) {
			name = $.pandalocker.tools.camelCase(name);
			if( $.pandalocker.sdk[name] ) {
				return $.pandalocker.sdk[name];
			}
			return null;
		},

		/**
		 * Checks whether a specified SDK is connected (sdk script is included into a page).
		 *
		 * @since 1.0.0
		 * @return object
		 */
		isConnected: function(sdk) {
			if( $("#" + sdk.scriptId).length > 0 ) {
				return true;
			}

			var found = false;
			$("script").each(function() {
				var src = $(this).attr('src');
				if( !src ) {
					return true;
				}

				found = src.indexOf(sdk.url) !== -1;
				if( found ) {
					$(this).attr('id', sdk.scriptId);
					return false;
				}
			});
			return found;
		},

		/**
		 * Gets loading SDK script on a page.
		 *
		 * @since 1.0.0
		 * @return object
		 */
		getLoadingScript: function(sdk) {

			var byId = $("#" + sdk.scriptId);
			var byScr = $("script[src='*" + sdk.url + "']");
			return (byId.length > 0) ? byId : byScr;
		},

		/**
		 * Checks whether a specified SQK is loaded and ready to use.
		 *
		 * @since 1.0.0
		 * @return object
		 */
		isLoaded: function(sdk) {
			return this.isConnected(sdk) && sdk.isLoaded && sdk.isLoaded();
		},

		/**
		 * Connects SKD if it's needed then calls callback.
		 */
		connect: function(name, options, timeout) {
			var self = this;
			var sdk = this.getSDK(name);

			var result = new $.pandalocker.deferred();

			if( !sdk ) {
				console && console.log('Invalide SDK name: ' + name);
				result.reject('invalide-sdk');
				return result.promise();
			}

			sdk.options = options;

			// an error if the timeout reached
			setTimeout(function() {
				var loaded = sdk.isLoaded();

				if( !loaded ) {
					self._connected[name] = false;
					result.reject('timeout');
				} else {
					self.setup && self.setup();
				}
			}, timeout);

			// if aready loaded and ready
			if( this._ready[name] ) {

				result.resolve();
				return result.promise();

				// if not, waits until it's ready
			} else {
				$(document).bind(name + "-init", function() {
					result.resolve();
				});
				$(document).bind(name + "-error", function(e, error) {
					self._error[name] = true;
					result.reject(error);
				});
			}

			// if already connected, waits result from the previos caller
			if( this._connected[name] && !self._error[name] ) {
				return result.promise();
			}

			// sets the default method if it's not specified
			if( !sdk.createEvents ) {

				sdk.createEvents = function() {
					var isLoaded = sdk.isLoaded();

					var load = function() {
						$(document).trigger(sdk.name + '-init');
					};

					if( isLoaded ) {
						load();
						return;
					}

					$(document).bind(sdk.name + "-script-loaded", function() {
						load();
					});
				};
			}

			if( sdk.prepare ) {
				sdk.prepare();
			}

			var loaded = sdk.isLoaded();
			var connected = this.isConnected(sdk);

			// subscribes to events
			$(document).bind(name + "-init", function() {
				self._ready[name] = true;
			});
			if( !this._connected[name] ) {
				sdk.createEvents();
			}

			// connects sdk
			if( !connected || self._error[name] ) {

				// removes the previos script
				if( self._error[name] ) {
					var loadingScript = this.getLoadingScript(sdk);
					if( loadingScript ) {
						loadingScript.remove();
					}
				}

				var scriptConnection = function() {

					var script = document.createElement('script');
					script.type = 'text/javascript';
					script.id = sdk.scriptId;
					script.src = sdk.url;

					var scriptContent = ( sdk.getScriptBody ) ? sdk.getScriptBody() : null;
					if( scriptContent ) {
						script.innerHtml = scriptContent;
					}

					var bodyElement = document.getElementsByTagName('body')[0];
					bodyElement.appendChild(script);
				};

				scriptConnection();
			}

			// subsribes to onload event
			if( !loaded ) {

				var loadingScript = this.getLoadingScript(sdk)[0];

				loadingScript.onerror = function(data) {
					console && console.log('Failed to load SDK script:');
					console && console.log(data);

					$(document).trigger(sdk.name + '-error', ['blocked']);
				};

				loadingScript.onreadystatechange = loadingScript.onload = function() {

					var state = loadingScript.readyState;
					if( (!state || /loaded|complete/.test(state)) ) {
						$(document).trigger(sdk.name + '-script-loaded');
						$(document).unbind(sdk.name + '-script-loaded');
					}
				};
			}

			// an error if the timeout reached
			setTimeout(function() {
				var loaded = sdk.isLoaded();
				if( !loaded ) {
					$(document).trigger(sdk.name + '-error', ['timeout']);
				}
			}, timeout);

			this._connected[name] = true;
			return result.promise();
		}
	};
})(__$onp);

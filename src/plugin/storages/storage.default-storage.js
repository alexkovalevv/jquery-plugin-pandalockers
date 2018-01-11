/*
 * OnePress Default State Storage
 * Copyright 2014, OnePress, http://byonepress.com

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:75
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	/**
	 * Returns a state provide for the Strict Mode.
	 */
	$.pandalocker.storages.defaultStateStorage = function(locker) {

		var options = locker.options;

		this.demo = options.demo;
		this.useCookies = options.locker.useCookies;
		this.expires = options.locker.expires;

		/**
		 * Does the provider contain an unlocked state?
		 */
		this.isUnlocked = function(identity) {
			if( this.demo ) {
				return false;
			}
			return this._getValue(identity) ? true : false;
		};

		/**
		 * Does the provider contain a locked state?
		 */
		this.isLocked = function(identity) {
			return !this.isUnlocked(identity);
		};

		/**
		 * Gets a state and calls the callback with the one.
		 */
		this.requestState = function(identity, callback) {
			if( this.demo ) {
				return callback("locked");
			}
			callback(this.isUnlocked(identity) ? "unlocked" : "locked");
		};

		/**
		 * Sets state of a locker to provider.
		 */
		this.setState = function(identity, value) {
			if( this.demo ) {
				return true;
			}
			try {
				return value === "unlocked"
					? this._setValue(identity)
					: this._removeValue(identity);

			}
			catch( e ) {
				console && console.log(e);
			}
		};

		/**
		 * Sets a value to a provider.
		 */
		this._setValue = function(identity) {
			if( !identity ) {
				return false;
			}

			var itemValue = true;
			var itemExpires = 10000;

			// if the option "expires" is set, then we need to save the time
			// when unlocked content will be locked again

			if( this.expires ) {

				var today = new Date();
				var todayMs = today.getTime();

				var expires = todayMs + this.expires * 1000;

				itemExpires = Math.ceil(this.expires / 86400); // in days
				itemValue = JSON.stringify({expires: expires});

			}

			// issue #SLJQ-44
			// for catching QUOTA_EXCEEDED_ERR

			var tryCookies = true;

			try {
				if( localStorage && !this.useCookies ) {
					tryCookies = false;
					try {
						localStorage.setItem(identity, itemValue);
					}
					catch( e ) {
						console && console.log(e);
						tryCookies = true;
					}
				}

				if( tryCookies ) {
					$.pandalocker.tools.cookie(identity, itemValue, {
						expires: itemExpires,
						path: "/"
					});
				}
			}
			catch( e ) {
				console.log('[Warnign]:Local storage is disabled by security permissions.');

				$.pandalocker.tools.cookie(identity, itemValue, {
					expires: itemExpires,
					path: "/"
				});
			}

			return true;
		};

		/**
		 * Gets a value from a provider.
		 */
		this._getValue = function(identity) {
			if( !identity ) {
				return false;
			}

			// if the got value is an object, then check the "expires" property
			function gotValue(value) {
				try {
					var valueObj = JSON.parse(value);
					if( valueObj && valueObj.expires ) {
						var today = new Date();
						return valueObj.expires > today;
					}
					return true;
				}
				catch( e ) {
					return true;
				}
			}

			try {
				// at first, trying to get a value from local storage
				// if there's not a situable value, then trying to get a value from cookies

				var value = localStorage && !this.useCookies && localStorage.getItem(identity);
				if( !value ) {
					value = $.pandalocker.tools.cookie(identity);
				}

				if( value ) {
					return gotValue(value);
				}

				return null;
			}
			catch( e ) {
				console.log('[Warnign]:Local storage is disabled by security permissions.');

				value = $.pandalocker.tools.cookie(identity);

				if( value ) {
					return gotValue(value);
				}

				return null;
			}
		};

		this._removeValue = function(identity) {
			if( !identity ) {
				return false;
			}

			try {
				if( localStorage ) {
					localStorage.removeItem(identity);
				}
				$.pandalocker.tools.cookie(identity, null);
			}
			catch( e ) {
				console.log('[Warnign]:Local storage is disabled by security permissions.');

				$.pandalocker.tools.cookie(identity, null);
			}
		};
	};

})(__$onp);
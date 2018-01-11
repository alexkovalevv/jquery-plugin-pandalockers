/**
 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:85
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function(window, document, $) {
	'use strict';

	if( !$.pandalocker ) {
		$.pandalocker = {};
	}
	$.pandalocker.deferred = $.Deferred || function() {
		var self = this;

		var events = {
			done: [],
			fail: [],
			always: []
		};

		this.resolved = false;
		this.rejected = false;

		this.arg1 = null;
		this.arg2 = null;

		this.resolve = function(arg1, arg2) {
			if( this.resolved || this.rejected ) {
				return this;
			}
			this.resolved = true;

			this.arg1 = arg1;
			this.arg2 = arg2;

			for( var i = 0; i < events.done.length; i++ ) {
				events.done[i](arg1, arg2);
			}
			for( var i = 0; i < events.always.length; i++ ) {
				events.always[i](arg1, arg2);
			}

			return this;
		};

		this.reject = function(arg1, arg2) {
			if( this.resolved || this.rejected ) {
				return this;
			}
			this.rejected = true;

			this.arg1 = arg1;
			this.arg2 = arg2;

			for( var i = 0; i < events.fail.length; i++ ) {
				events.fail[i](arg1, arg2);
			}
			for( var i = 0; i < events.always.length; i++ ) {
				events.always[i](arg1, arg2);
			}

			return this;
		};

		this.done = this.success = function(callback) {
			if( this.resolved ) {
				callback && callback(this.arg1, this.arg2);
			} else {
				events.done.push(callback);
			}

			return this;
		};

		this.fail = this.error = function(callback) {
			if( this.rejected ) {
				callback && callback(this.arg1, this.arg2);
			} else {
				events.fail.push(callback);
			}

			return this;
		};

		this.always = function(callback) {
			if( this.resolved || this.rejected ) {
				callback && callback(this.arg1, this.arg2);
			} else {
				events.always.push(callback);
			}

			return this;
		};

		this.promise = function() {
			return this;
		};
	};
}(window, document, __$onp));
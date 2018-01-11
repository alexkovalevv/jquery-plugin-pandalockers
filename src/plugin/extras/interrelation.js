/*!
 * Interrelation
 * Copyright 2014, OnePress, http://byonepress.com
 * 
 * @since 4.0.0
 * @pacakge extras
 *
 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:65
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	if( !$.pandalocker.extras ) {
		$.pandalocker.extras = {};
	}

	$.pandalocker.extras.interrelation = {

		init: function() {
			var scope = this.options.locker && this.options.locker.scope;
			if( !scope ) {
				return;
			}

			var self = this;

			// fires when the state changed, to save the scope
			// identity in the state storage

			this.addHook('state-changed', function(locker, state, senderType, senderName) {
				if( state !== 'unlocked' ) {
					return;
				}

				var storage = self._getStateStorage();
				var identity = "scope_" + scope;
				storage.setState(identity, 'unlocked');
			});

			this.addFilter('functions-requesting-state', function(checkFunctions) {

				checkFunctions.push(function(callback) {

					var storage = self._getStateStorage();
					var identity = "scope_" + scope;

					storage.requestState(identity, function(state) {
						callback(state);
					});
				});

				return checkFunctions;
			});

			// fires when the current locker was unlocked
			// to notify other lockers on the same page

			this.addHook('unlocked', function(locker, sender) {
				if( "button" !== sender ) {
					return;
				}
				self.runHook('unlocked-by-scope-' + scope, [], true);
			});

			// fires when any interrelated locker
			// was unlocked on the same page

			this.addHook('unlocked-by-scope-' + scope, function(locker) {
				if( locker === self ) {
					return;
				}
				self.unlock('scope');
			}, 10, true);
		}
	};

})(__$onp);

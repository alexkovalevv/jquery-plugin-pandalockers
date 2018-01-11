/**
 * Facebook Connect
 * Copyright 2014, OnePress, http://byonepress.com
 *
 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:45
 * @!uglify:true
 * @!lang:[]
 * @!build:['premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	var button = $.pandalocker.tools.extend($.pandalocker.entity.connectButton);

	/**
	 * The button name.
	 */
	button.name = "facebook";

	/**
	 * The dafault options.
	 */
	button._defaults = {};

	/**
	 * Prepares options before starting usage of the button.
	 */
	button.prepareOptions = function() {

		this.permissions = ['public_profile', 'email'];

		// permissions which have not been yet granted (including the declined)
		this.restPermissions = this.permissions;

		// permissions which were declined
		this.declinedPermissions = [];
	};

	/**
	 * Renders the button.
	 */
	button.renderButton = function($holder) {
		var self = this;

		var longText = this.processButtonTitle(this.lang.viaSignInLong, $.pandalocker.lang.signin_facebook_name);
		var shortText = this.processButtonTitle(this.lang.viaSignInShort, $.pandalocker.lang.signin_facebook_name);

		this.longTitle = $("<span class='onp-sl-long'>" + longText + "</span>").appendTo($holder);
		this.shortTtle = $("<span class='onp-sl-short'>" + shortText + "</span>").appendTo($holder);

		var loadingTimeout = this.groupOptions.loadingTimeout || 20000;
		var theAppIsValid = false;

		setTimeout(function() {
			if( theAppIsValid ) {
				return;
			}
			self.showError($.pandalocker.lang.errors.invlidFacebookAppId);
		}, loadingTimeout);

		this._getLoginStatus(function() {
			theAppIsValid = true;
			self._unlockLoadingState();
		});
	};

	/**
	 * Connects the user via Faceboook.
	 */
	button.connect = function(callback) {
		var self = this;

		// the user is already connected and granted all the needed permissions
		if( 'connected' === self._status && !this.restPermissions.length ) {
			return this._identify(function(identityData) {
				callback(identityData, self._serviceData);
			});
		}
		;

		// sets the permissions we need to ask
		var requestOptions = {
			scope: self.restPermissions.join(',')
		};

		// if some of permissions were declined, ask for them again
		if( self.declinedPermissions.length > 0 ) {
			requestOptions.auth_type = 'rerequest';
		}

		var loggedIn = false;

		self._trackWindow('facebook.com/dialog/oauth', function() {

			setTimeout(function() {
				if( loggedIn ) {
					return;
				}

				self.runHook('raw-social-app-declined');
				self.showNotice($.pandalocker.lang.errors_not_signed_in);
			}, 500);
		});

		// try to login if the user is not connected yet
		FB.login(function(response) {
			loggedIn = true;

			self._checkPermissions(response, function() {

				// shows a message that the user are not authorized the app
				if( 'connected' !== self._status ) {
					self.runHook('raw-social-app-declined');

					self.showNotice($.pandalocker.lang.errors_not_signed_in);
					return;
				}

				// shows a message that the user has not granted all the permissions required
				if( self.restPermissions.length ) {
					self.runHook('raw-social-app-declined');

					self.showNotice(
						$.pandalocker.lang.res_errors_not_granted
							.replace('{permissions}', self.restPermissions.join(', '))
					);
					return;
				}

				return self._identify(function(identityData) {
					callback(identityData, self._serviceData);
				});
			});
		}, requestOptions);
	};

	/**
	 * Gets the current login status, including permissions.
	 */
	button._getLoginStatus = function(onComplete) {
		var self = this;

		FB.getLoginStatus(function(response) {
			self._checkPermissions(response, onComplete);
		});
	};

	/**
	 * Checks which permissions should be granted.
	 */
	button._checkPermissions = function(response, onComplete) {
		var self = this;

		this._status = response.status;
		this._serviceData = response;

		if( !response || 'connected' !== this._status ) {
			if( onComplete ) {
				onComplete();
			}
			return;
		}
		;

		FB.api('/me/permissions', function(response) {
			if( !response || !response.data ) {
				return;
			}

			// new format
			if( response.data[0] && !response.data[0].permission && !response.data[0].status ) {

				var granted = [];
				var declined = [];

				for( var perm in response.data[0] ) {

					if( response.data[0][perm] ) {
						granted.push(perm);
					} else {
						declined.push(perm);
					}
				}

				// old format
			} else {

				var declined = $.grep(response.data, function(a) {
					return a.status !== 'granted';
				});
				var granted = $.grep(response.data, function(a) {
					return a.status == 'granted';
				});

				declined = $.map(declined, function(n, i) {
					return n.permission;
				});
				granted = $.map(granted, function(n, i) {
					return n.permission;
				});
			}

			self.restPermissions = $.pandalocker.tools.diffArrays(self.permissions, granted);
			self.declinedPermissions = $.pandalocker.tools.unionArrays(self.restPermissions, declined);

			if( onComplete ) {
				onComplete();
			}
		});
	};

	/**
	 * Identify the user.
	 */
	button._identify = function(callback) {

		FB.api('/me?fields=email,first_name,last_name,gender,link', function(data) {

			var identity = {};
			if( !data ) {
				return callback(identity);
			}

			identity.source = "facebook";
			identity.email = data.email;
			identity.displayName = data.first_name + " " + data.last_name;
			identity.name = data.first_name;
			identity.family = data.last_name;
			identity.gender = data.gender;
			identity.facebookUrl = data.link;
			identity.image = 'https://graph.facebook.com/' + data.id + '/picture?type=large';
			identity.social = true;
			identity.facebookId = data.id;

			callback(identity);
		});
	};

	// ----------------------------------------------------------------
	// Actions linked with connection
	// ----------------------------------------------------------------

	$.pandalocker.controls["connect-buttons"]["facebook"] = button;

})(__$onp);

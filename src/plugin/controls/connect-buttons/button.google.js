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
	button.name = "google";

	/**
	 * The SDK name to load.
	 */
	button.sdk = 'google-client';

	/**
	 * The dafault options.
	 */
	button._defaults = {};

	/**
	 * Prepares options before starting usage of the button.
	 */
	button.prepareOptions = function() {

		if( !this.options.clientId ) {
			this.showError($.pandalocker.lang.connectButtons.google.clientIdMissed);
			return;
		}

		this.permissions = ['https://www.googleapis.com/auth/userinfo.profile'];
		this.permissions.push('https://www.googleapis.com/auth/userinfo.email');

		if( $.inArray('youtube-subscribe', this.options.actions) !== -1 ) {
			this.permissions.push('https://www.googleapis.com/auth/youtube');

			if( !this.options.youtubeSubscribe || !this.options.youtubeSubscribe.channelId ) {
				return this.showError($.pandalocker.lang.connectButtons.errorYouTubeChannelMissed);
			}
		}

		// permissions which have not been yet granted (including the declined)
		this.restPermissions = this.permissions;

		// permissions which were declined
		this.declinedPermissions = [];
	};

	/**
	 * Renders the button.
	 */
	button.renderButton = function($holder) {

		var longText = this.processButtonTitle(this.lang.viaSignInLong, $.pandalocker.lang.signin_google_name);
		var shortText = this.processButtonTitle(this.lang.viaSignInShort, $.pandalocker.lang.signin_google_name);

		this.longTitle = $("<span class='onp-sl-long'>" + longText + "</span>").appendTo($holder);
		this.shortTtle = $("<span class='onp-sl-short'>" + shortText + "</span>").appendTo($holder);

		this._unlockLoadingState();
	};

	/**
	 * Connects the user via Faceboook.
	 */
	button.connect = function(callback) {
		var self = this;
		var loggedIn = false;

		// sets the permissions we need to ask
		var requestOptions = {
			callback: function(response) {

				if( 'immediate_failed' === response.error ) {
					return;
				}
				loggedIn = true;

				if( !response || !response['status']['signed_in'] ) {
					self.runHook('raw-social-app-declined');

					self.showNotice($.pandalocker.lang.errors_not_signed_in);
					return;
				}

				return self._identify(function(type, result) {

					if( 'error' === type ) {
						self.showNotice($.pandalocker.lang.connectButtons.google.unexpectedError.replace('{0}', result));
						return;
					}

					callback(result, response);
				});
			}
		};

		requestOptions.clientid = this.options.clientId;
		requestOptions.cookiepolicy = 'single_host_origin';
		requestOptions.scope = this.permissions.join(' ');

		if( this.options.share ) {
			var activityType = $.pandalocker.tools.capitaliseFirstLetter(this.options.share.type || 'add');
			requestOptions.requestvisibleactions = 'http://schema.org/' + activityType + 'Action';
		}

		self._trackWindow('google.com/o/oauth2', function() {

			setTimeout(function() {
				if( loggedIn ) {
					return;
				}

				self.runHook('raw-social-app-declined');
				self.showNotice($.pandalocker.lang.errors_not_signed_in);
			}, 500);
		});

		gapi.auth.signIn(requestOptions);
	};

	/**
	 * Identify the user.
	 */
	button._identify = function(callback) {

		gapi.client.load('plus', 'v1').then(function() {

			gapi.client.plus.people.get({
				'userId': 'me'
			}).then(function(data) {

				var identity = {};
				if( !data || !data.result ) {
					return callback('error', identity);
				}

				identity.source = "google";
				identity.email = data.result.emails && data.result.emails[0] && data.result.emails[0].value;
				identity.displayName = data.result.displayName;
				identity.name = data.result.name && data.result.name.givenName;
				identity.family = data.result.name && data.result.name.familyName;
				identity.gender = data.result.gender;
				identity.googleUrl = data.result.url;
				identity.social = true;

				if( data.result.image && data.result.image.url ) {
					identity.image = data.result.image.url.replace(/\?sz=\d+/gi, '');
				}

				callback('success', identity);

			}, function(reason) {
				callback('error', reason.result.error.message);
			});
		});
	};

	button.runYoutubeSubscribeAction = function(identityData, serviceData, actionOptions, changeScreen, callback) {
		var self = this;

		gapi.client.load('youtube', 'v3', function() {

			var request = gapi.client.youtube.subscriptions.insert({
				part: 'snippet',
				resource: {
					snippet: {
						resourceId: {
							kind: 'youtube#channel',
							channelId: self.options.youtubeSubscribe.channelId
						}
					}
				}
			});

			request.execute(function(response) {

				if( response && response.error ) {

					// ignores if the user is already subscribed
					if( response.error.data && response.error.data[0] && response.error.data[0].reason === "subscriptionDuplicate" ) {
						callback();
						return;
					}

					console && console.log && console.log(response);
					self.showError(response.error.message);
					callback('error');

					return;
				}

				self.runHook('got-youtube-subscriber', [response]);
				callback();
			});

		});
	};

	// ----------------------------------------------------------------
	// Actions linked with connection
	// ----------------------------------------------------------------

	$.pandalocker.controls["connect-buttons"]["google"] = button;

})(__$onp);

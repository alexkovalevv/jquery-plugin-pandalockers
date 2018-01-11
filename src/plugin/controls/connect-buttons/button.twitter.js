/**
 * Facebook Twitter
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
	button.name = "twitter";

	/**
	 * The dafault options.
	 */
	button._defaults = {};

	/**
	 * Renders the button.
	 */
	button.prepareOptions = function($holder) {

		if( !this.options.proxy ) {
			this.showError($.pandalocker.lang.connectButtons.twitter.proxyEmpty);
			return;
		}

		if( $.inArray('follow', this.options.actions) !== -1 ) {

			if( !this.options.follow || !this.options.follow.user ) {
				return this.showError($.pandalocker.lang.connectButtons.errorTwitterUserMissed);
			}
		}

		if( $.inArray('tweet', this.options.actions) !== -1 ) {

			if( !this.options.tweet || !this.options.tweet.message ) {
				return this.showError($.pandalocker.lang.connectButtons.errorTwitterMessageMissed);
			}
		}
	};

	/**
	 * Renders the button.
	 */
	button.renderButton = function($holder) {
		var self = this;

		var longText = this.processButtonTitle(this.lang.viaSignInLong, $.pandalocker.lang.signin_twitter_name);
		var shortText = this.processButtonTitle(this.lang.viaSignInShort, $.pandalocker.lang.signin_twitter_name);

		this.longTitle = $("<span class='onp-sl-long'>" + longText + "</span>").appendTo($holder);
		this.shortTtle = $("<span class='onp-sl-short'>" + shortText + "</span>").appendTo($holder);

		self._unlockLoadingState();
	};

	/**
	 * Connects the user via Faceboook.
	 */
	button.connect = function(callback) {
		var self = this;

		if( $.pandalocker.data.twitterOAuthReady ) {

			this._identify(function(identityData) {
				callback(identityData, self._getServiceData());
			});

		} else {

			// The fix for the issue #BIZ-41:
			// removes the proxy URL from the options because it fires the errors on some website

			var optionsToPass = $.extend(true, {}, self.options);
			delete optionsToPass['proxy'];

			var dataToSend = {
				'opandaHandler': 'twitter',
				'opandaRequestType': 'init',
				'opandaTwitterOptions': JSON.stringify(optionsToPass)
			};

			var visitorId = $.pandalocker.tools.cookie('opanda_twid');
			if( visitorId && visitorId !== 'null' ) {
				dataToSend['opandaVisitorId'] = visitorId;
			}

			var url = self.options.proxy;

			for( var prop in dataToSend ) {
				if( !dataToSend.hasOwnProperty(prop) ) {
					continue;
				}
				url = $.pandalocker.tools.updateQueryStringParameter(url, prop, dataToSend[prop]);
			}

			self._trackWindow('opandaHandler=twitter', function() {

				setTimeout(function() {
					if( $.pandalocker.data.twitterOAuthReady ) {
						return;
					}

					self.runHook('raw-social-app-declined');
					self.showNotice($.pandalocker.lang.errors_not_signed_in);
				}, 500);
			});

			var apiTwitterAuth = window.open(url,
				"Twitter Sign-In",
				"width=500,height=450,resizable=yes,scrollbars=yes,status=yes"
			);

			window.OPanda_TwitterOAuthCompleted = function(visitorId) {

				$.pandalocker.data.twitterOAuthReady = true;
				self._saveVisitorId(visitorId);
				self.connect(callback);
			};

			window.OPanda_TwitterOAuthDenied = function(visitorId) {

				self.runHook('raw-social-app-declined');
				self.showNotice($.pandalocker.lang.errors_not_signed_in);
				self._saveVisitorId(visitorId);
			};
		}
	};

	/**
	 * Saves a visitor ID.
	 */
	button._saveVisitorId = function(visitorId) {

		this._visitorId = visitorId;
		$.pandalocker.tools.cookie('opanda_twid', visitorId, {
			expires: 1000,
			path: "/"
		});
	};

	/**
	 * Puts together service data required for the future requests.
	 */
	button._getServiceData = function() {
		var self = this;
		return {visitorId: self._visitorId};
	};

	/**
	 * Identify the user.
	 */
	button._identify = function(callback) {
		var self = this;

		var req = $.ajax({
			type: "POST",
			dataType: "json",
			url: self.options.proxy,
			data: {
				'opandaHandler': 'twitter',
				'opandaRequestType': 'user_info',
				'opandaVisitorId': self._visitorId
			},
			success: function(data) {

				if( ( !data || data.error || data.errors ) && console && console.log ) {
					console.log('Unable to get the user data: ' + req.responseText);
				}

				var identity = {};
				if( !data ) {
					return callback(identity);
				}

				if( data.name ) {
					var parts = data.name.split(' ', 2);
					if( parts.length === 2 ) {
						identity.name = parts[0];
						identity.family = parts[1];
					} else {
						identity.name = data.name;
					}
				} else {
					identity.name = data.name;
				}

				identity.source = "twitter";
				identity.email = data.email;
				identity.displayName = data.screen_name;
				identity.twitterUrl = 'https://twitter.com/' + data.screen_name;

				if( data.profile_image_url ) {
					identity.image = data.profile_image_url.replace('_normal', '');
				}

				callback(identity);
			},
			error: function() {
				console && console.log && console.log('Unable to get the user data: ' + req.responseText);
				callback({});
			}
		});
	};

	/**
	 * Runs the Follow action.
	 */
	button.runFollowAction = function(identityData, serviceData, actionOptions, changeScreen, callback) {
		var self = this;

		var dataToPass = {
			'opandaHandler': 'twitter',
			'opandaRequestType': 'follow',
			'opandaVisitorId': self._visitorId,
			'opandaFollowTo': actionOptions.user,
			'opandaNotifications': actionOptions.notifications,
		};

		dataToPass = $.pandalocker.filters.run(self.locker.id + '.ajax-data', [dataToPass]);
		dataToPass = $.pandalocker.filters.run(self.locker.id + '.twitter-follow.ajax-data', [dataToPass]);

		var req = $.ajax({
			type: "POST",
			dataType: "json",
			url: self.options.proxy,

			data: dataToPass,

			success: function(data) {
				if( ( !data || data.error || data.errors ) && console && console.log ) {
					console.log('Unable to follow: ' + req.responseText);
				}

				if( data && data.error ) {
					self.showScreen('default');
					self.showNotice('Unable to perform the follow action due to the error: ' + data.error);
					return;
				}

				callback();
			},

			error: function() {

				self.showScreen('default');
				self.showNotice('Unable to perform the follow action due to the unexpected error. See the logs for more details.');
				console && console.log && console.log('Unable to follow: ' + req.responseText);
			}
		});
	};

	/**
	 * Runs the Tweet action.
	 */
	button.runTweetAction = function(identityData, serviceData, actionOptions, changeScreen, callback) {
		var self = this;

		var dataToPass = {
			'opandaHandler': 'twitter',
			'opandaRequestType': 'tweet',
			'opandaVisitorId': self._visitorId,
			'opandaTweetMessage': actionOptions.message
		};

		dataToPass = $.pandalocker.filters.run(self.locker.id + '.ajax-data', [dataToPass]);
		dataToPass = $.pandalocker.filters.run(self.locker.id + '.twitter-tweet.ajax-data', [dataToPass]);

		var req = $.ajax({
			type: "POST",
			dataType: "json",
			url: self.options.proxy,

			data: dataToPass,
			success: function(data) {

				if( ( !data || data.error || data.errors ) && console && console.log ) {
					console.log('Unable to tweet: ' + req.responseText);
				}

				if( data && data.error ) {

					self.showScreen('default');
					self.showNotice('Unable to perform the tweet action due to the error: ' + data.error);
					return;
				}

				callback();
			},
			error: function() {

				self.showScreen('default');
				self.showNotice('Unable to perform the tweet action due to the unexpected error. See the logs for more details.');
				console && console.log && console.log('Unable to follow: ' + req.responseText);
			}
		});
	};

	$.pandalocker.controls["connect-buttons"]["twitter"] = button;

})(__$onp);

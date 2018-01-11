/**
 * Facebook LinkedIn
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
	button.name = "linkedin";

	/**
	 * The dafault options.
	 */
	button._defaults = {};

	/**
	 * Prepares options before starting usage of the button.
	 */
	button.prepareOptions = function() {

		if( !this.options.clientId ) {
			this.showError($.pandalocker.lang.connectButtons.linkedin.clientIdMissed);
			return;
		}
	};

	/**
	 * Renders the button.
	 */
	button.renderButton = function($holder) {
		var self = this;

		var longText = this.processButtonTitle(this.lang.viaSignInLong, $.pandalocker.lang.signin_linkedin_name);
		var shortText = this.processButtonTitle(this.lang.viaSignInShort, $.pandalocker.lang.signin_linkedin_name);

		this.longTitle = $("<span class='onp-sl-long'>" + longText + "</span>").appendTo($holder);
		this.shortTtle = $("<span class='onp-sl-short'>" + shortText + "</span>").appendTo($holder);

		self._unlockLoadingState();
	};

	button.connect = function(callback) {
		var self = this;

		if( $.pandalocker.data.linkedInOAuthReady ) {

			this._identify(function(identityData) {
				callback(identityData, self._getServiceData());
			});

		} else {

			// The fix for the issue #BIZ-41:
			// removes the proxy URL from the options because it fires the errors on some website

			var optionsToPass = $.extend(true, {}, self.options);
			delete optionsToPass['proxy'];

			var dataToSend = {
				'opandaHandler': 'linkedin',
				'opandaRequestType': 'init',
				'opandaLinkedinOptions': JSON.stringify(optionsToPass)
			};

			var url = self.options.proxy;

			for( var prop in dataToSend ) {
				if( !dataToSend.hasOwnProperty(prop) ) {
					continue;
				}
				url = $.pandalocker.tools.updateQueryStringParameter(url, prop, dataToSend[prop]);
			}

			self._trackWindow('opandaHandler=linkedin', function() {

				setTimeout(function() {
					if( $.pandalocker.data.linkedInOAuthReady ) {
						return;
					}

					self.runHook('raw-social-app-declined');
					self.showNotice($.pandalocker.lang.errors_not_signed_in);
				}, 500);
			});

			var apiLinkedInAuth = window.open(url,
				"LinkedIn Sign-In",
				"width=500,height=450,resizable=yes,scrollbars=yes,status=yes"
			);

			window.OPanda_LinkedInOAuthCompleted = function(accessToken) {

				$.pandalocker.data.linkedInOAuthReady = true;
				self._accessToken = accessToken;

				self.connect(callback);
			};

			window.OPanda_LinkedInOAuthDenied = function() {

				self.runHook('raw-social-app-declined');
				self.showNotice($.pandalocker.lang.errors_not_signed_in);
			};
		}
	};

	/**
	 * Puts together service data required for the future requests.
	 */
	button._getServiceData = function() {
		var self = this;
		return {accessToken: self._accessToken};
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
				'opandaHandler': 'linkedin',
				'opandaRequestType': 'user_info',
				'opandaAccessToken': self._accessToken
			},
			success: function(data) {

				if( ( !data || data.error || data.errors ) && console && console.log ) {
					console.log('Unable to get the user data: ' + req.responseText);
				}

				var identity = {};

				if( !data ) {
					return callback(identity);
				}

				identity.source = "linkedin";
				identity.email = data.emailAddress;
				identity.displayName = data.firstName + " " + data.lastName;
				identity.name = data.firstName;
				identity.family = data.lastName;
				identity.linkedinUrl = data.publicProfileUrl;
				identity.social = true;

				if( data.pictureUrls && data.pictureUrls.values ) {
					identity.image = data.pictureUrls.values[0];
				}

				callback(identity);
			},
			error: function() {
				console && console.log && console.log('Unable to get the user data: ' + req.responseText);
				callback({});
			}
		});
	};

	$.pandalocker.controls["connect-buttons"]["linkedin"] = button;

})(__$onp);
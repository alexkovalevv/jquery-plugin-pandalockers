/**
 * Vk connect
 * Copyright 2016, OnePress, http://byonepress.com
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
	button.name = "vk";

	/**
	 * The dafault options.
	 */
	button._defaults = {};

	/**
	 * Renders the button.
	 */
	button.prepareOptions = function($holder) {

		if( !this.options.proxy ) {
			this.showError($.pandalocker.lang.connectButtons.vk.proxyEmpty);
			return;
		}

		if( !this.options.appId ) {
			this.showError($.pandalocker.lang.connectButtons.vk.appIdMissed);
			return;
		}

		this.scope = "email";
	};

	button.setupEvents = function() {
		var self = this;

		VK.init(
			{
				apiId: this.options.appId
			}
		);
	};

	/**
	 * Renders the button.
	 */
	button.renderButton = function($holder) {
		var self = this;

		var longText = this.processButtonTitle(this.lang.viaSignInLong, $.pandalocker.lang.signin_vk_name);
		var shortText = this.processButtonTitle(this.lang.viaSignInShort, $.pandalocker.lang.signin_vk_name);

		this.longTitle = $("<span class='onp-sl-long'>" + longText + "</span>").appendTo($holder);
		this.shortTtle = $("<span class='onp-sl-short'>" + shortText + "</span>").appendTo($holder);

		self._unlockLoadingState();
	};

	/**
	 * Connects the user via Vk.
	 */
	button.connect = function(callback) {
		var self = this;

		if( $.pandalocker.data.VkOAuthReady ) {

			this._identify(
				function(identityData) {
					callback(identityData, self._getServiceData());
				}
			);

		} else {
			var width = 700;
			var height = 420;

			var x = screen.width ? (screen.width / 2 - width / 2 + $.pandalocker.tools.findLeftWindowBoundry()) : 0;
			var y = screen.height ? (screen.height / 2 - height / 2 + $.pandalocker.tools.findTopWindowBoundry()) : 0;

			var dataToSend = {
				opandaHandler: 'vk'
			};

			var url = self.options.proxy;
			for( var prop in dataToSend ) {
				if( !dataToSend.hasOwnProperty(prop) ) {
					continue;
				}
				url = $.pandalocker.tools.updateQueryStringParameter(url, prop, dataToSend[prop]);
			}

			self._trackWindow(
				'opandaHandler=vk', function() {

					setTimeout(
						function() {
							if( $.pandalocker.data.VkOAuthReady ) {
								return;
							}

							self.runHook('raw-social-app-declined');
							self.showNotice($.pandalocker.lang.errors_not_signed_in);
						}, 500
					);
				}
			);

			window.open(
				"//oauth.vk.com/authorize?client_id=" + self.options.appId + "&display=page&redirect_uri=" + url + "&scope=" + self.scope + "&response_type=code&v=5.50",
				"Vkontakte Sign-in",
				"width=" + width + ",height=" + height + ",left=" + x + ",top=" + y + ",resizable=yes,scrollbars=yes,status=yes"
			);

			window.OPanda_VkOAuthCompleted = function(d) {
				var requestData = JSON.parse(d);

				$.pandalocker.tools.setStorage('onp-sl-vk-buttons-oid', requestData['user_id'], 134);

				self._accessToken = requestData['access_token'];
				self._uid = requestData['uid'];
				self._email = requestData['email'] ? requestData['email'] : null;

				$.pandalocker.data.VkOAuthReady = true;

				self.connect(callback);
			};

			window.OPanda_VkOAuthDenied = function(d) {
				var requestData = JSON.parse(d);

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
		return {
			accessToken: self._accessToken,
			uid: self._uid,
			email: self._email
		};
	};

	/**
	 * Identify the user.
	 */
	button._identify = function(callback) {
		var self = this;

		VK.api(
			'users.get', {
				access_token: self._accessToken,
				fields: 'photo_200'
			}, function(data) {
				if( data.response ) {

					var identity = {};

					if( ( !data || data.error || data.errors ) && console && console.log ) {
						console.log('Unable to get the user data: ' + data.error.error_msg);
						callback(identity);
					}

					if( !data.response[0] ) {
						callback(identity);
					}

					identity.source = "vk";
					identity.email = self._email;
					identity.displayName = data.response[0].first_name + " " + data.response[0].last_name;
					identity.name = data.response[0].first_name;
					identity.family = data.response[0].last_name;
					identity.vkUrl = 'https://vk.com/id' + data.response[0].uid;
					identity.social = true;

					if( data.response[0] && data.response[0].photo_200 ) {
						identity.image = data.response[0].photo_200;
					}

					callback(identity);
				}
			}
		);
	};

	$.pandalocker.controls["connect-buttons"]["vk"] = button;

})(__$onp);
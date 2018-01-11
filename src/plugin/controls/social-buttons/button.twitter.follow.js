/**
 * Twitter Follow
 * Copyright 2014, OnePress, http://byonepress.com

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:50
 * @!uglify:true
 * @!lang:[]
 * @!build:['premium', 'full-premium']
 */

(function($) {
	'use strict';

	if( !$.pandalocker.data ) {
		$.pandalocker.data = {};
	}
	$.pandalocker.data.__followedUrl = null;
	$.pandalocker.data.__followWindow = null;

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButton);

	button.name = "twitter-follow";

	button.verification = {
		container: 'iframe',
		timeout: 600000
	};

	button._defaults = {

		// if true, checks wheither the user tweeted
		doubleCheck: false,

		// URL of the page to share.
		url: null,

		// The user's screen name shows up by default, but you can opt not to 
		// show the screen name in the button.

		hideScreenName: false,
		// Followers count display
		showCount: true,
		// The language for the Tweet Button
		lang: 'en',
		// The size of the rendered button (medium, large)
		size: 'medium'
	};

	button.prepareOptions = function() {

		if( !this.options.url || this.options.url.indexOf("twitter") === -1 ) {
			this.showError($.pandalocker.lang.errors.emptyTwitterFollowUrlError);
			return false;
		}

		this.url = this._extractUrl();

		if( "vertical" === this.groupOptions.layout ) {
			this.showError($.pandalocker.lang.errors.unsupportedTwitterFollowLayout);
		} else {
			if( !this.groupOptions.counters ) {
				this.options.showCount = false;
			}
		}

		if( this.groupOptions.lang ) {
			var langParts = this.groupOptions.lang.split('_');
			this.options.lang = langParts[0];
		}

		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.twitterFollow;
	};

	button.setupEvents = function() {
		var self = this;

		$(document).bind('onp-sl-twitter-follow', function(e, url) {
			if( self.url !== $.pandalocker.data.__followedUrl ) {
				return;
			}

			if( $.pandalocker.data.__followWindow && $.pandalocker.data.__followWindow.close ) {
				$.pandalocker.data.__followWindow.close();
			}
			$.pandalocker.data.__followWindow = null;

			self.unlock("button", self.name, self.url);
		});
	};

	button.renderButton = function($holder) {
		var self = this;

		this.button = $('<a href="https://twitter.com/share" class="twitter-follow-button">Follow</a>').appendTo($holder);
		this.button.attr('href', this.url);

		this.button.attr("data-show-count", this.options.showCount);
		if( this.options.showCount ) {
			this.button.attr("data-show-count", this.options.showCount);
		}
		if( this.options.lang ) {
			this.button.attr("data-lang", this.options.lang);
		}
		if( this.options.alignment ) {
			this.button.attr("data-alignment", this.options.alignment);
		}
		if( this.options.size ) {
			this.button.attr("data-size", this.options.size);
		}
		if( this.options.dnt ) {
			this.button.attr("data-dnt", this.options.dnt);
		}
		if( this.options.hideScreenName ) {
			this.button.attr("data-show-screen-name", false);
		}

		var overlay = $("<div class='onp-sl-feature-overlay'></div>").appendTo($holder);

		overlay.click(function() {

			var result = self.follow(self.options.doubleCheck);
			result.done(function() {
				$(document).trigger('onp-sl-twitter-follow', [self.url]);
			});

			return false;
		});

		// our original markup will be fully replaced with the iframe created 
		// by Twitter, so we cannot to bind the data required to verify
		// tweeting on the button, we need to bind this data on the parent element

		$holder.data('url-to-verify', self.url);

		var attemptCounter = 5;

		// Chrome fix
		// If there is SDK script on the same page that is loading now when a tweet button will not appear.
		// Setup special timeout function what will check 5 times when we can render the twitter button.
		var timoutFunction = function() {
			if( $holder.find('iframe').length > 0 ) {
				return;
			}

			if( window.twttr.widgets && window.twttr.widgets.load ) {
				window.twttr.widgets.load($holder[0]);
			} else {
				if( attemptCounter <= 0 ) {
					return;
				}
				attemptCounter--;

				setTimeout(function() {
					timoutFunction();
				}, 1000);
			}
		};

		timoutFunction();
	};

	button.follow = function(doubleCheck) {

		var self = this;
		var def = $.Deferred();

		// follow through oauth

		if( doubleCheck ) {

			this.connect(function(data) {

				var followResult = self.follow(false);

				followResult.done(function() {
					var checkResult = self.checkFollower(self.url);

					checkResult.done(function() {
						def.resolve();
					});

					checkResult.fail(function() {
						self.showNotice($.pandalocker.lang.errors.followingNotFound);
					});
				});
			});

			return def;
		}

		// follow through popup

		var args = {};
		$.pandalocker.data.__followedUrl = self.url;

		var parts = self.url.split('/');
		self.screenName = parts[parts.length - 1];

		args.screen_name = self.screenName;

		var intentUrl = new $.pandalocker.tools.uri()
			.scheme('http')
			.host('twitter.com')
			.path('/intent/follow')
			.query(args)
			.toString();

		var width = 550;
		var height = 530;

		var x = screen.width ? (screen.width / 2 - width / 2 + $.pandalocker.tools.findLeftWindowBoundry()) : 0;
		var y = screen.height ? (screen.height / 2 - height / 2 + $.pandalocker.tools.findTopWindowBoundry()) : 0;

		if( $.pandalocker.data.__twitterAuth && $.pandalocker.data.__twitterAuth.closed === false ) {
			$.pandalocker.data.__twitterAuth.updateState(intentUrl, width, height, x, y);

			$.pandalocker.data.__followWindow = $.pandalocker.data.__twitterAuth;
			$.pandalocker.data.__twitterAuth = null;

		} else {
			$.pandalocker.data.__followWindow = window.open(intentUrl, "TwitterFollowWindow", "width=" + width + ",height=" + height + ",left=" + x + ",top=" + y);
		}

		setTimeout(function() {

			var pollTimer = setInterval(function() {
				if( !$.pandalocker.data.__followWindow || $.pandalocker.data.__followWindow.closed !== false ) {
					clearInterval(pollTimer);
					def.resolve();
				}
			}, 200);
		}, 200);

		return def.promise();
	};

	/**
	 * Connects the user via Faceboook.
	 */
	button.connect = function(callback) {
		var self = this;

		if( $.pandalocker.data.twitterOAuthReady ) {

			if( $.pandalocker.data.__twitterAuthIdentityData ) {
				callback($.pandalocker.data.__twitterAuthIdentityData, self._getServiceData());
			} else {

				this._identify(function(identityData) {
					callback(identityData, self._getServiceData());
				});
			}

		} else {

			// The fix for the issue #BIZ-41:
			// removes the proxy URL from the options because it fires the errors on some website

			var dataToSend = {
				'opandaHandler': 'twitter',
				'opandaRequestType': 'init',
				'opandaKeepOpen': true,
				'opandaReadOnly': true
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

			var width = 500;
			var height = 610;

			var x = screen.width ? (screen.width / 2 - width / 2 + $.pandalocker.tools.findLeftWindowBoundry()) : 0;
			var y = screen.height ? (screen.height / 2 - height / 2 + $.pandalocker.tools.findTopWindowBoundry()) : 0;

			$.pandalocker.data.__twitterAuth = window.open(url,
				"Twitter Follow",
				"width=" + width + ",height=" + height + ",left=" + x + ",top=" + y + ",resizable=yes,scrollbars=yes,status=yes"
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
		$.pandalocker.data.__twitterVisitorId = visitorId;
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
		return {visitorId: $.pandalocker.data.__twitterVisitorId};
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
				'opandaVisitorId': $.pandalocker.data.__twitterVisitorId,
				'opandaReadOnly': true
			},
			success: function(data) {

				console.log(data);

				if( ( !data || data.error || data.errors ) && console && console.log ) {
					console.log('Unable to get the user data: ' + req.responseText);
				}

				var identity = {};
				identity.displayName = data.screen_name;
				identity.twitterUrl = 'https://twitter.com/' + data.screen_name;

				if( data.profile_image_url ) {
					identity.image = data.profile_image_url.replace('_normal', '');
				}

				$.pandalocker.data.__twitterAuthIdentityData = identity;
				callback(identity);
			},
			error: function() {
				console && console.log && console.log('Unable to get the user data: ' + req.responseText);
				callback({});
			}
		});
	};

	button.checkFollower = function() {

		var self = this;
		var def = $.Deferred();

		var req = $.ajax({
			type: "POST",
			dataType: "json",
			url: self.options.proxy,
			data: {
				'opandaHandler': 'twitter',
				'opandaRequestType': 'get_followers',
				'opandaSceenName': self.screenName,
				'opandaVisitorId': $.pandalocker.data.__twitterVisitorId,
				'opandaReadOnly': true
			},
			success: function(data) {

				if( ( !data || data.error || data.errors ) && console && console.log ) {
					console.log('Unable to get the user data: ' + req.responseText);
				}
				if( data[0] ) {
					for( var i = 0; i < data[0].connections.length; i++ ) {

						if( data[0].connections[i] === 'following' ) {
							def.resolve();
							return;
						}
					}
				}

				def.reject();
			},
			error: function() {
				console && console.log && console.log('Unable to get the user data: ' + req.responseText);
				callback({});
			}
		});

		return def.promise();
	};

	$.pandalocker.controls["social-buttons"]["twitter-follow"] = button;

})(__$onp);
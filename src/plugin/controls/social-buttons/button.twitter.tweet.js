/**
 * Twitter Tweet
 * Copyright 2017, OnePress, http://byonepress.com

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:50
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */
(function($) {
	'use strict';

	if( !$.pandalocker.data ) {
		$.pandalocker.data = {};
	}

	$.pandalocker.data.__tweetedUrl = null;
	$.pandalocker.data.__tweetWindow = null;

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButton);

	button.name = "twitter-tweet";

	button.verification = {
		container: 'iframe',
		timeout: 5000
	};

	button._defaults = {

		// if true, checks wheither the user tweeted
		doubleCheck: false,

		// URL of the page to share.
		url: null,

		// Default Tweet text
		text: null,
		// Screen name of the user to attribute the Tweet to
		via: null,
		// Related accounts
		related: null,
		// Count box position (none, horizontal, vertical)
		count: 'horizontal',
		// The language for the Tweet Button
		lang: 'en',
		// URL to which your shared URL resolves
		counturl: null,
		// The size of the rendered button (medium, large)
		size: 'medium'
	};

	button.prepareOptions = function() {

		if( !this.options.url && !this.networkOptions.url && $("link[rel='canonical']").length > 0 ) {
			this.options.url = $("link[rel='canonical']").attr('href');
		}

		this.url = this._extractUrl();
		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.twitterTweet;

		if( "vertical" === this.groupOptions.layout ) {
			this.showError($.pandalocker.lang.errors.unsupportedTwitterTweetLayout);
		} else {
			if( !this.groupOptions.counters ) {
				this.options.count = 'none';
			}
		}

		if( this.groupOptions.lang ) {
			var langParts = this.groupOptions.lang.split('_');
			this.options.lang = langParts[0];
		}

		if( !this.options.text ) {
			var $title = $("title");

			if( $title.length > 0 ) {
				this.options.text = $($title[0]).text();
			} else {
				this.options.text = "";
			}
		}
	};

	button.setupEvents = function() {
		var self = this;

		$(document).bind('onp-sl-twitter-tweet', function() {
			if( self.url !== $.pandalocker.data.__tweetedUrl ) {
				return;
			}

			if( $.pandalocker.data.__tweetWindow && $.pandalocker.data.__tweetWindow.close ) {
				$.pandalocker.data.__tweetWindow.close();
			}
			$.pandalocker.data.__tweetWindow = null;

			self.unlock("button", self.name, self.url);
		});
	};

	button.renderButton = function($holder) {
		var self = this;

		this.button = $('<a href="https://twitter.com/share" class="twitter-share-button">Tweet</a>').appendTo($holder);
		this.button.attr("data-url", this.url);

		this.button.attr("data-show-count", this.options.showCount);
		if( this.options.via ) {
			this.button.attr("data-via", this.options.via);
		}
		if( this.options.text ) {
			this.button.attr("data-text", this.options.text);
		}
		if( this.options.lang ) {
			this.button.attr("data-lang", this.options.lang);
		}
		if( this.options.hashtags ) {
			this.button.attr("data-hashtags", this.options.hashtags);
		}
		if( this.options.size ) {
			this.button.attr("data-size", this.options.size);
		}
		if( this.options.dnt ) {
			this.button.attr("data-dnt", this.options.dnt);
		}

		var overlay = $("<div class='onp-sl-feature-overlay'></div>").appendTo($holder);

		overlay.click(function() {
			var result = self.tweet(self.options.doubleCheck);
			result.done(function() {
				$(document).trigger('onp-sl-twitter-tweet', [self.url]);
			});
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

	button.tweet = function(doubleCheck) {

		var self = this;
		var def = $.Deferred();

		// tweet through oauth

		if( doubleCheck ) {

			this.connect(function(data) {

				var tweetResult = self.tweet(false);

				tweetResult.done(function() {
					var checkResult = self.checkTweet(self.url);

					checkResult.done(function() {
						def.resolve();
					});

					checkResult.fail(function() {
						self.showNotice($.pandalocker.lang.errors.tweetNotFound);
					});
				});
			});

			return def;
		}

		// tweet through popup

		var args = {};

		if( self.options.text ) {
			var safeText = encodeURI(self.options.text);
			safeText = safeText.replace(/#/g, '%23');
			safeText = safeText.replace(/\|/g, "-");
			safeText = safeText.replace(/\&/g, "%26");
			args.text = self.options.text;
		}

		if( self.options.hashtags ) {
			args.hashtags = self.options.hashtags;
		}
		if( self.options.via ) {
			args.via = self.options.via;
		}
		if( self.options.related ) {
			args.via = self.options.related;
		}

		args.url = self.url;

		$.pandalocker.data.__tweetedUrl = self.url;

		var intentUrl = new $.pandalocker.tools.uri()

			.scheme('http')
			.host('twitter.com')
			.path('/intent/tweet')
			.query(args)
			.toString();

		var width = 550;
		var height = 420;

		var x = screen.width ? (screen.width / 2 - width / 2 + $.pandalocker.tools.findLeftWindowBoundry()) : 0;
		var y = screen.height ? (screen.height / 2 - height / 2 + $.pandalocker.tools.findTopWindowBoundry()) : 0;

		if( $.pandalocker.data.__twitterAuth && $.pandalocker.data.__twitterAuth.closed === false ) {
			$.pandalocker.data.__twitterAuth.updateState(intentUrl, width, height, x, y);

			$.pandalocker.data.__tweetWindow = $.pandalocker.data.__twitterAuth;
			$.pandalocker.data.__twitterAuth = null;

		} else {
			$.pandalocker.data.__tweetWindow = window.open(intentUrl, "TwitterTweetWindow", "width=" + width + ",height=" + height + ",left=" + x + ",top=" + y);
		}

		setTimeout(function() {

			var pollTimer = setInterval(function() {
				if( !$.pandalocker.data.__tweetWindow || $.pandalocker.data.__tweetWindow.closed !== false ) {
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
				"Twitter Tweet",
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

	button.checkTweet = function() {

		var self = this;
		var def = $.Deferred();

		var req = $.ajax({
			type: "POST",
			dataType: "json",
			url: self.options.proxy,
			data: {
				'opandaHandler': 'twitter',
				'opandaRequestType': 'get_tweets',
				'opandaVisitorId': $.pandalocker.data.__twitterVisitorId,
				'opandaReadOnly': true
			},
			success: function(data) {

				if( ( !data || data.error || data.errors ) && console && console.log ) {
					console.log('Unable to get the user data: ' + req.responseText);
				}

				for( var i = 0; i < data.length; i++ ) {
					if( !data[i].entities ) {
						continue;
					}

					for( var n = 0; n < data[i].entities.urls.length; n++ ) {
						if( !data[i].entities.urls[n] ) {
							continue;
						}

						var compareUrl = self.urlPrepare(data[i].entities.urls[n].expanded_url);
						var url = self.urlPrepare(self.url);

						if( compareUrl === url ) {
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

	$.pandalocker.controls["social-buttons"]["twitter-tweet"] = button;

})(__$onp);

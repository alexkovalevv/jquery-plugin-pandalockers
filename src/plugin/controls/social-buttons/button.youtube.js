/**
 * Youtube Subscribe
 * Copyright 2013, OnePress, http://byonepress.com

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:50
 * @!uglify:true
 * @!lang:['en']
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButton);

	button.name = "youtube-subscribe";
	button.sdk = 'google-client';

	button._defaults = {
		clientId: null,
		channelId: null,
		layout: 'default',
		count: 'default'
	};

	/**
	 * The funtions which returns an URL to like/share for the button.
	 * Uses the options and a current location to determine the URL.
	 */
	button._extractUrl = function() {
		return this.options.channelId;
	};

	button.prepareOptions = function() {
		var self = this;
		this.url = this._extractUrl();

		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.youtubeSubscribe;

		if( !this.options.channelId ) {
			this.showError($.pandalocker.lang.errors.emptyYoutubeChannelId);
		}

		if( !this.options.clientId ) {
			this.showError($.pandalocker.lang.errors.emptyGoogleClientId);
		}

		if( "vertical" === this.groupOptions.layout ) {
			this.showError($.pandalocker.lang.errors.unsupportedYoutubeSubscribeLayout);
		} else {
			if( !this.groupOptions.counters ) {
				this.options.count = 'hidden';
			}
		}
	};

	button.setupEvents = function() {
		var self = this;

		$(document).bind('onp-sl-youtube-subscribe', function(e, url) {
			self.unlock("button", self.name, self.url);
		});
	};

	/**
	 * Renders the button.
	 */
	button.renderButton = function($holder) {
		var self = this;

		this.button = $("<div></div>").appendTo($holder);

		this.button.attr("data-channelid", this.options.channelId);
		this.button.attr("data-layout", this.options.layout);
		this.button.attr("data-count", this.options.count);

		this.button.addClass('g-ytsubscribe');

		setTimeout(function() {
			window.gapi.ytsubscribe.go($holder[0]);
		}, 100);

		var overlay = $("<div class='onp-sl-youtube-subscribe-overlay'></div>").appendTo($holder);

		overlay.click(function() {

			self.authorize(false, function(response) {
				if( 'immediate_failed' === response.error ) {
					return;
				}

				if( !response || !response['status']['signed_in'] ) {
					self.showNotice($.pandalocker.lang.errors_not_signed_in);
					return;
				}

				self.subscribe();
			});

			return false;
		});
	};

	button.authorize = function(immediate, callback) {
		var self = this;
		var requestOptions = {};

		requestOptions.client_id = self.options.clientId;
		requestOptions.immediate = immediate;
		requestOptions.scope = "https://www.googleapis.com/auth/youtube";

		gapi.auth.authorize(requestOptions, callback);
	};

	button.subscribe = function() {
		var self = this;

		gapi.client.load('youtube', 'v3', function() {

			var request = gapi.client.youtube.subscriptions.insert({
				part: 'snippet',
				resource: {
					snippet: {
						resourceId: {
							kind: 'youtube#channel',
							channelId: self.options.channelId
						}
					}
				}
			});

			request.execute(function(response) {

				if( response.error && 'subscriptionDuplicate' != response.error.data[0].reason ) {
					return self.showNotice(response.error.data[0].message);
				}

				$(document).trigger('onp-sl-youtube-subscribe');
			});
		});
	}

	$.pandalocker.controls["social-buttons"]["youtube-subscribe"] = button;

})(__$onp);

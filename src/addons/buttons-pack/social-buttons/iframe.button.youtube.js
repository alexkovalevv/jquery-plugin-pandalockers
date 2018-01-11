/**
 * Youtube Subscribe
 * Copyright 2017, Alex Kovalevv <alex.kovalevv@gmail.com>, http://sociallocker.ru

 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:10
 * @!lang:['rus']
 * @!build:['premium']
 */

(function($) {
	'use strict';

	if( !$.pandalocker || !$.pandalocker.sdk || !$.pandalocker.controls || !$.pandalocker.entity ) {
		throw new Error('[Ошибка]: Не подключен основной плагин.');
	}

	if( !$.pandalocker.data ) {
		$.pandalocker.data = {};
	}

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButtonsPack);

	button.name = "google-youtube";
	button.sdk = 'onp';
	button.verification.container = '.onp-button-loaded';

	button._defaults = {
		channelId: null,
		layout: 'default'
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

		if( !this.options.channelId ) {
			return this.showError($.pandalocker.lang.connectButtons.errorYouTubeChannelMissed);
		}

		this.options.counter = "vertical" === this.groupOptions.layout ? true : this.groupOptions.counters;
		this.layout = this.groupOptions.layout;
		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.youtubeSubscribe;
	};

	button.setupEvents = function() {
	};

	button._extendCallback = function(data) {
		var self = this;

		if( data.event === 'subscribe' ) {
			if( this.options.channelId !== data.channelId ) {
				return;
			}

			this.unlock("button", this.name, this.options.channelId);
		}
	};

	button.renderButton = function($holder) {
		var self = this;

		this.button = $("<div></div>").appendTo($holder);
		this.widgetId = "onp-g-share-widget-id" + Math.floor((Math.random() * 999999) + 1);
		this.button.attr('id', this.widgetId);
		$holder.addClass('onp-sl-iframe-button');

		if( !window.ONPWGT ) {
			return;
		}

		window.ONPWGT.init(this.widgetId, 'google-youtube', {
			channelId: this.options.channelId,
			counter: this.options.counter,
			layout: this.groupOptions.layout
		}, function(data) {
			self._callback(data);
		});
	};

	$.pandalocker.controls["social-buttons"]["google-youtube"] = button;
})(__$onp);
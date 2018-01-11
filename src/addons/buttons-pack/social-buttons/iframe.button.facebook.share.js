/**
 * Facebook Share Button
 * Copyright 2017, Alex Kovalevv <alex.kovalevv@gmail.com>, http://sociallocker.ru

 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:10
 * @!lang:['rus']
 * @!build:['free','premium']
 */

(function($) {
	'use strict';

	if( !$.pandalocker || !$.pandalocker.sdk || !$.pandalocker.controls || !$.pandalocker.entity ) {
		throw new Error('[Ошибка]: Не подключен основной плагин.');
	}

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButtonsPack);

	button.name = "facebook-share";

	button.sdk = 'onp';
	button.verification.container = '.onp-button-loaded';

	button._defaults = {

		// URL to share
		url: null,

		// button_count, button, box_count
		layout: 'button_count',

		// set to 'none' to hide the count box
		count: 'standard',

		// Language of the button labels. By default en_US.
		lang: 'en_US',

		// Button container width in px, by default 450.
		width: null,

		// if set, then use the Share Dialog
		shareDialog: false,

		// data to share
		name: null,
		caption: null,
		description: null,
		image: null
	};

	button.prepareOptions = function() {
		this.url = this._extractUrl();
		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.facebookShare;
		this.options.counter = "vertical" === this.groupOptions.layout ? true : this.groupOptions.counters;
	};

	button.setupEvents = function() {
	};

	button._extendCallback = function(data) {
		var self = this;

		if( data.event === 'loaded' ) {
			this.button.addClass('onp-button-loaded');
		}

		if( data.event === 'notshared' ) {
			this.showScreen('default');
			this.showNotice($.pandalocker.lang.alerts.social_share_aborted);
		}

		if( data.event === 'click' || data.event === 'processing' ) {
			this.showScreen('data-processing');
		}

		if( data.event === 'error' ) {

			if( data.message ) {
				this.showNotice(data.message);
			} else if( data.code ) {
				var message = $.pandalocker.lang.errors[data.code];
				this.showNotice(message);
			}

			this.showScreen('default');
		}

		if( data.event === 'shared' ) {
			var uri = new $.pandalocker.tools.uri(data.url);
			if( this.url !== uri.normalize().toString() ) {
				return;
			}

			this.unlock("button", this.name, this.url, data.other_info);
		}
	};

	button.renderButton = function($holder) {

		var self = this;

		this.button = $("<div></div>").appendTo($holder);
		this.widgetId = "onp-fb-share-widget-id" + Math.floor((Math.random() * 999999) + 1);
		this.button.attr('id', this.widgetId);
		$holder.addClass('onp-sl-iframe-button');

		if( !window.ONPWGT ) {
			return;
		}

		window.ONPWGT.init(this.widgetId, 'facebook-share', {
			url: this.url,
			ref: this.options.ref,
			counter: this.options.counter,
			layout: this.groupOptions.layout,
			lang: this.groupOptions.lang,
			title: this.options.name,
			caption: this.options.caption,
			description: this.options.description,
			image: this.options.image
		}, function(data) {
			self._callback(data);
		});

	};

	$.pandalocker.controls["social-buttons"]["facebook-share"] = button;

})(__$onp);
/**
 * Vkontakte like
 * Copyright 2017, Alex Kovalevv <alex.kovalevv@gmail.com>, http://sociallocker.ru
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:10
 * @!lang:[]
 * @!build:['free','premium']
 */

(function($) {
	'use strict';

	if( !$.pandalocker || !$.pandalocker.sdk || !$.pandalocker.controls || !$.pandalocker.entity ) {
		throw new Error('[Ошибка]: Не подключен основной плагин.');
	}

	if( !$.pandalocker.vk_like ) {
		$.pandalocker.vk_like = {};
	}

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButtonsPack);

	button.name = "vk-like";
	button.sdk = 'onp';
	button.verification.container = '.onp-button-loaded';

	button._defaults = {
		type: 'mini',
		pageTitle: null,
		pageDescription: null,
		pageUrl: null,
		pageImage: null,
		pageId: null,
		verb: 0,
		requireSharing: 1
	};

	/**
	 * The funtions which returns an URL to like/share for the button.
	 * Uses the options and a current location to determine the URL.
	 */
	button._extractUrl = function() {
		var URL = this.options.pageUrl || this.networkOptions.url || window.location.href;
		return this.urlPrepare(URL);
	};

	button.urlPrepare = function(URL) {
		var uri = new $.pandalocker.tools.uri(URL);
		return uri.normalize().toString();
	};

	button.prepareOptions = function() {
		this.url = this._extractUrl();

		if( "vertical" === this.groupOptions.layout ) {
			this.options.type = "vertical";
		}

		this.options.counter = "vertical" === this.groupOptions.layout ? true : this.groupOptions.counters;
		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.vkLike;
	};

	button.setupEvents = function() {
		var self = this;
	};

	button._extendCallback = function(data) {
		var otherInfo = data.userInfo;

		if( !this.options.requireSharing ) {
			if( data.event === 'liked' ) {
				if( this.url !== this.urlPrepare(data.url) ) {
					return;
				}

				this.unlock("button", this.name, this.url);
			}
		}

		if( data.event === 'shared' ) {
			if( this.url !== this.urlPrepare(data.url) ) {
				return;
			}

			this.unlock("button", this.name, this.url);
		}

		if( data.event === 'unliked' ) {
			this.showNotice($.pandalocker.lang.alerts.social_unshare);
		}
	};

	button.renderButton = function($holder) {
		var self = this;

		this.button = $('<div></div>').appendTo($holder);

		this.widgetId = "onp-vk-like-widget-" + Math.floor((Math.random() * 999999) + 1);
		this.button.attr('id', this.widgetId);
		$holder.addClass('onp-sl-iframe-button');

		if( !window.ONPWGT ) {
			return;
		}

		window.ONPWGT.init(this.widgetId, 'vk-like', {
			type: this.options.type,
			pageTitle: this.options.pageTitle,
			pageDescription: this.options.pageDescription,
			pageUrl: this.url,
			pageImage: this.options.pageImage,
			pageId: this.options.pageId,
			counter: this.options.counter,
			verb: this.options.verb
		}, function(data) {
			self._callback(data);
		});

	};

	$.pandalocker.controls["social-buttons"]["vk-like"] = button;
})(__$onp);
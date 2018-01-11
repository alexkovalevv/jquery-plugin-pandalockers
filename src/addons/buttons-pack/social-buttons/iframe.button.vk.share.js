/**
 * Vkontakte share button
 * Copyright 2017, Alex Kovalevv <alex.kovalevv@gmail.com>, http://sociallocker.ru

 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:10
 * @!lang:[]
 * @!build:['premium']
 */

(function($) {
	'use strict';

	if( !$.pandalocker || !$.pandalocker.sdk || !$.pandalocker.controls || !$.pandalocker.entity ) {
		throw new Error('[Ошибка]: Не подключен основной плагин.');
	}

	if( !$.pandalocker.vk_share ) {
		$.pandalocker.vk_share = {};
	}

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButtonsPack);

	button.name = "vk-share";
	button.sdk = 'onp';
	button.verification.container = '.onp-button-loaded';

	button._defaults = {
		pageUrl: null,
		pageTitle: null,
		pageDescription: null,
		pageImage: null,
		counter: 1
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
		this.alternateURL = this.url;
		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.vkShare;

		this.options.counter = "vertical" === this.groupOptions.layout ? true : this.groupOptions.counters;
		this.layout = this.groupOptions.layout;

		if( $.pandalocker.tools.cdmt(this.url) == 'punycode' ) {
			this.options.counter = "vertical" === this.groupOptions.layout ? true : false;
		}
	};

	button.setupEvents = function() {
		var self = this;
	};

	button._extendCallback = function(data) {
		var self = this;

		if( data.event === 'shared' || data.event === 'waiting_shared' ) {
			var getWallLink = this.urlPrepare(data.url);
			var comparisonUrl = self.url;

			if( getWallLink !== comparisonUrl ) {
				if( data.event != 'waiting_shared' ) {
					this.showScreen('default');
					this.showNotice($.pandalocker.lang.alerts.social_share_aborted);
				}
				return;
			}

			this.unlock("button", this.name, this.url);
		}

		if( data.event === 'notshared' || data.event === 'error' ) {
			this.showScreen('default');
			this.showNotice($.pandalocker.lang.alerts.social_share_aborted);

			if( data.event === 'error' ) {
				var $holder = self.button.parent();
				$holder.html('');
				self.renderButton($holder);
			}
		}
	};

	/***
	 * Создает кнопку, счетчик и контейнеры
	 * @param $holder
	 */
	button.renderButton = function($holder) {
		var self = this;

		this.button = $('<div></div>').appendTo($holder);

		this.widgetId = "onp-vk-share-widget-" + Math.floor((Math.random() * 999999) + 1);
		this.button.attr('id', this.widgetId);
		$holder.addClass('onp-sl-iframe-button');

		if( !window.ONPWGT ) {
			return;
		}

		var pageImage;
		if( this.options.pageImage ) {
			pageImage = this.urlPrepare(this.options.pageImage);
		}

		window.ONPWGT.init(this.widgetId, 'vk-share', {
			lang: this.groupOptions.lang,
			pageTitle: this.options.pageTitle,
			pageDescription: this.options.pageDescription,
			pageUrl: this.url,
			alternateURL: this.alternateURL,
			pageImage: pageImage,
			layout: this.layout,
			counter: this.options.counter,
			clickja: this.options.clickja,
			lockerId: this.locker.id,
			refPageUrl: window.location.href || $(location).attr('href')
		}, function(data) {
			self._callback(data);
		});
	};

	$.pandalocker.controls["social-buttons"]["vk-share"] = button;

})(__$onp);
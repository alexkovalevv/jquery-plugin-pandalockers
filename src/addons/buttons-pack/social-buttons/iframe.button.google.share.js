/**
 * Google share button
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

	if( !$.pandalocker.google_share ) {
		$.pandalocker.google_share = {};
	}

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButtonsPack);

	button.name = "google-share";
	button.sdk = 'onp';
	button.verification.container = '.onp-button-loaded';

	button._defaults = {
		pageUrl: null,
		prefilltext: null
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
		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.googleShare;

		if( "vertical" === this.groupOptions.layout ) {
			this.showError($.pandalocker.lang.errors.unsupportedLayout.replace('{button}', 'vk-notify'));
		}
	};

	button.setupEvents = function() {
		var self = this;
	};

	button._extendCallback = function(data) {
		var self = this;

		if( data.event === 'google-share-box' ) {

			/*if( this.button.closest('.onp-sl-control').hasClass('onp-sl-flip') ) {
			 if( data.status === 'started' ) {
			 this.button.closest('.onp-sl-control-inner-wrap').addClass('onp-sl-notransition');
			 } else {
			 this.button.closest('.onp-sl-control-inner-wrap').removeClass('onp-sl-notransition');
			 }
			 }*/

			if( data.status === 'started' ) {
				this.button.find('iframe').css({
					position: "fixed",
					width: window.innerWidth + "px",
					height: window.innerHeight + "px"
				});
				this.button.children().css({
					overflow: "visible",
					zIndex: "99"
				});

				$('body').addClass('onp-sl-notransition');
				this.button.closest('.onp-sl-control').add('.onp-sl-overlap-mode').addClass('onp-sl-zindex-9999999');
			} else {
				this.button.find('iframe').css({
					position: "static",
					width: this.button.children().css('width'),
					height: this.button.children().css('height')
				});
				this.button.children().css({
					overflow: "hidden",
					zIndex: "10"
				});
				$('body').removeClass('onp-sl-notransition');
				this.button.closest('.onp-sl-control').add('.onp-sl-overlap-mode').removeClass('onp-sl-zindex-9999999');
			}

		}

		if( data.event === 'shared' ) {
			var getUrl = this.urlPrepare(data.url);
			var comparisonUrl = self.url;

			if( getUrl !== comparisonUrl ) {
				this.showScreen('default');
				this.showNotice($.pandalocker.lang.alerts.social_share_aborted);
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

		this.widgetId = "onp-google-share-widget-" + Math.floor((Math.random() * 999999) + 1);
		this.button.attr('id', this.widgetId);
		$holder.addClass('onp-sl-iframe-button');

		if( !window.ONPWGT ) {
			return;
		}

		window.ONPWGT.init(this.widgetId, 'google-share', {
			lang: this.groupOptions.lang,
			pageUrl: this.url,
			prefilltext: this.options.prefilltext,
			lockerId: this.locker.id,
			refPageUrl: window.location.href || $(location).attr('href')
		}, function(data) {
			self._callback(data);
		});
	};

	$.pandalocker.controls["social-buttons"]["google-share"] = button;

})(__$onp);
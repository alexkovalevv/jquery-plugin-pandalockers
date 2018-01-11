/**
 * Mail share button
 * Copyright 2017, Alex Kovalevv <alex.kovalevv@gmail.com>, http://sociallocker.ru

 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:10
 * @!lang:[]
 * @!build:['free','premium']
 */


(function($) {
	'use strict';

	if( !$.pandalocker.data ) {
		$.pandalocker.data = {};
	}

	$.pandalocker.data.__mailShareUrl = null;

	if( !$.pandalocker || !$.pandalocker.sdk || !$.pandalocker.controls || !$.pandalocker.entity ) {
		throw new Error('[Ошибка]: Не подключен основной плагин.');
	}

	if( !$.pandalocker.mail_share ) {
		$.pandalocker.mail_share = {};
	}

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButton);

	button.name = "mail-share";
	button.sdk = 'mail';
	button.buttonCounterBuffer = 0;
	button.taskcheckShared = 0;
	button.useButtonFrameId = null;

	button._defaults = {
		pageUrl: null,
		pageTitle: null,
		pageDescription: null,
		pageImage: null,
		counter: true,
		clickja: true
	};

	/**
	 * The funtions which returns an URL to like/share for the button.
	 * Uses the options and a current location to determine the URL.
	 */
	button._extractUrl = function() {
		var uri = new $.pandalocker.tools.uri(this.options.pageUrl || this.networkOptions.url || window.location.href);
		return uri.normalize().toString();
	};

	button.prepareOptions = function() {
		//Отключаем кликджекинг для яндекс браузера
		if( $.pandalocker.browser && $.pandalocker.browser.YaBrowser ) {
			this.options.clickja = false;
		}

		this.url = this._extractUrl();
		this.options.counter = "vertical" === this.groupOptions.layout ? true : this.groupOptions.counters;
		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.mailShare;
	};

	button.verification = {
		container: 'iframe',
		timeout: 5000
	};

	button.setupEvents = function() {
		var self = this;

		$(document).bind('onp-sl-mail-share', function() {
			if( self.url !== $.pandalocker.data.__mailShareUrl ) {
				return;
			}
			self.unlock("button", self.name, self.url);
		});

		$(document).bind('onp-sl-mail-unlike', function() {
			if( self.url !== $.pandalocker.data.__mailShareUrl ) {
				return;
			}

			self.showNotice($.pandalocker.lang.alerts.social_unshare);
		});
	};

	button.renderButton = function($holder) {
		var self = this;

		/*var shareUrl = $.pandalocker.tools.uri('//connect.mail.ru/share').addQuery({
		 url: self.url,
		 image_url: self.options.pageImage
		 }).normalize().toString() + (self.options.pageTitle
		 ? '&title=' + encodeURI(self.options.pageTitle)
		 : '') + (self.options.pageDescription
		 ? '&description=' + encodeURI(self.options.pageDescription)
		 : ''
		 );*/

		var shareUrl = '//connect.mail.ru/share?url=' + self.url +
			(self.options.pageTitle ? '&amp;title=' + encodeURIComponent(self.options.pageTitle) : '') +
			(self.options.pageDescription
				? '&amp;description=' + encodeURIComponent(self.options.pageDescription)
				: ''
			) +
			(self.options.pageImage
				? '&amp;image_url=' + $.pandalocker.tools.uri(self.options.pageImage).normalize().toString()
				: ''
			);

		var defaultButtonData = {
			cm: '1',
			sz: '20',
			st: '2',
			tp: 'mm'
		};

		if( !this.options.counter ) {
			defaultButtonData.nc = 1;
		}

		if( "vertical" === this.groupOptions.layout ) {
			defaultButtonData.vt = 1;
		}

		self.button = $('<div><a target="_blank" class="mrc__plugin_uber_like_button" href="' + shareUrl + '">Нравится</a></div>').appendTo($holder);
		self.button.data('url', self.url);
		self.button.find('a').attr('data-mrc-config', JSON.stringify(defaultButtonData));

		mailru && mailru.loader && mailru.loader.require('api', function() {
			mailru.plugin.init();
		});

		self.button.hover(function() {
			$.pandalocker.data.__mailShareUrl = $(this).data('url')
		});

		try {

		}
		catch( e ) {
			console.log(e);
		}
	};

	$.pandalocker.controls["social-buttons"]["mail-share"] = button;

})(__$onp);
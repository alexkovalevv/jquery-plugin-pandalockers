/**
 * Instagram button
 * Copyright 2016, OnePress, http://byonepress.com
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:10
 * @!lang:[]
 * @!build:[]
 */
(function($) {
	'use strict';

	if( !$.pandalocker || !$.pandalocker.sdk || !$.pandalocker.controls || !$.pandalocker.entity ) {
		throw new Error('[Ошибка]: Не подключен основной плагин.');
	}

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButton);

	button.name = "instagram";

	button.verification.container = 'div';
	button.verification.timeout = 5000;

	button._defaults = {
		userName: null
	};

	button.prepareOptions = function() {
		this.url = this._extractUrl();
		this.options.title = this.options.title || $.pandalocker.lang.socialButtons.instagram;
	};

	button.setupEvents = function() {
	};

	/**
	 * Создает окно репоста страницы, в этом же методе происходит прослушивание на закрытие окна
	 * @return void
	 */
	button.showShareWindow = function() {
		var self = this;

		var width = screen.width / 2;
		var height = screen.height / 2;

		var x = screen.width ? (screen.width / 2 - width / 2 + $.pandalocker.tools.findLeftWindowBoundry()) : 0;
		var y = screen.height ? (screen.height / 2 - height / 2 + $.pandalocker.tools.findTopWindowBoundry()) : 0;

		var winref = window.open(
			"//www.instagram.com/" + self.options.userName,
			"Sociallocker",
			"width=" + width + ",height=" + height + ",left=" + x + ",top=" + y + ",resizable=yes,scrollbars=yes,status=yes"
		);

		self.locker._showScreen('data-processing');

		var pollTimer = setInterval(function() {
			if( !winref || winref.closed !== false ) {
				clearInterval(pollTimer);
				self.unlock("button", self.name, self.url);
			}
		}, 200);
	};

	button.renderButton = function($holder) {
		var self = this;

		self.button = $('<div class="onp-sl-flat-button-default onp-sl-instagram-button">' +
			'<div class="onp-sl-flat-button-left-side">' +
			'<i class="onp-sl-flat-button-instagram-logo"></i>' +
			'</div>' +
			'<span>подписаться</span>' +
			'</div>'
		).appendTo($holder);

		self.buttonCounter = $('<div class="onp-sl-flat-button-counter">-</div>');
		self.button.after(self.buttonCounter);

		if( !self.options.userName ) {
			self.showError("Пожалуйста, установите имя пользователя, на которого осуществляется подписка.");
		}

		self.button.addClass('onp-sl-button-loaded');

		self.button.click(function() {
			self.showShareWindow();
		});
	};

	$.pandalocker.controls["social-buttons"]["instagram"] = button;

})(__$onp);
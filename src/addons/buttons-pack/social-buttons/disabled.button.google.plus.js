/**
 * Google Plus button
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

	if( !$.pandalocker.google_plus ) {
		$.pandalocker.google_plus = {};
	}

	var button = $.pandalocker.tools.extend($.pandalocker.entity.socialButtonsPack);

	button.name = "google-plus";
	button.sdk = 'onp';
	button.verification.container = '.onp-button-loaded';

	button.prepareOptions = function() {
	};

	button.setupEvents = function() {
		var self = this;
	};

	/***
	 * Создает кнопку, счетчик и контейнеры
	 * @param $holder
	 */
	button.renderButton = function($holder) {
		var self = this;
		this.showError('Кнопка google плюс больше не доступна, используйте вместо нее google поделиться. Функционал этих двух кнопок идентичен. ');
	};

	$.pandalocker.controls["social-buttons"]["google-plus"] = button;

})(__$onp);
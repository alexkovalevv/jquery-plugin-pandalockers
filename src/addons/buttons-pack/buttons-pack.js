/**
 * Расширенный пакет социальных кнопок
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 26.05.2017
 * @version 1.0
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:0
 * @!lang:[]
 * @!build:['free','premium']
 */

(function($) {
	'use strict';

	if( !$.pandalocker || !$.pandalocker.groups || !$.pandalocker.groups["social-buttons"] || !$.pandalocker.groups["social-buttons"]._defaults ) {
		throw new Error('[Ошибка]: Не подключен основной плагин.');
	}
	/*$.pandalocker.groups["social-buttons"]._defaults['draugiem'] = {
	 share: {
	 title: 'Ieteikt'
	 }
	 };

	 $.pandalocker.groups["social-buttons"]._defaults['instagram'] = {};
	 $.pandalocker.groups["social-buttons"]._defaults['livejournal'] = {};*/

	$.pandalocker.groups["social-buttons"]._defaults['vk'] = {
		like: {},
		share: {},
		subscribe: {}
	};

	$.pandalocker.groups["social-buttons"]._defaults['ok'] = {
		share: {}
	};

	$.pandalocker.groups["social-buttons"]._defaults['mail'] = {
		share: {}
	};

	$.pandalocker.groups["social-buttons"]._defaults.google['youtube'] = {};

	if( $.pandalocker.groups["social-buttons"]._defaults.youtube ) {
		delete $.pandalocker.groups["social-buttons"]._defaults.youtube;
	}

	/** ------------------------------------------------------------------------- **/
	// Добавляем данные по умолчанию для расширенного пакета кнопок
	/** ------------------------------------------------------------------------- **/

	$.pandalocker.hooks.add('opanda-social-buttons-group-filter-options', function(options, locker) {
		if( locker.options.vk ) {
			options.vk = $.extend(true, options.vk, locker.options.vk);
		}
		if( locker.options.ok ) {
			options.ok = $.extend(true, options.ok, locker.options.ok);
		}
		if( locker.options.mail ) {
			options.mail = $.extend(true, options.mail, locker.options.mail);
		}
		if( locker.options.draugiem ) {
			options.draugiem = $.extend(true, options.draugiem, locker.options.draugiem);
		}
		if( locker.options.instagram ) {
			options.instagram = $.extend(true, options.instagram, locker.options.instagram);
		}
		if( locker.options.livejournal ) {
			options.livejournal = $.extend(true, options.livejournal, locker.options.livejournal);
		}
		return options;
	});

	/** ------------------------------------------------------------------------- **/
	//	Настройка google аналитики
	/** ------------------------------------------------------------------------- **/

	$.pandalocker.hooks.add('opanda-google-analytics-button-name-filter', function(buttonName, locker, senderName) {

		if( senderName === 'google-youtube' ) {
			buttonName = 'Google Youtube';
		}
		else if( senderName === 'vk-share' ) {
			buttonName = 'Vkontakte Share';
		}
		else if( senderName === 'vk-like' ) {
			buttonName = 'Vkontakte Like';
		}
		else if( senderName === 'vk-subscribe' ) {
			buttonName = 'Vkontakte Subscribe';
		}
		else if( senderName === 'vk-notify' ) {
			buttonName = 'Vkontakte Get notify';
		}
		else if( senderName === 'ok-share' ) {
			buttonName = 'Odnoklassniki Share';
		}
		else if( senderName === 'mail-share' ) {
			buttonName = 'Mail Share';
		}
		else if( senderName === 'draugiem' ) {
			buttonName = 'Draugiem share';
		}
		else if( senderName === 'instagram' ) {
			buttonName = 'Instagram subscribe';
		}
		else if( senderName === 'vk' ) {
			buttonName = 'Vkontakte Sign-In';
		}

		return buttonName;
	});

})(__$onp);

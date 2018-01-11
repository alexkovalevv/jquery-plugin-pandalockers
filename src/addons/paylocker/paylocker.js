/**
 * Аддон для создания платного контента
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 10.12.2016
 * @version 1.0
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:0
 * @!lang:[]
 * @!build:['paylocker']
 */

(function($) {
	'use strict';

	// Регистрируем экран с формой оплаты от яндекса
	$.__pl.tools.addHook('init', function(e, locker) {

		locker._registerScreen('paylocker-success-payment', function($holder, options) {
			var screenHeaderEl = $('<div class="onp-pl-screen-header">' + $.pandalocker.lang.pl_payment_successful + '</div>');
			$holder.append(screenHeaderEl);
			var loginUrl = __paylocker && __paylocker.loginUrl;
			var screenTextEl = $('<div class="onp-pl-screen-text">' + $.pandalocker.lang.pl_payment_have_last_step.replace('{%login_url%}', loginUrl) + '</div>');
			$holder.append(screenTextEl);
		});

		locker._registerScreen('paylocker-error', function($holder, options) {
			if( options && options.header ) {
				var screenHeaderEl = $('<div class="onp-pl-screen-header">' + options.header + '</div>');
				$holder.append(screenHeaderEl);
			}

			var screenText = (options && options.errorMessage) || $.pandalocker.lang.pl_errors.ajax_unknown_error,
				screenTextEl = $('<div class="onp-pl-screen-text">' + screenText + '</div>');

			$holder.append(screenTextEl);
		});

	});

	/**
	 * Устанавливаем настройки по умолчнаию или принудительно перезаписываем запрещенные настройки.
	 */
	$.pandalocker.hooks.add('opanda-filter-options', function(options, locker) {
		var groupOrder = (locker.options.groups && locker.options.groups.order) || locker.options.groups.length && locker.options.groups;

		if( !groupOrder || groupOrder.indexOf("pricing-tables") == -1 ) {
			return options;
		}

		options.locker.close = false;
		options.locker.timer = 0;

		if( !options.theme || typeof options.theme !== 'object' ) {
			options.theme = {
				name: 'default'
			};
		} else {
			if( options.theme.style && options.theme.style != 'default' ) {
				options.theme = {
					name: 'default-' + options.theme.style
				};
			}
		}

		return options;
	});

	// Добавляем ссылку на страницу помощь
	$.pandalocker.hooks.add('opanda-before-lock', function(e, locker) {
		var groupOrder = (locker.options.groups && locker.options.groups.order) || locker.options.groups.length && locker.options.groups;

		if( (!groupOrder || groupOrder.indexOf("pricing-tables") == -1) || !locker.options.paylocker ) {
			return;
		}

		$(locker.locker).addClass('onp-sl-paylocker-mode');

		if( locker.options.paylocker.helpUrl ) {
			$(locker.locker).prepend('<a class="onp-pl-help-link" href="' + locker.options.paylocker.helpUrl + '" target="_blank"></a>');
		}

		var loginUrl = locker.options.paylocker.loginUrl || null;
		var supportUrl = locker.options.paylocker.supportUrl || null;

		$(locker.locker).append('<div class="onp-pl-bottom-panel">' +
			'<a href="' + loginUrl + '" class="onp-pl-login-link">' + $.pandalocker.lang.pl_already_subscbibe + '</a>' +
			'<a href="' + supportUrl + '" class="onp-pl-mailto-link">' + $.pandalocker.lang.pl_contact_with_us + '</a>' +
			'<div style="clear: both;"></div>' +
			'</div>'
		);
	});
})(__$onp);

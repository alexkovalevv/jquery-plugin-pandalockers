/**
 * Миграция с русской версии jQuery плагина на англоязычную
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 25.05.2017
 * @version 1.0
 *
 * @!jsObfuscate:false
 * @!preprocess:true
 * @!uglify:true
 * @!priority:0
 * @!lang:[]
 * @!build:['migration-rus-to-en']
 */

(function($) {
	'use strict';

	if( !$.pandalocker ) {
		$.pandalocker = {};
	}

	if( !$.pandalocker.entity ) {
		$.pandalocker.entity = {};
	}

	if( !$.pandalocker.entity.control ) {
		$.pandalocker.entity.control = {};
	}

	if( !$.pandalocker.groups ) {
		$.pandalocker.groups = {};
	}

	/** ------------------------------------------------------------------------- **/
	//	Расширенные настройки по умолчанию
	/** ------------------------------------------------------------------------- **/

	$.pandalocker.hooks.add('opanda-filter-default-options', function(options) {
		// Полноэкранный режим
		options.fullscreenMode = false;

		// Если установлено true, приложение является публичным
		// Для публичный приложений в случае ошибки, если кнопка будет одна
		// замок будет всегда открываться, чтобы не ограничивать доступ для пользователей.
		// Также для публичных приложений все кнопки с ошибками, если их больше одной
		// скрываются, а ошибки кнопок выводятся в консоли браузера.
		options.appPublic = false;
		// Добавлять ссылку на автора или нет
		options.credential = false;

		// Значение подставляется автоматически при компиляции
		options.lang = '/* @echo lang */';

		return options;
	});

	/** ------------------------------------------------------------------------- **/
	//	Предустановленные и модернизированные методы
	/** ------------------------------------------------------------------------- **/

	$.pandalocker.hooks.add('opanda-init', function(e, locker) {

		// SCREEN: Prompt

		locker._registerScreen('prompt',
			function($holder, options) {

				var promtHtmlObj = $(
					'<div class="onp-sl-prompt">' +
					'<div class="onp-sl-prompt-text">' + options.textMessage + '</div>' +
					'<div class="onp-sl-prompt-buttons"><button class="onp-sl-prompt-button-yes">' + options.textButtonYes + '</button>' +
					'<button class="onp-sl-prompt-button-no">' + options.textButtonNo + '</button></div>' +
					'</div>'
				);

				!options.textButtonYes && promtHtmlObj.find('.onp-sl-prompt-button-yes').hide();
				!options.textButtonNo && promtHtmlObj.find('.onp-sl-prompt-button-no').hide();

				$holder.append(promtHtmlObj);

				$holder.closest('.onp-sl-social-locker').find('.onp-sl-cross').hide();

				promtHtmlObj.find('.onp-sl-prompt-button-yes').click(function() {
					options.callbackButtonYes && options.callbackButtonYes();
					return false;
				});

				promtHtmlObj.find('.onp-sl-prompt-button-no').click(function() {
					$holder.closest('.onp-sl-social-locker').find('.onp-sl-cross').show();

					if( options.callbackButtonNo ) {
						options.callbackButtonNo();
						return false;
					}

					locker._showScreen('default');

					return false;
				});

				options.callbackScreenLoad && options.callbackScreenLoad(promtHtmlObj);
			}
		);
	});

	/** ------------------------------------------------------------------------- **/
	//	Если у нас одна кнопка и замок вызывает ошибку, открываем его.
	//	Если кнопки вызвали ошибку, скрываем их.
	//	Хук работает только для фронтенда, поэтому проверяем опцию appPublic
	/** ------------------------------------------------------------------------- **/

	$.pandalocker.hooks.add('control-error', function(locker, buttonName, groupName, message) {

		if( !locker.options.errors ) {
			locker.options.errors = {};
		}
		if( !locker.options.errors.buttons ) {
			locker.options.errors.buttons = {};
		}

		var order = locker.options.socialButtons && locker.options.socialButtons.order,
			countErrors = Object.keys(locker.options.errors.buttons).length;

		if( !order || !order.length ) {
			order = locker.options.buttons && locker.options.buttons.order;
		}

		if( order && order.length && locker.options.appPublic ) {
			if( $.inArray(buttonName, order) === -1 ) {
				return;
			}

			if( locker.options.errors.buttons[buttonName] ) {
				return;
			}

			console.group('%c[Error]: Возникла ошибка при инициализации кнопки.', "color: red;");
			console.log('%c[Button]: ' + buttonName, "color: blue;");
			console.log('%c[Group]: ' + groupName, "color: blue;");
			console.log('%c[Mesage]: ' + message, "color: green;");

			locker.options.errors.buttons[buttonName] = {
				'message': message
			};

			if( order.length <= 1 || ((order.length - countErrors) <= 1) ) {
				if( order.length <= 1 && order[0] !== buttonName ) {
					return;
				}

				locker.unlock && locker.unlock("error");
				console.log('%c[Event]: Замок был открыт из-за того, что кнопка ' + buttonName + ' вызвала ошибку.', "color:#EF94F2;");
				return;
			}

			var interationCount = 0,
				timer = setInterval(function() {
					var control = $(locker.locker).find('.onp-sl-' + buttonName);

					if( control.length || interationCount > 10 ) {
						control.fadeOut();
						clearInterval(timer);
					}
					interationCount++;
				}, 500);

			console.log('%c[Event]: Кнопка ' + buttonName + ' была скрыта из-за возникновения ошибки.', "color:#EF94F2;");

			console.groupEnd();
		}
	});

})(__$onp);

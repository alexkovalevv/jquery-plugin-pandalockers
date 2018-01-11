/**
 * Набор модификаций для расширения возможностей основного плагина.
 * В данном наборе присутсвует возможность использования popup окнон и анимации для кнопок
 * и диалоговых окон.
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:0
 * @!lang:[]
 * @!build:['popup-mode']
 */

(function($) {
	'use strict';

	/**
	 * Функция проверяет поддерживает ли браузера css3 анимацию или нет
	 * @returns {boolean}
	 */
	$.pandalocker.tools.isAnimationSupport = function() {
		var animation = false,
			animationstring = 'animation',
			keyframeprefix = '',
			domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
			pfx = '',
			elm = document.createElement('div');

		if( elm.style.animationName !== undefined ) {
			animation = true;
		}

		if( animation === false ) {
			for( var i = 0; i < domPrefixes.length; i++ ) {
				if( elm.style[domPrefixes[i] + 'AnimationName'] !== undefined ) {
					pfx = domPrefixes[i];
					animationstring = pfx + 'Animation';
					keyframeprefix = '-' + pfx.toLowerCase() + '-';
					animation = true;
					break;
				}
			}
		}

		return animation;
	};

	/**
	 * Базовы предустановки, перед инициализацией ядра
	 */
	$.pandalocker.hooks.add('opanda-init', function(e, locker) {

		// --------------------------------------------------------------------------------------
		// Lock/Unlock content.
		// --------------------------------------------------------------------------------------

		locker._lock = function(sender) {
			var self = locker;

			if( locker._isLocked ) {
				return;
			}

			var lockerShowDelay = self.options.locker.showDelay || 0;

			setTimeout(function() {
				if( !self._markupIsCreated ) {
					self._createMarkup();
				}

				self.runHook('before-lock');

				if( !self.overlap ) {
					self.element.hide();
					if( $.pandalocker.tools.isAnimationSupport() ) {
						self.locker.show();
					} else {
						self.locker.fadeIn(1000);
					}

				} else {
					// Если анимация поддерживается браузером, показываем с анимацией,
					// если нет, то просто показываем без анимации
					if( $.pandalocker.tools.isAnimationSupport() ) {
						// Мы изменили способ анимации для выхода замка
						self.overlapLockerBox.show();
						self._updateLockerPosition();
					} else {
						self.overlapLockerBox.fadeIn(1000, function() {
							self._updateLockerPosition();
						});
						self._updateLockerPosition();
					}
				}

				self._isLocked = true;

				self.runHook('lock');
				self.runHook('locked');

				setTimeout(function() {
					self._startTrackVisability();
				}, 1500);
			}, lockerShowDelay);
		};

	});

	/**
	 * Промежуточная анимация
	 */
	$.pandalocker.hooks.add('opanda-before-lock', function(e, locker) {

		if( typeof locker.options.theme === 'object' ) {
			var theme = locker.options.theme;

			// Добавляем эффекты анимации для всплпывающих окон
			if( theme.animation && theme.animation.type != '' ) {
				if( theme.animation != 'none' ) {
					if( locker.overlap ) {
						if( locker.fullscreenMode ) {
							locker.overlapBox.addClass('onp-sl-popup-mode');
						}

						locker.overlapLockerBox.addClass('animated ' + theme.animation.type);
					} else {

						locker.locker.addClass('animated ' + theme.animation.type);
					}
				}
			}

			if( !theme.connectButtons ) {
				theme.connectButtons = {};
			}

			var connectButtonsStyle = theme.connectButtons.style || 'dark-force';
			var connectButtonsSize = theme.connectButtons.size || 'big';

			if( ['big', 'medium', 'small'].indexOf(connectButtonsSize) < 0 ) {
				connectButtonsSize = 'big';
			}

			// Добавляем стиль кнопок авторизации
			locker.locker.find('.onp-sl-connect-buttons')
				.addClass('onp-sl-connect-buttons-style-' + connectButtonsStyle)
				.addClass('onp-sl-buttons-size-' + connectButtonsSize);

			// Добавляем эффекты анимации для кнопок авторизации
			if( theme.connectButtons.hoverAnimation && theme.connectButtons.hoverAnimation != 'none' ) {
				var connectControl = locker.locker.find('.onp-sl-connect-buttons').find('.onp-sl-control');

				connectControl.addClass('hvr-' + theme.connectButtons.hoverAnimation);
			}

			var overlapBackgroundElement = locker.overlapBox.find('.onp-sl-overlap-background');

			if( theme.overlap && theme.overlap.style ) {

				if( theme.overlap.style == 'none' ) {
					overlapBackgroundElement.css({
						background: 'none;'
					});
				}

				if( typeof theme.overlap.style === 'string' && [
						'lockers',
						'discounts'
					].indexOf(theme.overlap.style) > -1 ) {
					overlapBackgroundElement.addClass('onp-sl-' + theme.overlap.style + '-texture');
				}

				//var background = 'none';

				/*overlapBackgroundElement.css({
				 backgroundImage: background
				 });*/
			}

			if( theme.overlap && theme.overlap.color && theme.overlap.color != 'default' ) {
				var color = 'rgba(97, 97, 97, 0.78)';

				switch( theme.overlap.color ) {
					case "color_1":
						color = 'rgba(255, 255, 255, 0.78)';
						break;
					case "color_2":
						color = 'rgba(96, 125, 139, 0.78)';
						break;
					case "color_3":
						color = 'rgba(121, 85, 72, 0.78)';
						break;
					case "color_4":
						color = 'rgba(244, 67, 54, 0.78)';
						break;
					case "color_5":
						color = 'rgba(255, 87, 34, 0.78)';
						break;
					case "color_6":
						color = 'rgba(255, 152, 0, 0.78)';
						break;
					case "color_7":
						color = 'rgba(255, 235, 59, 0.78)';
						break;
					case "color_8":
						color = 'rgba(205, 220, 57, 0.78)';
						break;
					case "color_9":
						color = 'rgba(139, 195, 74, 0.78)';
						break;
					case "color_10":
						color = 'rgba(76, 175, 80, 0.78)';
						break;
					case "color_11":
						color = 'rgba(0, 150, 136, 0.78)';
						break;
					case "color_12":
						color = 'rgba(156, 39, 176, 0.78)';
						break;
					case "color_13":
						color = 'rgba(103, 58, 183, 0.78)';
						break;
				}

				overlapBackgroundElement.css({
					backgroundColor: color
				});
			}

		}

		var animationDelay = 50;

		/*locker.locker.find('.onp-sts-progress-line').each(function() {
		 animationDelay = animationDelay + 200;
		 $(this).find('.onp-sts-step-mark').css('animation-delay', animationDelay + 'ms');
		 $(this).find('.onp-sts-step-mark').addClass('animated flipInY');
		 });*/
	});

	/**
	 * Анимация кнопок после их загрузки
	 */
	/*$.pandalocker.hooks.add('opanda-remove-loading-state', function(e, locker, sender) {

	 });*/

	//$.pandalocker.hooks.add('opanda-filter-options', function(options, locker) {

	// Обновление старых тем.
	/*var currentThemeName = typeof options.theme === 'object' && options.theme.name ?
	 options.theme.name : null;
	 if( !currentThemeName ) {
	 currentThemeName = typeof options.theme === 'string' && options.theme ? options.theme : null;
	 }
	 if( currentThemeName === 'facebook' ) {
	 if( !options.socialButtons ) {
	 options.socialButtons = {};
	 }

	 if( typeof options.theme !== 'object' ) {
	 var themeName = options.theme;
	 options.theme = {};
	 options.theme['name'] = themeName;
	 }

	 if( options.theme.thanksLink === null || options.theme.thanksLink === undefined ) {
	 options.theme['thanksLink'] = true;
	 }

	 if( !options.theme.thanksText ) {
	 options.theme['thanksText'] = "Спасибо, я уже с Вами!";
	 }
	 }*/

	//return options;
	//});

	/*$.pandalocker.hooks.add('opanda-functions-requesting-state', function(checkFunctions, locker) {
	 checkFunctions.push(function(callback) {
	 var storage = locker._getStateStorage();
	 callback(storage.isUnlocked('onp-sl-popup-locker') ? "unlocked" : "locked");
	 });
	 return checkFunctions;
	 });*/

	/*$.pandalocker.hooks.add('opanda-before-lock', function(e, locker, sender) {
	 if( locker.options.stepToStep ) {
	 return;
	 }
	 if( typeof locker.options.theme === 'object' && locker.options.theme.name === 'facebook' ) {
	 var wrapThanksLink = $('<div class="onp-sl-wrap-thanks-link">');

	 if( typeof locker.options.theme === 'object' && locker.options.theme.thanksLink ) {

	 var isWrapThanksLink = locker.locker.find('.onp-sl-wrap-thanks-link').length;

	 if( !isWrapThanksLink ) {
	 locker.locker.find('.onp-sl-group-inner-wrap').after(wrapThanksLink);
	 }

	 var thanksText = locker.options.theme.thanksText || null;
	 var thanksLink = $('<a href="#" class="onp-sl-thanks-link">' + thanksText + '</a>');

	 var isThanksLink = locker.locker.find('.onp-sl-thanks-link').length;
	 if( !isThanksLink ) {
	 wrapThanksLink.append(thanksLink);
	 }

	 locker.locker.find(thanksLink).click(function() {
	 var storage = locker._getStateStorage();
	 storage.setState('onp-sl-popup-locker', 'unlocked');
	 locker._unlock("popup");
	 return false;
	 });
	 } else {
	 locker.locker.find('.onp-sl-group-inner-wrap').css({
	 paddingBottom: "50px"
	 });
	 }

	 locker.addHook('open-control-error-message', function() {
	 $('.onp-sl-timer', locker.locker).toggle();
	 });
	 }
	 });*/

	/*$.pandalocker.hooks.add('opanda-lock', function(e, locker, sender) {
	 console.log('dsf');
	 locker._showScreen('data-processing');
	 $('.onp-sl-timer', locker.locker).hide();
	 });*/
})(jQuery);

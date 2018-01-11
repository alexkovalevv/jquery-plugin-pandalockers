/** *
 * Аддон для создания пошаговых заданий для социального замка
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 10.12.2016
 * @version 1.0
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!priority:0
 * @!uglify:true
 * @!lang:[]
 * @!build:['step-to-step']
 */


(function($) {
	'use strict';

	if( !$.pandalocker.step_to_step ) {
		$.pandalocker.step_to_step = {};
		$.pandalocker.step_to_step.needed = 0;
		$.pandalocker.step_to_step.finish = 0;
	}

	$.pandalocker.hooks.add('opanda-before-init', function(e, locker) {
		var defaults = {
			popup_addon_step_counter: 'STEP',
			popup_addon_step_default_title: 'Set screen header for example: "Get discount 20%"'
		};

		$.pandalocker.lang = $.extend(true, $.pandalocker.lang, defaults);

		if( window.__pandalockers && window.__pandalockers.lang ) {
			$.pandalocker.lang = $.extend(true, $.pandalocker.lang, window.__pandalockers.lang);
			//window.__pandalockers.lang = null;
		}
	});

	/**
	 * Устанавливаем настройки по умолчанию
	 */
	/*$.pandalocker.hooks.add('opanda-filter-options', function(options, locker) {
	 if( !locker.options.stepToStep ) {
	 return options;
	 }
	 options.demo = false;

	 return options;
	 });*/

	/**
	 * Задаем нулевой индекс для групп, чтобы все группы печатались, как первичные
	 */
	$.pandalocker.hooks.add('opanda-filter-init-group-index', function(groupIndex, locker, group) {
		if( !locker.options.stepToStep ) {
			return groupIndex;
		}
		return 0;
	});

	/**
	 * Для каждой отдельной группы мы записывает уникальные настройки.
	 * Если у нас две группы социальных кнопок, то у каждой группы будут уникальные настройки
	 */
	$.pandalocker.hooks.add('opanda-filter-init-group-options', function(options, locker, groupIndex, group) {
		if( !locker.options.stepToStep ) {
			return options;
		}

		groupIndex = groupIndex + 1;

		var groupOptionsName = $.pandalocker.tools.camelCase(group.name),
			stepOptions = locker.options.stepToStep['step' + groupIndex],
			localOptions;

		if( stepOptions && stepOptions.lockerOptions ) {
			localOptions = $.extend({}, stepOptions.lockerOptions);

			if( localOptions[groupOptionsName] ) {
				delete localOptions[groupOptionsName];
			}

			if( stepOptions.lockerOptions[groupOptionsName] ) {
				localOptions = $.extend(localOptions, stepOptions.lockerOptions[groupOptionsName]);
			}

			options = $.extend(options, localOptions);
		}

		return options;
	});

	/**
	 * Создаем пошаговые экраны
	 */
	$.pandalocker.hooks.add('opanda-markup-created', function(e, locker, sender) {
		if( !locker.options.stepToStep ) {
			return;
		}

		locker.screens['default'].remove();

		for( var screenName in locker._screenFactory ) {
			if( !locker._screenFactory.hasOwnProperty(screenName) || screenName.indexOf('step') < 0 ) {
				continue;
			}

			// if the screen has not been registered, fires an exception
			if( !locker._screenFactory[screenName] && !locker.screens[screenName] ) {
				throw new $.pandalocker.error('The screen "' + screenName + '" not found in the group "' + screenName + '"');
			}

			var screen = $("<div class='onp-sl-screen onp-sl-screen-step onp-sl-screen-" + screenName + "'></div>").appendTo(locker.innerWrap).hide();
			locker.screens[screenName] = locker._screenFactory[screenName](screen);
		}

		/*var dd = 2;
		 locker.locker.click(function(e) {
		 e.stopPropagation();
		 locker.screens['default'] = locker.defaultScreen = locker.screens['step-' + dd];
		 locker._showScreen('step-' + dd);

		 locker.locker.find('.onp-sts-step-' + (dd - 1) + '-mark').addClass('onp-sts-finish');
		 locker.runHook('next-step', ['step-' + dd], true);
		 dd++;
		 });*/
	});

	/**
	 * Сортируем группы по пошаговым экранам
	 */
	$.pandalocker.hooks.add('opanda-before-render-group-filter', function(screen, locker, groupIndex, groups, groupName, screens) {
		if( !locker.options.stepToStep ) {
			return screen;
		}

		groupIndex = groupIndex + 1;

		locker.screens['default'] = locker.defaultScreen = screens['step-1'];
		locker._currentScreenName = 'default';
		screens['step-1'].show();

		return screens['step-' + groupIndex];
	});

	/**
	 * После того, как группа будет опубликована, печатаем маркеры шагов.
	 */
	$.pandalocker.hooks.add('opanda-after-render-group', function(e, locker, groupIndex, group) {
		if( !locker.options.stepToStep ) {
			return;
		}
		var groups = locker.options.groups && locker.options.groups.order,
			progressLine;

		groupIndex = groupIndex + 1;

		for( var index = 0; index < groups.length; index++ ) {
			progressLine = getProgressLine(index + 1, locker.options);

			if( (index + 1) <= groupIndex ) {
				group.element.before(progressLine);
				progressLine.find('.onp-sts-step-mark').addClass('onp-sts-top-line')
			} else {

				if( locker.screens['step-' + groupIndex] ) {
					locker.screens['step-' + groupIndex].append(progressLine);
				}
			}
		}
	});

	/**
	 * Функция возвращаем разметку маркера шагов
	 * @param index
	 * @param options
	 * @returns {*|HTMLElement}
	 */
	function getProgressLine(index, options) {
		var markTitle = '',
			progressLine = $('<div class="onp-sts-progress-line"></div>');

		if( options.stepToStep && options.stepToStep['step' + index] ) {
			markTitle = options.stepToStep['step' + index].title || $.pandalocker.lang.popup_addon_step_default_title;
		}

		progressLine.append('<div class="onp-sts-step-mark onp-sts-step-' + index + '-mark" data-step="' + index + '"><span>' + $.pandalocker.lang.popup_addon_step_counter + ' #' + index + '</span>' + markTitle + '</div>');

		return progressLine;
	}

	/**
	 * Регистрируем экраны и перезаписываем стандартный метода unlock на свой.
	 */
	$.pandalocker.hooks.add('opanda-init', function(e, locker, sender) {
		if( !locker.options.stepToStep ) {
			return;
		}

		var stopInitLocker = false;

		if( locker.options.groups && locker.options.groups.order && locker.options.groups.order.length ) {
			$.pandalocker.step_to_step.needed = locker.options.groups.order.length;

			for( var i = 0; i < locker.options.groups.order.length; i++ ) {

				locker._registerScreen('step-' + (i + 1),
					function($holder, options) {
						return $holder;
					}
				);
			}
		} else {
			stopInitLocker = true;
		}

		if( !locker.options.stepToStep.step1 ) {
			stopInitLocker = true;
		}

		if( stopInitLocker ) {
			locker._lock = function() {
				return false;
			};
		}

		var _unlock = locker._unlock;

		locker._unlock = function(sender, senderName, value) {

			// если у нас системная разблокировка, то пропускаем ее.
			if( ['button', 'form'].indexOf(sender) < 0 ) {
				_unlock.apply(locker, [sender, senderName, value]);
				return;
			}

			$.pandalocker.hooks.run('opanda-step-to-step-next-screen', [locker]);
		};

		var parentLockerId = locker.id;

		$.pandalocker.hooks.add('opanda-step-to-step-force-unlock', function(locker) {
			if( locker.id != parentLockerId ) {
				return;
			}

			var storage = locker._getStateStorage();
			storage.setState('onp_sts_unlocked', 'unlocked');
			_unlock.apply(locker, [sender, 'step-to-step']);
		});

		$.pandalocker.hooks.add('opanda-step-to-step-next-screen', function(locker) {
			if( locker.id != parentLockerId ) {
				return;
			}

			$.pandalocker.step_to_step.finish++;

			var storage = locker._getStateStorage(),
				finishSteps = $.pandalocker.step_to_step.finish,
				nextStep = finishSteps + 1,
				prevStep = nextStep - 1;

			if( finishSteps >= $.pandalocker.step_to_step.needed ) {
				storage.setState('onp_sts_unlocked', 'unlocked');
				_unlock.apply(locker, [sender, 'step-to-step']);
				return false;
			}

			if( locker.screens['step-' + nextStep] ) {
				locker.screens['default'] = locker.defaultScreen = locker.screens['step-' + nextStep];
				locker._showScreen('step-' + nextStep);

				locker.locker.find('.onp-sts-step-' + prevStep + '-mark').addClass('onp-sts-finish');

				locker.runHook('next-step', ['step-' + nextStep], true);
				return false;
			}

			// Если следующего экрана не существует, просто открываем замок
			storage.setState('onp_sts_unlocked', 'unlocked');
			_unlock.apply(locker, [sender, 'step-to-step']);
		});
	});

	/**
	 * Создаем условия, при который плагин распознает замок, открывался ли он ранее или нет.
	 */
	$.pandalocker.hooks.add('opanda-functions-requesting-state', function(checkFunctions, locker) {
		checkFunctions.push(function(callback) {
			var storage = locker._getStateStorage();
			callback(storage.isUnlocked('onp_sts_unlocked') ? "unlocked" : "locked");
		});
		return checkFunctions;
	});

})(jQuery);

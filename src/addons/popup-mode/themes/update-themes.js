/**
 * Регистрация новых и оптимизации старых тем
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 13.05.2017
 * @version 1.0
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!priority:10
 * @!uglify:true
 * @!lang:[]
 * @!build:['popup-mode']
 */

(function($) {
	'use strict';

	if( !$.pandalocker.themes ) {
		$.pandalocker.themes = {};
	}

	$.pandalocker.hooks.add('opanda-filter-default-options', function(options, locker) {
		// Обновление старых тем.
		var currentThemeName = typeof locker.options.theme === 'object' && locker.options.theme.name ?
		                       locker.options.theme.name : null;
		if( !currentThemeName ) {
			currentThemeName = typeof locker.options.theme === 'string' && locker.options.theme
				? locker.options.theme
				: null;
		}

		var updatedThems = ['dark-force', 'great-attractor', 'friendly-giant', 'facebook'];

		if( updatedThems.indexOf(currentThemeName) > -1 ) {

			if( currentThemeName == 'dark-force' ) {
				// Theme: Dark Force
				$.pandalocker.themes['dark-force'] = {
					socialButtons: {
						layout: 'horizontal',
						counter: true,
						flip: true
					},
					theme: {
						fonts: [
							{
								name: 'Montserrat',
								styles: ['400', '700']
							}
						]
					}
				};
			} else if( currentThemeName == 'friendly-giant' ) {
				// Theme: Friendly Giant

				$.pandalocker.themes['friendly-giant'] = {
					socialButtons: {
						layout: 'horizontal',
						counter: true,
						flip: true
					},
					theme: {
						fonts: [
							{
								name: 'Open Sans',
								styles: ['400', '700']
							}
						]
					}
				};
			} else {
				$.pandalocker.themes[currentThemeName] = {
					socialButtons: {
						layout: 'horizontal',
						counter: true,
						flip: true
					}
				};
			}
		}

		return options;
	});

})(jQuery);

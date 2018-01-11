/**
 * Настройки анимации
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 15.05.2017
 * @version 1.0
 */


(function($) {
	'use strict';

	/**
	 * Анимация для мультизамков
	 */
	$.pandalocker.hooks.add('opanda-before-lock', function(e, locker) {
		var options = locker.options;

		/*if( options ) {
		 var animationDelay = 50;
		 locker.locker.find('.onp-sts-progress-line').each(function() {
		 animationDelay = animationDelay + 200;
		 $(this).find('.onp-sts-step-mark').css('animation-delay', animationDelay + 'ms');
		 $(this).find('.onp-sts-step-mark').addClass('animated flipInY');
		 });
		 }*/
	});
})(jQuery);

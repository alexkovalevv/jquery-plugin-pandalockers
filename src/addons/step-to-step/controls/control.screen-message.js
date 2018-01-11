/**
 * Таблицы тарифов
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 10.12.2016
 * @version 1.0
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:10
 * @!lang:[]
 * @!build:['step-to-step']
 */

(function($) {
	'use strict';

	if( !$.pandalocker.controls["custom-screens"] ) {
		$.pandalocker.controls["custom-screens"] = {};
	}

	var control = $.pandalocker.tools.extend($.pandalocker.entity.actionControl);

	control.name = "screen-message";

	control.defaults = {
		closeButton: true,
		nextButton: true,
		closeButtonText: 'Close window',
		nextButtonText: 'Next step'
	};

	control.prepareOptions = function() {
		this.options = $.extend(true, this.defaults, this.options, this.locker.options.customScreens);
	};

	control.render = function($holder) {
		var self = this;

		var wrap = $('<div class="onp-slp-control-buttons-line"></div>').appendTo($holder);

		var closeButton = $('<a href="#" class="onp-sl-button onp-sl-button-primary onp-slp-close-button">' + this.options.closeButtonText + '</a>'),
			nextButton = $('<a href="#" class="onp-sl-button onp-sl-button-primary onp-slp-next-button">' + this.options.nextButtonText + '</a>');

		closeButton.click(function() {
			$.pandalocker.hooks.run('opanda-step-to-step-force-unlock', [self.locker]);
			return false;
		});

		nextButton.click(function() {
			$.pandalocker.hooks.run('opanda-step-to-step-next-screen', [self.locker]);
			return false;
		});

		if( this.options.closeButton ) {
			wrap.append(closeButton);
		}
		if( this.options.nextButton ) {
			wrap.append(nextButton)
		}
	};

	$.pandalocker.controls["custom-screens"]["screen-message"] = control;
})(jQuery);

/**
 * Произвольный экран для конструктора заданий
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:20
 * @!lang:[]
 * @!build:['step-to-step']
 */

(function($) {
	'use strict';

	var group = $.pandalocker.tools.extend($.pandalocker.entity.group);

	/**
	 * Default options.
	 */
	group._defaults = {

		// an order of the buttons
		order: ["screen-message"],

		text: $.pandalocker.lang.subscription.defaultText

	};

	/**
	 * The name of the group.
	 */
	group.name = "custom-screens";

	$.pandalocker.groups["custom-screens"] = group;

})(jQuery);
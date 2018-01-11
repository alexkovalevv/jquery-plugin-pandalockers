/**
 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:35
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	var group = $.pandalocker.tools.extend($.pandalocker.entity.group);

	/**
	 * Default options.
	 */
	group._defaults = {

		// an order of the buttons
		order: ["form"],

		text: $.pandalocker.lang.subscription.defaultText,

		separator: {
			type: 'hiding-link',
			title: $.pandalocker.lang.misc_or_enter_email
		}

	};

	/**
	 * The name of the group.
	 */
	group.name = "subscription";

	$.pandalocker.groups["subscription"] = group;

})(__$onp);

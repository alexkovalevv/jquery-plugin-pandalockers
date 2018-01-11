/**
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:15
 * @!lang:[]
 * @!build:['paylocker']
 */

(function($) {
	'use strict';

	var group = $.pandalocker.tools.extend($.pandalocker.entity.group);

	/**
	 * Default options.
	 */
	group._defaults = {

		// an order of the buttons
		order: ["tables"],

		text: $.pandalocker.lang.subscription.defaultText

	};

	/**
	 * The name of the group.
	 */
	group.name = "pricing-tables";

	$.pandalocker.groups["pricing-tables"] = group;

})(__$onp);
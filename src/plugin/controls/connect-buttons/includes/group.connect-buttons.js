/**
 * @!obfuscator:false
 * @!preprocess:true
 * @!priority:50
 * @!uglify:true
 * @!lang:[]
 * @!build:['premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	var group = $.pandalocker.tools.extend($.pandalocker.entity.group);

	/**
	 * Default options.
	 */
	group._defaults = {

		// the default order of the buttons
		order: ["facebook", "twitter", "google"],

		// Facebook Options
		facebook: {

			// sdk version to load (v1.0, v2.0)
			version: 'v2.8'
		},

		// Twitter Options
		twitter: {},

		// Google Options
		google: {},

		// LinkedIn Options
		linkedin: {}
	};

	/**
	 * The name of the group.
	 */
	group.name = "connect-buttons";

	group.setup = function() {
		var self = this;

		if( !this.isFirst ) {

			this.options.text.message = (this.options.text && this.options.text.message) || $.pandalocker.lang.connectButtons.defaultMessage;
			this.options.text.message = $.pandalocker.tools.normilizeHtmlOption(this.options.text.message);
		}
	};

	$.pandalocker.groups["connect-buttons"] = group;

})(__$onp);

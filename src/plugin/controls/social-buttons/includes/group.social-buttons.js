/**
 * @!obfuscator:false
 * @!preprocess:true
 * @!priority:55
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

		// common url to like/share
		url: null,

		// horizontal or vertical
		layout: 'horizontal',

		// adds the covers of the buttons
		flip: false,

		// an order of the buttons, available buttons:
		// -
		// twitter: twitter-tweet, twitter-follow
		// facebook: facebook-like, facebook-share
		// google: google-plus, google-share
		// -
		order: [
			"twitter-tweet",
			"facebook-like"
		],

		// behavior on error: show_error, show_content
		behaviorOnError: 'show_error',
		behaviorError: 'Unable to create Social Buttons. Please make sure that nothing blocks loading of social scripts in your browser. Some browser extentions (Avast, PrivDog, AdBlock, Adguard etc.) or usage of private tabs in FireFox may cause this issue. Turn them off and try again.',

		// hide or show counters for the buttons
		counters: true,

		// Facebook Options
		facebook: {

			// sdk version to load (v1.0, v2.0)
			version: 'v2.8',

			like: {
				title: $.pandalocker && $.pandalocker.lang && $.pandalocker.lang.socialButtons.facebookLike
			},
			share: {
				title: $.pandalocker && $.pandalocker.lang && $.pandalocker.lang.socialButtons.facebookShare
			}
		},

		// Twitter Options
		twitter: {

			tweet: {
				title: $.pandalocker && $.pandalocker.lang && $.pandalocker.lang.socialButtons.twitterTweet
			},
			follow: {
				title: $.pandalocker && $.pandalocker.lang && $.pandalocker.lang.socialButtons.twitterFollow
			}
		},

		// Google Options
		google: {

			plus: {
				title: $.pandalocker && $.pandalocker.lang && $.pandalocker.lang.socialButtons.googlePlus
			},
			share: {
				title: $.pandalocker && $.pandalocker.lang && $.pandalocker.lang.socialButtons.googleShare
			}
		},

		// Youtube Options
		youtube: {
			title: $.pandalocker && $.pandalocker.lang && $.pandalocker.lang.socialButtons.youtubeSubscribe
		},

		// @if lang=='rus'
		// --
		// VKontakte Options
		vk: {

			like: {
				title: $.pandalocker && $.pandalocker.lang && $.pandalocker.lang.vk_like
			},

			share: {
				title: $.pandalocker && $.pandalocker.lang && $.pandalocker.lang.vk_share
			},

			subscribe: {
				title: $.pandalocker && $.pandalocker.lang && $.pandalocker.lang.vk_subscribe
			}
		},

		// --
		// Odnoklassniki Options
		ok: {

			share: {
				title: $.pandalocker && $.pandalocker.lang && $.pandalocker.lang.ok_class,
			}
		},
		// @endif

		// --
		// LinkedIn Options
		linkedin: {

			// - Separeted options for each buttons.
			share: {
				title: $.pandalocker && $.pandalocker.lang && $.pandalocker.lang.socialButtons.linkedinShare
			}
		}
	};

	/**
	 * The name of the group.
	 */
	group.name = "social-buttons";

	/**
	 * Prepares the group options.
	 */
	group.prepareOptions = function() {

		this.options.lang = this.locker.options.lang;

		if( 'horizontal' !== this.options.layout && 'vertical' !== this.options.layout ) {
			this.options.layout = 'horizontal';
		}

		// remove a google share button for mobile devices
		/**
		 if ( $.pandalocker.tools.isTabletOrMobile() ) {
            var googleIndex = $.inArray("google-share", this.options.order);   
            if (googleIndex >= 0) this.options.order.splice(googleIndex, 1);
        }
		 */

		this.options.url = this.options.url || this.locker.options.url;

		// adapter for the old version of the social locker

		// for social buttons
		if( this.locker.options.buttons ) {
			if( this.locker.options.buttons.order ) {
				this.options.order = this.locker.options.buttons.order;
			}
			if( typeof this.locker.options.buttons.counters !== "undefined" ) {
				this.options.counters = this.locker.options.buttons.counters;
			}
		}

		// for social keys
		if( this.locker.options.facebook ) {
			this.options.facebook = $.extend(true, this.options.facebook, this.locker.options.facebook);
		}
		if( this.locker.options.twitter ) {
			this.options.twitter = $.extend(true, this.options.twitter, this.locker.options.twitter);
		}
		if( this.locker.options.google ) {
			this.options.google = $.extend(true, this.options.google, this.locker.options.google);
		}
		if( this.locker.options.linkedin ) {
			this.options.linkedin = $.extend(true, this.options.linkedin, this.locker.options.linkedin);
		}
		if( this.locker.options.youtube ) {
			this.options.youtube = $.extend(true, this.options.youtube, this.locker.options.youtube);
		}

		this.options = this.applyFilters('social-buttons-group-filter-options', this.options, [], true);
	};

	/**
	 * Renders the group.
	 * @returns {undefined}
	 */
	group.render = function() {
		this._groupIsRendered = true;

		this.element.addClass(this.options.counters ? 'onp-sl-has-counters' : 'onp-sl-no-counters');
		this.element.addClass('onp-sl-' + this.options.layout);
		this.element.addClass('onp-sl-lang-' + this.options.lang);

		this._loadedButtons = $.extend([], this.options.order);
		this.renderControls(this.innerWrap);
	};

	group._loadedButtons = [];

	/**
	 * Fires when en error occurs in a control.
	 */
	group.onControlError = function(control) {
		if( !this._groupIsRendered ) {
			return;
		}

		var index = $.inArray(control, this._loadedButtons);

		this._loadedButtons.splice(index, 1);

		if( this._loadedButtons.length === 0 ) {
			if( this.options.behaviorOnError === 'show_error' ) {
				this.showError('adblock', this.options.behaviorError);
			} else {
				this.locker.unlock('error');
			}
		}
	}

	/**
	 * Creates a specified control.
	 */
	group.createControl = function(controlName) {

		var control = $.pandalocker.tools.extend($.pandalocker.controls[this.name][controlName]);

		var parts = controlName.split('-');
		var networkName = parts.length === 2 ? parts[0] : null;
		var buttonName = parts.length === 2 ? parts[1] : parts[0];

		var controlOptions = {};

		if( networkName ) {
			if( this.options[networkName] ) {
				controlOptions = $.extend({}, this.options[networkName]);
			}
			if( this.options[networkName][buttonName] ) {
				controlOptions = $.extend(controlOptions, this.options[networkName][buttonName]);
			}
		} else {
			if( this.options[buttonName] ) {
				controlOptions = $.extend(controlOptions, this.options[buttonName]);
			}
		}

		var networkOptions = networkName ? this.options[networkName] : {};

		networkOptions.lang = this.options.lang;
		networkOptions.counters = this.options.counters;
		networkOptions.url = networkOptions.url || this.options.url;

		control.init(this, controlOptions, networkOptions);
		return control;
	},

		/**
		 * Checks wheither this group is ready for work.
		 */
		group.canLock = function() {

			// unlock the locker if no buttons are defined
			if( this.options.order.length === 0 ) {
				return false;
			}

			return true;
		};

	$.pandalocker.groups["social-buttons"] = group;

})(__$onp);

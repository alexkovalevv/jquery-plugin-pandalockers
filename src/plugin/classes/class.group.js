/**
 * Класс упраления группами
 *
 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:61
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	var group = {};

	/**
	 * Default options.
	 */
	group._defaults = {};

	/**
	 * Inits the group.
	 */
	group.init = function(locker, options) {
		var self = this;

		this.locker = locker;
		this.lockerOptions = locker.options;

		// stores the lang resources for the current lang scope
		this.lang = locker.lang;

		// фикс для аддона шаг за шагом
		if( locker.langScope == 'socialLocker' && this.name == 'connect-buttons' ) {
			locker.langScope = 'signinLocker';
			this.lang = locker.lang = $.pandalocker.lang.scopes[locker.langScope];
		}

		if( locker.langScope == 'socialLocker' && this.name == 'email-locker' ) {
			locker.langScope = 'emailLocker';
			this.lang = locker.lang = $.pandalocker.lang.scopes[locker.langScope];
		}

		if( !options ) {
			options = {};
		}

		var temp = $.extend(true, {}, this._defaults);
		this.options = $.extend(true, temp, options);

		for( var prop in options ) {
			if( !options.hasOwnProperty(prop) ) {
				continue;
			}
			if( !$.isArray(options[prop]) ) {
				continue;
			}
			this.options[prop] = options[prop];
		}

		this.isFirst = options.index === 1;
		this.isLast = options.index === this.lockerOptions.groups.order.length;
		this.isSingle = this.lockerOptions.groups.order.length === 1;

		if( typeof this.options.text !== "object" ) {
			this.options.text = {message: self.options.text};
		}

		if( this.isFirst ) {
			if( '' === this.options.text.header ) {
				this.options.text.header = '';
			} else {
				this.options.text.header = this.options.text.header || this.lang.defaultHeader;
			}

			if( '' === this.options.text.message ) {
				this.options.text.message = '';
			} else {
				this.options.text.message = this.options.text.message || this.lang.defaultMessage;
			}
		}

		this.options.text.header = $.pandalocker.tools.normilizeHtmlOption(this.options.text.header);
		this.options.text.message = $.pandalocker.tools.normilizeHtmlOption(this.options.text.message);
		this.options.text.footer = $.pandalocker.tools.normilizeHtmlOption(this.options.text.footer);

		// prepares separator options

		if( false !== this.options.separator ) {

			var separator = $.isPlainObject(this.options.separator)
				? this.options.separator
				: {
					type: 'line',
					'title': self.options.separator
				};

			separator.type = separator.type || 'line';
			this.options.separator = separator;
		}

		// continues processing with child methods

		if( this.childInit ) {
			this.childInit();
		}
		if( this.setup ) {
			this.setup();
		}
		if( this.setupHooks ) {
			this.setupHooks();
		}
		if( this.prepareOptions ) {
			this.prepareOptions();
		}

		try {
			this.createControls();
		}
		catch( e ) {
			if( e.onpsl ) {
				this.showError(this.name, e.message);
			} else {
				throw e;
			}
		}
	};

	/**
	 * Creates controls for the group.
	 */
	group.createControls = function() {

		this.controls = [];

		for( var i = 0; i < this.options.order.length; i++ ) {

			var controlName = this.options.order[i];
			if( typeof controlName !== 'string' ) {
				continue;
			}

			if( !$.pandalocker.controls[this.name][controlName] ) {
				throw new $.pandalocker.error('Control "' + controlName + '" not found in the group "' + this.name + '"');
			}

			var control = this.createControl(controlName);
			this.controls.push(control);
		}
	};

	/**
	 * Creates a specified control.
	 */
	group.createControl = function(controlName) {
		var control = $.pandalocker.tools.extend($.pandalocker.controls[this.name][controlName]);

		var optionsName = $.pandalocker.tools.camelCase(controlName);
		var controlOptions = this.options[optionsName] || {};

		control.init(this, controlOptions);
		return control;
	};

	/**
	 * Requests the state of a locker.
	 */
	group.requestState = function(callback) {

		var controlsCount = this.controls.length;
		var currentState = 'locked';

		for( var i = 0; i < this.controls.length; i++ ) {
			this.controls[i].requestState(function(state) {
				controlsCount--;
				if( 'unlocked' === state ) {
					currentState = state;
				}
				if( controlsCount <= 0 ) {
					callback(currentState);
				}
			});
		}
	};

	/**
	 * Checks wheither this group is ready for work.
	 * For examplle, has any buttons available for the user to click.
	 */
	group.canLock = function() {
		return true;
	};

	/**
	 * Renders a group.
	 */
	group.renderGroup = function($holder) {

		var $group = $("<div class='onp-sl-group onp-sl-" + this.name + "'></div>");
		$group.appendTo($holder);

		var $innerWrap = $("<div class='onp-sl-group-inner-wrap'></div>");
		$innerWrap.appendTo($group);

		if( this.isFirst ) {
			$group.addClass('onp-sl-first-group');
		} else if( this.isLast ) {
			$group.addClass('onp-sl-last-group');
		} else {
			$group.addClass('onp-sl-middle-group');
		}

		$group.addClass(this.isSingle ? 'onp-sl-single-group' : 'onp-sl-not-single-group');

		$group.addClass('onp-sl-group-index-' + this.options.index);

		this.element = $group;
		this.innerWrap = $innerWrap;

		this.renderSeparator();

		if( this.options.text.header || this.options.text.message ) {
			var resultText = $("<div class='onp-sl-text'></div>").appendTo(this.innerWrap);

			if( this.options.text.header ) {
				resultText.append(this.options.text.header.addClass('onp-sl-header onp-sl-strong').clone());
			}

			if( this.options.text.message ) {
				resultText.append(this.options.text.message.addClass('onp-sl-message').clone());
			}

		}

		this._isRendered = true;
		this.render(this.innerWrap);
	};

	/**
	 * The child method which should be overwritten.
	 */
	group.render = function() {
		this.renderControls(this.innerWrap);
	};

	/**
	 * Sends a signal to the locker that the content should be unlocked.
	 */
	group.unlock = function(sender, sernderName, value) {
		this.locker.unlock(sender, sernderName, value);
	};

	/**
	 * Sets a new state for a given group control.
	 */
	group.setState = function(state, senderType, sernderName) {
		this.locker.setState(state, senderType || 'group', sernderName || this.name);
	};

	/**
	 * Renders the group controls.
	 */
	group.renderControls = function($innerWrap) {

		for( var i = 0; i < this.controls.length; i++ ) {
			this.controls[i].renderControl($innerWrap);
		}
	};

	group.showError = function(name, text) {

		// if the group has been not yet rendered,
		// then pass processing of the error to the locker

		if( !this._isRendered ) {

			this.locker._showError(name, text);

			// if the group has been rendered,
			// then shows the error as a part of the group html

		} else {

			this.element.find('.onp-sl-group-error').remove();

			if( this._currentErrorFor === name ) {

				this.element.find('.onp-sl-group-error').remove();
				this._currentErrorFor = null;

			} else {

				var $error = $("<div class='onp-sl-group-error'>" + text + "</div>");
				this.innerWrap.append($error);

				this._currentErrorFor = name;
			}

			this.runHook('size-changed');
		}
	};

	/**
	 * Adds a CSS class to locker.
	 * @returns {undefined}
	 */
	group.addClassToLocker = function(className) {
		this.locker._addClass(className);
	};

	// --------------------------------------------------------------
	// Notices
	// --------------------------------------------------------------

	/**
	 * Shows a notice.
	 */
	group.showNotice = function(text, expires, callback) {
		var self = this;
		this.element.find('.onp-sl-group-notice').remove();

		var $notice = $("<div class='onp-sl-group-notice'>" + text + "</div>").hide();
		this.innerWrap.append($notice);

		$notice.fadeIn(500, function() {
			self.runHook('size-changed');
		});

		if( !expires ) {
			expires = 7000;
		}

		setTimeout(function() {
			if( !$notice.length ) {
				return;
			}
			$notice.fadeOut(800, function() {
				$notice.remove();
				callback && callback();
				self.runHook('size-changed');
			});
		}, expires);
	};

	// --------------------------------------------------------------
	// Separators
	// --------------------------------------------------------------

	/**
	 * Renders a separator if needed.
	 */
	group.renderSeparator = function() {

		// there's not any meaning to show the separator before first group
		if( this.isFirst ) {
			return;
		}
		if( this.options.separator === false ) {
			return;
		}

		var self = this;

		var options = this.options.separator;
		var type = options.type;

		this.element
			.addClass('onp-sl-has-separator')
			.addClass('onp-sl-has-' + type + '-separator');

		var $separator = $("<div class='onp-sl-group-separator onp-sl-" + type + "-separator'></div>");

		var titleTag = ( 'hiding-link' === type ) ? "<a href='#'></a>" : "<span></span>";
		var $text = $(titleTag).addClass('onp-sl-title').appendTo($separator);

		$text.html(options.title || $.pandalocker.lang.misc_or);

		$separator.appendTo(this.innerWrap);

		if( 'hiding-link' === type ) {
			this.element.addClass('onp-sl-separator-hides');

			var $container = $("<div class='onp-sl-hiding-link-container' style='display: none;'></div>");
			$container.appendTo(this.innerWrap);
			this.innerWrap = $container;

			$text.click(function() {
				self.element.removeClass('onp-sl-separator-hides');
				self.element.addClass('onp-sl-separator-shows');

				$separator.hide();
				$container.fadeIn(500);

				self.runHook('size-changed');
				return false;
			});
		}
	};

	// --------------------------------------------------------------
	// Events
	// --------------------------------------------------------------

	/**
	 * Subscribes to the specified hook.
	 */
	group.addHook = function(eventName, callback, priority) {
		return this.locker.addHook(eventName, callback, priority);
	};

	/**
	 * Runs the specified hook.
	 */
	group.runHook = function(eventName, args) {
		return this.locker.runHook(eventName, args);
	};

	/**
	 * Subscribes to the specified hook.
	 */
	group.addFilter = function(eventName, callback, priority) {
		return this.locker.addFilter(eventName, callback, priority);
	};

	/**
	 * Runs the specified hook.
	 */

	group.applyFilters = function(eventName, input, args, global) {
		return this.locker.applyFilters(eventName, input, args, global);
	};

	// --------------------------------------------------------------
	// Screens
	// --------------------------------------------------------------

	group.showScreen = function(screenName, options) {
		this.locker._showScreen(screenName, options);
	};

	group.registerScreen = function(screenName, factory) {
		this.locker._registerScreen(screenName, factory);
	};

	$.pandalocker.entity.group = group;

})(__$onp);



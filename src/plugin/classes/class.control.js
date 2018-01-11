/**
 * Класс упраления контролами
 *
 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:63
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	var control = {};

	control.init = function(group, options) {

		var temp = $.extend(true, {}, this._defaults);
		this.options = $.extend(true, temp, options);

		this.groupOptions = group.options;
		this.lockerOptions = group.locker.options;

		// stores the lang resources for the current lang scope
		this.lang = group.lang;

		this.group = group;
		this.locker = group.locker;

		// when we use Twitter to sign in, it redirects to the simple sign in form,
		// but we need to keep the original  sender name to track the stats
		if( this.groupOptions.senderName ) {
			this.senderName = this.groupOptions.senderName;
		}

		if( !this.name ) {
			throw new Error('The property "name" cannot be empty for the control.');
		}

		this.options.proxy = this.options.proxy || this.groupOptions.proxy || this.lockerOptions.proxy;

		if( this.setup ) {
			this.setup();
		}
		if( this.setupHooks ) {
			this.setupHooks();
		}
		if( this.prepareOptions ) {
			this.prepareOptions();
		}
	};

	/**
	 * Default options.
	 */
	control._defaults = {};

	// ----------------------------------------------------------------
	// Basic public methods
	// ----------------------------------------------------------------

	/**
	 * Shows the control in the specified holder.
	 */
	control.renderControl = function($holder) {

		this.control = $(this.tag || '<div>')
			.addClass('onp-sl-control')
			.addClass('onp-sl-' + this.name)
			.appendTo($holder);

		this.innerWrap = $("<div></div>")
			.addClass('onp-sl-control-inner-wrap')
			.appendTo(this.control);

		this._isRendered = true;

		if( this._hasError() ) {
			this.showError();
		}
		this.render(this.innerWrap);
	};

	/**
	 * The child method which should be overwritten.
	 */
	control.render = function() {
		throw new Error("The control should implement the method 'render'");
	};

	/**
	 * Sends a signal to the group that the content should be unlocked.
	 */
	control.unlock = function(sender, senderName, value) {
		this.setState('unlocked');
		this.group.unlock(sender || 'button', senderName || this.senderName || this.name, value);
	};

	/**
	 * Adds a CSS class to locker.
	 * @returns {undefined}
	 */
	control.addClassToLocker = function(className) {
		this.group.addClassToLocker(className);
	};

	control._trackWindow = function(urlPart, onCloseCallback) {

		var funcOpen = window.open;
		window.open = function(url, name, params) {

			var winref = funcOpen(url, name, params);

			if( !url ) {
				return winref;
			}
			if( url.indexOf(urlPart) === -1 ) {
				return winref;
			}

			var pollTimer = setInterval(function() {
				if( !winref || winref.closed !== false ) {
					clearInterval(pollTimer);
					onCloseCallback && onCloseCallback();
				}
			}, 300);

			return winref;
		};
	};

	// ----------------------------------------------------------------
	// State storage methods
	// ----------------------------------------------------------------

	/**
	 * Requests the state of a locker.
	 */
	control.requestState = function(callback) {
		var storage = this._getStateStorage();
		storage.requestState(this.applyFilters('get-storage-identity', this._getStorageIdentity(), [], true), callback);
	};

	/**
	 * Sets a new state for a given control.
	 */
	control.setState = function(state, callback) {
		var storage = this._getStateStorage();
		storage.setState(this.applyFilters('get-storage-identity', this._getStorageIdentity(), [], true), state, callback);

		this.group.setState(state, 'button', this.name);
	};

	/**
	 * Returns an identity of a given control in a used state storage.
	 */
	control._getStorageIdentity = function() {
		return 'control_' + this.name;
	};

	/**
	 * Returns a state storage to set/get a state of a given control.
	 */
	control._getStateStorage = function() {
		return this.locker._getStateStorage();
	};

	// ----------------------------------------------------------------
	// Handling loading
	// ----------------------------------------------------------------

	control._setLoadingState = function(sender) {
		if( this._stateSender ) {
			return;
		}
		this._stateSender = sender;

		this.control.addClass('onp-sl-state-loading');
		this._isLoadingState = true;

		this.runHook('set-loading-state', [sender]);
	};

	control._removeLoadingState = function(sender) {

		if( this._stateSender && this._stateSender !== sender ) {
			return;
		}
		this._stateSender = null;

		this.control.removeClass('onp-sl-state-loading');
		this._isLoadingState = false;

		this.runHook('remove-loading-state', [sender]);
	};

	control._isLoading = function() {
		return this._isLoadingState;
	};

	// ----------------------------------------------------------------
	// Handling errors
	// ----------------------------------------------------------------

	control._setError = function(message) {
		if( this._error ) {
			return;
		}
		this._error = message;
	};

	control._hasError = function() {
		return this._error ? true : false;
	};

	control.showError = function(message, $holder) {
		var self = this;

		this.runHook('control-error', [self.name, self.group.name, message]);

		self.group.onControlError && self.group.onControlError(self.name);

		if( !this._isRendered ) {
			this._setError(message);
			return;
		}

		var $holder = $holder || this.innerWrap;
		var message = message || this._error;

		this.runHook('control-error', [self.name, self.group.name, message]);

		if( this.control.hasClass('onp-sl-state-error') ) {
			return;
		}
		this.control.removeClass('onp-sl-state-loading').addClass('onp-sl-state-error');

		var $error = this.createErrorMarkup(message).appendTo($holder);
		$error.find(".onp-sl-error-title").click(function() {
			self.group.showError(self.name, message);

			self.runHook('open-control-error-message', [self.name, self.group.name, message]);
			return false;
		});
	};

	/**
	 * Creats the markup for the error.
	 */
	control.createErrorMarkup = function(text) {
		return $("<div class='onp-sl-error-body'><a href='#' class='onp-sl-error-title'>" + $.pandalocker.lang.error + "</a></div>");
	};

	// --------------------------------------------------------------
	// Notices
	// --------------------------------------------------------------

	control.showNotice = function(message, callback) {
		this.group.showNotice(message, null, callback);
	};

	// --------------------------------------------------------------
	// Events
	// --------------------------------------------------------------

	/**
	 * Subscribes to the specified hook.
	 */
	control.addHook = function(eventName, callback, priority) {
		return this.group.addHook(eventName, callback, priority);
	};

	/**
	 * Runs the specified hook.
	 */
	control.runHook = function(eventName, args) {
		return this.group.runHook(eventName, args);
	};

	/**
	 * Subscribes to the specified hook.
	 */
	control.addFilter = function(eventName, callback, priority) {
		return this.group.addFilter(eventName, callback, priority);
	};

	/**
	 * Runs the specified hook.
	 */

	control.applyFilters = function(eventName, input, args, global) {
		return this.group.applyFilters(eventName, input, args, global);
	};

	// --------------------------------------------------------------
	// Working with SDK
	// --------------------------------------------------------------

	/**
	 * Preloads the SDK script for the control.
	 */
	control.requireSdk = function(sdkName, sdkOptions) {
		var self = this;
		var result = new $.pandalocker.deferred();

		if( !sdkName ) {
			result.resolve();
			return result.promise();
		}

		var timeout = this.group.options.loadingTimeout || this.lockerOptions.locker.loadingTimeout || 20000;
		var sdkResult = self.attemptToLoad(sdkName, sdkOptions || {}, 5, timeout);

		// the sdk script is loaded and ready to use
		sdkResult.done(function() {
			result.resolve();
		});

		// failed with error
		sdkResult.fail(function(error) {
			var errorText = $.pandalocker.lang.errors.unableToLoadSDK
				.replace('{0}', sdkName)
				.replace('{1}', error);

			result.reject(errorText);
		});

		return result.promise();
	};

	control.attemptToLoad = function(sdkName, sdkOptions, attemptMax, timeout) {
		var self = this;

		// 5 attempts to load a script
		if( !attemptMax ) {
			attemptMax = 5;
		}
		var attemptResult = new $.pandalocker.deferred();

		var sdkResult = $.pandalocker.sdk.connect(sdkName, sdkOptions || {}, timeout);

		// the sdk script is loaded and ready to use
		sdkResult.done(function() {
			attemptResult.resolve();
		});

		// failed with error
		sdkResult.fail(function(error) {
			console.log('Failed to load SDK script "' + sdkName + '" due to the error "' + error + '". ' + attemptMax + ' attempts left.');
			if( error !== 'timeout' && error !== 'blocked' ) {
				attemptResult.reject(error);
			}

			if( attemptMax - 1 <= 0 ) {
				attemptResult.reject(error);
			} else {

				self.attemptToLoad(sdkName, sdkOptions, attemptMax - 1, timeout)
					.done(function() {
						attemptResult.resolve();
					})
					.fail(function() {
						attemptResult.reject(error);
					});
			}
		});

		return attemptResult.promise();
	};

	control.verifyButton = function() {
		var self = this;
		var result = new $.pandalocker.deferred();

		var buttonTimeout = self.verification.timeout;

		var verificationFunction = function() {

			if(
				( ( self.customVerifyButton && !self.customVerifyButton() ) ||

					self.control.find(self.verification.container).length === 0 ) &&
				buttonTimeout >= 0 ) {

				setTimeout(function() {
					verificationFunction();
				}, 500);

				buttonTimeout = buttonTimeout - 500;
			} else {

				if( buttonTimeout <= 0 ) {
					var errorText = $.pandalocker.lang.errors.unableToCreateControl.replace('{0}', self.networkName);
					return result.reject(errorText);
				} else {
					result.resolve();
				}
			}
		};

		verificationFunction();

		return result.promise();
	};

	// --------------------------------------------------------------
	// Screens
	// --------------------------------------------------------------

	control.showScreen = function(screenName, options) {
		this.group.showScreen(screenName, options);
	};

	// --------------------------------------------------------------
	// Making the control public
	// --------------------------------------------------------------

	$.pandalocker.entity.control = control;

})(__$onp);



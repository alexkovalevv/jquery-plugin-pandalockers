/*
 * Panda Lockers
 * Copyright 2016, OnePress, http://byonepress.com

 * @!obfuscator:false
 * @!preprocess:true
 * @!priority:0
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';
	if( $.fn.pandalocker ) {
		return;
	}

	$.pandalocker.widget("pandalocker", {

		options: {},

		// The variable stores a current locker state.
		_isLocked: false,

		// Defauls option's values.
		_defaults: {

			// Text above the locker buttons.
			text: {
				header: null,
				message: null
			},

			// Theme applied to the locker
			theme: {
				name: "starter"
			},

			// The language of the locker
			lang: 'en_US',

			// The groups of controls which will be available for the user.
			groups: {
				order: ['social-buttons'],
				union: 'or'
			},

			// shows the terms
			terms: false,
			privacyPolicy: false,
			termsPopup: false,

			// The options of the Connect Buttons.
			connectButtons: {},

			// The options of the Social Buttons.
			socialButtons: {},

			// Sets overlap for the locked content.
			// false = mode:none
			overlap: {

				// Possible modes:
				// - full: hides the content, and show the locker instead (classic)
				// - transparence: transparent overlap
				// - blurring: to blur locked content
				mode: "full",

				// Using only if the mode is set to 'transparence' or 'blurring'
				// Defines the position of the locker. Possible values:
				// middle, top, scroll
				position: 'middle',

				// blur intensity (works only with the 'blue' mode)
				intensity: 5,

				// the alternative mode which will be applied if the browser doesn't support the blurring effect
				altMode: 'transparence'
			},

			// Extra class
			cssClass: null,

			// Sets whether the locker keep the state of always appears
			demo: false,

			// Turns on the highlight effect
			highlight: true,

			// Optional. If set true, the locker will generate events for the Google Analytics.
			googleAnalytics: false,

			// --
			// Locker functionality.
			locker: {

				// delay before displaying the locker, the option 'showDelay' also possible
				delay: false,
				showDelay: false,

				// if true, the locker will work as classic social buttons
				off: false,

				// if true, the locker waits until the user click all the available buttons.
				stepByStep: false,

				// Sets whether a user may remove the locker by a cross placed at the top-right corner.
				close: false,

				// delay before displaying the close icon, the option 'showCloseButtonDelay' also possible
				closeDelay: false,
				showCloseButtonDelay: false,

				// Sets a timer interval to unlock content when the zero is reached.
				// If the value is 0, the timer will not be created.
				timer: 0,

				// Sets whether the locker appears for mobiles devides.
				mobile: true,

				// Optional. If false, the content will be unlocked forever, else will be
				// unlocked for the given number of seconds.
				expires: false,

				// Optional. Forces to use cookies instead of a local storage
				useCookies: false,

				// Optional. Allows to bind lockers into one group.
				// If one of lockers in the given scope are unlocked, all others will be unlocked too.
				scope: false,

				// Optional. Timeout for loading of the social scripts.
				loadingTimeout: 10000,

				// Optional. If on, the locker will protect your content
				// against browser extensions which remove the lock automatically.
				tumbler: true,

				// Optional. Check interval for the Tumbler, 500 is good.
				tumblerInterval:
					500,

				// Options. Set what to do if the buttons are not available (blocked by Avast or AdBlock).
				naMode: 'show-error',

				// conditions that determine whether the locker has to be displayed
				visibility: [],

				// in-app browsers
				inAppBrowsers: 'visible_with_warning',
				inAppBrowsersWarning: 'You are viewing this page in the {browser}. The locker may work incorrectly in this browser. Please open this page in a standard browser.'
			},

			subscribeActionOptions: {}
			,

			// -
			// Content that will be showen after unlocking.
			content: null,

			// -
			// Default proxy
			proxy:
				null
		},

		getState: function() {
			return this._isLocked ? "locked" : "unlocked";
		},

		/**
		 * Creates a new locker.
		 */
		_create: function() {
			var self = this;

			this.runHook('before-init');
			this.id = this.options.id || this._generteId();

			this._prepareOptions();
			this._setupVariables();

			this._initExtras();
			this._initHooks();

			this._initGroups();
			this._initScreens();

			this._setupVisitorId();

			this.runHook('init');

			if( !this._canLock() ) {
				return;
			}

			this.requestState(function(state) {
				'locked' === state ? self._lock() : self._unlock("provider");
			});
		},

		/**
		 * Generates an uniqure id for the locker.
		 */

		_generteId: function() {
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for( var i = 0; i < 5; i++ ) {
				text += possible.charAt(Math.floor(Math.random() * possible.length));
			}

			return text;
		},

		/**
		 * Prepares options before start.
		 */
		_prepareOptions: function() {
			var self = this;

			var defaults = $.extend(true, {}, this._defaults);
			defaults = this.applyFilters('filter-default-options', defaults, [], true);

			if( this.options.theme && !$.isPlainObject(this.options.theme) ) {
				this.options.theme = {name: self.options.theme};
			}

			if( typeof this.options.theme !== "object" ) {
				this.options.theme = {name: self.options.theme};
			}

			var theme = this.options.theme.name || this._defaults.theme;

			// some themes also have defaults options,
			// merging the global default option with the theme default options
			if( $.pandalocker.themes[theme] ) {
				defaults = $.extend(true, {}, defaults, $.pandalocker.themes[theme]);
			}

			// now merges with the options specified by a user
			var options = $.extend(true, defaults, this.options);

			// normalizes options

			if( $.isArray(options.groups) ) {
				options.groups = $.extend(true, {}, defaults.groups, {order: options.groups});
			}

			options.locker.timer = parseInt(options.locker.timer);
			if( options.locker.timer === 0 ) {
				options.locker.timer = null;
			}

			this.options = this.applyFilters('filter-options', options, [], true);

			// ie 10-11 fix (they doesn't support the blur filter)
			if( 'blurring' === this.options.overlap.mode && !$.pandalocker.tools.supportBlurring() ) {
				this.options.overlap.mode = this.options.overlap.altMode;
			}
		}
		,

		/**
		 * Sets variables used in various parts of the plugin code.
		 */
		_setupVariables: function() {

			// the css class of the theme
			this.style = "onp-sl-" + this.options.theme.name;

			// should we use one of advanced overlay modes?
			this.overlap = ( this.options.overlap.mode === 'full' ) ? false : this.options.overlap.mode;

			// groups union
			this.groupUnion = this.options.groups.union;

			// the default namespace of language resources
			// detects which the group is primary and select situable lables

			if( this.options.groups.order.length > 0 ) {

				switch( this.options.groups.order[0] ) {
					case 'connect-buttons':
						this.lockerType = 'signin-locker';
						this.langScope = 'signinLocker';
						break;
					case 'subscription':
						this.lockerType = 'email-locker';
						this.langScope = 'emailLocker';
						break;
					default:
						this.lockerType = 'social-locker';
						this.langScope = 'socialLocker';
						break;
				}
			}

			// stores the lang resources for the current lang scope
			this.lang = $.pandalocker.lang.scopes[this.langScope];
		}
		,

		/**
		 * Inits extras.
		 */
		_initExtras: function() {

			for( var i in $.pandalocker.extras ) {
				if( !$.pandalocker.extras.hasOwnProperty(i) ) {
					continue;
				}
				if( !$.pandalocker.extras[i].init ) {
					continue;
				}

				$.pandalocker.extras[i].init.apply(this);
			}
		}
		,

		/**
		 * Inits extras.
		 */
		_initHooks: function() {
			var self = this;

			var intercationAccounted = false;
			var errorAccounted = false;
			var socialAppDeclineAccounted = false;
			var getImpress = false;

			this.addHook('raw-interaction', function() {
				if( !getImpress ) {
					return;
				}

				if( intercationAccounted ) {
					return;
				}
				intercationAccounted = true;
				self.runHook('interaction');
			});

			this.addHook('raw-error', function() {
				if( !getImpress ) {
					return;
				}

				if( errorAccounted ) {
					return;
				}
				errorAccounted = true;
				self.runHook('error');
			});

			this.addHook('raw-impress', function() {
				if( self._currentScreenName !== 'default' ) {
					return;
				}
				getImpress = true;
				self.runHook('impress');
			});

			this.addHook('raw-social-app-declined', function() {
				if( !getImpress ) {
					return;
				}

				if( socialAppDeclineAccounted ) {
					return;
				}
				socialAppDeclineAccounted = true;
				self.runHook('social-app-declined');
			});
		}
		,

		/**
		 * Inits control groups.
		 */
		_initGroups: function() {
			this._groups = [];

			for( var i = 0; i < this.options.groups.order.length; i++ ) {
				var groupName = this.options.groups.order[i];

				var optionsName = $.pandalocker.tools.camelCase(groupName);
				var groupOptions = this.options[optionsName] || {};

				if( i == 0 ) {
					groupOptions.text = this.options.text;
				}

				if( !$.pandalocker.groups[groupName] ) {
					this._showError('core', 'The control group "' + groupName + '" not found.');
					return;
				}

				var group = $.pandalocker.tools.extend($.pandalocker.groups[groupName]);

				var groupIndex = this.applyFilters('filter-init-group-index', parseInt(i), [group], true);

				if( groupIndex == 0 ) {
					groupOptions.text = this.options.text;
				}

				groupOptions.index = groupIndex + 1;
				groupOptions = this.applyFilters('filter-init-group-options', groupOptions, [
					parseInt(i),
					group
				], true);

				group.init(this, groupOptions);

				this._groups[i] = group;
			}
		}
		,

		/**
		 * Setups an unique visitor id.
		 */
		_setupVisitorId: function() {

			this.vid = $.pandalocker.tools.getValue("opanda_vid");
			if( !this.vid ) {
				this.vid = $.pandalocker.tools.guid();
				$.pandalocker.tools.saveValue("opanda_vid", this.vid, 365);
			}
		}
		,

		/**
		 * Checks if the content should be locked or not.
		 * Some options can forbid to lock content for a given user.
		 *
		 * @since 4.0.0
		 */
		_canLock: function() {

			// don't show a locker in ie7
			if( $.pandalocker.browser.msie && parseInt($.pandalocker.browser.version, 10) === 7 ) {
				this._unlock("ie7");
				return false;
			}

			// checks the visability options
			if( this.options.locker.visibility ) {
				var checker = new $.pandalocker.services.visibility();
				if( !checker.canLock(this.options.locker.visibility) ) {
					this._unlock("visibility");
					return false;
				}
			}

			// check mobile devices
			if( !this.options.locker.mobile && $.pandalocker.tools.isMobile() ) {
				this._unlock("mobile");
				return false;
			}

			// check in-app browsers
			if( !this.options.locker.inAppBrowsers === 'hidden' && $.pandalocker.tools.isInAppBrowser() ) {
				this._unlock("inapp");
				return false;
			}

			// checks if the groups containing buttons can be used
			// to lock, e.g. the group may have no buttons to use,
			// then it's not possible to use this group

			var invalidGroups = 0;

			for( var i = 0; i < this._groups.length; i++ ) {
				if( this._groups[i].canLock() ) {
					continue;
				}

				if( 'or' === this.groupUnion ) {
					this._unlock("group");
					return false;
				} else {
					invalidGroups++;
				}
			}

			if( invalidGroups === this._groups.length ) {
				this._unlock("group");
				return false;
			}

			return true;
		}
		,

		/**
		 * Requests the state of a locker.
		 */
		requestState: function(callback) {
			var self = this;

			// the default state-checking function,
			// which is run always the last

			var defaultFunction = function(localCallback) {

				var groupsCount = self._groups.length;
				var currentState = 'locked';

				for( var i = 0; i < self._groups.length; i++ ) {
					self._groups[i].requestState(function(state) {
						groupsCount--;
						if( 'unlocked' === state ) {
							currentState = state;
						}
						if( groupsCount <= 0 ) {
							localCallback(currentState);
						}
					});
				}
			};

			var checkFunctions = [];
			checkFunctions = this.applyFilters('functions-requesting-state', checkFunctions, [], true);

			checkFunctions.push(defaultFunction);

			var runNextCheckFunction = function() {

				var check = checkFunctions.shift();
				if( !check ) {
					return callback('locked');
				}

				check(function(state) {

					// if the function returned one of the states, breaks the loop
					if( state === 'unlocked' ) {
						return callback(state);
					}

					// else call the next check function
					runNextCheckFunction();
				});
			};

			runNextCheckFunction();
		}
		,

		/**
		 * Seta a given state.
		 *
		 * @argument {string} sate A state (locked, unlocked).
		 * @argument {string} senderType A sender type (e.g. button, group).
		 * @argument {string} senderName A sender name (e.g. facebook-like).
		 */
		setState: function(state, senderType, senderName) {

			// notifies about changing the state
			this.runHook('state-changed', [state, senderType, senderName]);
		}
		,

		/**
		 * Returns a state storge.
		 */
		_getStateStorage: function() {
			if( this._stateStorage ) {
				return this._stateStorage;
			}
			this._stateStorage = this.applyFilters('get-default-state-storage', new $.pandalocker.storages.defaultStateStorage(this));
			return this._stateStorage;
		}
		,

		/**
		 * Sets an error state.
		 */
		_showError: function(sender, text) {
			this._error = true;
			this._errorText = text;

			this.locker && this.locker.hide();

			this.element.html("<strong>[Error]: " + text + "</strong>");
			this.element.show().addClass("onp-sl-locker-error");

			this.runHook('size-changed');
		}
		,

		// --------------------------------------------------------------------------------------
		// Hooks & Filters
		// --------------------------------------------------------------------------------------

		/**
		 * Subscribes to the specified hook.
		 */
		addHook: function(eventName, callback, priority, global) {
			$.pandalocker.hooks.add(this.id + '.' + eventName, callback, priority);
			if( global ) {
				$.pandalocker.hooks.add('opanda-' + eventName, callback, priority);
			}
		}
		,

		/**
		 * Runs the specified hook.
		 */
		runHook: function(eventName, args, global) {
			if( !args ) {
				args = [];
			}
			args.unshift(this);

			// filters api
			$.pandalocker.hooks.run(this.id + '.' + eventName, args);
			if( global ) {
				$.pandalocker.hooks.run(eventName, args);
			}

			// jquery api
			this.element.trigger('opanda-' + eventName, args);

			// global api
			var globalArgs = args.slice();

			var identity = {};
			identity.lockId = this.id;
			identity.visitorId = this.vid;
			identity.locker = this.locker;
			identity.content = this.element;
			globalArgs.unshift(identity);

			$.pandalocker.hooks.run('opanda-' + eventName, globalArgs);
		}
		,

		/**
		 * Subscribes to the specified hook.
		 */
		addFilter: function(eventName, callback, priority, global) {
			$.pandalocker.filters.add(this.id + '.' + eventName, callback, priority);
		}
		,

		/**
		 * Runs the specified hook.
		 */
		applyFilters: function(eventName, input, args, global) {
			if( !args ) {
				args = [];
			}
			if( !$.isArray(args) ) {
				args = [args];
			}

			args.unshift(this);
			args.unshift(input);

			// filters api
			var result = $.pandalocker.filters.run(this.id + '.' + eventName, args);
			args[0] = result;

			if( global ) {
				result = $.pandalocker.filters.run('opanda-' + eventName, args);
			}
			return result;
		}
		,

		// --------------------------------------------------------------
		// Screens
		// --------------------------------------------------------------

		/**
		 * Stores HTML markup of the screens.
		 */
		screens: {}
		,

		/**
		 * Stores factories of the screens.
		 */
		_screenFactory: {}
		,

		/**
		 * Shows the screen.
		 */
		_showScreen: function(screenName, options) {

			// if the screen has not been registered, fires an exception
			if( !this._screenFactory[screenName] && !this.screens[screenName] ) {
				throw new $.pandalocker.error('The screen "' + screenName + '" not found in the group "' + this.name + '"');
			}

			var self = this;
			this._currentScreenName = screenName;

			// shows a screen if it was already created
			this.innerWrap.find('.onp-sl-screen').hide();

			if( this.screens[screenName] ) {
				this.screens[screenName].show();
				self.runHook('size-changed');
				return;
			}

			// if not, then creates via the screen factory
			var screen = $("<div class='onp-sl-screen onp-sl-non-default-screen onp-sl-screen-" + screenName + "'></div>").appendTo(this.innerWrap).hide();
			this.screens[screenName] = this._screenFactory[screenName](screen, options);
			screen.fadeIn(300, function() {
				self.runHook('size-changed');
			});
		},

		/**
		 * Registers a new screen.
		 */
		_registerScreen: function(screenName, factory) {
			this._screenFactory[screenName] = factory;
		},

		_initScreens: function() {
			var self = this;
			this._currentScreenName = 'default';

			// SCREEN: Enter Email

			this._registerScreen('enter-email',
				function($holder, options) {

					var $text = $('<div class="onp-sl-text"></div>');
					$holder.append($text);

					if( options.header ) {
						var $header = $('<div class="onp-sl-header onp-sl-strong">' + options.header + '</div>');
						$text.append($header);
					}

					if( options.message ) {
						var $message = $('<div class="onp-sl-message">' + options.message + '</div>');
						$text.append($message);
					}

					var $controlWrap = $('<div class="onp-sl-control"></div>');
					$holder.append($controlWrap);

					var fields = {};

					fields['email'] = {
						name: 'email',
						type: 'text',
						placeholder: $.pandalocker.lang.misc_enter_your_email
					};
					fields['submit'] = {
						name: 'submit',
						type: 'submit',
						title: options.buttonTitle
					};

					for( var name in fields ) {
						var type = fields[name].type;
						var title = fields[name].title;

						var value = fields[name].value || ( options.fields && options.fields[name] && options.fields[name].value );

						var $wrap = $("<div></div>")
							.addClass('onp-sl-field')
							.addClass('onp-sl-field-' + name)
							.addClass('onp-sl-field-type-' + type);

						if( 'text' === type || 'email' === type ) {

							var $field = $("<input type='" + type + "' name='" + name + "' class='onp-sl-input' id='onp-sl-input-" + name + "' />");
							if( fields[name].placeholder ) {
								$field.attr('placeholder', fields[name].placeholder);
							}
							if( value ) {
								$field.attr('value', value);
							}

							$field.appendTo($wrap);
						}

						if( 'submit' === type ) {
							var $field = $("<button class='onp-sl-button onp-sl-form-button onp-sl-submit'>" + title + "</button>");
							$field.addClass('onp-sl-button-primary');
							$field.appendTo($wrap);
						}

						$wrap.appendTo($controlWrap);
					}

					if( options.note ) {
						var $note = $("<div class='onp-sl-note onp-sl-nospam'></div>").html(options.note);
						$note.appendTo($wrap);
					}

					$holder.find('.onp-sl-submit').click(function() {

						var showNotice = function(text, expires) {

							$holder.find('.onp-sl-group-notice').remove();

							var $notice = $("<div class='onp-sl-group-notice'>" + text + "</div>").hide();
							$holder.append($notice);
							$notice.fadeIn(500);

							if( !expires ) {
								expires = 7000;
							}
							setTimeout(function() {
								if( !$notice.length ) {
									return;
								}
								$notice.fadeOut(800, function() {
									$notice.remove();
								});
							}, expires);
						};

						var $button = $(this);
						var email = $.trim($holder.find('#onp-sl-input-email').val());

						if( !email || !email.length ) {
							showNotice($.pandalocker.lang.errors_empty_email);
							return;
						} else if( !$.pandalocker.tools.isValidEmailAddress(email) ) {
							showNotice($.pandalocker.lang.errors_inorrect_email);
							return;
						}

						if( options.callback ) {
							options.callback(email);
						}
					});
				}
			);

			// SCREEN: Data Processing

			this._registerScreen('data-processing',
				function($holder, options) {

					$holder.append($("<div class='onp-sl-process-spin'></div>"));
					$holder.append($("<div class='onp-sl-processing-sreen-text'>" + ( options && options.screenText || $.pandalocker.lang.misc_data_processing ) + "</div>"));
				}
			);

			// SCREEN: Email Confirmation

			this._registerScreen('email-confirmation',
				function($holder, options) {

					// shows the message

					var $message = $('<div class="onp-sl-screen-message"></div>');

					var $strong = $("<div class='onp-sl-header'></div>").html($.pandalocker.lang.confirm_screen_title);
					var $text = $("<div class='onp-sl-message'></div>");

					var $line1 = $('<p></p>').html($.pandalocker.lang.confirm_screen_instructiont.replace('{email}', '<strong>' + options.email + '</strong>' + ' <a href="#" class="onp-sl-cancel">' + $.pandalocker.lang.confirm_screen_cancel + '</a>'));
					var $line2 = $('<p class="onp-sl-highlight"></p>').html($.pandalocker.lang.confirm_screen_note1);
					var $line3 = $('<p class="onp-sl-note"></p>').html($.pandalocker.lang.confirm_screen_note2);

					var $cancel = $line1.find('.onp-sl-cancel');
					$cancel.click(function() {
						options.service.cancel();
						self._showScreen('default');
						return false;
					});

					$text.append($line1);
					$text.append($line2);

					$message.append($strong);
					$message.append($text);

					$holder.append($message);

					// show the button 'Check Email Box'

					var emailParts = options.email.split('@');
					var emailService = null;

					if( emailParts[1].indexOf("gmail") >= 0 ) {
						emailService = {
							url: 'https://mail.google.com/mail/?tab=wm',
							icon: '0px 0px',
							title: 'Gmail'
						};
					} else if( emailParts[1].indexOf("yahoo") >= 0 ) {
						emailService = {
							url: 'https://mail.yahoo.com/',
							icon: '0px -70px',
							title: 'Yahoo!'
						};
					} else if( emailParts[1].indexOf("hotmail") >= 0 ) {
						emailService = {
							url: 'https://hotmail.com/',
							icon: ' 0px -140px',
							title: 'Hotmail'
						};
					} else if( emailParts[1].indexOf("outlook") >= 0 ) {
						emailService = {
							url: 'http://www.outlook.com/',
							icon: ' 0px -140px',
							title: 'Outlook'
						};
					}

					if( emailService ) {
						var $checkEmail = $('<a class="onp-sl-button onp-sl-form-button onp-sl-form-button-sm onp-sl-open"></a>').html($.pandalocker.lang.confirm_screen_open.replace('{service}', emailService.title));
						$checkEmail.attr('href', emailService.url);
						$checkEmail.attr('target', '_blank');

						if( emailService.icon ) {
							$checkEmail.addClass('onp-sl-has-icon');
							var $icon = $('<i class="onp-sl-icon"></i>').prependTo($checkEmail);
							$icon.css('background-position', emailService.icon);
						}

						var $checkEmailWrap = $("<div class='onp-sl-open-button-wrap'></div>");
						$checkEmailWrap.append($checkEmail);

						$holder.append($checkEmailWrap);
					}

					$holder.append($line3);
				}
			);
		}
		,

		// --------------------------------------------------------------------------------------
		// Lock/Unlock content.
		// --------------------------------------------------------------------------------------

		_lock: function(sender) {
			var self = this;

			if( this._isLocked ) {
				return;
			}

			var lockMethod = function() {

				if( self._isLocked ) {
					return;
				}

				if( !self._markupIsCreated ) {
					self._createMarkup();
				}

				self.runHook('before-lock');

				if( !self.overlap ) {

					self.element.hide();
					self.locker.fadeIn(1000);

				} else {

					self.overlapLockerBox.fadeIn(1000, function() {
						self._updateLockerPosition();
					});
					self._updateLockerPosition();
				}

				self._isLocked = true;

				self.runHook('lock');
				self.runHook('locked');

				setTimeout(function() {
					self._startTrackVisability();
				}, 1500);
			}

			// if there is a delay for displaying the locker after loading a page
			var delay = parseInt(this.options.locker.delay || this.options.locker.showDelay);

			// converts seconds to miliseconds
			if( delay < 500 ) {
				delay = delay * 1000;
			}

			if( delay ) {
				setTimeout(function() {
					lockMethod();
				}, delay);
			} else {
				lockMethod();
			}
		},

		_unlock: function(sender, sernderName, value) {
			var self = this;

			// returns if we have turned off the locker
			if( this.options.locker.off ) {
				return;
			}

			this.runHook('before-unlock', [sender, sernderName, value]);

			if( !this._isLocked ) {
				this.runHook('cancel', [sender]);
				this._showContent(sender === "button");
				return false;
			}

			this._showContent(true);
			this._isLocked = false;

			this.runHook('unlock', [sender, sernderName, value]);
			this.runHook('unlocked', [sender, sernderName, value]);
		},

		lock: function(sender) {
			this._lock(sender || "api");
		},

		unlock: function(sender, sernderName, value) {
			this._unlock(sender || "api", sernderName, value);
		},

		// --------------------------------------------------------------------------------------
		// Markups and others.
		// --------------------------------------------------------------------------------------

		/**
		 * Creates the plugin markup.
		 */
		_createMarkup: function() {
			var self = this;

			this._loadFonts();

			var element = (this.element.parent().is('a')) ? this.element.parent() : this.element;
			element.addClass("onp-sl-content");

			var browser = ($.pandalocker.browser.mozilla && 'mozilla') ||
				($.pandalocker.browser.opera && 'opera') ||
				($.pandalocker.browser.webkit && 'webkit') || 'msie';

			this.locker = $("<div class='onp-sl onp-sl-" + browser + "'></div>");
			this.outerWrap = $("<div class='onp-sl-outer-wrap'></div>").appendTo(this.locker);
			this.innerWrap = $("<div class='onp-sl-inner-wrap'></div>").appendTo(this.outerWrap);

			var screen = $("<div class='onp-sl-screen onp-sl-screen-default'></div>").appendTo(this.innerWrap);
			this.screens['default'] = this.defaultScreen = screen;

			this.locker.addClass(this.style);
			this.locker.addClass('onp-sl-' + this.lockerType);
			this.locker.addClass('onp-sl-' + this.options.groups.order[0] + '-frist');

			this.locker.addClass(this.options.groups.order.length === 1
				? 'onp-sl-contains-single-group'
				: 'onp-sl-contains-many-groups');

			for( var index = 0; index < this.options.groups.order.length; index++ ) {
				this.locker.addClass('onp-sl-' + this.options.groups.order[index] + '-enabled');
			}

			$.pandalocker.isTouch()
				? this.locker.addClass('onp-sl-touch')
				: this.locker.addClass('onp-sl-no-touch');

			if( this.options.cssClass ) {
				this.locker.addClass(this.options.cssClass);
			}

			// - classic mode
			// when we use the classic mode, we just set the display property of the locked content
			// to "none", then add the locker after the locked content.
			if( !this.overlap ) {

				this.locker.hide();
				this.locker.insertAfter(element);

				// - overlap mode
				// when we use the overlap mode, we put the locker inside the locked content,
				// then set the locker position to "absolute" and postion to "0px 0px 0px 0px".
			} else {

				element.addClass("onp-sl-overlap-mode");

				var displayProp = this.element.css("display");

				// creating content wrap if it's needed
				var $containerToTrackSize = element;
				if(
					this.overlap === 'blurring' ||
					element.is("img") || element.is("iframe") || element.is("object") ||
					( displayProp !== "block" && displayProp !== "inline-block" ) ) {

					$containerToTrackSize = $('<div class="onp-sl-content-wrap"></div>')
					$containerToTrackSize.insertAfter(element);
					$containerToTrackSize.append(element);

					var originalMargin = element.css('margin');
					$containerToTrackSize.css({'margin': originalMargin});
					element.css({'margin': '0'});

					self.addHook('unlock', function() {
						$containerToTrackSize.css({'margin': originalMargin});
					});
				}

				element.show();
				this.element.show();

				// creating another content which will be blurred
				if( this.overlap === 'blurring' ) {
					this.blurArea = $("<div class='onp-sl-blur-area'></div>");
					this.blurArea.insertAfter(element);
					this.blurArea.append(element);
					element = this.blurArea;
				}

				var positionProp = $containerToTrackSize.css("position");
				if( positionProp === 'static' ) {
					$containerToTrackSize.css("position", 'relative');
				}

				var innerFrame = ( element.is("iframe") && element ) || element.find("iframe");
				if( innerFrame.length === 1 && innerFrame.css('position') === 'absolute' ) {

					var skip = ( !element.is(innerFrame) && !innerFrame.parent().is(element) && innerFrame.parent().css('position') === 'relative' );
					if( !skip ) {

						$containerToTrackSize.css({
							'position': 'absolute',
							'width': '100%',
							'height': '100%',
							'top': innerFrame.css('top'),
							'left': innerFrame.css('left'),
							'right': innerFrame.css('right'),
							'bottom': innerFrame.css('bottom'),
							'margin': innerFrame.css('margin')
						});

						innerFrame.css({
							'top': 0,
							'left': 0,
							'right': 0,
							'bottom': 0,
							'margin': 'auto'
						});
					}
				}

				// creating other markup for the overlap
				this.overlapLockerBox = $("<div class='onp-sl-overlap-locker-box'></div>").hide();
				this.overlapLockerBox.addClass('onp-sl-position-' + this.options.overlap.position);
				this.overlapLockerBox.append(this.locker);

				this.overlapBox = $("<div class='onp-sl-overlap-box'></div>").hide();

				this.overlapBox.append(this.overlapLockerBox);
				this.overlapBox.addClass("onp-sl-" + this.overlap + "-mode");
				this.overlapBox.addClass(this.style + "-theme");

				if( this.options.cssClass ) {
					this.overlapBox.addClass(this.options.cssClass);
				}

				var $overlapBackground = $("<div class='onp-sl-overlap-background'></div>");
				this.overlapBox.append($overlapBackground);

				$containerToTrackSize.append(this.overlapBox);
				this.containerToTrackSize = $containerToTrackSize;

				this.overlapBox.fadeIn(1000);

				if( this.overlap === 'blurring' ) {

					var intensity = ( this.options.overlap && this.options.overlap.intensity ) || 5;
					this.blurArea = this.blurArea.Vague({
						intensity: intensity,
						forceSVGUrl: false
					});
					this.blurArea.blur();
				}

				$(window).resize(function() {
					self._updateLockerPosition();
				});

				this.addHook('size-changed', function() {
					self._updateLockerPosition();
				});

				if( this.options.overlap.position === 'scroll' ) {
					$(window).scroll(function() {
						self._updateLockerPositionOnScrolling();
					});
				}
			}

			this._markupIsCreated = true;
			this.runHook('markup-created');

			// tracks interactions, we need these hooks to track how
			// many users interacted with the locker any way

			this.locker.click(function() {
				self.runHook('raw-interaction');
			});

			this._isLockerVisible = this.locker.parent().is(":visible");
			if( !this._isLockerVisible ) {
				this.options.lazy = true;
			}

			// locked created here, now we can create other elements

			// creates markup for buttons
			for( var i = 0; i < this._groups.length; i++ ) {

				screen = this.applyFilters('before-render-group-filter', screen, [
					i,
					this._groups,
					this._groups[i].name,
					this.screens
				], true);

				this._groups[i].renderGroup(screen);

				this.runHook('after-render-group', [i, this._groups[i]], true);

			}

			// Terms & Conditions and Privacy Policy
			if( this.options.terms || this.options.privacyPolicy ) {
				this._createTerms();
			}

			// close button and timer if needed
			this.options.locker.close && this._createClosingCross();
			this.options.locker.timer && this._createTimer();

			// check in-app browsers
			if( this.options.locker.inAppBrowsers === 'visible_with_warning' && this.options.locker.inAppBrowsersWarning && $.pandalocker.tools.isInAppBrowser() ) {
				var warningText = this.options.locker.inAppBrowsersWarning;
				warningText = warningText.replace("{browser}", "<strong>" + $.pandalocker.tools.getInAppBrowser() + "</strong>");
				var $notice = $("<div class='onp-sl-group-notice'>" + warningText + "</div>");
				screen.find(".onp-sl-group").append($notice);
			}

			/**
			 var serviceOptions = {
                id: self.id,
                proxy: self.options.proxy,
                name: self.options.subscribeActionOptions.name,
                listId: self.options.subscribeActionOptions.listId,
                service: self.options.subscribeActionOptions.service,
                doubleOptin: self.options.subscribeActionOptions.doubleOptin,
                confirm: self.options.subscribeActionOptions.confirm,
                requireName: self.options.subscribeActionOptions.requireName
            };

			 var service = new $.pandalocker.services.subscription( serviceOptions );

			 this._showScreen('email-confirmation', {
                email: 'fff',
                service: service
            }); */
		}
		,

		/**
		 * Adds a CSS class.
		 */
		_addClass: function(className) {
			this.locker.addClass(className);
		}
		,

		/**
		 * Loads fonts if needed.
		 */
		_loadFonts: function() {
			if( !this.options.theme.fonts || !this.options.theme.fonts.length ) {
				return;
			}

			var protocol = (("https:" === document.location.protocol) ? "https" : "http");
			var base = protocol + '://fonts.googleapis.com/css';

			for( var i = 0; i < this.options.theme.fonts.length; i++ ) {
				var fontData = this.options.theme.fonts[i];

				var family = fontData.name;
				if( fontData.styles && fontData.styles.length ) {
					family = family + ":" + fontData.styles.join(",");
				}

				var url = $.pandalocker.tools.updateQueryStringParameter(base, 'family', family);

				if( fontData.subset && fontData.subset.length ) {
					url = $.pandalocker.tools.updateQueryStringParameter(url, 'subset', fontData.subset.join(","));
				}

				var hash = $.pandalocker.tools.hash(url);
				if( $("#onp-sl-font-" + hash).length > 0 ) {
					continue;
				}

				$('<link id="onp-sl-font-' + hash + '" rel="stylesheet" type="text/css" href="' + url + '" >').appendTo("head");
			}
		}
		,

		/**
		 * Updates the locker position for various overlap modes.
		 */
		_updateLockerPosition: function() {
			if( !this.overlap ) {
				return;
			}

			var self = this;

			// updates the content size if the locker is bigger then the content
			var contentHeight = this.containerToTrackSize.outerHeight();

			if( typeof this.contentMinTopMargin == "undefined" ) {
				this.contentMinTopMargin = parseInt(this.containerToTrackSize.css('marginTop'));
			}

			if( typeof this.contentMinBottomMargin == "undefined" ) {
				this.contentMinBottomMargin = parseInt(this.containerToTrackSize.css('marginBottom'));
			}

			var lockerHeight = this.locker.outerHeight();

			if( contentHeight < lockerHeight ) {

				var value = parseInt(( lockerHeight - contentHeight ) / 2) + 20;
				var topMargin = this.contentMinTopMargin < value ? value : this.contentMinTopMargin;
				var bottomMargin = this.contentMinBottomMargin < value ? value : this.contentMinBottomMargin;

				this.containerToTrackSize.css({
					'marginTop': topMargin + "px",
					'marginBottom': bottomMargin + "px"
				});
			}

			// updates the locker position

			if( this.options.overlap.position === 'top' || this.options.overlap.position === 'scroll' ) {

				var boxWidth = this.overlapBox.outerWidth(),
					lockerWidth = this.locker.outerWidth(),
					boxHeight = this.overlapBox.outerHeight(),
					offset = this.options.overlap.offset;

				if( !offset ) {
					offset = Math.floor(( boxWidth - lockerWidth ) / 2);

					if( offset <= 10 ) {
						offset = 10;
					}
				}

				if( offset * 2 + lockerHeight > boxHeight ) {
					offset = Math.floor(( boxHeight - lockerHeight ) / 2);
				}

				this.overlapLockerBox.css('marginTop', offset + 'px');

				if( this.options.overlap.position === 'scroll' ) {
					this._baseOffset = offset;

					this._updateLockerPositionOnScrolling(function(position, offset) {
						if( position === 'middle-scroll' ) {
							var lockerOffset = parseInt(self.overlapLockerBox.css('top'));
							if( lockerOffset === 0 ) {
								self.overlapLockerBox.css('top', offset);
							}
						}
					});
				}
			}

			if( this.options.overlap.position === 'middle' ) {
				this.overlapLockerBox.css('marginTop', '-' + Math.floor(this.overlapLockerBox.innerHeight() / 2) + 'px');
				return;
			}
		}
		,

		/**
		 * Updates the locker position on scrolling.
		 */
		_updateLockerPositionOnScrolling: function(callback) {
			var self = this;

			var boxOffset = this.overlapBox.offset();
			var contentTopBorder = boxOffset.top;
			var contentLeftBorder = boxOffset.left;
			var contentBottomBorder = boxOffset.top + this.overlapBox.outerHeight();

			var boxWidth = this.overlapBox.outerWidth();

			var boxHeight = this.overlapBox.outerHeight();
			var lockerHeight = this.locker.outerHeight();

			if( this._baseOffset * 2 + lockerHeight + 10 >= boxHeight ) {
				return;
			}

			var scrollTop = $(document).scrollTop();
			var shift = 20;

			if( scrollTop + shift * 2 > contentTopBorder && (scrollTop - shift * 2 + $(window).height()) < contentBottomBorder ) {

				var newOffset = Math.floor(($(window).height() / 2) - (lockerHeight / 2));

				callback && callback('middle-scroll', newOffset);

				var lockerOffset = parseInt(this.overlapLockerBox.css('top'));

				this.overlapLockerBox
					.css('position', 'fixed')
					.css('left', contentLeftBorder + 'px')
					.css('width', boxWidth + 'px')
					.css('bottom', 'auto')
					.css('margin-top', '0px');

				if( lockerOffset != newOffset ) {
					if( !this._animateBusy ) {
						this._animateBusy = true;
						this.overlapLockerBox.animate({
							top: newOffset + 'px'
						}, 150, function() {
							self._animateBusy = false;
						});
					}
				}
				return
			}

			if( scrollTop + lockerHeight + this._baseOffset * 2 + shift > contentBottomBorder ) {
				this.overlapLockerBox
					.css('position', 'absolute')
					.css('top', 'auto')
					.css('left', '0px')
					.css('width', 'auto')
					.css('bottom', this._baseOffset + 'px')
					.css('margin-top', '0px');

				return;
			}

			if( scrollTop + shift > contentTopBorder ) {
				this.overlapLockerBox
					.css('position', 'fixed')
					.css('top', this._baseOffset + shift + 'px')
					.css('left', contentLeftBorder + 'px')
					.css('width', boxWidth + 'px')
					.css('bottom', 'auto')
					.css('margin-top', '0px');

				return;
			}

			this.overlapLockerBox
				.css('position', 'absolute')
				.css('top', '0px')
				.css('left', '0px')
				.css('bottom', 'auto')
				.css('width', 'auto')
				.css('margin-top', this._baseOffset + 'px');
		}
		,

		/**
		 * Fires the hook when the locker gets visible in the current viewport.
		 */
		_startTrackVisability: function() {
			var self = this;
			var el = this.locker[0];

			this._trackVisabilityStoppped = false;

			if( !el.getBoundingClientRect ) {
				this.runHook('raw-impress');
			}

			var windowHeight = $(window).height();
			var windowWidth = $(window).width();

			var checkVisability = function() {

				if( self._trackVisabilityStoppped ) {
					return;
				}

				if( !el ) {
					self._stopTrackVisability();
					return;
				}

				var rect = el.getBoundingClientRect();

				var heightHalf = rect.height / 2;
				var windowHalf = rect.width / 2;

				// if we can see a half of the locker in the current view post, notify about that
				if( rect.top + heightHalf > 0 && rect.bottom - heightHalf <= windowHeight &&
					rect.left + windowHalf && rect.right - windowHalf <= windowWidth ) {

					self.runHook('raw-impress');
					self._stopTrackVisability();
				}
			};

			$(window).bind('resize.visability.opanda', function() {

				if( self._trackVisabilityStoppped ) {
					return;
				}

				windowHeight = $(window).height();
				windowWidth = $(window).width();
			});

			$(window).bind('resize.visability.opanda scroll.visability.opanda', function() {

				if( self._trackVisabilityStoppped ) {
					return;
				}

				checkVisability();
			});

			// if the locker is not visible, binds to click events to catch
			// the moment when it gets visible

			if( !this._isLockerVisible ) {

				$("a, button").add($(document)).bind('click.visability.opanda', function() {

					if( self._trackVisabilityStoppped ) {
						return;
					}

					setTimeout(function() {
						checkVisability();
					}, 200);
				});

				this.addHook('raw-impress', function() {

					self._isLockerVisible = true;
					self._trackVisabilityStoppped = true;
					// $("a, button").add($(document)).unbind('click.visability.opanda');
				});
			}

			checkVisability();
		},

		_stopTrackVisability: function() {

			this._trackVisabilityStoppped = true;
			//$(window).unbind('.visability.opanda');
		},

		// --------------------------------------------------------------------------------------
		// Close Cross
		// --------------------------------------------------------------------------------------

		/**
		 * Creates the markup for the close icon.
		 */
		_createClosingCross: function() {
			var self = this;

			var createMethod = function() {

				$("<div class='onp-sl-cross' title='" + $.pandalocker.lang.misc_close + "' />")
					.prependTo(self.locker)
					.click(function() {
						if( !self.close || !self.close(self) ) {
							self._unlock("cross", true);
						}
					});
			};

			var delay = parseInt(this.options.locker.showDelay || this.options.locker.showCloseButtonDelay);
			if( delay < 500 ) {
				delay = delay * 1000;
			}

			if( delay ) {

				setTimeout(function() {
					createMethod();
				}, delay);

			} else {
				createMethod();
			}
		},

		// --------------------------------------------------------------------------------------
		// Timer
		// --------------------------------------------------------------------------------------

		/**
		 * Creates the markup for the timer.
		 */
		_createTimer: function() {

			this.timer = $("<span class='onp-sl-timer'></span>");
			var timerLabelText = $.pandalocker.lang.misc_or_wait;

			timerLabelText = timerLabelText.replace('{timer}', $("<span class='onp-sl-timer-counter'>" + this.options.locker.timer + "</span>")[0].outerHTML);

			this.timerLabel = $("<span class='onp-sl-timer-label'></span>").html(timerLabelText).appendTo(this.timer);
			this.timerCounter = this.timerLabel.find('.onp-sl-timer-counter');

			this.timer.appendTo(this.locker);

			this.counter = this.options.locker.timer;
			this._kickTimer();
		}
		,

		/**
		 * Executes one timer step.
		 */
		_kickTimer: function() {
			var self = this;

			setTimeout(function() {

				if( !self._isLocked ) {
					return;
				}

				self.counter--;
				if( self.counter <= 0 ) {
					self._unlock("timer");
				} else {
					self.timerCounter.text(self.counter);

					// Opera fix.
					if( $.pandalocker.browser.opera ) {
						var box = self.timerCounter.clone();
						box.insertAfter(self.timerCounter);
						self.timerCounter.remove();
						self.timerCounter = box;
					}

					self._kickTimer();
				}
			}, 1000);
		}
		,

		// --------------------------------------------------------------------------------------
		// Terms & Conditions / Privacy Policy
		// --------------------------------------------------------------------------------------

		_createTerms: function() {
			this.locker.addClass('onp-sl-has-terms');

			this.terms = $("<div class='onp-sl-terms'></div>").appendTo(this.defaultScreen);
			this.termsInnerWrap = $("<div class='onp-sl-terms-inner-wrap'></div>").appendTo(this.terms);

			var text = $.pandalocker.lang.misc_your_agree_with;
			var links = '';

			if( this.options.terms ) {

				links = $("<a target='_black' class='onp-sl-link'>" + $.pandalocker.lang.misc_terms_of_use + "</a>")
					.attr('href', this.options.terms)[0].outerHTML;
			}

			if( this.options.privacyPolicy ) {

				if( this.options.terms ) {
					links = links + ", ";
				}
				links = links + $("<a target='_black' class='onp-sl-link'>" + $.pandalocker.lang.misc_privacy_policy + "</a>")
					.attr('href', this.options.privacyPolicy)[0].outerHTML;
			}

			if( links ) {
				text = text.replace('{links}', links);
			}
			this.termsInnerWrap.html(text);

			if( this.options.termsPopup ) {
				var popupWidth = this.options.termsPopup.width || 550;
				var popupHeight = this.options.termsPopup.height || 400;

				this.termsInnerWrap.find('.onp-sl-link').click(function() {
					var url = $(this).attr('href');
					window.open(url, 'bizpanda_policies', "width=" + popupWidth + ",height=" + popupHeight + ",resizable=yes,scrollbars=yes");
					return false;
				});
			}
		}
		,

		// --------------------------------------------------------------------------------------
		// Displaying content
		// --------------------------------------------------------------------------------------

		_showContent: function(useEffects) {
			var self = this;

			this.runHook('before-show-content');

			var effectFunction = function() {

				if( self.overlap ) {
					if( self.overlapBox ) {
						self.overlapBox.hide();
					}
					if( self.blurArea ) {
						self.blurArea.unblur();
					}
				} else {
					if( self.locker ) {
						self.locker.hide();
					}
				}

				if( self.locker ) {
					self.locker.hide();
				}

				if( !useEffects ) {
					self.element.show();
				} else {
					self.element.fadeIn(1000, function() {
						self.options.highlight && self.element.effect && self.element.effect('highlight', {color: '#fffbcc'}, 800);
					});
				}

				self.runHook('after-show-content');
			};

			if( !this.options.content ) {
				effectFunction();

			} else if( typeof this.options.content === "string" ) {
				this.element.html(this.options.content);
				effectFunction();

			} else if( typeof this.options.content === "object" && !this.options.content.url ) {
				this.element.append(this.options.content.clone().show());
				effectFunction();

			} else if( typeof this.options.content === "object" && this.options.content.url ) {

				var ajaxOptions = $.extend(true, {}, this.options.content);

				var customSuccess = ajaxOptions.success;
				var customComplete = ajaxOptions.complete;
				var customError = ajaxOptions.error;

				ajaxOptions.success = function(data, textStatus, jqXHR) {

					!customSuccess ? self.element.html(data) : customSuccess(self, data, textStatus, jqXHR);
					effectFunction();
				};

				ajaxOptions.error = function(jqXHR, textStatus, errorThrown) {

					self._showError('ajax', "An error is triggered during the ajax request! Text: " + textStatus + " " + errorThrown);
					customError && customError(jqXHR, textStatus, errorThrown);
				};

				ajaxOptions.complete = function(jqXHR, textStatus) {

					customComplete && customComplete(jqXHR, textStatus);
				};

				$.ajax(ajaxOptions);

			} else {
				effectFunction();
			}
		}
	});

	$.fn.sociallocker = function(options) {
		return $(this).pandalocker(options);
	};

})(__$onp);
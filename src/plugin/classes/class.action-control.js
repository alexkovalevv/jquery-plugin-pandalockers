/**
 * Класс упраления действиями
 *
 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:62
 * @!uglify:true
 * @!lang:[]
 * @!build:['premium', 'full-free', 'full-premium']
 */
(function($) {
	'use strict';

	var control = $.pandalocker.tools.extend($.pandalocker.entity.control);

	/**
	 * Builds the array of actions and their options.
	 */
	control.setup = function() {
		var self = this;

		this.options.actions = this.options.actions || [];

		// move the subscribe action to the end

		var subscribeActionExists = false;

		for( var index in this.options.actions ) {
			if( 'subscribe' !== this.options.actions[index] ) {
				continue;
			}
			this.options.actions.splice(index, 1);
			subscribeActionExists = true;
		}

		if( subscribeActionExists ) {
			this.options.actions.push('subscribe');
		}

		if( this.groupOptions.actions ) {
			this.options.actions = $.extend(this.options.actions, this.groupOptions.actions);
		}

		for( var i = 0; i < this.options.actions.length; i++ ) {

			var actionName = $.pandalocker.tools.camelCase(this.options.actions[i]);
			this.options[actionName] = this.options[actionName] || {};

			var groupOptionsName = actionName + 'Options';

			if( this.groupOptions[groupOptionsName] ) {
				this.options[actionName] = $.extend(true, this.options[actionName], this.groupOptions[groupOptionsName]);
			}

			var lockerOptionsName = actionName + 'ActionOptions';

			if( this.lockerOptions[lockerOptionsName] ) {
				this.options[actionName] = $.extend(true, this.options[actionName], this.lockerOptions[lockerOptionsName]);
			}
		}

		this.options.proxy = this.options.proxy || this.groupOptions.proxy || this.lockerOptions.proxy;
		this.options.lazy = this.options.lazy || this.groupOptions.lazy || this.lockerOptions.lazy;

		// creating the subscription service

		if( subscribeActionExists ) {

			var serviceOptions = {
				id: self.locker.id,
				proxy: self.lockerOptions.proxy,
				name: self.name,
				listId: self.options[actionName].listId,
				service: self.options[actionName].service,
				doubleOptin: self.options[actionName].doubleOptin,
				confirm: self.options[actionName].confirm,
				requireName: self.options[actionName].requireName || false
			};

			var service = new $.pandalocker.services.subscription(serviceOptions);
			this.subscriptionService = self.applyFilters('get-default-subscription-service', service);
		}
	};

	/**
	 * Runs coherently each action
	 * which should be executed when the user is connected.
	 */
	control.runActions = function(identityData, serviceData, changeScreen) {
		var deferred = new $.Deferred();
		var self = this;

		// in order to execute the actions only once
		if( this._actionsDone ) {
			return;
		}
		this._actionsDone = true;

		var actions = this.options.actions.slice();

		if( changeScreen ) {
			this.showScreen('data-processing');
		}

		// this function takes the next action from the queue and executes it,
		// when the action is completed, takes the next one

		var runNextAction = function() {
			var actionName = actions.shift();

			if( !actionName ) {
				deferred.resolve();
				self.unlock();
				return;
			}

			var actionOptions = self.options[$.pandalocker.tools.camelCase(actionName)];

			var methodName = $.pandalocker.tools.camelCase('run-' + actionName + "-action");
			if( !self[methodName] ) {
				deferred.reject();
				self._actionsDone = false;
				throw new Error("The action '" + methodName + "' not found.");
			}

			self[methodName](identityData, serviceData, actionOptions, changeScreen, function(result) {

				if( 'error' === result ) {
					self.runHook('raw-error');
					deferred.reject(result);
					self._actionsDone = false;
					return self.showScreen('default');
				}
				runNextAction();
			});
		};

		runNextAction();
		return deferred.promise();
	};

	/**
	 * Runs the action to subscribe the user.
	 */
	control.runSubscribeAction = function(identityData, serviceData, actionOptions, changeScreen, callback) {
		var self = this;

		var subscribe = function() {

			if( changeScreen ) {
				self.showScreen('data-processing');
			}

			var result = self.subscriptionService.subscribe(identityData, serviceData);
			self._setupSubscriptionHooks(result, identityData);

			result.fail(function() {
				callback('error');
			});
		};

		if( !identityData.email ) {

			return this.showScreen('enter-email', {
				header: $.pandalocker.lang.onestep_screen_title,
				message: $.pandalocker.lang.onestep_screen_instructiont,
				buttonTitle: $.pandalocker.lang.onestep_screen_button,
				note: $.pandalocker.tools.normilizeHtmlOption(self.options.noSpamText || self.groupOptions.text.noSpamText || $.pandalocker.lang.noSpam),
				callback: function(email) {
					identityData.email = email;
					subscribe();
				}
			});
		}
		;

		subscribe();
	};

	/**
	 * Runs the action to sign up the user.
	 */
	control.runSignupAction = function(identityData, serviceData, actionOptions, changeScreen, callback) {
		var self = this;

		var signup = function() {

			if( changeScreen ) {
				self.showScreen('data-processing');
			}

			var dataToPass = {};
			dataToPass.opandaIdentityData = identityData;
			dataToPass.opandaHandler = 'signup';

			dataToPass = $.pandalocker.filters.run(self.locker.id + '.ajax-data', [dataToPass]);
			dataToPass = $.pandalocker.filters.run(self.locker.id + '.signup.ajax-data', [dataToPass]);

			return $.ajax({
				type: "POST",
				dataType: "json",
				url: self.lockerOptions.proxy,
				data: dataToPass,
				success: function() {
					callback();
				},
				error: function(response, type, errorThrown) {
					if( response && response.readyState < 4 ) {
						return;
					}

					self.showScreen('default');
					self.showError('Unable to sign in, the ajax error occurred.');
					callback('error');

					if( !console || !console.log ) {
						return;
					}
					console.log('Invalide ajax response:');
					console.log(response.responseText);
				}
			});
		};

		if( !identityData.email ) {

			return this.showScreen('enter-email', {
				header: $.pandalocker.lang.onestep_screen_title,
				message: $.pandalocker.lang.onestep_screen_instructiont,
				buttonTitle: $.pandalocker.lang.onestep_screen_button,
				note: $.pandalocker.tools.normilizeHtmlOption(self.options.noSpamText || self.groupOptions.text.noSpamText || $.pandalocker.lang.noSpam),
				callback: function(email) {
					identityData.email = email;
					signup();
				}
			});
		}
		;

		signup();
	};

	/**
	 * Runs the action to catch the lead.
	 */
	control.runLeadAction = function(identityData, serviceData, actionOptions, changeScreen, callback) {
		var self = this;

		var catchLead = function() {

			if( changeScreen ) {
				self.showScreen('data-processing');
			}

			var dataToPass = {};
			dataToPass.opandaIdentityData = identityData;
			dataToPass.opandaHandler = 'lead';

			dataToPass = $.pandalocker.filters.run(self.locker.id + '.ajax-data', [dataToPass]);
			dataToPass = $.pandalocker.filters.run(self.locker.id + '.lead.ajax-data', [dataToPass]);

			return $.ajax({
				type: "POST",
				dataType: "json",
				url: self.lockerOptions.proxy,
				data: dataToPass,
				success: function() {
					callback();
				},
				error: function(response, type, errorThrown) {
					if( response && response.readyState < 4 ) {
						return;
					}

					self.showScreen('default');
					self.showError('Unable to sign in, the ajax error occurred.');
					callback('error');

					if( !console || !console.log ) {
						return;
					}
					console.log('Invalide ajax response:');
					console.log(response.responseText);
				}
			});
		};

		if( !identityData.email ) {

			return this.showScreen('enter-email', {
				header: $.pandalocker.lang.onestep_screen_title,
				message: $.pandalocker.lang.onestep_screen_instructiont,
				buttonTitle: $.pandalocker.lang.onestep_screen_button,
				note: $.pandalocker.tools.normilizeHtmlOption(self.options.noSpamText || self.groupOptions.text.noSpamText || $.pandalocker.lang.noSpam),
				callback: function(email) {
					identityData.email = email;
					catchLead();
				}
			});
		}
		;

		catchLead();
	};

	// ----------------------------------------------------------------
	// Subscription
	// ----------------------------------------------------------------

	control._checkWaitingSubscription = function() {
		if( !this.subscriptionService || !this.subscriptionService.isWaitingSubscription() ) {
			return;
		}

		var identityData = this.subscriptionService.getWaitingIdentityData();

		var result = this.subscriptionService.waitSubscription(identityData);
		this._setupSubscriptionHooks(result, identityData);

		var self = this;
		this.showScreen('email-confirmation', {
			service: self.subscriptionService,
			email: identityData.email
		});
	};

	control._setupSubscriptionHooks = function(result, identityData) {
		var self = this;

		result.done(function() {
			self.unlock();
		});

		result.fail(function(data) {

			self.runHook('raw-error');

			self.showNotice(data.error);
			self.showScreen('default');

			if( data.detailed && console && console.log ) {
				console.log(data.detailed);
			}
		});

		result.always(function(data, ok) {
			self.subscriptionService._removeWaitingStatus();
		});

		result.progress(function(status) {
			if( 'waiting-confirmation' === status ) {
			}
			self.showScreen('email-confirmation', {
				service: self.subscriptionService,
				email: identityData.email
			});
		});

		return result;
	};

	// --------------------------------------------------------------
	// Making the control public
	// --------------------------------------------------------------

	$.pandalocker.entity.actionControl = control;

})(__$onp);


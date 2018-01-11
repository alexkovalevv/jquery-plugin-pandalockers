/*!
 * OnePress Default Subscription Service
 * Copyright 2014, OnePress, http://byonepress.com

 * @since 1.0.0
 * @pacakge core

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:85
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */
(function($) {
	'use strict';

	$.pandalocker.services.subscription = function(serviceOptions) {

		this.id = serviceOptions.id;
		this.serviceOptions = serviceOptions;

		this.cookieName = 'opanda_' + serviceOptions.name + "_" + serviceOptions.service + '_' + serviceOptions.listId;
		this.checkingInterval = serviceOptions.checkingInterval || 10000;

		/**
		 * Makes the ajax call with a given request type.
		 */
		this._call = function(requestType, identityData, serviceData) {
			var self = this;

			var dataToPass = {};

			dataToPass.opandaIdentityData = identityData;
			dataToPass.opandaServiceData = serviceData;

			dataToPass.opandaHandler = 'subscription';
			dataToPass.opandaRequestType = requestType;

			dataToPass.opandaService = this.serviceOptions.service;
			dataToPass.opandaListId = this.serviceOptions.listId;
			dataToPass.opandaDoubleOptin = this.serviceOptions.doubleOptin;
			dataToPass.opandaConfirm = this.serviceOptions.confirm;
			dataToPass.opandaRequireName = this.serviceOptions.requireName;

			dataToPass = $.pandalocker.filters.run(this.id + '.ajax-data', [dataToPass]);
			dataToPass = $.pandalocker.filters.run(this.id + '.subscribe.ajax-data', [dataToPass]);

			if( this.serviceOptions.parentId ) {
				dataToPass = $.pandalocker.filters.apply('subscription-data-' + this.serviceOptions.parentId, dataToPass);
			}

			var result = new $.pandalocker.deferred();

			var onError = function(response) {
				if( response && response.readyState < 4 ) {
					return;
				}

				if( !console || !console.log ) {
					return;
				}
				console.log('Invalide ajax response:');
				console.log(response.responseText);

				result.reject(response);
			};

			var request = $.ajax({
				type: "POST",
				dataType: "text",
				url: self.serviceOptions.proxy,
				data: dataToPass,
				error: function(response) {
					onError(request);
				},
				success: function(response) {
					var data = $.pandalocker.tools.extractJSON(response);
					if( !data ) {
						return onError(request);
					}
					result.resolve(data);
				}
			});

			return result.promise();
		};

		/**
		 * Subscribes the given user.
		 *
		 * @since 1.0.0
		 * @param {object} identityData An identity data of a person to subscribe
		 * @return {$.Deferred} The deferred object to track the state.
		 */
		this.subscribe = function(identityData, serviceData) {
			var self = this;
			var result = new $.Deferred();

			// makes ajax call to subscribe the user
			this._call('subscribe', identityData, serviceData)
				.done(function(response) {

					console.log(response);

					// checks if the error occured
					if( response && response.error ) {
						result.reject(response);
						return;
					}

					if( response && 'subscribed' === response.status ) {
						result.resolve(response);
						return;
					}

					// if the confirmation is not required
					if( !self.serviceOptions.doubleOptin || !self.serviceOptions.confirm ) {
						result.resolve(response);
						return;
					}

					// adds the local storage item or the cookies
					// pointing that we're waiting subscription
					self._setWaitingStatus(identityData);

					// notify the method caller that we're waiting the subcription,
					// the caller should show the email-confirmation screen
					result.notify('waiting-confirmation');

					// if we need to wait for the confirmation, runs the checking loop
					self.waitSubscription(identityData)
						.done(function(response) {
							result.resolve(response);
						})
						.fail(function(response) {
							result.reject(response);
						})
						.always(function() {
							self._removeWaitingStatus();
						});

				})
				.fail(function(data) {
					if( data && data.readyState < 4 ) {
						return;
					}
					result.reject({error: $.pandalocker.lang.errors.ajaxError});
				});

			return result.promise();
		};

		/**
		 * Waits for the subscription.
		 *
		 * @since 1.0.0
		 * @param {object} identityData An identity data of a person to wait subscription.
		 * @return {$.Deferred} The deferred object to track the state.
		 */
		this.waitSubscription = function(identityData) {
			var self = this;
			var result = new $.Deferred();

			this._waitingConfirmationResult = result;
			if( self._isCanceled ) {
				self._isCanceled = false;
				return;
			}

			// checks the subscription
			this.check(identityData)
				.done(function(response) {

					if( self._isCanceled ) {
						self._isCanceled = false;
						return;
					}

					// don't remove, not for debug
					console && console.log && console.log('waiting subscription...');
					console && console.log && console.log(response);

					// if not subscribed, then checks the sunbscription again
					if( !response || response.status !== 'subscribed' ) {

						// waits some time to send the checking request again
						setTimeout(function() {

							var localResult = self.waitSubscription(identityData);
							if( !localResult ) {
								return;
							}

							localResult.done(function(response) {
								result.resolve(response);
							});

							localResult.fail(function(response) {
								result.reject(response);
							});

						}, self.checkingInterval);

						return;
					}

					result.resolve(response);
				})
				.fail(function(response) {
					if( self._isCanceled ) {
						self._isCanceled = false;
						return;
					}
					result.reject(response);
				});

			return result.promise();
		};

		/**
		 * Check whether the use is a subscriber.
		 *
		 * @since 1.0.0
		 * @param {object} identityData An identity data of a person to check subscription.
		 * @return {$.Deferred} The deferred object to track the state.
		 */
		this.check = function(identityData) {
			var result = new $.Deferred();

			// makes ajax call to check if the user subscribed
			this._call('check', identityData)
				.done(function(response) {

					// checks if the error occured
					if( response.error ) {
						result.reject(response);
						return;
					}

					result.resolve(response);
				})
				.fail(function(data) {
					if( data && data.readyState < 4 ) {
						return;
					}
					result.reject({error: $.pandalocker.lang.errors.ajaxError});
				});

			return result.promise();
		};

		/**
		 * Cancels waiting confirmation of subscription.
		 */
		this.cancel = function() {
			this._isCanceled = true;
			this._removeWaitingStatus();

			if( this._waitingConfirmationResult ) {
				this._waitingConfirmationResult.reject({
					error: $.pandalocker.lang.errors_subscription_canceled
				});
				this._waitingConfirmationResult = null;
			}
		};

		/**
		 * Sets the local storage item or the cookies to memorize the waiting status.
		 */
		this._setWaitingStatus = function(identityData) {
			var dataToSave = JSON.stringify(identityData);

			if( localStorage && localStorage.setItem ) {
				try {
					localStorage.setItem(this.cookieName, dataToSave);
				}
				catch( e ) {
					$.pandalocker.tools.cookie(this.cookieName, dataToSave, {
						expires: 365,
						path: "/"
					});
				}
			} else {
				$.pandalocker.tools.cookie(this.cookieName, dataToSave, {
					expires: 365,
					path: "/"
				});
			}
		};

		/**
		 * Removes the waiting status.
		 */

		this._removeWaitingStatus = function(identityData) {
			localStorage && localStorage.removeItem && localStorage.removeItem(this.cookieName);
			$.pandalocker.tools.cookie(this.cookieName, false, {
				expires: 0,
				path: "/"
			});
		};

		/**
		 * Returns try if we're waiting when the user confirm his subscription.
		 */
		this.isWaitingSubscription = function() {
			var result = this.getWaitingIdentityData();
			return result ? true : false;
		};

		this.getWaitingIdentityData = function() {
			var result = localStorage && localStorage.getItem && localStorage.getItem(this.cookieName);
			if( !result ) {
				result = $.pandalocker.tools.cookie(this.cookieName);
			}
			if( result ) {
				return JSON.parse(result);
			}
			return result;
		}
	};

})(__$onp);
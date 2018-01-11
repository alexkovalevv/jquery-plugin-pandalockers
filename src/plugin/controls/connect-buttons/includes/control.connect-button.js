/**
 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:50
 * @!uglify:true
 * @!lang:[]
 * @!build:['premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	var button = $.pandalocker.tools.extend($.pandalocker.entity.actionControl);

	/**
	 * The main control tag.
	 */
	button.tag = '<a href="#"></a>';

	/**
	 * Shows the control in the specified holder.
	 */
	button.render = function($holder) {
		var self = this;
		this.sdk = this.sdk || this.name;

		this.control.addClass('onp-sl-button');

		this.icon = $("<div class='onp-sl-icon'></div>");
		this.icon.appendTo($holder);

		this.container = $("<div class='onp-sl-connect-button onp-sl-social-button-" + this.name + "'></div>");
		this.container.appendTo($holder);

		if( !this._hasError() ) {

			this._lockLoadingState();

			var render = function() {

				var sdkResult = self.requireSdk(self.sdk, self.options);

				// error fired
				sdkResult.fail(function(error) {
					self._unlockLoadingState();
					self.showError(error);
				});

				sdkResult.done(function() {
					if( self.setupEvents ) {
						self.setupEvents();
					}
					self.renderButton(self.container);
				});
			};

			if( this.locker.options.lazy ) {

				this.addHook('raw-impress', function() {

					if( self._rendered ) {
						return;
					}
					self._rendered = true;
					render();
				})
			} else {
				render();
			}
		}

		this.handleClick();
		this._checkWaitingSubscription();
	};

	button.processButtonTitle = function(template, name) {
		var title = template.replace('{long}', $.pandalocker.lang.signin_long);
		title = title.replace('{short}', $.pandalocker.lang.signin_short);
		title = title.replace('{name}', name);
		return title;
	};

	/**
	 * Handles a click on the connect button.
	 */
	button.handleClick = function() {
		var self = this;

		this.control.click(function() {
			self.runHook('raw-interaction');

			if( self._hasError() || self._isLoading() ) {
				return;
			}

			self.connect(function(identityData, serviceData) {
				self.runActions(identityData, serviceData, true);
			});

			return false;
		});
	};

	button._lockLoadingState = function() {
		this._setLoadingState('connect-button');
	};

	button._unlockLoadingState = function() {
		this._removeLoadingState('connect-button');
	};

	/**
	 * This method should be overwritten.
	 */
	button.connect = function() {
		throw new Error("The control should implement the method 'connect'");
	};

	/**
	 * Returns an indentity for the state storage.
	 */
	button._getStorageIdentity = function() {
		return "opanda_" + $.pandalocker.tools.hash(this.name) + "_hash_" + this.name;
	};

	$.pandalocker.entity.connectButton = button;

})(__$onp);

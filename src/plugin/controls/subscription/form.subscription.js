/**
 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:30
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */
(function($) {
	'use strict';

	var form = $.pandalocker.tools.extend($.pandalocker.entity.actionControl);

	form.name = "form";

	/**
	 * The dafault options.
	 */
	form._defaults = {
		type: 'email-form',
		fields: null,
		unlocksPerPage: false
	};

	/**
	 * Builds the subscription options and create the subscription service.
	 */
	form.setup = function() {
		var self = this;

		if( !this.options.actions || this.options.actions.length === 0 ) {
			this.options.actions = ['subscribe'];
		}

		$.pandalocker.entity.actionControl.setup.apply(this);

		this.options.requireName = this.options.requireName ||
			( this.options['subscribe'] && this.options['subscribe'].requireName );

		this.advancedValidation = true;

		if( 'email-form' === this.options.type ) {
			this.advancedValidation = false;

			this.options.fields = [
				{
					'id': 'email',
					'type': 'email',
					'placeholder': $.pandalocker.lang.errors_empty_email,
					'req': true
				}
			];

		} else if( 'name-email-form' === this.options.type ) {
			this.advancedValidation = true;

			this.options.fields = [
				{
					'id': 'fullname',
					'type': 'text',
					'placeholder': $.pandalocker.lang.misc_enter_your_name,
					'req': true
				}, {
					'id': 'email',
					'type': 'email',
					'placeholder': $.pandalocker.lang.misc_enter_your_email,
					'req': true
				}
			];
		}
	};

	form._memorize = function(name, value) {
		var cookieName = 'opanda_' + name;

		if( localStorage && localStorage.setItem ) {
			try {
				localStorage.setItem(cookieName, value);
			}
			catch( e ) {
				$.pandalocker.tools.cookie(cookieName, value, {
					expires: 365,
					path: "/"
				});
			}
		} else {
			$.pandalocker.tools.cookie(cookieName, value, {
				expires: 365,
				path: "/"
			});
		}
	};

	form._getFromMemory = function(name) {
		var cookieName = 'opanda_' + name;

		var result = localStorage && localStorage.getItem && localStorage.getItem(cookieName);
		if( !result ) {
			result = $.pandalocker.tools.cookie(cookieName);
		}
		return result;
	};

	/**
	 * Submits the form.
	 */
	form.submit = function() {
		var self = this;

		if( !this.validate() ) {
			return false;
		}

		if( this.options.preview ) {

			this.showNotice(
				( window.bizpanda && window.bizpanda.res && window.bizpanda.res['subscription-preview-mode'] )
				|| "The locker is in the preview mode. The subscription does not work here.");
			return;
		}

		var buttonText = this.$button.text();
		this.$button.addClass('load').prop('disabled', true);
		this.$button.html('&nbsp;');

		var result = self.runActions(this.getValues(), {});

		result.fail(function() {
			self.$button.removeClass('load').removeProp('disabled');
			self.$button.text(buttonText);
		});
	};

	// -----------------------------------------------------------
	// Getting values
	// -----------------------------------------------------------

	form.getValues = function() {
		var self = this;
		var fields = this.options.fields;

		var values = {};

		$.each(fields, function(i, field) {

			if( !field || !field.type ) {
				return;
			}
			if( !field.id ) {
				return;
			}

			values[field.id] = self.getFieldValue(field);
		});

		return values;
	};

	form.getFieldValue = function(field) {

		var type = field.type;

		var result = $.pandalocker.hooks.run('get-field-value-' + type, [field]);
		if( typeof result !== 'undefined' ) {
			return result;
		}

		if( field.id === 'email' ) {
			this._memorize('email', $.trim(field._$input.val()));
		} else if( field.id === 'fullname' ) {
			this._memorize('fullname', $.trim(field._$input.val()));
		}

		var typeName = $.pandalocker.tools.capitaliseFirstLetter($.pandalocker.tools.camelCase(type));
		var method = 'get' + typeName + 'Value';

		if( this[method] ) {
			return this[method](field);
		} else {
			if( field._$input ) {
				return $.trim(field._$input.val());
			}
			return null;
		}
	};

	form.getDateValue = function(field) {
		if( $.pandalocker.tools.isTabletOrMobile() ) {
			return $.trim(field._$input.val());
		}
		return field._$input.data('value');
	};

	form.getCheckboxValue = function(field) {
		return field._$input.is(":checked") ? field.onValue : field.offValue;
	};

	// -----------------------------------------------------------
	// Validation
	// -----------------------------------------------------------

	/**
	 * Validates the form.
	 */
	form.validate = function() {
		var self = this;
		var fields = this.options.fields;

		var isValid = true;

		$.each(fields, function(i, field) {

			if( self.advancedValidation && field._$input ) {

				field._$input.bind('change keyup blur', function() {
					self.validateField(field);
				});
			}

			if( self.validateField(field) ) {
				return;
			}
			isValid = false;
		});

		return isValid;
	};

	form.validateField = function(field) {
		var type = field.type;
		this.hideValidationErrors(field);

		var result = $.pandalocker.hooks.run('validate-field-' + type, [field]);
		if( typeof result !== 'undefined' ) {
			return result;
		}

		var typeName = $.pandalocker.tools.capitaliseFirstLetter($.pandalocker.tools.camelCase(type));
		var method = 'validate' + typeName;

		var res = this[method] ? this[method](field) : true;

		// custom validation

		if( res && field.validation && ( field.req || ( !field.req && $.trim(field._$input.val()) ) ) ) {

			var value = $.trim(field._$input.val());

			var expression = null;
			var validationError = field.validationError;

			if( field.validation instanceof RegExp ) {
				expression = field.validation;
			} else {

				var regexp = new RegExp('^\/.*?\/[ims]*$');

				if( regexp.test(field.validation) ) {

					eval('expression = ' + field.validation);

				} else if( 'month/day/year' === field.validation ) {

					expression = /^\d\d\/\d\d\/\d\d\d\d$/;
					var parts = value.split("/");

					if( parts.length < 3 ) {
						this.showValidationError(field, $.pandalocker.lang.errors_invalid_date);
						return false;
					}

					var month = parseInt(parts[0]);
					var day = parseInt(parts[1]);
					var year = parseInt(parts[2]);

					if( month < 1 || month > 12 ) {
						this.showValidationError(field, $.pandalocker.lang.errors_invalid_month);
						return false;
					}

					if( day < 1 || day > 31 ) {
						this.showValidationError(field, $.pandalocker.lang.errors_invalid_day);
						return false;
					}

				} else if( 'month/year' === field.validation ) {

					expression = /^\d\d\/\d\d\d\d$/;
					var parts = value.split("/");

					if( parts.length < 2 ) {
						this.showValidationError(field, $.pandalocker.lang.errors_invalid_date);
						return false;
					}

					var month = parseInt(parts[0]);
					var year = parseInt(parts[1]);

					if( month < 1 || month > 12 ) {
						this.showValidationError(field, $.pandalocker.lang.errors_invalid_month);
						return false;
					}

				} else if( 'month' === field.validation ) {

					var month = parseInt(value);
					if( month < 1 || month > 12 ) {
						this.showValidationError(field, $.pandalocker.lang.errors_invalid_month);
						return false;
					}

				} else if( 'year' === field.validation ) {
					expression = /^\d\d\d\d$/;
				} else {
					expression = new RegExp(field.validation);
				}

			}

			if( expression && !expression.test(value) ) {
				this.showValidationError(field, validationError
					? validationError
					: $.pandalocker.lang.errors_invalid_value);
				return false;
			}
		}

		this.runHook('size-changed');
		return res;
	};

	form.validateText = function(field, errorText) {

		var value = $.trim(field._$input.val());

		if( field.req && ( !value || !value.length ) ) {

			if( "fullname" === field.id ) {
				errorText = $.pandalocker.lang.errors_empty_name;
			} else if( "email" === field.id ) {
				errorText = $.pandalocker.lang.errors_empty_email;
			}

			this.showValidationError(field, errorText ? errorText : $.pandalocker.lang.errors_empty_field);
			return false;
		}

		return true;
	};

	form.validateHidden = function(field, errorText) {
		return true;
	};

	form.validateDate = function(field) {

		var resuslt = this.validateText(field);
		if( !resuslt ) {
			return resuslt;
		}

		return true;
	};

	form.validateEmail = function(field) {

		var resuslt = this.validateText(field);
		if( !resuslt ) {
			return resuslt;
		}

		var value = $.trim(field._$input.val());

		if( !$.pandalocker.tools.isValidEmailAddress(value) ) {
			this.showValidationError(field, $.pandalocker.lang.errors_inorrect_email);
			return false;
		}

		return true;
	};

	form.validatePhone = function(field) {
		return this.validateText(field);
	};

	form.validateUrl = function(field) {
		var resuslt = this.validateText(field);
		if( !resuslt ) {
			return resuslt;
		}

		var value = $.trim(field._$input.val());

		if( !$.pandalocker.tools.isValidUrl(value) ) {
			this.showValidationError(field, 'Please enter a valid URL.');
			return false;
		}

		return true;
	};

	form.validateBirthday = function(field) {

		var resuslt = this.validateText(field);
		if( !resuslt ) {
			return resuslt;
		}

		var value = $.trim(field._$input.val());
		var parts = value.split("/");

		if( parts.length < 2 ) {
			this.showValidationError(field, 'Please enter a valid date.');
			return false;
		}

		var month = parseInt(parts[1]);
		var day = parseInt(parts[0]);

		if( field.maskPlaceholder === 'mm/dd' ) {
			var month = parseInt(parts[0]);
			var day = parseInt(parts[1]);
		}

		if( day < 1 || day > 31 ) {
			this.showValidationError(field, 'Please enter a valid date.');
			return false;
		}

		if( month < 1 || month > 12 ) {
			this.showValidationError(field, 'Please enter a valid date.');
			return false;
		}

		return true;
	};

	form.validateInteger = function(field) {
		var resuslt = this.validateText(field);
		if( !resuslt ) {
			return resuslt;
		}

		var value = $.trim(field._$input.val());
		if( !value && !field.req ) {
			return true;
		}

		value = parseInt(value);

		if( isNaN(value) ) {
			this.showValidationError(field, 'Please enter an integer number.');
			return false;
		}

		if( field.min && value < field.min ) {
			this.showValidationError(field, 'Please enter a number greater than or equal to {0}.'.replace('{0}', field.min));
			return false;
		}

		if( field.max && value > field.max ) {
			this.showValidationError(field, 'Please enter a number less than or equal to {0}.'.replace('{0}', field.max));
			return false;
		}

		return true;
	};

	form.validateCheckbox = function(field) {

		var isChecked = field._$input.is(":checked");

		if( field.req && !isChecked ) {
			this.showValidationError(field, 'Please mark this checkbox to continue.');
			return false;
		}

		return true;
	};

	form.showValidationError = function(field, text) {
		var $wrap = field._$wrap;
		var self = this;

		if( this.advancedValidation ) {

			var $error = $('<div class="onp-sl-validation-error"></div>').html(text);
			$wrap.append($error);

			$wrap.addClass('onp-sl-error-state');

		} else {
			if( this._validationErrorShown ) {
				return;
			}

			this._validationErrorShown = true;
			this.showNotice(text, function() {
				self._validationErrorShown = false;
			});
		}
	};

	form.hideValidationErrors = function(field) {
		if( !this.advancedValidation ) {
			return;
		}

		var $wrap = field._$wrap;

		$wrap.find(".onp-sl-validation-error").remove();
		$wrap.removeClass('onp-sl-error-state');
	};

	// -----------------------------------------------------------
	// Rendering
	// -----------------------------------------------------------

	/**
	 * Shows the control in the specified holder.
	 */
	form.render = function($holder) {
		var self = this;

		if( this.options.fields && this.options.fields.length > 1 ) {
			this.addClassToLocker('onp-sl-custom-form');
		}

		var fields = this.options.fields;

		for( var i in fields ) {
			if( !fields.hasOwnProperty(i) ) {
				continue;
			}

			var field = fields[i];

			if( !field || !field.type ) {
				continue;
			}

			field._$input = this.renderField($holder, field);
		}

		$holder.find("input").keypress(function(e) {
			if( e.which !== 13 ) {
				return;
			}
			self.control.find('.onp-sl-submit').click();
		});

		this.$button = this.renderSubmitButton($holder);
		this._checkWaitingSubscription();
	};

	form.renderSubmitButton = function($holder) {
		var self = this;

		var buttonText = this.options.buttonText || this.groupOptions.text.buttonText || this.lang.btnSubscribe;
		var noSpam = $.pandalocker.tools.normilizeHtmlOption(this.options.noSpamText || this.groupOptions.text.noSpamText || $.pandalocker.lang.noSpam);

		var $wrap = $("<div></div>")
			.addClass('onp-sl-field')
			.addClass('onp-sl-field-submit');

		var $field = $("<button class='onp-sl-button onp-sl-form-button onp-sl-submit'>" + buttonText + "</button>");
		if( this.group.isFirst ) {
			$field.addClass('onp-sl-button-primary');
		}
		$field.appendTo($wrap);

		noSpam.addClass('onp-sl-note').addClass('onp-sl-nospa');
		noSpam.appendTo($wrap);

		$field.click(function() {
			self.submit();
			return false;
		});

		$wrap.appendTo($holder);
		return $field;
	};

	/**
	 * Renders a field.
	 */
	form.renderField = function($holder, field) {
		var type = field.type;
		var id = field.id;

		var $wrap = $("<div class='onp-sl-field'></div>");
		field._$wrap = $wrap;

		if( id ) {
			$wrap.addClass('onp-sl-field-' + id);
		}
		if( type ) {
			$wrap.addClass('onp-sl-field-' + type);
		}

		if( field.title && type !== 'hidden' ) {
			var $title = $("<div class='onp-sl-field-title'></div>");
			$title.html(field.title);
			$title.appendTo($wrap);
		}

		$wrap.appendTo($holder);

		var $input = $("<div class='onp-sl-field-control'></div>");
		$input.appendTo($wrap);

		var $result = $.pandalocker.hooks.run('render-' + type, [$holder, field]);
		if( $result ) {
			return $result;
		}

		var typeName = $.pandalocker.tools.capitaliseFirstLetter($.pandalocker.tools.camelCase(type));
		var method = 'render' + typeName;

		if( !this[method] ) {
			return this.showError('Cannot render a field of the type "' + type + '".');
		}
		;
		var $field = this[method]($input, field);

		if( field.id === 'email' ) {
			$field.val(this._getFromMemory('email'));
		} else if( field.id === 'fullname' ) {
			$field.val(this._getFromMemory('fullname'));
		}

		return $field;
	};

	form.renderEmail = function($holder, field) {
		return this.renderText($holder, field, 'text', 'email');
	};

	form.renderPhone = function($holder, field) {
		return this.renderText($holder, field, 'text', 'phone');
	};

	form.renderUrl = function($holder, field) {
		return this.renderText($holder, field, 'text', 'website');
	};

	form.renderInteger = function($holder, field) {
		return this.renderText($holder, field, 'text', 'interger');
	};

	form.renderHidden = function($holder, field) {

		var $field = $("<input type='hidden' id='onp-sl-input-" + field.id + "' />");
		if( field.value ) {
			$field.attr('value', field.value);
		}

		$field.appendTo($holder);
		return $field;
	};

	form.renderBirthday = function($holder, field) {

		if( !field.mask ) {
			field.mask = '99/99';
		}
		if( !field.maskPlaceholder ) {
			field.maskPlaceholder = 'dd/mm';
		}

		return this.renderText($holder, field, 'text', 'birthday');
	};

	form.renderDate = function($holder, field) {
		if( $.pandalocker.tools.isTabletOrMobile() ) {
			return this.renderText($holder, field, 'date');
		}

		var $field = this.renderText($holder, field, 'text');

		if( !window.Pikaday ) {
			return this.showError('Unable to create a field of the type "date" due to the lib Pikaday not found.');
		}

		$field.attr('readOnly', 'true');

		var picker = new Pikaday({
			field: $field[0],
			container: $holder[0],
			format: 'DD MMM YYYY',
			onSelect: function() {
				$field.data('value', this.getMoment().format('YYYY-MM-DD'));
			}
		});

		return $field;
	};

	form.renderText = function($wrap, field, inputType, name) {

		if( field.icon ) {
			var position = field.iconPosition || 'right';
			if( position !== 'none' ) {
				var $icon = $("<i class='onp-sl-icon'></i>").addClass(field.icon);
				if( position === 'right' ) {
					$icon.addClass('onp-sl-icon-append');
				} else {
					$icon.addClass('onp-sl-icon-prepend');
				}
				$icon.appendTo($wrap);
			}
		}

		if( !inputType ) {
			inputType = 'text';
		}
		if( field.password ) {
			inputType = 'password';
		}

		var $field = $("<input type='" + inputType + "' class='onp-sl-input' id='onp-sl-input-" + field.id + "' />");
		if( field.placeholder ) {
			$field.attr('placeholder', field.placeholder);
		}
		if( field.value ) {
			$field.attr('value', field.value);
		}
		if( name ) {
			$field.attr('name', name);
		}

		if( field.mask ) {
			if( !$.mask ) {
				return this.showError('Unable to create a masked input, the lib not found');
			}

			var options = {};
			if( field.maskPlaceholder ) {
				options.placeholder = field.maskPlaceholder;
			}
			$field.mask(field.mask, options);
		}

		$field.appendTo($wrap);
		return $field;
	};

	form.renderCheckbox = function($wrap, field) {

		var $label = $("<label></lable>");

		var $input = $("<input type='checkbox' />");
		$input.appendTo($label);

		if( field.markedByDefault ) {
			$input.attr('checked', 'checked');
		}

		var $checkbox = $("<span class='onp-sl-checkbox' id='onp-sl-input-" + field.id + "' />");
		$checkbox.appendTo($label);

		var $span = $("<span></span>");
		if( field.description ) {
			$span.html(field.description);
		}
		$span.appendTo($label);

		$label.appendTo($wrap);
		return $input;
	};

	form.renderDropdown = function($wrap, field) {

		var $select = $("<select class='onp-sl-input onp-sl-dropdown'></select>");
		var $picker = $("<i></i>");

		for( var i in field.choices ) {

			var $option = $("<option></option>")
				.attr('value', field.choices[i])
				.text(field.choices[i]);

			$option.appendTo($select);
		}

		$select.appendTo($wrap);
		$picker.appendTo($wrap);

		return $select;
	};

	form.renderSeparator = function($holder, field) {
		return null;
	};

	form.renderHtml = function($holder, field) {
		$holder.html(field.html);
		return null;
	};

	form.renderLabel = function($holder, field) {
		$holder.html(field.text);
		return null;
	};

	/**
	 * Returns an indentity for the state storage.
	 */
	form._getStorageIdentity = function() {
		var identity = "";

		if( this.options.unlocksPerPage ) {

			var uri = new $.pandalocker.tools.uri(this.options.url || window.location.href);
			var url = uri.normalize().toString();

			identity = "opanda_" + $.pandalocker.tools.hash(url) + "_hash_" + this.name;
		} else {
			identity = "opanda_" + $.pandalocker.tools.hash(this.options.listId + this.options.service) + "_hash_" + this.name;
		}

		identity = $.pandalocker.filters.run('subscription-form-get-storage-identity', [identity]);
		return identity;
	};

	$.pandalocker.controls["subscription"]["form"] = form;

})(__$onp);

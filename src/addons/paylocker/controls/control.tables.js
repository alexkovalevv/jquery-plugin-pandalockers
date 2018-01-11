/**
 * Таблицы тарифов
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 10.12.2016
 * @version 1.0
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:10
 * @!lang:[]
 * @!build:['paylocker']
 */

(function($) {
	'use strict';

	if( !$.pandalocker.controls["pricing-tables"] ) {
		$.pandalocker.controls["pricing-tables"] = {};
	}

	var table = $.pandalocker.tools.extend($.pandalocker.entity.actionControl);

	table.name = "tables";

	table.defaults = {
		ajaxUrl: null,
		paymentType: 'subscribe',
		paymentWay: 'screen',
		paymentRedirectUrl: null,
		paymentForms: {
			yandex: {}
		}
	};

	table.prepareOptions = function() {
		this.options = $.extend(true, this.defaults, this.options, this.locker.options.paylocker);

		this.redirectUrl = this.options.paymentRedirectUrl;
	};

	table.paymentProcess = function(transactionId, tableName, newUser) {
		if( !tableName || !transactionId ) {
			throw new Error($.pandalocker.lang.pl_errors.required_parameter_table_name);
		}

		var paymentFormOption = this.options.paymentForms.yandex;

		if( newUser ) {
			paymentFormOption.description = $.pandalocker.lang.pl_payment_form_newuser_description;
		} else if( this.options.paymentType == 'subscribe' ) {
			paymentFormOption.description = $.pandalocker.lang.pl_payment_form_subscription_description;
		} else if( this.options.paymentType == 'purchase' ) {
			paymentFormOption.description = $.pandalocker.lang.pl_payment_form_purchase_description;
		}
		paymentFormOption.targets = $.pandalocker.lang.pl_payment_form_purchase_target;

		if( this.options.paymentType == 'subscribe' ) {
			paymentFormOption.targets = $.pandalocker.lang.pl_payment_form_subscribe_target;
		}

		if( this.options[tableName].header ) {
			paymentFormOption.targets += ' «' + this.options[tableName].header + '»';
		}

		paymentFormOption.label = transactionId;
		paymentFormOption.sum = this.options[tableName].price;

		this.locker._showScreen('paylocker-yandex-form', paymentFormOption);

	};

	table.showScreenEmail = function(tableName) {
		var self = this;

		self.locker._showScreen('enter-email', {
			header: '',
			message: $.pandalocker.lang.pl_confirm_email_description,
			buttonTitle: $.pandalocker.lang.pl_confirm_email_text_button,
			callback: function(email) {
				$.pandalocker.tools.setStorage('opanda_email', email, 30);

				self.beginTransaction(tableName, {
					email: email
				}, false);
			}
		});

		var oldEmail = $.pandalocker.tools.getFromStorage('opanda_email'),
			emailForm = $('#onp-sl-input-email');

		if( emailForm.val() == '' && oldEmail ) {
			emailForm.val(oldEmail);
		}
	};

	table.beginTransaction = function(tableName, args) {
		var self = this;

		var ajaxUrl = this.locker.options.ajaxUrl || this.options.ajaxUrl;

		if( !ajaxUrl || !tableName ) {
			throw new Error($.pandalocker.lang.pl_errors.required_parameter_proxy);
		}

		self.locker._showScreen('data-processing');

		var lockerOptions = window.bizpanda && window.bizpanda.lockerOptions[this.locker.options.id]
			? window.bizpanda.lockerOptions[this.locker.options.id]
			: {};

		if( !lockerOptions ) {
			self.locker._showScreen('paylocker-error');
			console && console.log($.pandalocker.lang.pl_errors.lock_settings_not_passed);
		}

		var sendData = $.extend(true, {
			action: 'onp_pl_begin_transaction',
			locker_id: lockerOptions.lockerId,
			post_id: lockerOptions.postId,
			table_payment_type: this.options[tableName].paymentType,
			table_name: tableName,
			table_price: this.options[tableName].price,
			force_register_user: false
		}, args);

		var transaction = $.pandalocker.tools.getFromStorage('onp_pl_begin_transaction');

		if( transaction && transaction.table_name == sendData.table_name && transaction.locker_id == sendData.locker_id ) {
			sendData.transaction_id = transaction.transaction_id;
		}

		$.ajax({
			type: "POST",
			dataType: "json",
			url: ajaxUrl,
			data: sendData,
			success: function(data) {
				if( !data || data && data.error ) {
					self.locker._showScreen('paylocker-error', {
						errorMessage: data.error
					});
					return;
				}

				if( data.warning && data.code == 'entry_email' ) {
					self.showScreenEmail(tableName);
					return;
				}

				if( data.warning && data.code == 'email_not_exists' ) {
					self.locker._showScreen('prompt', {
						textMessage: $.pandalocker.lang.pl_promt_email_not_exists.replace('{%email%}', data.email),
						textButtonYes: $.pandalocker.lang.pl_promt_email_not_button_yes,
						textButtonNo: $.pandalocker.lang.pl_promt_email_not_button_no,
						callbackButtonYes: function() {
							sendData['force_register_user'] = true;
							self.beginTransaction(tableName, sendData);
						},
						callbackButtonNo: function() {
							self.showScreenEmail(tableName);

						}
					});
					return;
				}

				if( data.transaction_id ) {
					$.pandalocker.tools.setStorage('onp_pl_begin_transaction', {
						transaction_id: data.transaction_id,
						table_name: tableName,
						locker_id: sendData.locker_id
					}, 1);

					self.paymentProcess(data.transaction_id, tableName, data.newUser);
				}

			},

			error: function(response, type, errorThrown) {
				if( response && response.readyState < 4 ) {
					return;
				}

				self.locker._showScreen('paylocker-error');

				if( !console || !console.log ) {
					return;
				}
				console.log('Invalide ajax response:');
				console.log(response.responseText);
			}
		});
	};

	table.createTable = function(tableName, options) {
		var self = this;

		//this.locker._showScreen('paylocker-error');

		var ctableHeader = options.header || $.pandalocker.lang.pl_ctable_header,
			ctablePrice = options.price || $.pandalocker.lang.pl_ctable_price,
			ctableDescription = options.description || $.pandalocker.lang.pl_ctableDescription,
			ctableButtonText = options.buttonText || $.pandalocker.lang.pl_ctable_button_text,
			ctableAfterButtonText = options.afterButtonText;

		var controlTable = $('<div class="onp-pl-control-table onp-pl-' + options.paymentType + '"></div>'),
			tableHeader = $('<h3 class="onp-pl-ctable-header ' + options.paymentType + '">' + ctableHeader + '</h3>'),
			tablePrice = $('<div class="onp-pl-ctable-price">' + ctablePrice + '<span class="onp-pl-ctable-currency">р.</span></div>'),
			beforeButtonText = $('<div class="onp-pl-ctable-description"></div>'),
			tableButton = $('<button class="onp-pl-ctable-button ' + options.paymentType + '">' + ctableButtonText + '</button>'),
			afterButtonText = $('<div class="onp-pl-ctable-after-button-text"></div>');

		controlTable.append(tableHeader)
			.append(tablePrice);

		if( ctableDescription ) {
			beforeButtonText.html(ctableDescription);
			controlTable.append(beforeButtonText)
		}

		controlTable.append(tableButton);

		if( ctableAfterButtonText ) {
			afterButtonText.text(ctableAfterButtonText);
			controlTable.append(afterButtonText);
		}

		tableButton.click(function() {
			self.beginTransaction(tableName);

			var lockerContanier = $(this).closest('.onp-sl-paylocker-mode');
			$('html, body').animate({
				scrollTop: lockerContanier.offset().top - 100
			}, 400);
		});

		return controlTable;
	};

	table.createSeparator = function() {
		var separator = $('<div class="onp-pl-control-separator">' + $.pandalocker.lang.pl_separatorText + '</div>');
		return separator;
	};

	table.render = function($holder) {
		var self = this;

		//this.targetsReminder();

		if( !this.groupOptions.orderTables.length ) {
			$holder.append('<div class="onp-pl-tables-not-found" style="color: #ff3100;font-weight: bold; text-align: center;">' +
			$.pandalocker.lang.pl_table_not_found +
			'</div>');
			return;
		}

		var wrapTables = $('<div class="onp-pl-tables-contanier"></div>');

		for( var i = 0; i < this.groupOptions.orderTables.length; i++ ) {
			var tableName = this.groupOptions.orderTables[i];

			if( !this.options[tableName] ) {
				this.showError('pricing-table', $.pandalocker.lang.pl_errors.tarif_not_found.replace('{tarif_name}', tableName));
				return;
			}

			if( this.options[tableName].itemType == 'separator' ) {
				var separator = table.createSeparator();
				wrapTables.append(separator);
			} else {
				var control = this.createTable(tableName, this.options[tableName]);
				wrapTables.append(control);
			}

		}

		$holder.append(wrapTables);

	};

	table.targetsReminder = function() {
		var self = this;
		var transaction = $.pandalocker.tools.getFromStorage('onp_pl_begin_transaction');
		if( transaction ) {
			this.locker._showScreen('prompt', {

				textMessage: $.pandalocker.lang.pl_prompt_reminde_subscribe_message,
				textButtonYes: $.pandalocker.lang.pl_prompt_reminde_subscribe_button_yes,
				textButtonNo: $.pandalocker.lang.pl_prompt_reminde_subscribe_button_no,

				callbackButtonYes: function() {
					self.paymentProcess(transaction.transaction_id, transaction.table_name);
					return false;
				},
				callbackButtonNo: function() {
					self.locker._showScreen('default');
					$.pandalocker.tools.removeStorage('onp_pl_begin_transaction');
				}
			});
			//$('.onp-sl-screen-default', this.locker.locker).show();
		}
	};

	$.pandalocker.controls["pricing-tables"]["tables"] = table;
})(__$onp);

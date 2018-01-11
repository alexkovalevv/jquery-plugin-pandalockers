/**
 * Настройка тем для платного контента
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 10.06.2017
 * @version 1.0
 */

(function($) {
	'use strict';

	// Регистрируем экран с формой оплаты от яндекса
	$.pandalocker.hooks.add('opanda-init', function(e, locker) {

		var groupOrder = (locker.options.groups && locker.options.groups.order) || locker.options.groups.length && locker.options.groups;

		if( !groupOrder || groupOrder.indexOf("pricing-tables") == -1 ) {
			return;
		}

		locker._registerScreen('paylocker-success-payment', function($holder, options) {
			var screenHeaderEl = $('<div class="onp-pl-screen-header">' + $.pandalocker.lang.pl_payment_successful + '</div>');
			$holder.append(screenHeaderEl);
			var loginUrl = __paylocker && __paylocker.loginUrl;
			var screenTextEl = $('<div class="onp-pl-screen-text">' + $.pandalocker.lang.pl_payment_have_last_step.replace('{%login_url%}', loginUrl) + '</div>');
			$holder.append(screenTextEl);
		});

		locker._registerScreen('paylocker-error', function($holder, options) {
			if( options && options.header ) {
				var screenHeaderEl = $('<div class="onp-pl-screen-header">' + options.header + '</div>');
				$holder.append(screenHeaderEl);
			}

			var screenText = (options && options.errorMessage) || $.pandalocker.lang.pl_errors.ajax_unknown_error,
				screenTextEl = $('<div class="onp-pl-screen-text">' + screenText + '</div>');

			$holder.append(screenTextEl);
		});

		// SCREEN: payment form
		locker._registerScreen('paylocker-yandex-form',
			function($holder, options) {

				var optionsDefault = {
					termsPageUrl: '#',
					alternatePaymentTypePageUrl: '#',
					receiver: null,
					label: null,
					sum: null,
					quickpay: 'shop',
					paymentTypeChoice: true,
					writer: 'seller',
					targets: '',
					targetsHint: '',
					buttonText: '01',
					successURL: ''
				};

				options = $.extend(true, optionsDefault, options);

				var iframeUrl = 'https://money.yandex.ru/quickpay/shop-widget';

				// todo: Доработать вывод ошибок

				if( !options.receiver || options.receiver == '' ) {
					setTimeout(function() {
						locker._showScreen('paylocker-error', {
							errorMessage: $.pandalocker.lang.pl_errors.undefined_yandex_client_id
						});
					}, 500);
					return;
				}

				if( !options.sum || options.sum == '' ) {
					setTimeout(function() {
						locker._showScreen('paylocker-error', {
							errorMessage: $.pandalocker.lang.pl_errors.no_amount_is_set
						});
					}, 500);
					return;
				}

				var screenHeaderText = options.header || $.pandalocker.lang.pl_payment_form_header,
					screenDescriptionText = options.description || $.pandalocker.lang.pl_payment_form_subscription_description;

				var screenHeader = '<h3 class="onp-pm-screen-header">' + screenHeaderText + '</h3>',
					screenDescription = '<div class="onp-pm-screen-text">' + screenDescriptionText + '</div>',
					formWrap = $('<div class="onp-pm-yandex-payment-form"></div>');

				var alternatePaymentTypeLink = options.alternatePaymentTypePageUrl
					? '<tr><td></td><td><a href="' + options.alternatePaymentTypePageUrl + '" class="onp-pm-pform-alternate-payment-type-link" target="_blank">' + $.pandalocker.lang.pl_not_suitable_payment_method + '</a></td></tr>'
					: '';

				var termsLink = $.pandalocker.lang.pl_payment_form_terms.replace("{%terms_url%}", options.termsPageUrl);

				var newPaymentForm = '<form method="POST" action="https://money.yandex.ru/quickpay/confirm.xml" target="_blank">' +
					'<table class="onp-pm-pform-table"><tbody>' +
					'<tr><td>' + $.pandalocker.lang.pl_payment_form_target_label + ':</td><td><strong>' + options.targets + '</strong></td></tr>' +
					'<tr><td>' + $.pandalocker.lang.pl_payment_form_price_label + ':</td><td><strong>' + options.sum + ' руб.</strong></td></tr>' +
					'<tr><td>' + $.pandalocker.lang.pl_payment_form_way_label + ':</td><td>' +
					'<label><select name="paymentType">' +
					'<option value="AC" selected>' + $.pandalocker.lang.pl_yandex_payment_type_ac + '</option>' +
					'<option value="PC">' + $.pandalocker.lang.pl_yandex_payment_type_pc + '</option>' +
					'</select></label>' +
					'</td></tr>' + alternatePaymentTypeLink +
					'</tbody></table>' +
					'<div class="onp-pm-pform-bottom">' +
					'<div class="onp-pm-pform-bottom-left-side"><label><input type="checkbox" class="onp-pm-payment-terms-checkbox" checked> ' + termsLink + ' </label></div>' +
					'<div class="onp-pm-pform-bottom-right-side"><input type="submit" class="onp-pm-payment-button" value="Перейти к оплате"></div>' +
					'</div>' +
					'<input type="hidden" name="receiver" value="' + options.receiver + '">		' +
					'<input type="hidden" name="label" value="' + options.label + '">' +
					'<input type="hidden" name="quickpay-form" value="' + options.quickpay + '">' +
					'<input type="hidden" name="targets" value="' + options.targets + '">' +
					'<input type="hidden" name="sum" value="' + options.sum + '" data-type="number">' +
					'</form>';

				if( screenHeaderText ) {
					$holder.append(screenHeader);
				}

				if( screenDescriptionText ) {
					$holder.append(screenDescription);
				}

				$holder.append(formWrap.append(newPaymentForm));

				var termsCheckbox = $('.onp-pm-payment-terms-checkbox', $holder),
					paymentButton = $('.onp-pm-payment-button', $holder);

				termsCheckbox.change(function() {
					if( $(this).is(':checked') ) {
						paymentButton.removeClass('disabled');
					} else {
						paymentButton.addClass('disabled');
					}
				});

				paymentButton.click(function() {
					if( $(this).hasClass('disabled') ) {
						return false;
					}

					locker._showScreen('data-processing', {
						screenText: $.pandalocker.lang.pl_payment_form_process
					});

					var ajaxUrl = locker.options.paylocker && locker.options.paylocker.ajaxUrl;

					if( !ajaxUrl ) {
						return;
					}

					var pullTimer = setInterval(function() {
						$.ajax({
							url: ajaxUrl,
							type: 'post',
							dataType: 'json',
							data: {
								action: 'onp_pl_check_transaction',
								transactionId: options.label
							},
							success: function(data, textStatus, jqXHR) {

								if( !data || data.error || data.transaction_status == 'cancel' ) {
									clearInterval(pullTimer);
									locker._showScreen('paylocker-error', {
										errorMessage: data.error
									});
								}

								if( data.transaction_status == 'finish' ) {
									clearInterval(pullTimer);
									locker._showScreen('paylocker-success-payment');
								}
							}
						});
					}, 10000);
				});
			}
		);

	});

})(jQuery);

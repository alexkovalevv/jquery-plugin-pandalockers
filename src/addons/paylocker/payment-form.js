/**
 * Настройка тем для платного контента
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 10.06.2017
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

	// Регистрируем экран с формой оплаты от яндекса
	$.__pl.tools.addHook('init', function(e, locker) {

		// SCREEN: payment form
		locker._registerScreen('paylocker-payment-form',
			function($holder, options) {

				var optionsDefault = {
					header: null,
					text: null,
					paymentUrl: '#',
					transactionId: null,
					price: null,
					paymentGateWay: {}
				};

				options = $.extend(true, optionsDefault, options);

				if( !options.transactionId || options.transactionId == '' ) {
					setTimeout(function() {
						locker._showScreen('paylocker-error', {
							errorMessage: 'Не передан ID транзакции.'
						});
					}, 500);
					return;
				}

				if( !options.paymentUrl || options.paymentUrl == '' ) {
					setTimeout(function() {
						locker._showScreen('paylocker-error', {
							errorMessage: 'Не передан url процесса оплаты.'
						});
					}, 500);
					return;
				}

				if( !options.price || options.price == '' ) {
					setTimeout(function() {
						locker._showScreen('paylocker-error', {
							errorMessage: 'Не передана сумма покупки.'
						});
					}, 500);
					return;
				}

				var screenHeaderText = options.header || $.pandalocker.lang.pl_payment_form_header,
					screenDescriptionText = options.text || $.pandalocker.lang.pl_payment_form_subscription_description;

				var screenHeader = '<h3 class="onp-pm-screen-header">' + screenHeaderText + '</h3>',
					screenDescription = '<div class="onp-pm-screen-text">' + screenDescriptionText + '</div>',
					formWrap = $('<div class="onp-pm-yandex-payment-form"></div>');

				var termsLink = $.pandalocker.lang.pl_payment_form_terms.replace("{%terms_url%}", options.termsPageUrl);

				var currencyName = $.__pl.tools.extractOption(locker.options, 'currency', 'USD');

				var newPaymentForm = '<table class="onp-pm-pform-table"><tbody>' +
					'<tr><td>' + $.pandalocker.lang.pl_payment_form_target_label + ':</td><td><strong>' + $.pandalocker.lang.pl_payment_form_purchase_target + '</strong></td></tr>' +
					'<tr><td>' + $.pandalocker.lang.pl_payment_form_price_label + ':</td><td><strong>' + options.price + $.__pl.tools.getCurrencySymbol(currencyName) + '</strong></td></tr>' +
					'<tr><td>' + $.pandalocker.lang.pl_payment_form_way_label + ':</td><td>' +
					options.paymentGateWay.title +
					'</td></tr>' +
					'</tbody></table>' +
					'<div class="onp-pm-pform-bottom">' +
					'<div class="onp-pm-pform-bottom-left-side"><label><input type="checkbox" class="onp-pm-payment-terms-checkbox" checked> ' + termsLink + ' </label></div>' +
					'<div class="onp-pm-pform-bottom-right-side"><input type="submit" class="onp-pm-payment-button" value="Перейти к оплате"></div>' +
					'</div>';

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

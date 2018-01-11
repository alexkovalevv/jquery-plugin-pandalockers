/**
 * Регистрируем экран выбора способа оплаты
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

	$.__pl.tools.addHook('init', function(e, locker) {
		// SCREEN: payment gateways
		locker._registerScreen('paylocker-payment-gateways',
			function($holder, options) {

				var optionsDefault = {
					header: 'Выберите способ оплаты',
					text: 'Внимание! Если вы не нашли подходящий вам способ оплаты, вы можете выбрать способ оплаты "вручную", чтобы оплатить удобным вам способом.',
					paymentUrl: '#',
					transactionId: 'sfsdf',
					price: 990
				};

				options = $.extend(true, optionsDefault, options);

				if( options && options.header ) {
					var screenHeaderEl = $('<div class="onp-pl-screen-header">' + options.header + '</div>');
					$holder.append(screenHeaderEl);
				}

				if( options && options.text ) {
					var screenTextEl = $('<div class="onp-pl-screen-text">' + options.text + '</div>');
					$holder.append(screenTextEl);
				}

				var gateWays = $.__pl.tools.extractOption(locker.options, 'gateWays');

				if( !gateWays || !$.isPlainObject(gateWays) ) {
					return;
				}

				var contanier = $('<div class="onp-pl-gateways-wrap"></div>');

				var button, gateWay, gateWayTitle;

				for( var gateWayName in gateWays ) {
					if( !gateWays.hasOwnProperty(gateWayName) ) {
						continue;
					}
					gateWay = gateWays[gateWayName];
					gateWayTitle = gateWay.title || gateWayName;

					button = $('<div class="onp-pl-gateway-button"></div>').addClass('onp-pl-gateway-' + $.pandalocker.tools.destroyCamelCase(gateWayName));
					button.data('gateway', gateWayName);
					contanier.append(button);

					button.click(function() {
						locker._showScreen('paylocker-payment-form', {
							paymentUrl: options.paymentUrl,
							paymentGateWay: gateWays[$(this).data('gateway')],
							price: options.price,
							transactionId: options.transactionId,

						});
					});
				}

				$holder.append(contanier);
			});
	});

	$.__pl.tools.addHook('lock', function(e, locker) {
		locker._showScreen('paylocker-payment-gateways', {
			header: 'Выберите способ оплаты',
			text: 'Внимание! Если вы не нашли подходящий вам способ оплаты, вы можете выбрать способ оплаты "вручную", чтобы оплатить удобным вам способом.'
		});
	});

})(jQuery);

/*!
 * Loader Button
 * Copyright 2016, OnePress, http://byonepress.com
 */
(function($) {
	'use strict';

	$.pandalocker.hooks.add('opanda-init', function(e, locker, sender) {
		if( !locker.options.locker.loader ) {
			return;
		}

		var defaultStateStorage = new $.pandalocker.storages.defaultStateStorage(locker);
		var uri = $.pandalocker.tools.uri(locker.options.socialButtons.facebook.like.url || window.location.href);
		var facebookButtonUrl = uri.normalize().toString();
		var identify = defaultStateStorage._getValue("page_" + $.pandalocker.tools.hash(facebookButtonUrl) + "_hash_facebook-like");

		if( identify === true && locker.options.locker.timer ) {
			locker.options.demo = true;

			locker._registerScreen('loader-button-processing',
				function($holder, options) {

					var timer = locker.options.locker.timer;

					var progressBar = $('<progress value="0" max="' + timer + '">' +
					'Загружено <span class="percent">0</span>%' +
					'</progress>');

					progressBar.css({
						width: "100%",
						height: "7px",
						margin: "20px 0"
					});

					locker.options.text.header && $holder.append(
						$('<div style="text-align:center;font-size: 18px;font-weight: bold;color:#1653B7;margin-bottom: 15px;">' +
						locker.options.text.header +
						'</div>')
					);
					locker.options.text.message && $holder.append(
						$('<div>' + locker.options.text.message + '</div>')
					);
					$holder.append(progressBar);

					var countInteration = 0;
					var progressBarTimer = setInterval(function() {
						if( timer > countInteration ) {
							progressBar.val(progressBar.val() + 1);
							progressBar.find('.percent').text(progressBar.val() + 1);
						} else {
							clearInterval(progressBarTimer);
							locker.unlock("loader");
						}
						countInteration++;
					}, 1000);
				}
			);

			locker.addHook('markup-created', function() {
				locker._showScreen('loader-button-processing');
				locker.locker.find('.onp-sl-timer').hide();
			});
		}
	});

})(jQuery);
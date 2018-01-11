/*!
 * Google Analytics
 * Copyright 2014, OnePress, http://byonepress.com
 * 
 * @since 4.0.0
 * @pacakge extras

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:65
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	if( !$.pandalocker.extras ) {
		$.pandalocker.extras = {};
	}

	$.pandalocker.extras.googleAnalytics = {

		init: function() {

			if( !this.options.googleAnalytics ) {
				return;
			}

			var self = this;

			this.addHook('unlock', function(locker, sender, senderName, url) {

				if( !window._gaq && !window.ga ) {
					return;
				}
				if( !url ) {
					url = window.location.href;
				}

				if( 'button' === sender ) {

					var buttonName = null;

					if( senderName === 'facebook-like' ) {
						buttonName = 'Facebook Like';
					}
					else if( senderName === 'facebook-share' ) {
						buttonName = 'Facebook Share';
					}
					else if( senderName === 'twitter-tweet' ) {
						buttonName = 'Twitter Tweet';
					}
					else if( senderName === 'twitter-follow' ) {
						buttonName = 'Twitter Follow';
					}
					else if( senderName === 'google-plus' ) {
						buttonName = 'Google Plus';
					}
					else if( senderName === 'google-share' ) {
						buttonName = 'Google Share';
					}
					else if( senderName === 'linkedin-share' ) {
						buttonName = 'LinkedIn Share';
					}
					else if( senderName === 'youtube-subscribe' ) {
						buttonName = 'Google Youtube';
					}
					else if( senderName === 'facebook' ) {
						buttonName = 'Facebook Sign-In';
					}
					else if( senderName === 'twitter' ) {
						buttonName = 'Twitter Sign-In';
					}
					else if( senderName === 'google' ) {
						buttonName = 'Google Sign-In';
					}
					else if( senderName === 'linkedin' ) {
						buttonName = 'LinkedIn Sign-In';
					}
					else if( senderName === 'form' ) {
						buttonName = 'Opt-In Form';
					} else {
						buttonName = senderName.substr(0, 1).toUpperCase() + senderName.substr(1);
						buttonName = locker.applyFilters('google-analytics-button-name-filter', buttonName, [senderName], true);
					}

					trackEvent('Lockers', 'Unlocked (Total)', url);
					trackEvent('Lockers ', 'Unlocked via ' + buttonName, url);

				} else if( 'timer' === sender ) {

					trackEvent('Lockers', 'Skipped (Total)', url);
					trackEvent('Lockers ', 'Skipped via Timer', url);

				} else if( 'cross' === sender ) {

					trackEvent('Lockers', 'Skipped (Total)', url);
					trackEvent('Lockers ', 'Skipped via Cross', url);

				}
			});

			var trackEvent = function(category, action, value) {

				if( window.ga ) {
					window.ga('send', 'event', category, action, value);
				} else {
					window._gaq.push(['_trackEvent', category, action, value]);
				}
			};
		}
	};

})(__$onp);

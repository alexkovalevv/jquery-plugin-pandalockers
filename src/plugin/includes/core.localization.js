/*
 * Localization
 * Copyright 2016, OnePress, http://byonepress.com
 * @pacakge core

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:100
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {

	/**
	 * Text resources.
	 */

	if( !$.pandalocker ) {
		$.pandalocker = {};
	}

	if( !$.pandalocker.lang ) {
		$.pandalocker.lang = {};
	}
	if( !$.pandalocker.lang.defaults ) {
		$.pandalocker.lang.defaults = {};
	}

	// @if lang != 'rus'

	$.pandalocker.lang.defaults = {

		// - translatable text

		// the Screen "Please Confirm Your Email"

		confirm_screen_title: 'Please Confirm Your Email',
		confirm_screen_instructiont: 'We have sent a confirmation email to {email}. Please click on the confirmation link in the email to reveal the content.',
		confirm_screen_note1: 'The content will be unlocked automatically within 10 seconds after confirmation.',
		confirm_screen_note2: 'Note delivering the email may take several minutes.',

		confirm_screen_cancel: '(cancel)',
		confirm_screen_open: 'Open my inbox on {service}',

		// the Screen "One Step To Complete"

		onestep_screen_title: 'One Step To Complete',
		onestep_screen_instructiont: 'Please enter your email below to continue.',
		onestep_screen_button: 'OK, complete',

		// the sign-in buttons

		signin_long: 'Sign in via {name}',
		signin_short: 'via {name}',
		signin_facebook_name: 'Facebook',
		signin_twitter_name: 'Twitter',
		signin_google_name: 'Google',
		signin_linkedin_name: 'LinkedIn',

		// miscellaneous

		misc_data_processing: 'Processing data, please wait...',
		misc_or_enter_email: 'or enter your email manually to sign in',

		misc_enter_your_name: 'enter your name',
		misc_enter_your_email: 'enter your email address',

		misc_your_agree_with: 'By clicking on the button(s), you agree with {links}',
		misc_terms_of_use: 'Terms of Use',
		misc_privacy_policy: 'Privacy Policy',

		misc_or_wait: 'or wait {timer}s',
		misc_close: 'Close',
		misc_or: 'OR',

		// errors & notices

		errors_empty_email: "Please enter your email address.",
		errors_inorrect_email: "It seems you entered an incorrect email address. Please check it.",
		errors_empty_name: "Please enter your name.",
		errors_empty_field: "Please fill this field.",
		errors_invalid_value: "Invalid value. Please check the value you entered.",
		errors_invalid_date: "Please enter a valid date.",
		errors_invalid_month: "Please enter a valid month number (between 01 and 12).",
		errors_invalid_day: "Please enter a valid day number (between 01 and 31).",

		errors_subscription_canceled: "You have canceled your subscription.",
		errors_not_signed_in: "Sorry, but you have not signed in. Please try again.",
		res_errors_not_granted: "Sorry, but you have not granted all the required permissions ({permissions}). Please try again.",

		// - default text & internal errors

		// common resources

		error: 'error',
		noSpam: 'Your email address is 100% safe from spam!',

		errors: {
			ajaxError: 'Unexpected ajax error. Please check the console log to get more details.',
			unableToLoadSDK: 'Unable to load SDK script for "{0}" due to the error "{1}". Please make sure that nothing blocks loading of social scripts in your browser. Some browser extentions (Avast, PrivDog, AdBlock etc.) or usage of private tabs in FireFox may cause this issue. Turn them off and try again.',
			unableToCreateControl: 'Unable to create ({0}). Please make sure that nothing blocks loading of social scripts in your browser. Some browser extentions (Avast, PrivDog, AdBlock etc.) can cause this issue. Turn them off and try again.',
			invlidFacebookAppId: 'Invalid App ID or given URL is not allowed by the Application configuration: One or more of the given URLs is not allowed by the App\'s settings.  It must match the Website URL or Canvas URL, or the domain must be a subdomain of one of the App\'s domains.',
			emptyFBAppIdError: 'Please set your Facebook App ID.',
			emptyTwitterFollowUrlError: 'Please set an URL of your Twitter profile.',
			tweetNotFound: 'Please make sure that you have posted the tweet. Unfortunately we have not manage to find the tweet in your account.',
			followingNotFound: 'Please make sure that you have followed us. Unfortunately we have not manage to find you in the list of followers.',
			unsupportedTwitterTweetLayout: 'The Twitter Tweet Button doesn\'t support the vertical layout. Please remove the Tweet button or select another theme.',
			unsupportedTwitterFollowLayout: 'The Twitter Follow Button doesn\'t support the vertical layout. Please remove the Follow button or select another theme.',
			emptyYoutubeChannelId: 'Please set your Youtube Channel ID.',
			emptyGoogleClientId: 'Please set your Google Client ID.',
			unsupportedYoutubeSubscribeLayout: 'The Youtube Subscribe Button doesn\'t support the vertical layout. Please remove the Subscribe button or select another theme.',
			unableToCreateButton: 'Unable to create ({0}). Please make sure that nothing blocks loading of social scripts in your browser. Some browser extentions (Avast, PrivDog, AdBlock etc.) can cause this issue. Turn them off and try again.'
		},

		// locker type-dependent resources

		scopes: {

			// when the Connect Buttons is the primary group

			signinLocker: {
				defaultHeader: "Sing In To Unlock This Content",
				defaultMessage: "Please sign in. Just click one of the buttons below to get instant access.",

				btnSubscribe: "sign in to unlock",

				viaSignInLong: "{long}",
				viaSignInShort: "{short}"
			},

			// when the Subscription is the primary group

			emailLocker: {
				defaultHeader: "This Content Is Only For Subscribers",
				defaultMessage: "Please subscribe to unlock this content. Just enter your email.",

				btnSubscribe: "subscribe to unlock",

				viaSignInLong: "{short}",
				viaSignInShort: "{name}"
			},

			// when the Social Buttons is the primary group

			socialLocker: {
				defaultHeader: "This content is locked",
				defaultMessage: "Please support us, use one of the buttons below to unlock the content."
			}
		},

		// text resources for the group 'connect-buttons'

		connectButtons: {

			defaultMessage: "subscribe via your social profile by one click",

			facebook: {},

			google: {
				clientIdMissed: "The Google Client ID is not set. You need to generate a client ID before using the button.",
				unexpectedError: 'Unable to sign in. Unexpected error occurred: {0}'
			},

			twitter: {
				proxyEmpty: "The proxy URL is empty. The proxy is used to call Twitter API."
			},

			linkedin: {
				clientIdMissed: "The LinkedIn Client ID or Client Secret is not set. You need to set these settings before using the button."
			},

			defaultSeparator: "or",

			errorYouTubeChannelMissed: "Please set an ID of your Youtube channel to subscribe.",
			errorLinkedInCompanyNotFound: "The LinkedIn company '{0}' not found.",
			errorLinkedInCompanyMissed: "Please specify the LinkedIn company ID or name to follow.",
			errorTwitterUserMissed: "Please specify the Twitter user name to follow.",
			errorTwitterMessageMissed: "Please specify the message to tweet."
		},

		// text resources for the group 'subscription'

		subscription: {

			defaultText: 'Cannot sign in via social networks? Enter your email manually.',
			defaultButtonText: 'done, sign in to unlock'
		},

		// text resources for the group 'social-buttons'

		socialButtons: {

			// default labels for the buttons covers
			facebookLike: 'like us',
			facebookShare: 'share',
			twitterTweet: 'tweet',
			twitterFollow: 'follow us',
			googlePlus: '+1 us',
			googleShare: 'share',
			youtubeSubscribe: 'subscribe',
			linkedinShare: 'share',
			vkLike: 'like us',
			vkShare: 'share',
			vkSubscribe: 'subscribe',
			okShare: 'share',
			mailShare: 'share',
			draugiemShare: 'share',
			instagram: 'subscribe',
			livejornal: 'subscribe'
		}
	};

	$.pandalocker.lang = $.pandalocker.lang.defaults;

	if( window.__pandalockers && window.__pandalockers.lang ) {
		$.pandalocker.lang = $.extend($.pandalocker.lang, window.__pandalockers.lang);
		//window.__pandalockers.lang = null;
	}

})(__$onp);

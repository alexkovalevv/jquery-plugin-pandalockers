/*
 * Localization
 * Copyright 2016, OnePress, http://byonepress.com
 * @pacakge core

 * @!jsObfuscate:false
 * @!preprocess:true
 * @!uglify:true
 * @!priority:0
 * @!lang:['rus']
 * @!build:['localization-pack']
 */

(function($) {
	$.pandalocker.hooks.add('opanda-before-init', function(e, locker) {
		var defaults = {
			// - translatable text

			// the Screen "Please Confirm Your Email"

			confirm_screen_title: 'Пожалуйста, подтвердите ваш Email адрес',
			confirm_screen_instructiont: 'На ваш email адрес {email} отправлено письмо. Пожалуйста, откройте письмо и подтвердите подписку, чтобы разблокировать контент.',
			confirm_screen_note1: 'После подтверждения контент разблокируется автоматически в течение 10 секунд.',
			confirm_screen_note2: 'Ожидание подтверждения может занять несколько минут.',

			confirm_screen_cancel: '(Отмена)',
			confirm_screen_open: 'Открыть мой почтовый ящик в {service}',

			// the Screen "One Step To Complete"

			onestep_screen_title: 'Один шаг до завершения',
			onestep_screen_instructiont: 'Пожалуйста, введите ваш email адрес',
			onestep_screen_button: 'Все хорошо',

			// the sign-in buttons

			signin_long: '{name}',
			signin_short: '{name}',
			signin_facebook_name: 'Facebook',
			signin_twitter_name: 'Twitter',
			signin_google_name: 'Google',
			signin_linkedin_name: 'LinkedIn',
			signin_vk_name: 'Vkontakte',

			// miscellaneous
			misc_data_processing: 'Идет обработка данных, пожалуйста, подождите...',
			misc_or_enter_email: 'или введите свой email адрес вручную, чтобы авторизоваться',

			misc_enter_your_name: 'введите ваше имя',
			misc_enter_your_email: 'введите ваш email адрес',

			misc_your_agree_with: 'При нажатии на кнопку(и) вы соглашаетесь с {links}',
			misc_terms_of_use: 'условиями использования',
			misc_privacy_policy: '<br>политика конфиденциальности',

			misc_or_wait: 'или подождите {timer} сек',
			misc_close: 'Закрыть',
			misc_or: 'ИЛИ',

			alerts: {
				social_unshare: 'Оппс... Вы отписались (сняли отметку "мне нравится"), чтобы открыть замок нажмите кнопку снова!',
				social_share_aborted: 'Процесс не завершен или произошла ошибка в результате публикации записи. Попробуйте повторить попытку.'
			},

			// promts
			notUnlockPromptText: '<strong>Замок не открылся?</strong>Это возможно по следующим причинам:<br>1. Вы закрыли окно, не поделившись страницей.<br>2. Если окно, в котором вы делали репост, не закрылось автоматически, вы должны сделать это сами.<br>3. Возникла техническая ошибка.<br><br>',
			notUnlockPromptButtonYes: 'Попробовать снова?',
			notUnlockPromptButtonNo: 'Нет, я случайно нажал(а) кнопку',

			tryVkRepostPagePromptText: 'Спасибо, за вашу поддержку! Вам остался один шаг, после того, как вы нажмете кнопку "<b>продолжить</b>", появится всплывающее окно, нажмите кнопку "<b>отправить</b>" и закройте окно. Социальный замок проверит вашу стену и если вы действительно поделились страницей, замок будет открыт.',
			tryVkRepostPagePromptButtonYes: 'Продолжить',
			tryVkRepostPagePromptButtonNo: 'Нет, я случайно нажал(а) кнопку',

			postVkNotFindPromptText: '<strong>Запись не найдена на вашей стене вконтакте!</strong>Социальный замок не смог найти запись на вашей стене вконтакте, возможно, вы не завершили репост страницы или удалили запись.<br><br><em>Если запись этой страницы есть на вашей стене, но замок не открывается, пожалуйста, обратитесь к администратору сайта!</em><br><br>' +
			'Нажмите кнопку "Продолжить", чтобы попробовать поделиться страницей снова. Продолжить?',
			postVkNotFindPromptButtonYes: 'Продолжить',
			postVkNotFindPromptButtonNo: 'Отменить',

			tryVKSubscribePromptText: 'Вы пытаетесь подписаться на сообщество или страницу в социальной сети вконтакте. Вам остался один шаг, чтобы завершить подписку.',
			tryVKSubscribePromptButtonYes: 'Нажмите, чтобы продолжить',
			tryVKSubscribePromptButtonNo: 'Нет, я случайно нажал(а) кнопку',

			vk_cancel_subscribe: 'Подписка была отменена или вы пытаетесь подписаться на закрытое сообщество. Если вы случайно закрыли окно, пожалуйста, попробуйте подписаться снова, чтобы открыть скрытый контент.',

			mailCanNotOpenLockerPromptText: '<strong>Замок не может быть разблокирован!</strong>Причины возникновения ошибки:<br>1. Вы не завершили репост страницы<br>2. Ранее, Вы уже делились этой страницей, пожалуйста, попробуйте поделиться этой страницей в другой социальной сети.',
			mailCanNotOpenLockerPromptButtonNo: 'Скрыть уведомление',

			mailRepostConfirmPromptText: 'Социальный замок опубликовал запись на вашей стене в социальной сети, оставьте комментарий к записи или просто <b>закройте окно комментариев<b>.',
			mailRepostConfirmPromptButtonYes: 'Завершить',
			mailRepostConfirmPromptProcessButtonYes: 'Ожидание...',

			mailRepeatPostPagePromptText: 'Социальный замок определил, что вы ранее уже делились этой страницей. Старая запись была сброшена, чтобы поделиться страницей снова, <b>нажмите кнопку завершить</b>.',

			// errors & notices

			errors_empty_email: "Пожалуйста, введите ваш email адрес.",
			errors_inorrect_email: "Вы ввели некорректный email адрес. Пожалуйста, проверьте его и попробуйте снова.",
			errors_empty_name: "Пожалуйста, введите ваше имя.",

			errors_subscription_canceled: "Вы отменили подписку.",
			errors_not_signed_in: "Вы не вошли в систему. Пожалуйста, попробуйте еще раз.",
			res_errors_not_granted: "Вы не предоставили неоходимые права ({permissions}). Пожалуйста, попробуйте еще раз.",

			// - default text & internal errors

			// common resources

			error: 'ошибка',
			noSpam: 'Ваш email адрес на 100% защищен от спама.',

			errors: {
				unableToLoadSDK: 'Невозможно загрузить SDK сценарий для {0}. Пожалуйста, убедитесь, что ничто не препятствует загрузке социальных сценариев в вашем браузере. Некоторые расширения браузера (Avast, PrivDog, AdBlock и т.д.) могут вызывать эту проблему. Отключите их и попробуйте снова.',
				unableToCreateButton: 'Невозможно создать кнопку ({0}). Пожалуйста, убедитесь, что ничто не препятствует загрузке социальных сценариев в вашем браузере. Некоторые расширения браузера (Avast, PrivDog, AdBlock и т.д.) могут вызвать эту проблему. Отключите их и попробуйте снова.',
				tweetNotFound: 'Пожалуйста, убедитесь, что вы разместили твит. К сожалению, нам не удалось найти твит в вашем аккаунте.',
				emptyVKAppIdError: 'Пожалуйста, установите ID вашего ВКонтакте приложения.',
				emptyVKAppInvalidBaseDomain: 'Не установлен базовый домен в вашем приложении Вконтакте или базовый домен не совпадает с текущим доменом.',
				emptyVKAccessTokenError: 'Пожалуйста, установите токен доступа.',
				emptyVKGroupIdError: 'Пожалуйста, установите ID вашей группы/страницы ВКонтакте, на которую пользователи должны подписаться, чтобы разблокировать контент.',
				invalidVKGroupIdError: 'Пожалуйста, проверьте правильность ID вашей группы/страницы ВКонтакте, возможно вы ошиблись при вводе или группа/страница не существует.',
				emptyFBAppIdError: 'Пожалуйста, установите ID вашего Facebook приложения.',
				emptyFBGroupUrlError: 'Вы не указали url вашего сообщества в facebook или ссылка на сообщество некорректна.',
				emptyTwitterFollowUrlError: 'Пожалуйста, установите ссылку на ваш профиль в Twitter.',
				credentialError: 'Ваш лицензионный ключ не привязан к текущему домену, вы можете привязать ключ, обратившись в <a href="http://sociallocker.ru/create-ticket/">службу поддержки</a>.',
				credentialLinkText: 'Заблокировано с помощью "Социального Замка"',
				vkLikeAlertText: 'Чтобы разблокировать, нажмите сюда',
				facebookLikeAlertText: 'Чтобы открыть замок, пожалуйста, нажмите кнопку "подтвердить".',
				emptyGoogleClientId: 'Не установлен ID приложение Google. Вы должны создать идентификатор приложения в google',
				emptyYoutubeChannelId: 'Не установлен ID канала на Youtube. Вы должны получить его в вашем аккаунте.',
				unsupportedLayout: 'Кнопка {button} не поддерживает вертикальную структуру, пожалуйста, удалите кнопку или смените тему.',
				vk_uid_not_found: 'ID пользователя введен некорректно или пользователя с таким ID(<a href="https://vk.com/{vk_user_id}">{vk_user_id}</a>) не существует.',
				vk_group_id_not_found: 'ID группы введен некорректно или группы с таким ID(<a href="https://vk.com/{vk_group_id}">{vk_group_id}</a>) не существует.',
				vk_empty_group_id: 'Вы должны установить ID группы вконтакте для кнопки подписаться, чтобы устранить эту ошибку.',
				vk_empty_user_id: 'Вы должны установить ID пользователя вконтакте для кнопки подписаться, чтобы устранить эту ошибку.',
				ajaxError: 'Неожиданная ошибка Ajax. Пожалуйста, проверьте журнал консоли, чтобы получить более подробную информацию.',
				unableToCreateControl: 'Невозможно создать ({0}). Пожалуйста, убедитесь, что ничто не препятствует загрузке социальных сценариев в вашем браузере. Некоторые расширения браузера (Avast, PrivDog, AdBlock и т.д.) могут вызвать эту проблему. Отключите их и попробуйте снова.',
				invlidFacebookAppId: 'Ваш Id приложения на facebook недействителен, пожалуйста, проверьте его снова. Приложение должно иметь базовый домен идентичный домену, на котором вы используете плагин.',
				unexpected_error: 'Произошла неизвестная ошибка при попытке проверки данных. См. консоль для получения подробных данных.',
				unsupportedTwitterTweetLayout: 'Кнопка Twitter твит не поддерживает вертикальную структуру, пожалуйста, удалите кнопку или смените тему.',
				unsupportedTwitterFollowLayout: 'Кнопка Twitter подписаться не поддерживает вертикальную структуру, пожалуйста, удалите кнопку или смените тему.'
			},

			// locker type-dependent resources

			scopes: {

				// when the Connect Buttons is the primary group

				signinLocker: {
					defaultHeader: "Авторизуйтесь, чтобы разблокировать содержимое",
					defaultMessage: "Пожалуйста, авторизуйтесь. Нажмите на одну из кнопок ниже, чтобы разблокировать содержимое.",

					btnSubscribe: "авторизуйтесь, чтобы разблокировать",

					viaSignInLong: "{long}",
					viaSignInShort: "{short}"
				},

				// when the Subscription is the primary group

				emailLocker: {
					defaultHeader: "Этот контент только для подписчиков",
					defaultMessage: "Пожалуйста, подпишитесь, чтобы разблокировать содержимое. Просто введите ваш email адрес.",

					btnSubscribe: "авторизуйтесь, чтобы разблокировать",

					viaSignInLong: "{short}",
					viaSignInShort: "{name}"
				},

				// when the Social Buttons is the primary group

				socialLocker: {
					defaultHeader: "Этот контент заблокирован",
					defaultMessage: "Пожалуйста, поддержите нас, нажмите на одну из кнопок ниже, чтобы разблокировать контент."
				}
			},

			// text resources for the group 'connect-buttons'

			connectButtons: {

				defaultMessage: "подписаться на ваш социальный профайл одним нажатием",

				facebook: {},

				google: {
					clientIdMissed: "Не установлен ID приложение Google. Вы должны создать идентификатор приложения в google.",
					unexpectedError: 'Не удается авторизоваться. Неожиданная ошибка: {0}'
				},

				twitter: {
					proxyEmpty: "Прокси URL пуст. Прокси url используется для вызова Twitter API."
				},

				linkedin: {
					apiKeyMissed: "LinkedIn API ключ не установлен. Вы должны получить API ключ, прежде чем использовать кнопку.",
					apiKeyInvalid: "LinkedIn API ключ недействителен. Пожалуйста, проверьте его на корректность."
				},

				vk: {
					proxyEmpty: "Прокси URL пуст. Прокси url используется для вызова VK API.",
					appIdMissed: "Не установлен ID приложение Вконтакте. Вы должны создать идентификатор приложения в Вконтакте."
				},

				defaultSeparator: "или",

				errorYouTubeChannelMissed: "Пожалуйста, введите ID вашего канала на Youtube.",
				errorLinkedInCompanyNotFound: "Ваша компания '{0}' в LinkedIn не найдена.",
				errorLinkedInCompanyMissed: "Пожалуйста, установите Id вашей компании в LinkedIn.",
				errorTwitterUserMissed: "Пожалуйста, установите ID страницы в Twitter",
				errorTwitterMessageMissed: "Установите короткое сообщение, которым будут делиться в Twitter."
			},

			// text resources for the group 'subscription'

			subscription: {
				defaultText: 'Вы не можете авторизоваться через социальные сети? Введите адрес электронной почты вручную',
				defaultButtonText: 'сделано, открыть замок'
			},

			// text resources for the group 'social-buttons'

			socialButtons: {

				// default labels for the buttons covers
				facebookLike: 'мне нравится',
				facebookShare: 'поделиться',
				twitterTweet: 'твитнуть',
				twitterFollow: 'подписаться',
				googlePlus: 'плюсануть',
				googleShare: 'поделиться',
				youtubeSubscribe: 'подписаться',
				linkedinShare: 'поделиться',
				vkLike: 'мне нравится',
				vkShare: 'поделиться',
				vkSubscribe: 'подписаться',
				vkUnSubscribe: 'отписаться',
				okShare: 'класс',
				mailShare: 'поделиться'
			}
		};

		$.pandalocker.lang = $.extend(true, $.pandalocker.lang, defaults);

		if( window.__pandalockers && window.__pandalockers.lang ) {
			$.pandalocker.lang = $.extend(true, $.pandalocker.lang, window.__pandalockers.lang);
			//window.__pandalockers.lang = null;
		}
	});
})(__$onp);
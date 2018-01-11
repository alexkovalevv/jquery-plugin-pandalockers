/**
 * Текст и перевод для дополнения paylocker
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 10.12.2016
 * @version 1.0
 *
 * @!jsObfuscate:false
 * @!preprocess:false
 * @!uglify:true
 * @!priority:100
 * @!lang:[]
 * @!build:['paylocker']
 */

(function($) {
	'use strict';

	var messages = {
		pl_help: 'Помощь',
		pl_already_subscbibe: 'Уже подписаны? Тогда войдите',
		pl_contact_with_us: 'Остались вопросы? Напишите нам.',

		// форма оплаты
		pl_payment_form_header: 'Оплата премиум доступа',
		pl_payment_form_newuser_description: 'На ваш email адрес выслано письмо с интсрукциями по получению доступа к вашему аккаунту. Пожалуйста, завершите оплату.',
		pl_payment_form_subscription_description: 'После оплаты ваш аккаунт перейдет в статус премиум подписчика, все замки будут сняты.',
		pl_payment_form_purchase_description: 'После оплаты статьи, замок с нее будет снят. Ссылки на приобретенные вами статьи будет в личном кабинете пользователя.',
		pl_payment_form_subscribe_target: 'Оформление премиум подписки',
		pl_payment_form_purchase_target: 'Покупка одной статьи',
		pl_payment_form_target_label: 'Назначение платежа',
		pl_payment_form_price_label: 'Сумма',
		pl_payment_form_way_label: 'Способ оплаты',
		pl_payment_form_terms: 'C <a href="{%terms_url%}" target="_blank">условиями оплаты</a> ознакомлен',
		pl_payment_form_process: 'Пожалуйста, подождите... Мы проверяем ваш платеж.',
		pl_payment_successful: 'Оплата успешно завершена!',
		pl_payment_have_last_step: 'Вам остался один шаг, <a href="{%login_url%}">авторизуйтесь</a> на нашем сайте, чтобы открыть замки. ',

		pl_yandex_payment_type_ac: 'Банковской картой',
		pl_yandex_payment_type_pc: 'Яндекс.Деньгами',
		pl_not_suitable_payment_method: 'Не подходит способ оплаты?',

		pl_separatorText: '----- ИЛИ -----',
		pl_confirm_email_description: 'Пожалуйста, введите свой email. Мы создадим для вас аккаунт на нашем сайте или обновим премиум доступ у ранее созданного аккаунта.',
		pl_confirm_email_text_button: 'Подтвердить',
		pl_table_not_found: 'Вы не создали еще не одного тарифа. Пожалуйста, настройте тарифы в панели управления.',
		pl_ctable_header: 'Название тарифа',
		pl_ctable_price: 'Цена не установлена',
		pl_ctable_discount: 'СКИДКА {%discount%}',
		pl_ctable_description: 'Текст перед кнопкой',
		pl_ctable_button_text: 'Оформить подписку',
		pl_ctable_after_button_text: 'Текст после кнопки',

		// prompt reminde subscribe
		pl_prompt_reminde_subscribe_message: 'Вы начали, но не завершили подписку на премием доступ к контенту сайта!<br> Желаете перейти к оплате или отменить подписку?',
		pl_prompt_reminde_subscribe_button_yes: 'Перейти к оплате',
		pl_prompt_reminde_subscribe_button_no: 'Отменить подписку',
		// prompt email not exists
		pl_promt_email_not_exists: '[{%email%}] не зарегистрирован или вы ввели его с ошибкой. Создать новый аккаунт с этим email адресом и привязать к нему вашу покупку?',
		pl_promt_email_not_button_yes: 'Да, создать новый аккаунт',
		pl_promt_email_not_button_no: 'Отмена',

		pl_errors: {
			undefined_yandex_client_id: 'Не передан account id яндекс денег.',
			no_amount_is_set: 'Не установлена сумма платежа.',
			tarif_not_found: 'Тариф [{tarif_name}] не настроен.',
			payment_gateway_not_found: 'Платежный путь [{payment_gateway}] не существует.',
			ajax_unknown_error: 'Произошла неивестная ошибка во время выполнения запроса. Пожалуйста, свяжитесь с нашей <a href="{%support_url%}">службой поддеддержки</a>, чтобы решить эту проблему.',
			required_parameter_table_name: 'Не передан обязательный параметр tableName или transactionId',
			required_parameter_proxy: 'Не передан обязательный параметр proxy или tableName',
			lock_settings_not_passed: 'Не переданы настройки замка'
		}
	};

	$.pandalocker.lang = $.extend(true, $.pandalocker.lang, messages);

})(__$onp);

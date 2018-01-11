<?php
	/**
	 * Тестирование социального замка
	 * @author Alex Kovalev <alex.kovalevv@gmail.com>
	 * @copyright Alex Kovalev 28.05.2017
	 * @version 1.0
	 */

	// free - бесплатная версия для jQuery
	// premium - платная версия для jQuery
	// full-premium - платная версия для Wordpress
	// full-free - бесплатная версия для Wordpress
	define('BUILD', 'premium');

	// rus, en
	define('LANG', 'en');

	define('BASE_DIR', dirname(__FILE__));
	define('PLUGIN_DIR', BASE_DIR . '\..\\plugin');
	define('ADDONS_DIR', BASE_DIR . '\..\\addons');

	require_once('require.php');

	/**
	 * Данный класс собирает все файлы (js, css) плагина и подключает их на странице в зависимости от настроект в каждом из файлов.
	 * Создан с целью удобства и быстрой отладки приложения. Не требует ручного добавления ссылки на файл или модуль.
	 */
	$plugin_files = new RequireScriptsAndStyles(PLUGIN_DIR, ADDONS_DIR);

	/** Запускаем процесс сбора файлов */
	$plugin_files->loadPluginScripts(array('build' => BUILD, 'lang' => LANG));
	$plugin_files->loadAddonsScripts(array(
		'localization-pack' => array('build' => 'localization-pack', 'lang' => LANG),
		'migration-rus-to-en',
		'paylocker'
	));

?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8"/>
	<meta name="viewport" content="width=device-width"/>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<title>Example</title>
	<script src="libs/jquery.min.js"></script>

	<?php $plugin_files->printJsFiles(BASE_DIR); ?>
	<?php $plugin_files->printCssFiles(BASE_DIR); ?>

	<script>
		// __$onp - пространство в котором работает плагин. Необходимо для облачного плагина, для устранения конфликтов.
		// Для обычной сборки, используется общее пространство jQuery

		__$onp(document).ready(function($) {

			// Отключаем некоторы настройки для аддонов, чтобы протестировать приложение
			$.pandalocker.hooks.add('opanda-filter-options', function(options, locker) {
				options.credential = false;
				return options;
			}, 20);

			$('body').pandalocker({
				demo: true,

				theme: {
					name: 'default',
					// default, light, black, forest
					style: 'default'
				},

				locker: {
					close: true,
					timer: 300
				},

				overlap: {
					mode: 'blurring',
					position: 'scroll'
				},

				groups: {
					order: ["pricing-tables"]
				},

				paylocker: {

					ajaxUrl: 'http://testwp.dev/wp-admin/admin-ajax.php',
					helpUrl: 'https://ya.ru',
					loginUrl: 'https://ya.ru',
					supportUrl: 'https://ya.ru',

					currency: 'USD',

					gateWays: {
						paypal: {
							title: 'Paypal',
							processUrl: ''
						},
						yandexMoney: {
							title: 'Yandex деньги',
							processUrl: ''
						}
					},

					// screen, page-redirect
					paymentForms: {
						yandex: {
							receiver: '410011242846510',
							targets: 'Тест тест',
							successURL: ''
						}
					}

				},

				pricingTables: {
					orderTables: ['table1', 'table2', 'table3'],
					tables: {

						table1: {
							itemType: 'table',

							paymentType: 'purchase',
							price: 50,
							header: '1 перевод',
							description: '<div class="onp-pl-control-table-row">3 месяца в подарок</div><div class="onp-pl-control-table-row">10 сайтов</div><div class="onp-pl-control-table-row">3 смс</div><div class="onp-pl-control-table-row">+книга в подарок</div></div>',
							buttonText: 'Купить',
							afterButtonText: ''
						},
						table2: {

							itemType: 'table',
							paymentType: 'subscribe',
							price: 550,
							header: '6 месяцев',
							description: '<div class="onp-pl-control-table-row">3 месяца в подарок</div><div class="onp-pl-control-table-row">10 сайтов</div><div class="onp-pl-control-table-row">3 смс</div><div class="onp-pl-control-table-row">+книга в подарок</div></div>',
							buttonText: 'Подписаться',
							afterButtonText: ' '
						},

						table3: {
							itemType: 'table',
							paymentType: 'subscribe',
							price: 950,
							header: '1 год',
							description: '<div class="onp-pl-control-table-row">3 месяца в подарок</div><div class="onp-pl-control-table-row">10 сайтов</div><div class="onp-pl-control-table-row">3 смс</div><div class="onp-pl-control-table-row">+книга в подарок</div></div>',

							buttonText: 'Подписаться',
							afterButtonText: ''

						},

						separator1: {
							itemType: 'separator'
						},

						table4: {
							itemType: 'table',
							paymentType: 'purchase',
							price: 60,
							header: 'Один перевод',
							buttonText: 'Купить'
						}
					}
				}
			});

			// Фикс для подгрузки изображений. Баг с вечной полосой загрузки, это не баг.
			// Просто нужно доработать этот фикс, в публичной версии все работает нормально.
			$('*').each(function() {
				var newBg = $(this).css('background-image').replace('plugin/css', 'plugin');
				$(this).css('background-image', newBg);
				$(this).css('background-repeat', $(this).css('background-repeat'));
			});
		});
	</script>
</head>
<body>
<div class="wrap">
	<div style="max-width: 800px; margin: 20px auto;text-align: center">
		<img src="img/image.jpg" alt="Preview image"><br/>
		<i>Lorem ipsum — название классического текста-«рыбы».</i>

		<div>
			<p>Lorem ipsum представляет собой искажённый отрывок из философского трактата Цицерона «О пределах
				добра
				и зла» , написанного в 45 году до нашей эры на латинском языке. Впервые этот текст был применен
				для
				набора шрифтовых образцов неизвестным печатником в XVI веке. </p>
		</div>
	</div>
</div>
</body>
</html>
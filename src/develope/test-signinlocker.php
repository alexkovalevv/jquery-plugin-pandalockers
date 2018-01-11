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
	define('BUILD', 'full-free');

	// rus, en
	define('LANG', 'rus');

	define('BASE_DIR', dirname(__FILE__));
	define('PLUGIN_DIR', BASE_DIR . '\..\\plugin');
	define('ADDONS_DIR', BASE_DIR . '\..\\addons');

	require_once('require.php');

	/**
	 * Данный класс собирает все файлы (js, css) плагина и подключает их на странице в зависимости от настроект в каждом из файлов.
	 * Создан с целью удобства и быстрой отладки приложения. Не требует ручного добавления ссылки на файл или модуль.
	 */
	$plugin_files = new RequireScriptsAndStyles(PLUGIN_DIR, ADDONS_DIR);

	// Запускаем процесс сбора файлов
	$plugin_files->loadPluginScripts(array('build' => BUILD, 'lang' => LANG));

	if( LANG !== 'en' ) {
		// Подключаем локализацию
		$plugin_files->loadAddonsScripts(array(
			'localization-pack' => array('build' => 'localization-pack', 'lang' => LANG),
			'migration-rus-to-en',
			'buttons-pack' => array('build' => 'premium'),
			//'license' => array('build' => 'premium')
		));
	}
?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8"/>
	<meta name="viewport" content="width=device-width"/>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<title>Example</title>
	<script src="libs/jquery.min.js"></script>
	<script src="libs/URI.js"></script>

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

					// Если установлено true, приложение является публичным
					// Для публичный приложений в случае ошибки, если кнопка будет одна
					// замок будет всегда открываться, чтобы не ограничивать доступ для пользователей.
					// Также для публичных приложений все кнопки с ошибками, если их больше одной
					// скрываются, а ошибки кнопок выводятся в консоли браузера.
					// -------------
					// Работает только при установленном аддоне миграции
					appPublic: false,

					// Добавлять ссылку на автора или нет
					// -------------
					// Работает только при установленном аддоне миграции
					credential: false,

					// Для отладки Iframe кнопок
					debug: true,
					debugOptions: {
						onpSdkUrl: 'http://cdn.sociallocker.dev/ifbcreator.js'
					},

					groups: {
						order: ["connect-buttons"]
					},

					theme: {
						name: 'great-attractor'
					},

					overlap: {
						// Возможные режимы:
						// - full: скрывает контент полностью
						// - transparence: прозрачный слой
						// - blurring: размытый слой
						mode: 'transparent',

						// middle, top, scroll
						position: 'scroll'
					},

					connectButtons: {
						order: ['facebook', 'google'],
						facebook: {
							appId: '1397249660309704'
						},
						google: {
							clientId: '788541852920-tb8unl80leqd35007tl8l1l1qsfqrmbs.apps.googleusercontent.com',
							youtube: {
								channelId: 'UCNfxB3nWgDIpkItC6KSqKsw'
							}
						}
					}
				}
			);

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
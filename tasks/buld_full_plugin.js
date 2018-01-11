/**
 * Сборка полнофункционального плагина
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 29.03.2017
 * @version 1.0
 */
module.exports = function(grunt) {
	"use strict";

	/**
	 * СОЗДАНИЕ АНГЛОЯЗЫЧНОЙ СБОРКИ ДЛЯ WORDPRESS
	 * ----------------------------------------------------
	 * */

	grunt.registerTask('BUILD_WORDPRESS_PLUGIN_EN', function() {
		grunt.option('plugin.build', 'full-premium');
		grunt.option('plugin.lang', 'en');

		grunt.task.run(['build_plugin', 'build_examples']);
	});

	/**
	 * СОЗДАНИЕ РУССКОЙ ПРЕМИУМ СБОРКИ ДЛЯ WORDPRESS
	 * ----------------------------------------------------
	 * */

	grunt.registerTask('BUILD_WORDPRESS_PLUGIN_RUS_PREMIUM', function() {
		grunt.option('plugin.build', 'full-premium');
		grunt.option('plugin.lang', 'rus');

		grunt.option('plugin.addons', [
			[
				'localization-pack',
				{
					build: 'localization-pack',
					lang: 'rus'
				}
			],
			[
				'migration-rus-to-en',
				{
					build: 'migration-rus-to-en',
					lang: 'rus'
				}
			],
			[
				'buttons-pack',
				{
					build: 'premium',
					lang: 'rus'
				}
			],
			[
				'license',
				{
					build: 'premium',
					lang: 'rus'
				}
			]
		]);

		grunt.task.run([
			'build_plugin_with_addons'
		]);
	});

	/**
	 * СОЗДАНИЕ РУССКОЙ БЕСПЛАТНОЙ СБОРКИ ДЛЯ WORDPRESS
	 * ----------------------------------------------------
	 * */
	grunt.registerTask('BUILD_WORDPRESS_PLUGIN_RUS_FREE', function() {
		grunt.option('plugin.build', 'full-free');
		grunt.option('plugin.lang', 'rus');

		grunt.option('plugin.addons', [
			[
				'localization-pack',
				{
					build: 'localization-pack',
					lang: 'rus'
				}
			],
			[
				'migration-rus-to-en',
				{
					build: 'migration-rus-to-en',
					lang: 'rus'
				}
			],
			[
				'buttons-pack',
				{
					build: 'free',
					lang: 'rus'
				}
			],
			[
				'license',
				{
					build: 'free',
					lang: 'rus'
				}
			]
		]);

		grunt.task.run([
			'build_plugin_with_addons'
		]);
	});

	/**
	 * СОЗДАНИЕ РУССКОЙ ПРЕМИУМ СБОРКИ ДЛЯ JQUERY
	 * ----------------------------------------------------
	 * */
	grunt.registerTask('BUILD_PLUGIN_JQUERY_PREMIUM', function() {

		grunt.option('plugin.build', 'premium');
		grunt.option('plugin.lang', 'rus');

		grunt.option('plugin.addons', [
			[
				'localization-pack',
				{
					build: 'localization-pack',
					lang: 'rus'
				}
			],
			[
				'migration-rus-to-en',
				{
					build: 'migration-rus-to-en',
					lang: 'rus'
				}
			],
			[
				'buttons-pack',
				{
					build: 'premium',
					lang: 'rus'
				}
			],
			[
				'license',
				{
					build: 'premium',
					lang: 'rus'
				}
			]
		]);

		grunt.task.run([
			'build_plugin_with_addons'
		]);
	});

	/**
	 * СОЗДАНИЕ РУССКОЙ БЕСПЛАТНОЙ СБОРКИ ДЛЯ JQUERY
	 * ----------------------------------------------------
	 * */
	grunt.registerTask('BUILD_PLUGIN_JQUERY_FREE', function() {

		grunt.option('plugin.build', 'free');
		grunt.option('plugin.lang', 'rus');

		grunt.option('plugin.addons', [
			[
				'localization-pack',
				{
					build: 'localization-pack',
					lang: 'rus'
				}
			],
			[
				'migration-rus-to-en',
				{
					build: 'migration-rus-to-en',
					lang: 'rus'
				}
			],
			[
				'buttons-pack',
				{
					build: 'free',
					lang: 'rus'
				}
			],
			[
				'license',
				{
					build: 'free',
					lang: 'rus'
				}
			]
		]);

		grunt.task.run([
			'build_plugin_with_addons'
		]);
	});

};

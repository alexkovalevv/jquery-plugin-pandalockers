/**
 * Построение примеров плагина
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 26.02.2017
 * @version 1.0
 */

module.exports = function(grunt) {
	"use strict";

	grunt.registerMultiTask("build_examples", "Build plugin", function() {

		var build = grunt.option('plugin.build') || 'full-premium';
		var lang = grunt.option('plugin.lang') || 'rus';

		grunt.config.set('pkg.build', build);

		grunt.config.set('preprocess', {
			options: {
				context: {
					lang: lang,
					facebook_default_lang: '<%= facebook_default_lang %>',
					twitter_default_lang: '<%= twitter_default_lang %>',
					google_default_lang: '<%= google_default_lang %>',
					license: 0,
					build: build
				}
			},
			examples: {
				files: [
					{
						'temp/examples/example.html': 'src/examples/example.html',
						'temp/examples/index.html': 'src/examples/index.html',
						'temp/examples/howto/options.html': 'src/examples/howto/options.html',
						'temp/examples/howto/ajax.html': 'src/examples/howto/ajax.html',
						'temp/examples/howto/events.html': 'src/examples/howto/events.html',
						'temp/examples/howto/ajaxtest.html': 'src/examples/howto/ajaxtest.html',
						'temp/examples/howto/facebook-app.html': 'src/examples/howto/facebook-app.html',
						'temp/examples/howto/google-app.html': 'src/examples/howto/google-app.html'

						//'temp/examples/dev.html': 'src/examples/dev.html'
					},
					/*{
					 expand: true,
					 cwd: 'src/examples/generator/',
					 src: ['*'],
					 dest: 'temp/examples/generator/'
					 }*/
				]
			}
		});

		grunt.config.set('copy', {
			examples: {
				files: [
					{
						expand: true,
						cwd: 'temp/configurate/examples/',
						src: ['**/*'],
						dest: 'dist/examples/'
					},
					{
						expand: true,
						cwd: 'dist/plugin/',
						src: ['*.min.js'],
						dest: 'dist/examples/js'
					},
					{
						expand: true,
						cwd: 'dist/plugin/assets/css',
						src: ['**/*'],
						dest: 'dist/examples/css'
					},
					{
						expand: true,
						cwd: 'dist/plugin/assets/img',
						src: ['**/*'],
						dest: 'dist/examples/img'
					},
					{
						expand: true,
						cwd: 'libs/',
						src: ['**/*'],
						dest: 'dist/examples/js/libs'
					}
				]
			},
			css: {
				files: [
					{
						expand: true,
						cwd: 'src/examples/css/',
						src: ['*'],
						dest: 'dist/examples/css/'
					}
				]
			},
			fonts: {
				files: [
					{
						expand: true,
						cwd: 'src/examples/fonts/',
						src: ['*'],
						dest: 'dist/examples/fonts/'
					}
				]
			},
			js: {
				files: [
					{
						expand: true,
						cwd: 'src/examples/js/',
						src: ['*', '*/*', '*/*/*', '*/*/*/*'],
						dest: 'dist/examples/js/'
					}
				]
			},

			img: {
				files: [
					{
						expand: true,
						cwd: 'src/plugin/img/',
						src: ['*', '*/*'],
						dest: 'dist/examples/img/'
					},
					{
						expand: true,
						cwd: 'src/examples/img/',
						src: ['*', '*/*'],
						dest: 'dist/examples/img/'
					}
				]
			},

			/*monual: {
			 files: [
			 {
			 expand: true,
			 cwd: 'src/',
			 src: ['monual.html'],
			 dest: 'dist/'
			 }
			 ]
			 }*/
		});

		grunt.config.set('examples', {
			main: {
				options: {
					//wrap: 'temp/examples/howto/_wrap.html'
				},
				files: [
					{
						expand: true,
						cwd: 'temp/examples/',
						src: ['index.html', 'example.html', 'dev.html'],
						dest: 'temp/configurate/examples/',
						wrap: false
					},
					{
						expand: true,
						cwd: 'temp/examples/howto/',
						src: [
							'ajaxtest.html',
							'ajax.html',
							'events.html',
							'facebook-app.html',
							'google-app.html',
							'options.html'
						],
						dest: 'temp/configurate/examples/howto/',
						wrap: true
					}
				]
			}
		});

		grunt.config.set('clean.before', [
			'dist/examples'
		]);
		grunt.config.set('clean.after', [
			'temp'
		]);

		grunt.task.run([
			'clean:before', 'preprocess', 'examples', 'copy', 'clean:after'
		]);

	});
};

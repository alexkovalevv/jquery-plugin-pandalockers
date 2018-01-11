/**
 * Построение iframe кнопок
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 27.02.2017
 * @version 1.0
 */

module.exports = function(grunt) {
	"use strict";

	grunt.registerMultiTask("build_iframe_buttons", "Build iframe buttons", function() {

		grunt.loadNpmTasks('grunt-contrib-htmlmin');
		grunt.loadNpmTasks('grunt-insert');

		grunt.config.set('insert', {
			options: {
				// Task-specific options go here.
			},
			js: {
				files: [
					// social buttons
					{
						src: "temp/iframe-buttons/js/facebook-like.min.js",
						dest: 'temp/configurate/final/iframe-buttons/facebook-like.html',
						match: "/*inject js core*/"
					},
					{
						src: "temp/iframe-buttons/js/facebook-share.min.js",
						dest: 'temp/configurate/final/iframe-buttons/facebook-share.html',
						match: "/*inject js core*/"
					},
					{
						src: "temp/iframe-buttons/js/vk-like.min.js",
						dest: 'temp/configurate/final/iframe-buttons/vk-like.html',
						match: "/*inject js core*/"
					},
					{
						src: "temp/iframe-buttons/js/vk-notify.min.js",
						dest: 'temp/configurate/final/iframe-buttons/vk-notify.html',
						match: "/*inject js core*/"
					},
					{
						src: "temp/iframe-buttons/js/vk-share.min.js",
						dest: 'temp/configurate/final/iframe-buttons/vk-share.html',
						match: "/*inject js core*/"
					},
					{
						src: "temp/iframe-buttons/js/vk-subscribe.min.js",
						dest: 'temp/configurate/final/iframe-buttons/vk-subscribe.html',
						match: "/*inject js core*/"
					},
					{
						src: "temp/iframe-buttons/js/google-plus.min.js",
						dest: 'temp/configurate/final/iframe-buttons/google-plus.html',
						match: "/*inject js core*/"
					},
					{
						src: "temp/iframe-buttons/js/google-share.min.js",
						dest: 'temp/configurate/final/iframe-buttons/google-share.html',
						match: "/*inject js core*/"
					},
					{
						src: "temp/iframe-buttons/js/google-youtube.min.js",
						dest: 'temp/configurate/final/iframe-buttons/google-youtube.html',
						match: "/*inject js core*/"
					},

					// connect buttons
					{
						src: "temp/iframe-buttons/js/vk-connect.min.js",
						dest: 'temp/configurate/final/iframe-buttons/vk-connect.html',
						match: "/*inject js core*/"
					},
					{
						src: "temp/iframe-buttons/js/facebook-connect.min.js",
						dest: 'temp/configurate/final/iframe-buttons/facebook-connect.html',
						match: "/*inject js core*/"
					},
					{
						src: "temp/iframe-buttons/js/twitter-connect.min.js",
						dest: 'temp/configurate/final/iframe-buttons/twitter-connect.html',
						match: "/*inject js core*/"
					},
					{
						src: "temp/iframe-buttons/js/google-connect.min.js",
						dest: 'temp/configurate/final/iframe-buttons/google-connect.html',
						match: "/*inject js core*/"
					},
					{
						src: "temp/iframe-buttons/js/linkedin-connect.min.js",
						dest: 'temp/configurate/final/iframe-buttons/linkedin-connect.html',
						match: "/*inject js core*/"
					},

					// functions
					{
						src: "temp/iframe-buttons/js/functions/array.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-array*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/array.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-array*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/extend.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-extend*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/hash.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-hash*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/mobile.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-mobile*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/storage.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-storage*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/track-window.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-track-window*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/update-query-string.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-update-query-string*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/window-boundry.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-window-boundry*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/add-class.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-add-class*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/i18n.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-i18n*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/load-style.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-load-style*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/send-message.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-send-message*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/onload-init.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-onload-init*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/extract-connections.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-extract-connections*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/abbreviate-number.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-abbreviate-number*/"
					},
					{
						src: "temp/iframe-buttons/js/functions/ajax.min.js",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*inject function-ajax*/"
					}
				]

			},

			css: {
				files: [
					// social buttons
					{
						src: "temp/iframe-buttons/css/connect-facebook.min.css",
						dest: 'temp/configurate/final/iframe-buttons/facebook-share.html',
						match: "/*Stuff it here css*/"
					},
					{
						src: "temp/iframe-buttons/css/vk-like.min.css",
						dest: 'temp/configurate/final/iframe-buttons/vk-like.html',
						match: "/*Stuff it here css*/"
					},
					{
						src: "temp/iframe-buttons/css/vk-default.min.css",
						dest: 'temp/configurate/final/iframe-buttons/vk-notify.html',
						match: "/*Stuff it here css*/"
					},
					{
						src: "temp/iframe-buttons/css/vk-default.min.css",
						dest: 'temp/configurate/final/iframe-buttons/vk-share.html',
						match: "/*Stuff it here css*/"
					},
					{
						src: "temp/iframe-buttons/css/vk-default.min.css",
						dest: 'temp/configurate/final/iframe-buttons/vk-subscribe.html',
						match: "/*Stuff it here css*/"
					},
					{
						src: "temp/iframe-buttons/css/google-youtube.min.css",
						dest: 'temp/configurate/final/iframe-buttons/google-youtube.html',
						match: "/*Stuff it here css*/"
					},

					// connect buttons
					{
						src: "temp/iframe-buttons/css/connect-default.min.css",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*Stuff it here css connect*/"
					},

					// all buttons
					{
						src: "temp/iframe-buttons/css/resets.min.css",
						dest: 'temp/configurate/final/iframe-buttons/*',
						match: "/*Stuff it here css resets*/"
					}
				]

			}
		});

		grunt.config.set('htmlmin', {
			iframe: {
				options: {
					removeComments: true,
					collapseWhitespace: true
				},
				files: [
					{
						expand: true,
						cwd: 'src/iframe-buttons/html',
						src: ['*'],
						dest: 'temp/configurate/final/iframe-buttons/'
					}
				]
			}
		});

		grunt.config.set('jsObfuscate.main', {
			files: {
				// social buttons
				//{'temp/jsObfuscate/iframe-buttons/js/vk-like.js':
				// ['temp/configurate/iframe-buttons/js/vk-like.js']},
				// {'temp/jsObfuscate/iframe-buttons/js/vk-share.js':
				// ['temp/configurate/iframe-buttons/js/vk-share.js']},
				// {'temp/jsObfuscate/iframe-buttons/js/vk-subscribe.js':
				// ['temp/configurate/iframe-buttons/js/vk-subscribe.js']},

				// connect buttons
				//{'temp/jsObfuscate/iframe-buttons/js/vk-connect.js':
				// ['temp/configurate/iframe-buttons/js/vk-connect.js']},
				// {'temp/jsObfuscate/iframe-buttons/js/facebook-connect.js':
				// ['temp/configurate/iframe-buttons/js/facebook-connect.js']},
				// {'temp/jsObfuscate/iframe-buttons/js/twitter-connect.js':
				// ['temp/configurate/iframe-buttons/js/twitter-connect.js']},
				// {'temp/jsObfuscate/iframe-buttons/js/google-connect.js':
				// ['temp/configurate/iframe-buttons/js/google-connect.js']},
				// {'temp/jsObfuscate/iframe-buttons/js/linkedin-connect.js':
				// ['temp/configurate/iframe-buttons/js/linkedin-connect.js']}
			}
		});

		grunt.config.set('uglify', {
			options: {
				preserveComments: 'some'
			},
			iframe: {
				files: [
					// social buttons
					{'temp/iframe-buttons/js/facebook-like.min.js': ['temp/configurate/iframe-buttons/js/facebook-like.js']},
					{'temp/iframe-buttons/js/facebook-share.min.js': ['temp/configurate/iframe-buttons/js/facebook-share.js']},
					{'temp/iframe-buttons/js/vk-like.min.js': ['temp/configurate/iframe-buttons/js/vk-like.js']},
					{'temp/iframe-buttons/js/vk-notify.min.js': ['temp/configurate/iframe-buttons/js/vk-notify.js']},
					{'temp/iframe-buttons/js/vk-share.min.js': ['temp/configurate/iframe-buttons/js/vk-share.js']},
					{'temp/iframe-buttons/js/vk-subscribe.min.js': ['temp/configurate/iframe-buttons/js/vk-subscribe.js']},
					{'temp/iframe-buttons/js/google-plus.min.js': ['temp/configurate/iframe-buttons/js/google-plus.js']},
					{'temp/iframe-buttons/js/google-share.min.js': ['temp/configurate/iframe-buttons/js/google-share.js']},
					{'temp/iframe-buttons/js/google-youtube.min.js': ['temp/configurate/iframe-buttons/js/google-youtube.js']},

					// connect buttons
					{'temp/iframe-buttons/js/vk-connect.min.js': ['temp/configurate/iframe-buttons/js/vk-connect.js']},
					{'temp/iframe-buttons/js/facebook-connect.min.js': ['temp/configurate/iframe-buttons/js/facebook-connect.js']},
					{'temp/iframe-buttons/js/twitter-connect.min.js': ['temp/configurate/iframe-buttons/js/twitter-connect.js']},
					{'temp/iframe-buttons/js/google-connect.min.js': ['temp/configurate/iframe-buttons/js/google-connect.js']},
					{'temp/iframe-buttons/js/linkedin-connect.min.js': ['temp/configurate/iframe-buttons/js/linkedin-connect.js']},

					// functions
					{'temp/iframe-buttons/js/functions/array.min.js': ['src/iframe-buttons/js/functions/array.js']},
					{'temp/iframe-buttons/js/functions/extend.min.js': ['src/iframe-buttons/js/functions/extend.js']},
					{'temp/iframe-buttons/js/functions/hash.min.js': ['src/iframe-buttons/js/functions/hash.js']},
					{'temp/iframe-buttons/js/functions/mobile.min.js': ['src/iframe-buttons/js/functions/mobile.js']},
					{'temp/iframe-buttons/js/functions/storage.min.js': ['src/iframe-buttons/js/functions/storage.js']},
					{'temp/iframe-buttons/js/functions/track-window.min.js': ['src/iframe-buttons/js/functions/track-window.js']},
					{'temp/iframe-buttons/js/functions/update-query-string.min.js': ['src/iframe-buttons/js/functions/update-query-string.js']},
					{'temp/iframe-buttons/js/functions/window-boundry.min.js': ['src/iframe-buttons/js/functions/window-boundry.js']},
					{'temp/iframe-buttons/js/functions/add-class.min.js': ['src/iframe-buttons/js/functions/add-class.js']},
					{'temp/iframe-buttons/js/functions/i18n.min.js': ['src/iframe-buttons/js/functions/i18n.js']},
					{'temp/iframe-buttons/js/functions/load-style.min.js': ['src/iframe-buttons/js/functions/load-style.js']},
					{'temp/iframe-buttons/js/functions/send-message.min.js': ['src/iframe-buttons/js/functions/send-message.js']},
					{'temp/iframe-buttons/js/functions/onload-init.min.js': ['src/iframe-buttons/js/functions/onload-init.js']},
					{'temp/iframe-buttons/js/functions/extract-connections.min.js': ['src/iframe-buttons/js/functions/extract-connections.js']},
					{'temp/iframe-buttons/js/functions/abbreviate-number.min.js': ['src/iframe-buttons/js/functions/abbreviate-number.js']},
					{'temp/iframe-buttons/js/functions/ajax.min.js': ['src/iframe-buttons/js/functions/ajax.js']}

				]
			}
		});

		grunt.config.set('cssmin', {
			options: {
				keepSpecialComments: 0
			},
			iframe: {
				files: [
					// social buttons
					{'temp/iframe-buttons/css/connect-facebook.min.css': ['src/iframe-buttons/css/connect-facebook.css']},
					{'temp/iframe-buttons/css/vk-like.min.css': ['src/iframe-buttons/css/vk-like.css']},
					{'temp/iframe-buttons/css/vk-default.min.css': ['src/iframe-buttons/css/vk-default.css']},
					{'temp/iframe-buttons/css/connect-twitter.min.css': ['src/iframe-buttons/css/connect-twitter.css']},
					{'temp/iframe-buttons/css/google-youtube.min.css': ['src/iframe-buttons/css/google-youtube.css']},

					// connect buttons
					{'temp/iframe-buttons/css/connect-default.min.css': ['src/iframe-buttons/css/connect-default.css']},

					// all buttons
					{'temp/iframe-buttons/css/resets.min.css': ['src/iframe-buttons/css/resets.css']}
				]
			}
		});

		grunt.config.set('examples', {
			iframe: {
				files: {
					// social buttons
					'temp/configurate/iframe-buttons/js/facebook-like.js': 'src/iframe-buttons/js/facebook-like.js',
					'temp/configurate/iframe-buttons/js/facebook-share.js': 'src/iframe-buttons/js/facebook-share.js',
					'temp/configurate/iframe-buttons/js/vk-like.js': 'src/iframe-buttons/js/vk-like.js',
					'temp/configurate/iframe-buttons/js/vk-notify.js': 'src/iframe-buttons/js/vk-notify.js',
					'temp/configurate/iframe-buttons/js/vk-share.js': 'src/iframe-buttons/js/vk-share.js',
					'temp/configurate/iframe-buttons/js/vk-subscribe.js': 'src/iframe-buttons/js/vk-subscribe.js',
					'temp/configurate/iframe-buttons/js/google-plus.js': 'src/iframe-buttons/js/google-plus.js',
					'temp/configurate/iframe-buttons/js/google-share.js': 'src/iframe-buttons/js/google-share.js',
					'temp/configurate/iframe-buttons/js/google-youtube.js': 'src/iframe-buttons/js/google-youtube.js',

					//connect buttons
					'temp/configurate/iframe-buttons/js/vk-connect.js': 'src/iframe-buttons/js/vk-connect.js',
					'temp/configurate/iframe-buttons/js/facebook-connect.js': 'src/iframe-buttons/js/facebook-connect.js',
					'temp/configurate/iframe-buttons/js/twitter-connect.js': 'src/iframe-buttons/js/twitter-connect.js',
					'temp/configurate/iframe-buttons/js/google-connect.js': 'src/iframe-buttons/js/google-connect.js',
					'temp/configurate/iframe-buttons/js/linkedin-connect.js': 'src/iframe-buttons/js/linkedin-connect.js'

				}
			}
		});

		grunt.config.set('copy', {
			iframe: {
				files: [
					{
						expand: true,
						cwd: 'temp/configurate/final/iframe-buttons',
						src: ['*', '!js', '!css'],
						dest: 'dist/iframe-buttons'
					}
					/*{
					 expand: true,
					 cwd: 'temp/configurate/final/iframe-buttons',
					 src: ['*', '!js', '!css'],
					 dest: 'src/develope/iframe-buttons'
					 }*/
				]
			}
		});

		grunt.config.set('clean', {
			before: [
				'dist/plugin/iframe-buttons',
				'src/develope/iframe-buttons'
			],
			after: ['temp']
		});

		grunt.task.run([
			'clean:before', 'examples', 'uglify', 'cssmin', 'htmlmin', 'insert', 'copy', 'clean:after'
		]);

	});

};
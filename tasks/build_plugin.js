/**
 * Компиляция плагина
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 26.02.2017
 * @version 1.0
 */

var tools = require('./tools');

module.exports = function(grunt) {
	"use strict";

	grunt.registerMultiTask("build_plugin", "Build plugin", function() {
		var pkg = grunt.config('pkg');
		var build = grunt.option('plugin.build');

		if( !build ) {
			console.log('[Ошибка]: Вы не установили сборку для копмиляции.');
			return;
		}

		var lang = grunt.option('plugin.lang');

		grunt.log.writeln('========== Build plugin =======');
		grunt.log.writeln('lang = ' + lang);
		grunt.log.writeln('build = ' + build);

		var preprocessLang;

		if( 'rus' === lang ) {
			preprocessLang = "ru_RU";
			grunt.config.set('facebook_default_lang', 'ru_RU');
			grunt.config.set('twitter_default_lang', 'ru');
			grunt.config.set('google_default_lang', 'ru-RU');
			grunt.config.set('plugin.lang', 'rus');
		} else {
			preprocessLang = "en_En";
			grunt.config.set('facebook_default_lang', 'en_US');
			grunt.config.set('twitter_default_lang', 'en');
			grunt.config.set('google_default_lang', 'en-US');
			grunt.config.set('plugin.lang', 'en');
		}

		grunt.config.set('preprocess', {
			options: {
				context: {
					lang: preprocessLang,
					facebook_default_lang: '<%= facebook_default_lang %>',
					twitter_default_lang: '<%= twitter_default_lang %>',
					google_default_lang: '<%= google_default_lang %>',
					build: (build == 'premium' || build == 'full-premium') ? 'premium' : 'free',
					license: 0
				}
			},

			js: {
				// see the var 'js'
			},
			css: {
				// see the var 'js'
			}
		});

		grunt.config.set('uglify', {
			options: {
				preserveComments: 'some'
			},
			js: {
				files: {
					// see the var 'js'
				}
			}
		});

		grunt.config.set('cssmin', {
			options: {
				keepSpecialComments: 0
			},
			css: {
				files: {
					// see the var 'css'
				}
			}
		});

		grunt.config.set('copy', {
			libs: {
				files: [
					{
						expand: true,
						cwd: 'libs/',
						src: ['*'],
						dest: 'dist/plugin/js/libs/'
					}
				]
			},
			img: {
				files: [
					{
						expand: true,
						cwd: 'src/plugin/assets/img/',
						src: ['*', '*/*'],
						dest: 'dist/plugin/assets/img/'
					}
				]
			}
		});

		var rootpath = pkg.plugin.dir;

		tools.setupFiles(grunt, rootpath, build, lang, function(ext, resultMin, result) {
			var contactFiles = {};

			contactFiles['dist/plugin/pandalocker.' + build + '.<%= pkg.version %>.min.js'] = resultMin;
			contactFiles['dist/plugin/pandalocker.' + build + '.<%= pkg.version %>.js'] = result;

			if( ext === 'css' ) {
				contactFiles = {};
				contactFiles['dist/plugin/assets/css/pandalocker.' + build + '.<%= pkg.version %>.min.css'] = resultMin;
				contactFiles['dist/plugin/assets/css/pandalocker.' + build + '.<%= pkg.version %>.css'] = result;
			}

			return contactFiles;
		});

		grunt.config.set('clean', {
			before: [
				'dist/plugin'
			],
			after: ['temp']
		});

		grunt.task.run([
			'clean:before',
			'preprocess',
			'obfuscator',
			'uglify',
			'cssmin',
			'concat',
			'copy',
			/*'build_examples',*/
			'clean:after'
		]);
	});

	grunt.registerTask("build_plugin_with_addons", function() {
		var addons = grunt.option('plugin.addons');

		if( !addons ) {
			console.log('[Ошибка]: Вы не установили аддонны для копмиляции.');
			return;
		}

		grunt.option('addons.names', addons);

		grunt.task.run(['build_plugin', 'build_addons', 'concat_plugin_and_addons']);
	});

	grunt.registerTask("concat_plugin_and_addons", function() {
		var pkg = grunt.config('pkg');
		var addons = grunt.option('addons.names');
		var pluginBuild = grunt.option('plugin.build');

		grunt.config.set('concat', {
			cssMin: {
				src: [],
				dest: 'dist/plugin/assets/css/pandalocker.' + pluginBuild + '.<%= pkg.version %>.min.css'
			},
			jsMin: {
				src: [],
				dest: 'dist/plugin/pandalocker.' + pluginBuild + '.<%= pkg.version %>.min.js'
			},
			css: {
				src: [],
				dest: 'dist/plugin/assets/css/pandalocker.' + pluginBuild + '.<%= pkg.version %>.css'
			},
			js: {
				src: [],
				dest: 'dist/plugin/pandalocker.' + pluginBuild + '.<%= pkg.version %>.js'
			}
		});

		var pluginJs = [],
			pluginJsMin = [],
			pluginCss = [],
			pluginCssMin = [],
			pluginImages = [];

		// Добавляем js файлы в задание для слияния
		pluginJs.push(pkg.plugin.distDir + '/pandalocker.' + pluginBuild + '.<%= pkg.version %>.js');
		pluginJsMin.push(pkg.plugin.distDir + '/pandalocker.' + pluginBuild + '.<%= pkg.version %>.min.js');

		// Добавляем css файлы в задание для слияния
		pluginCss.push(pkg.plugin.distDir + '/assets/css/pandalocker.' + pluginBuild + '.<%= pkg.version %>.css');
		pluginCssMin.push(pkg.plugin.distDir + '/assets/css/pandalocker.' + pluginBuild + '.<%= pkg.version %>.min.css');

		for( var i = 0; i < addons.length; i++ ) {
			var addonName = addons[i][0],
				addonNameLower = addonName.replace(/-/g, '_'),
				addonDir = pkg.plugin.distAddonDir + '/' + addonName;

			// Добавляем js файлы в задание для слияния
			pluginJs.push(addonDir + '/' + addonName + '.<%= pkg.addons.' + addonNameLower + '.version %>.js');
			pluginJsMin.push(addonDir + '/' + addonName + '.<%= pkg.addons.' + addonNameLower + '.version %>.min.js');

			// Добавляем css файлы в задание для слияния
			pluginCss.push(addonDir + '/assets/css/' + addonName + '.<%= pkg.addons.' + addonNameLower + '.version %>.css');
			pluginCssMin.push(addonDir + '/assets/css/' + addonName + '.<%= pkg.addons.' + addonNameLower + '.version %>.min.css');

			// Копируем изображениз из папки аддона
			if( grunt.file.isDir(addonDir + '/assets/img') ) {
				pluginImages.push({
					expand: true,
					cwd: addonDir + '/assets/img',
					src: ['*', '*/*'],
					dest: pkg.plugin.distDir + '/assets/img'
				});
			}
		}

		grunt.config.set('concat.jsMin.src', pluginJsMin);
		grunt.config.set('concat.js.src', pluginJs);
		grunt.config.set('concat.cssMin.src', pluginCssMin);
		grunt.config.set('concat.css.src', pluginCss);

		grunt.config.set('copy', {
			img: {
				files: pluginImages
			}
		});

		grunt.task.run(['concat', 'copy']);
	});

};

/**
 * Построение дополнения paylocker
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 27.02.2017
 * @version 1.0
 */

var tools = require('./tools');

module.exports = function(grunt) {
	"use strict";

	// СОЗДАНИЕ СБОРКИ ДЛЯ LOCALIZATION

	grunt.registerTask('build_addon_localization_pack', function() {

		var build = grunt.option('addon.localization_pack.build');
		var lang = grunt.option('addon.localization_pack.lang');

		if( !build ) {
			build = 'localization-pack';
		}

		if( !lang ) {
			lang = 'rus';
		}

		grunt.option('addon.name', 'localization-pack');
		grunt.option('addon.build', build);
		grunt.option('addon.lang', lang);

		grunt.task.run(['build_addon']);
	});

	// СОЗДАНИЕ СБОРКИ ДЛЯ LICENSE

	grunt.registerTask('build_addon_license', function() {

		grunt.option('addon.use_banner', false);

		var build = grunt.option('addon.license.build');
		var lang = grunt.option('addon.license.lang');

		if( !build ) {
			build = 'premium';
		}

		grunt.option('addon.name', 'license');
		grunt.option('addon.build', build);
		grunt.option('addon.lang', lang);

		grunt.task.run(['build_addon']);
	});

	// СОЗДАНИЕ СБОРКИ ДЛЯ PAYLOCKER

	grunt.registerTask('build_addon_paylocker', function() {

		var build = grunt.option('addon.paylocker.build');
		var lang = grunt.option('addon.paylocker.lang');

		if( !build ) {
			build = 'paylocker';
		}

		grunt.option('addon.name', 'paylocker');
		grunt.option('addon.build', build);
		grunt.option('addon.lang', lang);

		grunt.task.run(['build_addon']);
	});

	// СОЗДАНИЕ СБОРКИ ДЛЯ POPUP MODE

	grunt.registerTask('build_addon_popup_mode', function() {

		var build = grunt.option('addon.popup_mode.build');
		var lang = grunt.option('addon.popup_mode.lang');

		if( !build ) {
			build = 'popup-mode';
		}

		grunt.option('addon.name', 'popup-mode');
		grunt.option('addon.build', build);
		grunt.option('addon.lang', lang);

		grunt.task.run(['build_addon']);
	});

	// СОЗДАНИЕ СБОРКИ ДЛЯ STEP TO STEP

	grunt.registerTask('build_addon_step_to_step', function() {

		var build = grunt.option('addon.step_to_step.build');
		var lang = grunt.option('addon.step_to_step.lang');

		if( !build ) {
			build = 'step-to-step';
		}

		grunt.option('addon.name', 'step-to-step');
		grunt.option('addon.build', build);
		grunt.option('addon.lang', lang);

		grunt.task.run(['build_addon']);
	});

	// СОЗДАНИЕ СБОРКИ MIGRATION

	grunt.registerTask('build_addon_migration_rus_to_en', function() {

		var build = grunt.option('addon.migration_rus_to_en.build');
		var lang = grunt.option('addon.migration_rus_to_en.lang');

		if( !build ) {
			build = 'migration-rus-to-en';
		}

		grunt.option('addon.name', 'migration-rus-to-en');
		grunt.option('addon.build', build);
		grunt.option('addon.lang', lang);

		grunt.task.run(['build_addon']);
	});

	/**
	 * СОЗДАНИЕ СБОРКИ ДЛЯ BUTTONS PACK
	 * */


	grunt.registerTask('build_addon_buttons_pack_free', function() {
		grunt.option('addon.buttons_pack.build', 'free');
		grunt.task.run(['build_addon_buttons_pack']);
	});

	grunt.registerTask('build_addon_buttons_pack_premium', function() {
		grunt.option('addon.buttons_pack.build', 'premium');
		grunt.task.run(['build_addon_buttons_pack']);
	});

	grunt.registerTask('build_addon_buttons_pack', function() {

		var build = grunt.option('addon.buttons_pack.build');
		var lang = grunt.option('addon.buttons_pack.lang');

		if( !build ) {
			build = 'premium';
		}

		if( !lang ) {
			lang = 'rus';
		}

		grunt.option('addon.name', 'buttons-pack');
		grunt.option('addon.build', build);
		grunt.option('addon.lang', lang);

		grunt.task.run(['build_addon']);
	});

	grunt.registerMultiTask("build_addons", "Build adddon", function() {
		var addons = grunt.option('addons.names');

		grunt.log.writeln('========== Build addons =======');

		if( !addons ) {
			console.log('[Error]: пожалуйста, установите дополения для компиляции');
		}

		var runTasks = [];

		for( var idx = 0; idx < addons.length; idx++ ) {
			if( !addons[idx][0] || !addons[idx][1] ) {
				continue;
			}

			var addonName = addons[idx][0],
				addonNameLower = addonName.replace(/-/g, '_'),
				build = addons[idx][1].build,
				lang = addons[idx][1].lang;

			grunt.option('addon.' + addonNameLower + '.build', build);
			grunt.option('addon.' + addonNameLower + '.lang', lang);

			runTasks.push('build_addon_' + addonNameLower);
		}

		grunt.task.run(runTasks);
	});

	grunt.registerTask('build_addon', function() {

		var pkg = grunt.config('pkg');

		var useBanner = grunt.option('addon.use_banner'),
			addonName = grunt.option('addon.name'),
			addonNameLower = addonName.replace(/-/g, '_'),
			lang = grunt.option('addon.lang'),
			build = grunt.option('addon.build'),
			rootpath = pkg.plugin.addonsDir + '/' + addonName;

		var banner = '/*!\n' +
			' * <%= pkg.addons.' + addonNameLower + '.title %> - v<%= pkg.addons.' + addonNameLower + '.version %>, <%= grunt.template.today("yyyy-mm-dd") %> \n' +
			' * for Social Locker platform: <%= pkg.site %> \n' +
			' * \n' +
			' * <%= pkg.addons.copyright %> \n' +
			' * <%= pkg.addons.companyCopyright %> \n' +
			' * Support: <%= pkg.support %> \n' +
			' * \n' +
			' * <%= pkg.addons.' + addonNameLower + '.description %>\n' +
			'*/\n';

		if( useBanner !== false ) {
			grunt.config.set('concat.options', {
				separator: ';\n',
				banner: banner
			});
		}

		grunt.log.writeln('----------------------------------');
		grunt.log.writeln('build = ' + build);
		grunt.log.writeln('lang = ' + lang);
		grunt.log.writeln('addon = ' + addonName);

		grunt.config.set('obfuscator.main', {
			files: {}
		});

		var preprocessLang;

		if( 'rus' === lang ) {
			preprocessLang = "ru_RU";
		} else {
			preprocessLang = "en_En";
		}

		grunt.config.set('preprocess', {
			options: {
				context: {
					lang: preprocessLang,
					build: build
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

		grunt.config.set('autoprefixer', {
			css: {
				files: {
					// see the var 'css'
				}
			}
		});

		grunt.config.set('cssmin', {
			css: {
				files: {
					// see the var 'css'
				}
			}
		});

		grunt.config.set('concat.js', {
			options: {
				separator: '\n'
			},
			files: {
				// see the var 'js'
			}
		});

		grunt.config.set('concat.css', {
			options: {
				separator: '\n'
			},
			files: {
				// see the var 'css'
			}
		});

		grunt.config.set('copy', {
			img: {files: []}
		});

		grunt.config.set('clean', {
			before: [
				pkg.plugin.distAddonDir + '/*'
			],
			after: ['temp']
		});

		(function(addonName, addonNameLower, grunt, rootpath, build, lang) {
			tools.setupFiles(grunt, rootpath, build, lang, function(ext, resultMin, result) {
				var contactFiles = {};

				contactFiles[pkg.plugin.distAddonDir + '/' + addonName + '/' + addonName + '.<%= pkg.addons.' + addonNameLower + '.version %>.min.js'] = resultMin;
				contactFiles[pkg.plugin.distAddonDir + '/' + addonName + '/' + addonName + '.<%= pkg.addons.' + addonNameLower + '.version %>.js'] = result;

				if( ext === 'css' ) {
					contactFiles = {};
					contactFiles[pkg.plugin.distAddonDir + '/' + addonName + '/assets/css/' + addonName + '.<%= pkg.addons.' + addonNameLower + '.version %>.min.css'] = resultMin;
					contactFiles[pkg.plugin.distAddonDir + '/' + addonName + '/assets/css/' + addonName + '.<%= pkg.addons.' + addonNameLower + '.version %>.css'] = result;
				}

				return contactFiles;
			});
		})(addonName, addonNameLower, grunt, rootpath, build, lang);

		grunt.config.set('clean.before', pkg.plugin.distAddonDir + '/' + addonName);

		grunt.task.run([
			'clean:before', 'preprocess', 'uglify', 'autoprefixer', 'cssmin', 'concat', 'copy', 'clean:after'
		]);
	});
};



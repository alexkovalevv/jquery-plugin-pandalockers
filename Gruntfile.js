'use strict';

module.exports = function(grunt) {

	var banner = '/*!\n' +
		' * <%= pkg.title %> - v<%= pkg.version %>, <%= grunt.template.today("yyyy-mm-dd") %> \n' +
		' * <%= pkg.site %> \n' +
		' * \n' +
		' * <%= pkg.copyright %> \n' +
		'*/\n';

	grunt.loadTasks("tasks");

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		obfuscator: {
			options: {
				compact: true,
				controlFlowFlattening: true,
				controlFlowFlatteningThreshold: 0.75,
				debugProtection: false,
				debugProtectionInterval: false,
				disableConsoleOutput: true,
				rotateStringArray: true,
				selfDefending: true,
				stringArray: true,
				stringArrayEncoding: 'base64',
				stringArrayThreshold: 0.75,
				unicodeEscapeSequence: false
			}
		},

		concat: {
			options: {
				separator: '\n',
				banner: banner + '\n'
			}
		},

		build_iframe_buttons: {
			targets: {}
		},

		build_plugin: {
			targets: {}
		},

		buld_full_plugin: {
			targets: {}
		},

		build_addons: {
			targets: {}
		},

		build_examples: {
			targets: {}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-obfuscator');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-onpress-preprocess');
	grunt.loadNpmTasks('grunt-autoprefixer');

};

/**
 * Инструменты для сборки пакетов
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 03.06.2017
 * @version 1.0
 */

module.exports = {

	setupFiles: function(grunt, rootpath, build, lang, concatCallback) {
		var self = this;

		var extentions = ['js', 'css'];

		for( var ext_idx = 0; ext_idx < extentions.length; ext_idx++ ) {

			var filtered = {};
			var scrapeFiles = {};
			var fileConfig = {};

			var ext = extentions[ext_idx];

			var tasks = ['preprocess', 'obfuscator', 'uglify'];
			var minTaskName = 'uglify';

			if( extentions[ext_idx] === 'css' ) {
				tasks = ['preprocess', 'autoprefixer', 'cssmin'];
				minTaskName = 'cssmin';
			}

			var last = {};
			var stages = {};

			if( grunt.file.isDir(rootpath) ) {
				if( grunt.file.isDir(rootpath + '/assets/img') ) {
					grunt.config.set('copy', {
						img: {
							files: [
								{
									expand: true,
									cwd: rootpath + '/assets/img',
									src: ['*', '*/*'],
									dest: rootpath.replace('src', 'dist') + '/assets/img'
								}
							]
						}
					});
				}

				grunt.file.recurse(rootpath, function callback(abspath, rootdir, subdir, filename) {

					var filter1 = subdir && subdir.indexOf('assets/img') > -1,
						filter2 = ext === 'css' && filename.indexOf('.css') < 0,
						filter3 = ext === 'js' && filename.indexOf('.js') < 0;

					if( filter1 || filter2 || filter3 ) {
						return;
					}

					var file = grunt.file.read(abspath);

					var reg = /@\!([a-z0-9]+)\:(\s?[a-z0-9]+|\[\s?\]|\s?\[[a-z0-9-_\[\],\'\"\s]+\])/ig;
					var myArray;

					fileConfig[abspath] = {};

					while( (myArray = reg.exec(file)) != null ) {
						fileConfig[abspath][myArray[1]] = self.normalizeValue(myArray[2]);
					}

					if( !fileConfig[abspath].build || !fileConfig[abspath].build.length || fileConfig[abspath].build.indexOf(build) === -1 ) {
						grunt.log.writeln('NOT BUILD TASK: ' + abspath + '...excluded'['yellow'].bold);
						return;
					}

					if( fileConfig[abspath].lang && fileConfig[abspath].lang.length && fileConfig[abspath].lang.indexOf(lang) === -1 ) {
						grunt.log.writeln('LANG TASK: ' + abspath + '...excluded'['yellow'].bold);
						return;
					}

					scrapeFiles[abspath] = fileConfig[abspath].priority;
				});

				var sorted = Object.keys(scrapeFiles).sort(function(a, b) {
					return scrapeFiles[b] - scrapeFiles[a];
				});

				for( var i in sorted ) {
					if( !sorted.hasOwnProperty(i) ) {
						continue;
					}
					filtered[sorted[i]] = sorted[i];
					last[sorted[i]] = sorted[i];
				}

				// выполняем задачи их перменной tasks
				for( var taskIndex in tasks ) {
					if( !tasks.hasOwnProperty(taskIndex) ) {
						continue;
					}
					var taskName = tasks[taskIndex];

					var filesToProcess = {};
					for( var f in filtered ) {

						if( !filtered.hasOwnProperty(f) ) {
							continue;
						}
						if( !stages[taskName] ) {
							stages[taskName] = {};
						}
						if( !stages[taskName][f] ) {
							stages[taskName][f] = last[f];
						}

						if( Object.keys(fileConfig[f]).indexOf(taskName) < 0 || !fileConfig[f][taskName] ) {
							continue;
						}

						filesToProcess[f] = last[f];

						last[f] = self.linkFile('temp/' + ext + '/' + taskName + '/', f);
						stages[taskName][f] = last[f];
					}

					var linkedFiles = self.linkFiles('temp/' + ext + '/' + taskName + '/', filesToProcess);

					grunt.config.set(taskName + '.' + ext + '.files', linkedFiles);
				}

				var result = [],
					resultMin = [];

				for( var fl in stages[minTaskName] ) {
					if( !stages[minTaskName].hasOwnProperty(fl) ) {
						continue;
					}
					resultMin.push(stages[minTaskName][fl]);
				}

				var stg = stages['preprocess'];

				if( ext === 'css' ) {
					stg = stages['autoprefixer'];
				}

				for( var ffl in stg ) {
					if( !stg.hasOwnProperty(ffl) ) {
						continue;
					}
					result.push(stg[ffl]);
				}

				// соединяем файлы
				var contactFiles = {};

				if( concatCallback ) {
					contactFiles = concatCallback(ext, resultMin, result);
				}

				grunt.config.set('concat.' + ext + '.files', contactFiles);

			} else {
				grunt.log.error("[Ошибка]: Директория " + rootpath + " не существует.");
			}
		}
	},

	/**
	 * Take the raw files array and convert it to the object situable to pass in the tasks.
	 * For example, taked the page 'src/js/file.js' and converts to 'temp/min/js/file.min.js'
	 */
	linkFiles: function(target, files, postfix) {
		var result = {};

		for( var file in files ) {
			var resultFilename = this.linkFile(target, file, postfix);
			result[resultFilename] = files[file];
		}

		return result;
	},

	linkFile: function(target, file, postfix) {
		var resultFilename = target + this.getFilename(file);
		if( postfix ) {
			resultFilename = resultFilename.replace(/(\.[a-z0-9]+)$/, postfix + '$1');
		}
		return resultFilename;
	},

	getFilename: function(filepath) {
		return filepath;
		// if ( base ) return filepath.replace(base, '');
		return filepath.replace(/^.*[\\\/]/, '');
	},

	normalizeValue: function(str) {
		str = str.trim();

		if( str == 'false' ) {
			return false;
		}

		if( str == 'true' ) {
			return true;
		}

		if( str == '[]' ) {
			return [];
		}

		if( str.indexOf('[') > -1 && str.indexOf(']') > -1 ) {
			str = str.replace(/[\']/g, '"');
			return JSON.parse(str);
		}

		if( !isNaN(str) ) {
			return parseInt(str);
		}
	}
};

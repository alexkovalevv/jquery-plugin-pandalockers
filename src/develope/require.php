<?php

	/**
	 * Класс для подключения скриптов и стилей, для их дальнешей отладки
	 * @author Alex Kovalev <alex.kovalevv@gmail.com>
	 * @copyright Alex Kovalev 28.05.2017
	 * @version 1.0
	 */
	class RequireScriptsAndStyles {

		public $path;
		public $addons_path;

		private $js = array();
		private $css = array();

		public function __construct($path, $addons_path)
		{
			$this->path = $path;
			$this->addons_path = $addons_path;
		}

		/**
		 * Собирает глобальные настройки из файла
		 * @param string $file_body
		 * @return array
		 */
		public function parseFileOptions($file_body)
		{
			$file_conditions = array();

			preg_match_all('/\@\!([A-z0-9]+):(\[.*\]|[0-9]+|true|false)/i', $file_body, $conditions);

			if( isset($conditions[1]) && isset($conditions[2]) ) {
				foreach($conditions[1] as $key => $conditionName) {
					if( isset($conditions[2][$key]) ) {
						$file_conditions[$conditionName] = $this->normalizeValue($conditions[2][$key]);
					}
				}
			}

			return $file_conditions;
		}

		/**
		 * Нормализует значения настроек
		 * @param $str
		 * @return array|bool|int|mixed
		 */
		public function normalizeValue($str)
		{
			if( preg_match('/\[(?:.*)\]/', $str) ) {
				$str = preg_replace('/[\[\]\'\"\s\r\n]/', '', $str);
				if( empty($str) ) {
					return array();
				}

				return explode(',', $str);
			} else {
				$str = preg_replace('/[\'\"\s\r\n]/', '', $str);

				if( $str === 'false' || $str === 'true' ) {
					return (boolean)$str;
				} else if( is_numeric($str) ) {
					return intval($str);
				}
			}

			return $str;
		}

		public function loadPluginScripts(array $conditions = array())
		{
			$this->proccess($this->path, $conditions);
		}

		public function loadAddonsScripts(array $addons = array())
		{
			if( empty($addons) ) {
				return;
			}

			foreach($addons as $addon_name => $addon) {

				if( is_array($addon) ) {
					$addon_path = $this->addons_path . '/' . $addon_name;
					$build = $addon['build'];
				} else {
					$addon_path = $this->addons_path . '/' . $addon;
					$build = $addon;
				}

				if( !is_dir($addon_path) ) {
					continue;
				}
				$this->proccess($addon_path, array('build' => $build));
			}
		}

		/**
		 * Запускает процесс сбора и фильтрации файлов для дальнешего подключения
		 * @param string $path
		 * @param array $conditions - поддерживаемые условия build, lang
		 */
		public function proccess($path, array $conditions = array())
		{
			$js = array();
			$css = array();

			$DirectoryIterator = new RecursiveDirectoryIterator($path);
			$IteratorIterator = new RecursiveIteratorIterator($DirectoryIterator, RecursiveIteratorIterator::SELF_FIRST);

			foreach($IteratorIterator as $file) {
				$path = $file->getRealPath();

				if( $file->isDir() ) {
					//$result['directories'][] = $path;
				} elseif( $file->isFile() ) {
					if( preg_match('/\.(js|css)$/i', $path) && filesize($path) ) {
						$file = fopen($path, 'r');
						$file_content = fread($file, filesize($path));

						$file_options = $this->parseFileOptions($file_content);

						if( !empty($conditions) ) {
							if( !isset($conditions['build']) || !isset($file_options['build']) ) {
								continue;
							}

							if( !in_array($conditions['build'], $file_options['build']) ) {
								continue;
							}

							if( isset($conditions['lang']) && !empty($conditions['lang']) && isset($file_options['lang']) && !empty($file_options['lang']) ) {
								if( !in_array($conditions['lang'], $file_options['lang']) ) {
									continue;
								}
							}
						}

						$priority = 0;

						if( isset($file_options['priority']) && !empty($file_options['priority']) ) {
							$priority = $file_options['priority'];
						}

						if( preg_match('/\.(js)$/i', $path) ) {
							$js[] = array('path' => $path, 'priority' => $priority);
						} else {
							$css[] = array('path' => $path, 'priority' => $priority);
						}

						fclose($file);
					}
				}
			}

			usort($js, function ($a, $b) {
				return $b['priority'] - $a['priority'];
			});

			usort($css, function ($a, $b) {
				return $b['priority'] - $a['priority'];
			});

			$this->js = array_merge($this->js, $js);
			$this->css = array_merge($this->css, $css);
		}

		public function getJsFiles()
		{
			return $this->js;
		}

		/**
		 * Печатает подключаемые js файлы на страницу
		 * @param string $base_dir путь к файлу в котором запускается этот процесс
		 */
		public function printJsFiles($base_dir)
		{
			if( empty($this->js) ) {
				return;
			}

			echo "\n<!-- Сгенерированный набор js файлов для отладки плагина. -->\n";

			foreach($this->js as $file) {
				if( !isset($file['path']) ) {
					continue;
				}
				echo '<script src="' . $this->getRelativePath($base_dir, $file['path']) . '"></script>';
			}
		}

		public function getCssFiles()
		{
			return $this->css;
		}

		/**
		 * Печатает подключаемые css файлы на страницу
		 * @param string $base_dir путь к файлу в котором запускается этот процесс
		 */
		public function printCssFiles($base_dir)
		{
			if( empty($this->css) ) {
				return;
			}

			echo "\n<!-- Сгенерированный набор css файлов для отладки плагина. -->\n";

			foreach($this->css as $file) {
				if( !isset($file['path']) ) {
					continue;
				}
				echo '<link rel="stylesheet" href="' . $this->getRelativePath($base_dir, $file['path']) . '" type="text/css" media="all">';
			}
		}

		/**
		 * Преобразует абсолютные пути в относительные
		 * @param string $from
		 * @param string $to
		 * @return string
		 */
		public function getRelativePath($from, $to)
		{
			// some compatibility fixes for Windows paths
			$from = is_dir($from)
				? rtrim($from, '\/') . '/'
				: $from;
			$to = is_dir($to)
				? rtrim($to, '\/') . '/'
				: $to;
			$from = str_replace('\\', '/', $from);
			$to = str_replace('\\', '/', $to);

			$from = explode('/', $from);
			$to = explode('/', $to);
			$relPath = $to;

			foreach($from as $depth => $dir) {
				// find first non-matching dir
				if( $dir === $to[$depth] ) {
					// ignore this directory
					array_shift($relPath);
				} else {
					// get number of remaining dirs to $from
					$remaining = count($from) - $depth;
					if( $remaining > 1 ) {
						// add traversals up to first matching dir
						$padLength = (count($relPath) + $remaining - 1) * -1;
						$relPath = array_pad($relPath, $padLength, '..');
						break;
					} else {
						$relPath[0] = './' . $relPath[0];
					}
				}
			}

			return implode('/', $relPath);
		}
	}
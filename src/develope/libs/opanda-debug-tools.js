/*!
 * Debug Tools
 * Copyright 2016, OnePress, Alex Kovalev
 *
 * @pacakge core
 */
(function ($) {
	'use strict';
	if (!$.pandalocker.tools) $.pandalocker.tools = {};

	console.log('opanda-debug-tools-loaded');

	/**
	 * Инструменты для отладки
	 * Придумать подгрузку откладчика с нашего сайта, чтобы на увеличивать вес плагина
	 * @type {{}}
	 */
	$.pandalocker.tools.debugBuffer = {
		mobile:  $.pandalocker.tools.isMobile(),
		browser: $.pandalocker.browser
	};

	/**
	 * Стурктурирует объект в читабельный вид
	 * @param options
	 * @param deph
	 * @returns {string}
	 */
	$.pandalocker.tools.convertObjToString = function ( options, deph ) {
		var str = '';
		var deph = deph ? deph : 0;
		var t = $.pandalocker.tools.getTabByDeph( deph );
		var i = 1;
		for ( var p in options ) {
			str += t;
			if ( !options[p] || typeof options[p] == 'string' || typeof options[p] == "number" || typeof options[p] == "boolean" || Array.isArray( options[p] ) ) {
				var option;
				if ( typeof options[p] == "boolean" || typeof options[p] == "number" ) {
					option = options[p];
				} else if ( Array.isArray( options[p] ) ) {
					option = "[" + $.pandalocker.tools.arrayToStr( options[p] ) + "]";
				} else {
					option = "'" + options[p] + "'";
				}
				str += p + ": " + option;
			} else {
				str += p + ":{\n" + $.pandalocker.tools.convertObjToString( options[p], deph + 1 ) + "}";
			}
			if ( $.pandalocker.tools.countProperties( options ) != i ) {
				str += ",\n";
			} else {
				str += "\n" + ( deph ? $.pandalocker.tools.getTabByDeph( deph - 1 ) : '');
			}
			i++;
		}
		return str;
	};

	/**
	 * Устанавливает табуляцию по уровню вложенности
	 * @param deph
	 * @returns {string}
	 */
	$.pandalocker.tools.getTabByDeph = function ( deph ) {
		var t = "\t";
		for ( var k = 0; k < deph; k++ ) {
			t += "   ";
		}
		return t;
	};

	/**
	 * Конвертирует массив в строку
	 * @param arr
	 * @returns {string}
	 */
	$.pandalocker.tools.arrayToStr = function ( arr ) {
		var str = [];
		for ( var i in arr ) {
			/*if ( typeof arr[i] !== 'string' ) {
			 continue;
			 }*/
			str.push( '"' + arr[i] + '"' );
		}
		return str.join();
	};

	/**
	 * Считает свойства объекта
	 * @param obj
	 * @returns {number}
	 */
	$.pandalocker.tools.countProperties = function ( obj ) {
		var count = 0;
		for ( var prop in obj ) {
			if ( obj.hasOwnProperty( prop ) ) {
				++count;
			}
		}
		return count;
	};

	/**
	 * Удаляет все данные сохранненные замком
	 */
	$( document ).on( 'click', '.onp-sl-debug-clear-data', function () {
		var clearKeys = [];
		for ( var i = 0, len = localStorage.length; i < len; ++i  ) {
			var storageItemId = localStorage.key( i );
			if ( storageItemId && ( storageItemId.indexOf( 'onp-sl-vk' ) + 1 || storageItemId.indexOf( 'onp_sl_vk' ) + 1 || storageItemId.indexOf( 'page_' ) + 1) ) {
				clearKeys.push(storageItemId);
			}
		}

		for(i in clearKeys) {
			$( this ).text( $( this ).text() + '.' );
			$.pandalocker.tools.removeStorage(clearKeys[i]);
		}

		return false;
	} );


	/**
	 * Данная функции записывает и выводит отладочную информацию
	 * @param details - Объект с различного рода информаций.
	 * @return {void}
	 */
	$.pandalocker.tools.debugger = function ( details ) {
		var l = (location.toString().match( /#(.*)/ ) || {})[1] || '';
		$.pandalocker.tools.debugBuffer = $.extend( true, $.pandalocker.tools.debugBuffer, details );

		if ( l && l == 'pandalocker_debug' ) {
			if ( !$( '.onp-sl-debug-panel' ).length ) {
				$( 'body' ).prepend(
					'<div class="onp-sl-debug-panel"><h3>Внимание! Включен режим откладки.</h3><pre>' +
					$.pandalocker.tools.convertObjToString( $.pandalocker.tools.debugBuffer ) +
					'</pre><a href="#" class="onp-sl-debug-clear-data">Сбросить кеш и удалить данные из памяти</div>'
				);
			} else {
				$( '.onp-sl-debug-panel' ).find( 'pre' ).html(
					$.pandalocker.tools.convertObjToString( $.pandalocker.tools.debugBuffer )
				);
			}
		}
	};
})(jQuery);
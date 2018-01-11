/*!
 * OnePress Visibility Checker Service
 * Copyright 2015, OnePress, http://byonepress.com

 * @since 1.0.0
 * @pacakge core

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:85
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */
(function($) {
	'use strict';

	$.pandalocker.services.visibility = function() {

		this.canLock = function(filters) {

			if( !filters ) {
				return true;
			}

			for( var i in filters ) {
				if( !filters.hasOwnProperty(i) ) {
					continue;
				}
				if( typeof( filters[i] ) !== "object" ) {
					continue;
				}

				var filter = filters[i];

				var passed = this.isVisible(filter);
				if( !passed ) {
					return false;
				}
			}

			return true;
		};

		this.isVisible = function(filter) {
			if( !filter.conditions ) {
				return true;
			}

			var matched = this.matchFilter(filter);
			var type = filter.type || 'showif';

			if( 'showif' === type ) {
				return matched;
			}
			if( 'hideif' === type ) {
				return !matched;
			}
		}

		this.matchFilter = function(filter) {

			// AND condition
			var all = true;

			for( var i in filter.conditions ) {
				if( !filter.conditions.hasOwnProperty(i) ) {
					continue;
				}
				if( typeof( filter.conditions[i] ) !== "object" ) {
					continue;
				}

				var scope = filter.conditions[i];
				var result = this.matchScope(scope);
				if( !result ) {
					all = false;
				}
			}

			return all;
		};

		/**
		 * Returns true if a specified scope is matched the current state.
		 */
		this.matchScope = function(scope) {

			// OR condition
			var any = false;

			if( !scope.conditions ) {
				return true;
			}
			for( var i in scope.conditions ) {
				if( !scope.conditions.hasOwnProperty(i) ) {
					continue;
				}
				if( typeof( scope.conditions[i] ) !== "object" ) {
					continue;
				}

				var condition = scope.conditions[i];

				var result = this.matchCondition(condition);
				if( result ) {
					any = true;
				}
			}

			return any;
		};

		/**
		 * Returns true if a specified condition is matched the current state.
		 */
		this.matchCondition = function(condition) {

			var parameter = condition.param;
			var operator = condition.operator;
			var modelValue = condition.value;
			var type = condition.type || 'text';

			var provider = this.getValueProvider(parameter);

			if( !provider ) {
				console && console.log('[visibility]: the value provider "%s" not found.'.replace('%s', parameter));
				return true;
			}

			var currentValue = provider.getValue(condition);
			if( currentValue === null ) {
				console && console.log('[visibility]: the value returned from the provider "%s" equals to null.'.replace('%s', parameter));
				return true;
			}

			if( provider.compare ) {
				return provider.compare(operator, modelValue, currentValue, type);
			} else {
				return this.compare(operator, modelValue, currentValue, type);
			}
		};

		this.getValueProvider = function(parameter) {
			var provider = $.pandalocker.services.visibilityProviders[parameter];
			provider = $.pandalocker.filters.run('visibility-value-provider', [provider, parameter]);
			return provider;
		};

		this.compare = function(operator, modelValue, currentValue, type) {
			var converToRange = (type === 'date' && (operator === 'equals' || operator === 'notequal'));

			modelValue = this.castValue(modelValue, type, converToRange ? 'range' : null);
			currentValue = this.castValue(currentValue, type);

			switch( operator ) {
				case 'equals':

					if( $.isArray(currentValue) ) {
						return $.inArray(modelValue, currentValue) > -1;
					}

					if( modelValue.range ) {
						return currentValue > modelValue.start && currentValue < modelValue.end;
					}

					return modelValue === currentValue;

					break;
				case 'notequal':

					if( $.isArray(currentValue) ) {
						return $.inArray(modelValue, currentValue) === -1;
					}

					if( modelValue.range ) {
						return !(currentValue > modelValue.start && currentValue < modelValue.end);
					}

					return modelValue !== currentValue;

					break;
				case 'less':
				case 'older':
					return currentValue < modelValue;
					break;
				case 'greater':
				case 'younger':
					return currentValue > modelValue;
					break;
				case 'contains':
					return currentValue.indexOf(modelValue) > -1;
					break;
				case 'notcontain':
					return currentValue.indexOf(modelValue) === -1;
					break;
				case 'between':
					return currentValue >= modelValue.start && currentValue <= modelValue.end;
					break;
			}

			return true;
		};

		this.castValue = function(value, type, label) {
			if( value === null ) {
				return value;
			}

			if( $.isArray(value) ) {

				for( var i = 0; i < value.length; i++ ) {
					value[i] = this.castValue(value[i], type);
				}

				return value;
			}

			if( typeof value.start !== "undefined" ) {

				var start = this.castValue(value.start, type, 'start');
				var end = this.castValue(value.end, type, 'end');

				if( value.start.type === 'relative' ) {
					value.end = start;
					value.start = end;
				} else {
					value.end = end;
					value.start = start;
				}

				return value;
			}

			switch( type ) {
				case 'text':
				case 'select':
					return '' + value;
					break;
				case 'integer':
					return parseInt(value);
					break;
				case 'date':
					return this.castToDate(value, label);
					break;
			}
		};

		this.castToDate = function(value, label) {

			var current = new Date().getTime();

			if( 'relative' === value.type ) {
				var unitsCount = parseInt(value.unitsCount);

				switch( value.units ) {
					case 'seconds':
						var point = current - unitsCount * 1000;
						break;
					case 'minutes':
						var point = current - unitsCount * 60 * 1000;
						break;
					case 'hours':
						var point = current - unitsCount * 60 * 60 * 1000;
						break;
					case 'days':
						var point = current - unitsCount * 60 * 60 * 24 * 1000;
						break;
					case 'weeks':
						var point = current - unitsCount * 60 * 60 * 24 * 7 * 1000;
						break;
					case 'months':
						var point = current - unitsCount * 60 * 60 * 24 * 30 * 1000;
						break;
					case 'years':
						var point = current - unitsCount * 60 * 60 * 24 * 365 * 1000;
						break;
				}

				if( 'range' !== label ) {
					return point;
				}

				var result = {
					range: true,
					end: point,
					start: 0
				};

				switch( value.units ) {
					case 'seconds':
						result.start = result.end - 1000;
						break;
					case 'minutes':
						result.start = result.end - 60 * 1000;
						break;
					case 'hours':
						result.start = result.end - 60 * 60 * 1000;
						break;
					case 'days':
						result.start = result.end - 60 * 60 * 24 * 1000;
						break;
					case 'weeks':
						result.start = result.end - 60 * 60 * 24 * 7 * 1000;
						break;
					case 'months':
						result.start = result.end - 60 * 60 * 24 * 30 * 1000;
						break;
					case 'years':
						result.start = result.end - 60 * 60 * 24 * 365 * 1000;
						break;
				}

				return result;

			} else {

				if( 'range' === label ) {

					var date = new Date(value);

					var day = date.getUTCDate();
					var month = date.getUTCMonth();
					var year = date.getUTCFullYear();

					return {
						range: true,
						start: Date.UTC(year, month, day),
						end: Date.UTC(year, month, day, 23, 59, 59, 999)
					};

				} else {
					return value;
				}
			}
		};
	};

	$.pandalocker.services.visibilityProviders = {};

	$.pandalocker.services.visibilityProviders['user-mobile'] = {
		getValue: function() {
			return $.pandalocker.tools.isMobile() ? 'yes' : 'no';
		}
	};

	$.pandalocker.services.visibilityProviders['location-page'] = {
		getValue: function() {
			return window.location.href;
		}
	};

	$.pandalocker.services.visibilityProviders['location-referrer'] = {
		getValue: function() {
			return document.referrer;
		}
	};

})(__$onp);
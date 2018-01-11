/*!
 * Not Available
 * Copyright 2014, OnePress, http://byonepress.com
 * 
 * @since 4.0.0
 * @pacakge extras

 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:65
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

(function($) {
	'use strict';

	if( !$.pandalocker.extras ) {
		$.pandalocker.extras = {};
	}

	$.pandalocker.extras.na = {

		init: function() {
			var self = this;

			var controlsCount = 0;
			var controlsLeft = 0;
			var controlsHavingErrors = {};

			var calculateControls = function() {
				var count = 0;

				for( var i = 0; i < self._groups.length; i++ ) {
					for( var k = 0; k < self._groups[i].controls.length; k++ ) {
						count++;
					}
				}

				return count;
			};

			this.addHook('control-error', function(locker, controlName, groupName) {

				if( !controlsCount ) {
					controlsCount = calculateControls();
					controlsLeft = controlsCount;
				}

				var identity = groupName + '-' + controlName;
				if( controlsHavingErrors[identity] ) {
					return;
				}

				controlsHavingErrors[identity] = true;
				controlsLeft--;

				if( controlsLeft > 0 ) {
					return;
				}

				self.runHook('na');

				if( self.options.locker.naMode === 'show-content' ) {
					self.unlock('na');
				}
			});
		}
	};

})(__$onp);

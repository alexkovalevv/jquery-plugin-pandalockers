HTMLElement.prototype.addClass = function(className) {
	if( this.className.indexOf(className) === -1 ) {
		if( this.className )
			this.className += ' ' + className;
		else
			this.className = className;
	}
	return this;
};

HTMLElement.prototype.removeClass = function(className) {
	if(this.className && this.className.indexOf(className) !== -1) {
		this.className = this.className.replace(new RegExp('\\s?' + className, 'g'), '');
	}
	return this;
};

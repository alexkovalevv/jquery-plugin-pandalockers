/**
 * Подключает таблицу стилей в head страницы
 * @param url
 */
function loadStyle(url) {
	var head = document.head,
		link = document.createElement('link');

		link.type = 'text/css';
		link.rel = 'stylesheet';
		link.href = url;

	head.appendChild(link)
}
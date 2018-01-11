/**
 * Создаем глобальную переменную, если ее не существует
 * @author Alex Kovalev <alex.kovalevv@gmail.com>
 * @copyright Alex Kovalev 29.03.2017
 * @version 1.0
 *
 * @!obfuscator:false
 * @!preprocess:false
 * @!priority:101
 * @!uglify:true
 * @!lang:[]
 * @!build:['free', 'premium', 'full-free', 'full-premium']
 */

void 0 === window.__$onp && void 0 !== window.jQuery && (window.__$onp = window.jQuery);
(function ()
{
	"use strict";

	angular.module('BuDirectives', []).
	directive('bindHtmlWithJs', ['$sce', '$parse', function ($sce, $parse)
	{

			/**
			 * It removes script tags from html and inserts it into DOM.
			 *
			 * Testing:
			 * html += '<script>alert(1234)</script><script type="text/javascript">alert(12345)</script><script type="asdf">alert(1234)</script><script src="/js/alert.js">alert(1234)</script><span style="color: red;">1234</span>';
			 * or
			 * html += '<script src="/js/alert.js"></script><script type="text/javascript">console.log(window.qwerqwerqewr1234)</script><span style="color: red;">1234</span>';
			 *
			 * @param html {String}
			 * @returns {String}
			 */
			function handleScripts(html)
			{
				// html must start with tag - it's angularjs' jqLite bug/feature
				html = '<i></i>' + html;

				var originElements = angular.element(html),
					elements = angular.element('<div></div>');

				if (originElements.length)
				{
					// start from 1 for removing first tag we just added
					for (var i = 1, l = originElements.length; i < l; i ++)
					{
						var $el = originElements.eq(i),
							el = $el[0];
						if (el.nodeName == 'SCRIPT' && ((! el.type) || el.type == 'text/javascript')) {
							evalScript($el[0]);
						}
						else {
							elements.append($el);
						}
					}
				}
//				elements = elements.contents();
				html = elements.html();

				return html;
			}

			/**
			 * It's taken from AngularJS' jsonpReq function.
			 * It's not ie < 9 compatible.
			 * @param {DOMElement} element
			 */
			function evalScript(element)
			{
				var script = document.createElement('script'),
					body = document.body,
					doneWrapper = function() {
						script.onload = script.onerror = null;
						body.removeChild(script);
					};

				script.type = 'text/javascript';
				if (element.src)
				{
					script.src = element.src;
					script.async = element.async;
					script.onload = script.onerror = function () {
						doneWrapper();
					};
				}
				else
				{
					// doesn't work on ie...
					try {
						script.appendChild(document.createTextNode(element.innerText));
					}
					// IE has funky script nodes
					catch (e) {
						script.text = element.innerText;
					}

					setTimeout(function () {doneWrapper()}, 10);
				}
				body.appendChild(script);
			}

		return function ($scope, element, attr)
		{
			element.addClass('ng-binding').data('$binding', attr.bindHtmlWithJs);

			var parsed = $parse(attr.bindHtmlWithJs);

			function getStringValue()
			{
				return (parsed($scope) || '').toString();
			}

			$scope.$watch(getStringValue, function bindHtmlWithJsWatchAction(value)
			{
				var html = value ? $sce.getTrustedHtml(parsed($scope)) : '';
				if (html) {
					html = handleScripts(html);
				}
				element.html(html || '');
			});
		};
	}]).

/* This filter is for demo only */

	filter('trustAsHtml', ['$sce', function ($sce) {
		return function trustAsHtml(value) {
			return $sce.trustAsHtml(value);
		}
	}]);
}());
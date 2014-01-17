(function ()
{
	"use strict";

	/* This filter is for demo only */
	angular.module('DemoHelpers', []).
	filter('trustAsHtml', ['$sce', function ($sce) {
		return function trustAsHtml(value) {
			return $sce.trustAsHtml(value);
		}
	}]);
}());
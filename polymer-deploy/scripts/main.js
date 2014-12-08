(function($) {


	$(document).on('polymer-ready', function() {

		$('#navicon').on('click', function() {
			$('#drawerPanel').get(0).togglePanel();
		});

		showSectionItem('configurator-type', 'chanel');

		$('core-item').on('click', function(event) {
			var $target = $(event.target);

			var type = $target.attr('label').toLowerCase();

			showSectionItem('configurator-type', type);
		});

		showSectionItem('tab-content', 'version');

		$('[data-version-tab]').click(function(event) {
			var $target = $(event.target);
			var type = $target.attr('data-type');
			
			showSectionItem('tab-content', type);
		});

	});

	function showSectionItem(type, item) {
		$('[data-' + type + ']').hide().filter('[data-type="' + item + '"]').show();	
	}



}(window.jQuery));
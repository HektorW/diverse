(function($) {


	$(document).on('polymer-ready', function() {


		var markets = {
			'zh-cn': {
				flag: 'flags/china.jpg',
				name: 'China'
			}
		};


		

		$('#drawerPanel').on('core-responsive-change', function() {
			$('#navicon').get(0).hidden = !$('#drawerPanel').get(0).narrow;
		});
		$('#navicon').get(0).hidden = !$('#drawerPanel').get(0).narrow;

		$('#navicon').on('click', function() {
			$('#drawerPanel').get(0).togglePanel();
		});

		showSectionItem('configurator-type', 'chanel');

		$('paper-item[data-configurator]').on('click', function(event) {
			var $target = $(event.target);

			var type = $target.attr('data-type').toLowerCase();

			showSectionItem('configurator-type', type);
			showSectionItem('tab-content', dataElem('configurator-type', type).find('section').attr('data-type'));

			if (!$('#drawerPanel').get(0).narrow) {
				$('#drawerPanel').get(0).togglePanel();
			}
		});

		showSectionItem('tab-content', 'driveline');

		$('[data-version-tab]').click(function(event) {
			var $target = $(event.target);
			var type = $target.attr('data-type');
			
			showSectionItem('tab-content', type);
		});

	});

	function showSectionItem(type, item) {
		$('[data-' + type + ']').hide().filter('[data-type="' + item + '"]').show();	
	}
	function dataElem(data, val) {
		return val ? $('[data-' + data + '="' + val + '"]') : $('[data-' + data + ']');
	}



}(window.jQuery));
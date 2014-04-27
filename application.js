/* Implementation example */

$(function(){
	var options = {};

	var callbacks = {
		variable_demo: {
			before: function(inData, openLightbox){
				var data = { name: null };

				// Sample a user name
				switch(inData.user_id){
					case 1:
						data.name = 'George';
						break;
					case 2:
						data.name = 'John';
						break;
				}
				
				// Only open lightbox if a user is found
				if(data.name !== null){
					openLightbox(data);
				}
			},
			after: function(data){
				alert('Lightbox loaded');
			}
		}
	};

	$.lightbox(options, callbacks);
});

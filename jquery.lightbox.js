(function($){
	// Ensures necessary elements exist inside body
	function ensureElements(){
		var mask = $('#lightbox-mask');
		if(!mask.length){
			mask = $('<div>').attr('id', 'lightbox-mask').appendTo('body');
		}

		var element = mask.find('#lightbox');
		if(!element.length){
			element = $('<div>').attr('id', 'lightbox');
			mask.html(element);
		}

		return [mask, element];
	}


	function error(msg){
		throw new Error('jQuery Lightbox: ' + msg);
	}


	$.lightbox = function(options, callbacks){
		/* Init */
		options = $.extend(true, {
			layoutTmpl:	$('#lightbox-tmpl'),
			trigger:	'.lightbox-trigger', // elements that will automatically trigger a lightbox
			fadeSpeed:	500 // the CSS transition speed (set to 0 for browsers that don't support transition)
		}, options);

		if(typeof callbacks !== 'object'){
			callbacks = {};
		}

		var elements = ensureElements();
		var mask = elements[0];
		var element = elements[1];

		// Bind open-triggers
		$(document).on('click.lightbox', options.trigger, function(e){
			e.preventDefault();
			var trigger = $(this);
			lightbox.open(trigger.data('lightbox-key'), trigger.data('lightbox-data'));
		});

		// Bind close-triggers
		var maskSelector = '#' + mask.attr('id');
		var closeSelector = '#' + element.attr('id') + ' .lightbox-close';
		$(document).on('click.lightbox', [maskSelector, closeSelector].join(', '), function(e){
			e.preventDefault();
			var target = $(e.target);

			if(target.is(mask) || target.is($(closeSelector))){
				lightbox.close();
			}
		});


		/* Return object */
		var lightbox = Object.create({
			open: function(key, data){
				if(!key){
					error('Tried to open lightbox with undefined key');
				}

				var _t				= this;
				var hyphenKey		= key.replace(/_/g, '-'); // normalize key format to use hyphen as word-delimeter
				var underscoreKey	= key.replace(/-/g, '_');  // normalize callback names to use underscore as word-delimeter

				// TODO Don't depend on jquery.tmpl
				var template = $('#' + hyphenKey + '-lightbox-tmpl');
				if(!template.length){
					error('Could not find HTML template "' + template.selector + '"');
				}

				// Ensure a before-callback always exists, that wraps a simple opening of the lightbox
				var lightboxCallbacks = callbacks[underscoreKey];
				if(typeof(lightboxCallbacks) !== 'object'){
					lightboxCallbacks = {};
				}
				if(typeof(lightboxCallbacks.before) !== 'function'){
					lightboxCallbacks.before = function(data, openLightbox){
						openLightbox(data);
					}
				}

				// Execute before-callback, then render lightbox, then execute after-callback
				lightboxCallbacks.before.apply(element, [data, function(data){
					// Create and render the HTML for the lightbox
					var html = $.tmpl(options.layoutTmpl, { data: data, template: template });
					var wrapper = $('<div>').attr('id', hyphenKey + '-lightbox').html(html);
					element.html(wrapper);
					
					// Show lightbox and execute after-callback after fadeSpeed
					element.add(mask).show(0).addClass('active');
					setTimeout((lightboxCallbacks.after || $.noop).bind(element, [data]), options.fadeSpeed);
				}]);
				return true;
			},
			
			close: function(){
				element.add(mask).removeClass('active').delay(options.fadeSpeed).hide(0, function(){ element.html('') });
			}
		});

		return lightbox;
	}
}(jQuery));

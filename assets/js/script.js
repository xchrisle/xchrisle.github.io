$(document).ready(function(){
	$('.progress-button').progressInitialize();

	// Listen for clicks and start animations

	$('#btn-cookie').click(function(e){
		e.preventDefault();

		// This function will show a progress meter for
		// the specified amount of time
		if ($(this).hasClass('noClick')) return;
		$(this).progressTimed(2);
	});

});

// The progress meter functionality is available as a series of plugins.
// You can put this code in a separate file if you wish to keep things tidy.

(function($){

	$.fn.progressInitialize = function(){

		return this.each(function(){

			var button = $(this),
				progress = 0;

			// Extract the data attributes into the options object.

			var options = $.extend({
				type:'background-horizontal',
				loading: 'Eating..',
				finished: 'Eat Cookie'
			}, button.data());

			// Add the data attributes if they are missing from the element - for CSS code
			button.attr({'data-loading': options.loading, 'data-finished': options.finished});

			// Add the needed markup for the progress bar to the button
			var bar = $('<span class="tz-bar ' + options.type + '">').appendTo(button);

			// The progress event tells the button to update the progress bar
			button.on('progress', function(e, val, absolute, finish){

				if(!button.hasClass('in-progress')){

					// This is the first progress event for the button 

					bar.show();
					progress = 0;
					button.removeClass('finished').addClass('in-progress')
				}

				// val, absolute and finish are event data passed by the progressIncrement
				// and progressSet methods that you can see near the end of this file.

				if(absolute){
					progress = val;
				}
				else{
					progress += val;
				}

				if(progress >= 100){
					progress = 100;
				}

				if(finish){
					// Prevent clicks while button is not ready
					button.addClass('noClick');
					button.removeClass('in-progress').addClass('finished');
					$('#counter').html(function(i, val) { return +val+1 });
					bar.delay(50).fadeOut(function(){
						button.trigger('progress-finish');
						setProgress(0);
						button.removeClass('noClick');
					});

				}

				setProgress(progress);
			});

			function setProgress(percentage){
				bar.filter('.background-horizontal,.background-bar').width(percentage+'%');
				bar.filter('.background-vertical').height(percentage+'%');
			}

		});

	};

	$.fn.progressStart = function(){

		var button = this.first(),
			last_progress = new Date().getTime();

		if(button.hasClass('in-progress')){
			return this;
		}

		button.on('progress', function(){
			last_progress = new Date().getTime();
		});

		// Every half a second check whether the progress 
		// has been incremented in the last two seconds

		var interval = window.setInterval(function(){

			if( new Date().getTime() > 2000+last_progress){

				// There has been no activity for two seconds. Increment the progress
				// bar a little bit to show that something is happening

				button.progressIncrement(5);
			}

		}, 500);

		button.on('progress-finish',function(){
			window.clearInterval(interval);
		});

		return button.progressIncrement(10);
	};

	$.fn.progressFinish = function(){
		return this.first().progressSet(100);
	};

	$.fn.progressIncrement = function(val){

		val = val || 10;

		var button = this.first();

		button.trigger('progress',[val])

		return this;
	};

	$.fn.progressSet = function(val){
		val = val || 10;

		var finish = false;
		if(val >= 100){
			finish = true;
		}

		return this.first().trigger('progress',[val, true, finish]);
	};

	$.fn.progressTimed = function(seconds, cb){

		var button = this.first(),
			bar = button.find('.tz-bar');

		if(button.is('.in-progress')){
			return this;
		}

		// Set a transition declaration for the duration of the meter.
		// CSS will do the job of animating the progress bar for us.

		bar.css('transition', seconds+'s linear');
		button.progressSet(99);

		window.setTimeout(function(){
			bar.css('transition','');
			button.progressFinish();

			if($.isFunction(cb)){
				cb();
			}

		}, seconds*1000);
	};

})(jQuery);
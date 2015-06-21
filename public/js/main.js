$(function () {

	/* Vars */
	var mWindow = $(window);
	var windowHeight = mWindow.height();
	var headerHeight = $(".header").height();
	var mainWidth = $("#main").width();

	/* Input range vars */
	var el;
	var isFirstVisible = false;
	var firstVisible;
	var nbClicks = 1;

	var data;
	var eyes = [];

	$("#vid-input").focus();

	$(".arrow").on("click", function (e) {
		e.preventDefault();
		var li = $(this).next().children();
		var count = $(li).length;
		var coeff;


		$(li).each(function (index) {
			if ($(this).hasClass("item-visible")) {
				if (!isFirstVisible) {
					firstVisible = index;
					isFirstVisible = true;
				}

				if ($(this).hasClass("translate-show")) {
					$(this).removeClass("translate-show");
				}
				$(this).addClass("translate-hide");
				$(this).removeClass("item-visible");
			}

			if (index < (firstVisible + 8 + 8) && index > (firstVisible + 7)) {
				if (!$(this).hasClass("translate-show")) {
					coeff = ((firstVisible + 8) % 8) + nbClicks;
					$(this).addClass("translate-show").css({
						"transform": "translateY(-" + coeff * 80 + "px)",
						"-webkit-transform": "translateY(-" + coeff * 80 + "px)",
						"-moz-transform": "translateY(-" + coeff * 80 + "px)",
						"-o-transform": "translateY(-" + coeff * 80 + "px)",
					});
				}
				$(this).addClass("item-visible");
			}
		});

		nbClicks++;
		if (nbClicks > 2) {
			nbClicks = 0;
		}
		isFirstVisible = false;
		/*
		if(!$(this).next().hasClass("translate")){
		    $(this).next().addClass("translate");
		}
		*/

	});

	$("#video-submit").on("click", function (e) {
		e.preventDefault();
		var videoInput = $("#vid-input").val();
		console.log(videoInput);

		var splitCriteria = "?v=";
		var videoUrl = videoInput.substring(videoInput.indexOf("?v=") + splitCriteria.length, videoInput.length);

		console.log(videoUrl);

		queryAPI(videoUrl);
	});


	function queryAPI(url) {
		$.getJSON('api/youtube', {
			url: url
		}).done(function (_data) {
			data = _data;
		});
	}


	var video = document.getElementById('video');
	video.addEventListener('timeupdate', function () {
		var i = Math.round(video.currentTime * 10);
		eyes = [];
		var string = "eye";
		var target, name, x, y;
		if (data) {
			console.log(i);
			if (data[i].faces.length > 0) {
				for (var j = 0; j < data[i].faces.length; j++) {
					if (data[i].faces[j].points.length > 0) {
						//console.log(data[i].faces[j].points);

						for (var k = 0; k < data[i].faces[j].points.length; k++) {

							target = data[i].faces[j].points[k];
							name = target.name;
							x = target.x;
							y = target.y;

							var eye = {};

							if (name == "basic eye right") {
								//console.log("hello right: ", name, x, y);
								//target.x
								eye.rightX = target.x;
								eye.rightY = target.y;
								eye.name = target.name;
								eyes.push(eye);
							}

							if (name == "basic eye left") {
								//console.log("hello left: ", name, x, y);
								eye.leftX = target.x;
								eye.leftY = target.y;
								eye.name = target.name;
								eyes.push(eye);
							}
						}
					}
				}
				console.log(eyes);
			}
		}
	})

})

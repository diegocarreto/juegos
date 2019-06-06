color1 = '';
color2 = '';

footerImg = '';
headerImg = '';
footerOff = '1nterfaz/graphics/footer-tab-off.png';
footerOn = '1nterfaz/graphics/footer-tab-on.png';
headerOff = '1nterfaz/graphics/head1.png';
headerOn = '1nterfaz/graphics/head2.png';
firstFooterClick = false;
footerHeight = ''
firstToggle = true;

$(document).ready(function () {

	//crear splash		
	$('<section id="splash"><img src="splash.png" /></section>').insertBefore('#activity')

	//crear header y footer
	$('<header> <img id="headerImg"/><h1></h1><a id="headerTab">Iniciar</a></header><footer><img id="logo" src="1nterfaz/graphics/logo.svg"/><section id="instrucciones"></section><div id="seccSugerecias"></div><nav id="footerButtons"><ul><li><a id="footerTab"><img src="1nterfaz/graphics/footer-tab-on.png"/></a></li></ul></nav></footer>').insertAfter('#activity')
	footerImg = $('#footerTab img');
	
	materias = ['ciencias', 'espanol', 'formacion', 'geografia', 'historia', 'matematicas' ];
	colorFooter = ['#93b939', '#dd491b', '#dd007b', '#0086c5', '#5f447c', '#d8161e'];
	colorHeader = ['#bd5298', '#2ea5bd', '#1f74b1', '#dd491b', '#f89f13', '#80a531'];
	
	if(skin == 'marfil'){
		
		$('*').css('color', '#000')
		$('header *, footer *, .button').css('color', 'white')
		
		}

	color1 = colorFooter[materias.indexOf(materia)];
	color2 = colorHeader[materias.indexOf(materia)];
	
	

	$('h1').text(titulo).css('background-color', color2);

	$('#headerTab, footer').css('background-color', color1);
	$('title').text(titulo);

	$('#instrucciones').html(intro).addClass('introTxt');
     /*
	midWidth = parseInt($('#instrucciones').css('width')) / 2 * -1;
	$('#instrucciones').css('margin-left', midWidth);
    */


	$('body').css('background-image', 'url(1nterfaz/skin/' + materia + '/' + skin + '.jpg)');
	$('#headerImg').attr('src', '1nterfaz/skin/' + materia + '/' + grado  +'/b' + bloque + '.jpg');

	$('.button').css('background-color', color2 //'-webkit-linear-gradient(left, white, white 22px, '+ color1+' 22px,' + color1 + ')'
	).hover(function(){$(this).css('background-color', color1)}, function(){$(this).css('background-color', color2)});
	

	$('#splash, #activity, #pageSections').hide();
	$('#activity').css('border-color', color1)
	$('#splash').fadeIn(1000);

	alreadyDown = false;
	footerHeight = $('footer').css('height');

	var headerHeight = $('h1').css('height');

	//mostrar botones parte izquierda
	if (botones.length != 0) {
		for (var a = 0; a < botones.length; a++) {

			$('#footerButtons li:last').after('<li><a id = "' + botones[a] + '"><img src="1nterfaz/graphics/' + botones[a] + '.png"> </img</a></li>')


			if (botones[a] == 'sugerencias') {


$('#seccSugerecias').css('background-color', color2).html('<object data="sugerencias.html" type="text/html" width="365px" height="315px;"></object>')	;

$('#sugerencias').click(function () {

	$('#seccSugerecias').fadeToggle("slow", "swing");


	}).toggle(
    function(){$('#sugerencias img').attr('src', '1nterfaz/graphics/cerrar.png')},
    function(){$('#sugerencias img').attr('src', '1nterfaz/graphics/sugerencias.png')}



	)

			};

		}
	}

	$('#footerButtons li, #seccSugerecias').hide(); // se eliminó .not(':first')
	// funciones de botones


	$('#home').click(function () {

		location.reload();

	})

	$('#imprimir').click(function () {

		window.print()
	})

	$('#headerTab').click(function () {

		if (firstToggle == true) {

			firstToggle = false;

			$('#instrucciones').css('margin-left', '0').html(paneles[0].instrucciones).removeClass('introTxt');

			$('#splash, #logo').fadeOut(1000);
			$('#activity, #pageSections, #nombre').fadeIn(4000);

			if (paneles[0].nombre == undefined) {

				$('#nombre').hide();
			} else {
				$('#nombre').text(paneles[0].nombre)
			}

			$('footer li').fadeIn(1000);

			$(this).html('');
			$('<img src="1nterfaz/graphics/head2.png" />').appendTo($(this));

			autoHideFooter = setTimeout(

			function () {
				if (firstFooterClick == false) {
					footerImg = $('#footerTab img');

					if (footerImg.attr('src') == footerOn) {

						footerImg.attr('src', footerOff)
                        footerHeight = $('footer').css('height');
						$('footer').animate({
							bottom: '-=' + footerHeight
						},
						500, 'swing');

					}
				}

			},
			12000

			);
		} // firstToggle

		switchHeader()

	})

	$('#footerTab').click(switchFooter)

	$('#splash').center();

	if (centrar == true) {
		$('#activity').center()
	};

	window.onresize = function (event) {
		$('#splash').center();
		if (centrar == true) {
			$('#activity').center()
		};
	}

}); //TERMINA DOCUMENT READY

function switchFooter() {

	firstFooterClick = true;

	if (footerImg.attr('src') == footerOn) {

		footerImg.attr('src', footerOff)

		$('footer').stop(true, true).animate({
			bottom: '-=' + footerHeight
		},
		500, 'swing');

	} else {

		footerImg.attr('src', footerOn)
		$('footer').stop(true, true).animate({
			bottom: '+=' + footerHeight
		},
		500, 'swing');

	}


}

function switchHeader() {

	headerImg = $('#headerTab img');

	if (headerImg.attr('src') == headerOn) {

		headerImg.attr('src', headerOff)

		$('header').animate({
			marginTop: '-=' + 84
		},
		500, 'swing');

	} else {

		headerImg.attr('src', headerOn)
		$('header').animate({
			marginTop: '+=' + 84
		},
		500, 'swing');

	}
}

function addButtons(buttonID) {

	$(document).ready(function () {

		$('#footerButtons li:last').after('<li><a id = "' + buttonID + '"><img src="img-html/' + buttonID + '.png"> </img</a></li>')

	})

}

function removeButtons(buttonID) {

	$(document).ready(function () {

		$('#' + buttonID).remove();

	})

}



function updateInstructions(newInstructions){
var firstClick = true;
     $('#instrucciones').html(newInstructions)

	if (footerImg.attr('src') == footerOff) {

		footerImg.attr('src', footerOn)
		$('footer').stop(true, true).animate({
			bottom: '+=' + footerHeight
		},
		500, 'swing');

	}
	
	}

jQuery.fn.center = function () {
	this.css('position', 'absolute')
	this.css("z-index", "-1000");
	this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
	this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
	return this;
}


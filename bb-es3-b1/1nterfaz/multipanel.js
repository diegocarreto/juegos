var availablePanels = ''
var bloquear = [];
var activeCSS = '';
var inactiveCSS = '';
var activeIndex = 0
var nextPanel = '';
var prevPanel = '';
var visited = [];
var panelWidth = 0;
var panelHeight = 0;

$(function () {
    var totalPanels = $('#panelReel > *').length;

    if (totalPanels > 1) {

        activeCSS = {
            "background-color": color1
        };
        inactiveCSS = {
            "background-color": color2
        };
        if (transicion == 'vertical') {
            nextPanel = 'up';
            prevPanel = 'down';
            transMarginRight = 70
        } else {
            nextPanel = 'left';
            prevPanel = 'right';
            transMarginRight = 70 + (40 * totalPanels) + 'px';
        }

        $('<nav id="pageSections"><ul></ul></nav>').hide().insertAfter('#logo')

        $('<div id="nombre"></div>').insertBefore('#pageSections')

        $('#nombre').hide().css({
            'margin-right': transMarginRight,
            'background-color': color1,
            'border': 'solid 2px white',
        })

        totalWidth = 40 * totalPanels;
        lilWidth = 20;
        lilBorder = 4;
        if (transicion == 'vertical') {
            $('#pageSections').css({
                'margin-top': -43 * totalPanels + 'px',
                'margin-right': '14px',

            })
        }

        $('#pageSections').addClass(transicion)

        for (b = 1; b <= totalPanels; b++) {

            panelIndex = b - 1;

            visited[panelIndex] = false;

            if (paneles[panelIndex].bloqueado == true) {
                bloquear.push(b);
            }

            if (paneles[panelIndex].instrucciones) {}

            seccText = b;
            if (transicion == 'horizontal' || transicion == 'fade') {
                $('#pageSections').width(totalPanels * 40)

                secCSS = {
                    'margin-right': (totalWidth - lilWidth - lilBorder) / (totalPanels - 1) - lilWidth - lilBorder + 'px'
                };
                lastSeccCSS = {
                    'margin-right': 0
                };

            }


            if (transicion == 'vertical') {

                secCSS = {
                    'margin-bottom': (totalWidth - lilWidth - lilBorder) / (totalPanels - 1) - lilWidth - lilBorder + 'px',
                    'float': 'none',
                    'margin-right': '0',

                };

                lastSeccCSS = {
                    'margin-bottom': 0
                };

            }


            $('<li>' + seccText + '</li>').attr('id', 'secc' + b).css(secCSS).appendTo('#pageSections ul');
            $('#secc' + totalPanels).css(lastSeccCSS);
            panelWidth = $("#activity").width();
            panelHeight = $("#activity").height();
            $('#panelReel').css('width', panelWidth * totalPanels + 'px');
        } // end for

        if (bloquear.length > 0) {
            availablePanels = $('#secc' + bloquear[0]).prevAll()
            $('#pageSections ul li').addClass('lock');

        } else {
            availablePanels = $('#pageSections ul li')
        }
        availablePanels.css(inactiveCSS)
        $('#pageSections ul li:first').css(activeCSS)
        navigate()
    } // termina if de numero de paneles
    
}) /// end document ready


function goTo(panelNum) {

        //unLock();
        availablePanels.css(inactiveCSS)
        $('#secc' + panelNum).css('background', color1)
        activeIndex = $('#secc' + panelNum).index();
        transition()

}

function navigate() {

    availablePanels.click(function () {
        availablePanels.css(inactiveCSS)
        $(this).css('background', color1)
		//alert($(this).attr('id'));
        activeIndex = $(this).index();
        transition()
    })
	
	
    $("#panelReel").swipe({
        swipe: function (event, direction) {
            availablePanels.css('background', color2)
            if (direction == nextPanel && activeIndex < availablePanels.length - 1) {
                activeIndex++

            }
            if (direction == prevPanel && activeIndex > 0) {
                activeIndex--
            }
            $('#secc' + (activeIndex + 1)).css(activeCSS)
            transition()
        }
    });
} // fin navigate

function transition() {
	
	

    if (!paneles[activeIndex].nombre) {

        $('#nombre').hide();

    } else {

        $('#nombre').show();
        $('#nombre').text(paneles[activeIndex].nombre)

    }

    if (paneles[activeIndex].instrucciones && activeIndex != availablePanels.length) {

        $('#instrucciones').html(paneles[activeIndex].instrucciones)

        if (visited[activeIndex] == false) {
            visited[activeIndex] = true

            footerHeigth = $('footer').css('height')

            footerImg = $('#footerTab img')

            if (footerImg.attr('src') == footerOff) {


                footerImg.attr('src', footerOn)

                $('footer').stop(true, true).animate({
                    bottom: '+=' + footerHeight
                }, 500, 'swing', function () {


                    $('footer').delay(10000).animate({
                        bottom: '-=' + footerHeight
                    }, 500, 'swing', function () {
                        footerImg.attr('src', footerOff)
                    });
                });

            } // if

        } // if

    } // if

    switch (transicion) {
        case 'horizontal':
            panelReelPosition = panelWidth * activeIndex;
            $('#panelReel > *').css('float', 'left')
            $("#panelReel").animate({
                left: -panelReelPosition
            }, 500, 'swing');
            break;
        case 'vertical':
            panelReelPosition = panelHeight * activeIndex;
            $("#panelReel").animate({
                top: -panelReelPosition
            }, 500, 'swing');
            break;
        case 'fade':
            $('#panelReel > *').hide();
            $('#panelReel > *').eq(activeIndex).fadeIn('normal');
    } // fin switch  
		
}

function unLock(thisbutton) {

    bloquear.splice(0, 1);

    if (bloquear[0] != undefined) {
        availablePanels = $('#secc' + bloquear[0]).prevAll();

    } else {
        availablePanels = $('#pageSections ul li')
    }
    availablePanels.css(inactiveCSS).removeClass('lock')
    $('#secc' + (activeIndex + 1)).css('background-color', color1)

    navigate()

    $(thisbutton).removeAttr('onclick');
}
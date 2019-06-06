$(function () {

    var activeIndex = 0, totalPanels = $('#panelReel > *').length, panelWidth  = $('#panelReel > *').width();
	
    $('#panelReel').css('width', $('#panelReel > *').width() * $('#panelReel > *').length + 'px')

   prev = $('#sugPaging li:first');
   next = $('#sugPaging li:last');

if(totalPanels != 1 ){

   prev.css('opacity', '0.4');



   prev.click(function(){

     if(activeIndex> 0){
      activeIndex--;

     panelReelPosition = panelWidth * activeIndex;
     next.css('opacity', '1')
            $("#panelReel").animate({
                left: -panelReelPosition 
            }, 500, 'swing');


   }

  if(activeIndex== 0){

prev.css('opacity', '0.4')
      //activeIndex = totalPanels;
   }
   
    //alert(activeIndex)
   })// end prev click


    next.click(function(){
if(activeIndex<totalPanels-1){

activeIndex++; 
prev.css('opacity', '1')
     panelReelPosition = panelWidth * activeIndex;
            $("#panelReel").animate({
                left: -panelReelPosition
            }, 500, 'swing');

}

if(activeIndex== totalPanels -1){next.css('opacity', '0.4')}

//alert(activeIndex)
    })

    }else{
   $('#sugPaging').hide();

    }

 })

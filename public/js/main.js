$(function() {
    
    /* Vars */
    var mWindow = $(window);
    var windowHeight = mWindow.height();
    var headerHeight =  $(".header").height();
    var mainWidth = $("#main").width();

    var eyes = [];
    
    /* Input range vars */
    var el;
    var isFirstVisible = false;
    var firstVisible;
    var nbClicks = 1;
    
    $("#vid-input").focus();
    
    $(".arrow").on("click", function(e){
        e.preventDefault();
        var li = $(this).next().children();
        var count = $(li).length;
        var coeff;
        
        
        $(li).each(function(index){
            if($(this).hasClass("item-visible")){
                if(!isFirstVisible){
                    firstVisible = index;
                    isFirstVisible = true;
                }
                
                if($(this).hasClass("translate-show")){
                    $(this).removeClass("translate-show");
                }
                $(this).addClass("translate-hide");
                $(this).removeClass("item-visible");
            }
            
            if(index < (firstVisible + 8 + 8) && index > (firstVisible + 7)){
                if(!$(this).hasClass("translate-show")){
                    coeff = ((firstVisible + 8) % 8) +nbClicks;
                    $(this).addClass("translate-show").css({
                        "transform": "translateY(-"+coeff*80+"px)",
                        "-webkit-transform": "translateY(-"+coeff*80+"px)",
                        "-moz-transform": "translateY(-"+coeff*80+"px)",
                        "-o-transform": "translateY(-"+coeff*80+"px)",
                    });
                }
                $(this).addClass("item-visible");
            }
        });
        
        nbClicks++;
        if(nbClicks > 2){
            nbClicks = 0;   
        }
        isFirstVisible = false;
        /*
        if(!$(this).next().hasClass("translate")){
            $(this).next().addClass("translate");
        }
        */
        
    });
    
    
    
})
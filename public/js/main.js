$(function() {
    
    /* Vars */
    var mWindow = $(window);
    var windowHeight = mWindow.height();
    var headerHeight =  $(".page-header").height();
    var mainWidth = $("#main").width();
    var mainContentHeight = windowHeight - headerHeight;
    var slider = $("#mainSlider");
    
    /* Input range vars */
    var el;
    
    
    
    $("#video-submit").on("click", function(e){
        e.preventDefault();
        var videoInput = $("#video-input").val();
        console.log(videoInput);
    
        var splitCriteria = "?v=";
        var videoUrl = videoInput.substring(videoInput.indexOf("?v=") + splitCriteria.length, videoInput.length);
        
        console.log(videoUrl);
        
        queryAPI(videoUrl);
    });
    
    
    function queryAPI(url){
        $.getJSON('api/youtube', {
            url: url
        }).done(function(data){
            checkStatus(data);
        });
    }
    

  
    function checkStatus(data){
        console.log("done"); 
        console.log(data);
    }
    
})
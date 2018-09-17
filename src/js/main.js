$(window).bind("load", function () {
    var footer = $("#footer");
    if (footer.length > 0){
        var pos = footer.position();
        var height = $(window).height();
        height = height - pos.top;
        height = height - footer.height();
        if (height > 0) {
            footer.css({
                'margin-top': height + 'px'
            });
        }
    }
});
$(document).ready(function () {
    var nextSchedule = $(".schedule-next");
    nextSchedule.click(function () {
        var thisCard = $(this).parent().parent();
        var nextCard = thisCard.next();
        if(nextCard.length > 0){
            thisCard.addClass("hide");
            nextCard.removeClass("hide");
        }
    });
    var previousSchedule = $(".schedule-previous");
    previousSchedule.click(function () {
        var thisCard = $(this).parent().parent();
        var previousCard = thisCard.prev();
        if(previousCard.length > 0){
            thisCard.addClass("hide");
            previousCard.removeClass("hide")
        }
    })
});

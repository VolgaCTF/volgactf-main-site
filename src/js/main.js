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
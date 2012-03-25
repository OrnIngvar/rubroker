(function () {
    now.name = prompt("What's your name?", "");

    now.receiveMessage = function (name, message) {
        $("#messages").append("<br>" + name + ": " + message);
    };

    $("#send-button").click(function () {
        console.log($("#msg-input").val());
        now.distributeMessage($("#msg-input").val());
        $("#msg-input").val("");
    });
})();



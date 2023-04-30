var PlatformUtils = function() {
    return {
        init: function() {},
        showError: function(source, message) {
            $('span').filter(".comment").empty();
            $(source).closest(".field-error").append($('<span class="comment font-small-2 text-danger">' + message + '</span>'));
            setTimeout(function() {
                $('span').filter(".comment").remove()
            }, 2000);
        },
        getTrimmedValue: function(element) {
            if (Array.isArray($("#" + element).val()) == true) {
                return $("#" + element).val();
            }
            if ($("#" + element).val() == undefined || $("#" + element).val() == null) {
                return $("#" + element).val();
            }
            return $("#" + element).val().trim();
        }
    }
}();
jQuery(document).ready(function() {
    PlatformUtils.init();
});
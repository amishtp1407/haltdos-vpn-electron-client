var Validations = function() {
    var readDataFromElement = function(element, allowEmpty) {
        var data = [];
        if (Array.isArray($(element).val()) == true) {
            var value = $(element).val();
            if (value != undefined && value != null) {
                data = $(element).val();
            }
        } else {
            var value = $(element).val();
            if (value != undefined && value != null) {
                value = value.trim();
                if (value !== "") {
                    data.push(value);
                }
            }
        }
        if (data.length == 0 && allowEmpty != true) {
            throw {
                source: element,
                message: "Cannot be empty"
            }
        }
        return data;
    }
    var validate = function(element, pattern, allowEmpty, message) {
        var data = readDataFromElement(element, allowEmpty);
        for (var i = 0; i < data.length; i++) {
            if (data[i].length == 0) {
                if (allowEmpty == false) {
                    throw {
                        source: element,
                        message: "Cannot be empty"
                    }
                } else {
                    continue;
                }
            }
            if (pattern.test(data[i]) == false) {
                throw {
                    source: element,
                    message: message
                }
            }
        }
    }
    return {
        notEmpty: function(element) {
            var data = readDataFromElement(element, false);
            for (var i = 0; i < data.length; i++) {
                if (data[i].length == 0) {
                    throw {
                        source: element,
                        message: "Cannot be empty"
                    }
                }
            }
        }
    }
}();
var VPN = function() {
    var config = null;
    var updateConnectionStatus = async function() {
        let respone = await window.ipcRender.invoke('status');
        console.log(respone.status);
        if (respone.status == true) {
            $("#status").removeClass("bg-danger");
            $("#status").addClass("bg-success");
            $("#status").text("Connected");
            $("#connect").addClass("disabled");
            $("#disconnect").removeClass("d-none");
            $('form :input').prop('disabled', true);
        } else {
            $("#status").removeClass("bg-success");
            $("#status").addClass("bg-danger");
            $("#status").text("Disconnected");
            $("#disconnect").addClass("d-none");
            $("#connect").removeClass("disabled");
            $('form :input').prop('disabled', false);
        }
    };
    var loadConfig = function(config) {
        if (_.isEmpty(config) == true) {
            return;
        }
        $("#username").val(config.username);
        $("#password").val(config.password);
        $("#server").val(config.server);
    };
    return {
        init: function() {
            updateConnectionStatus();
            setInterval(function() {
                updateConnectionStatus();
            }, 3000);
            loadConfig(config);
        },
        connect: function() {
            try {
                Validations.notEmpty($("#username"));
                Validations.notEmpty($("#password"));
                Validations.notEmpty($("#server"));
            } catch (e) {
                PlatformUtils.showError(e.source, e.message);
                return;
            }
            config = {
                "username": PlatformUtils.getTrimmedValue("username"),
                "password": PlatformUtils.getTrimmedValue("password"),
                "server": PlatformUtils.getTrimmedValue("server"),
                "toSave": $("#saveConfig").prop("checked")
            }
            console.log(config);
            window.ipcRender.send('connect', config);
            updateConnectionStatus();
        },
        disconnect: function() {
            window.ipcRender.send('disconnect');
            updateConnectionStatus();
        }
    }
}();
jQuery(document).ready(function() {
    VPN.init();
});
var VPN = function() {
    var config = null;
    var updateConnectionStatus = async function() {
        let respone = await window.ipcRender.invoke('status');
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

    var loadConfig = async function() {
        config = await window.ipcRender.invoke('fetch');
        if(config.response == true){
            $("#username").val(config.username);
            $("#password").val(config.password);
            $("#server").val(config.server);
            $('#saveConfig').prop('checked', config.toSave);
        }
    };

    return {
        init: function() {
            updateConnectionStatus();
            loadConfig();
            setInterval(function() {
                updateConnectionStatus();
            }, 3000);
        },
        connect: async function() {
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
            let response = await window.ipcRender.invoke('connect', config);
            if (response.status == true){
                updateConnectionStatus();
            }
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
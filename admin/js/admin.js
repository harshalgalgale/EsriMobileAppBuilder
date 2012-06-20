
$(document).ready(function () {
    ko.bindingHandlers.bindIframe = {
        init: function (element, valueAccessor) {
            function bindIframe() {
                try {
                    var iframeInit = element.contentWindow.initChildFrame,
                                iframedoc = element.contentDocument.body;
                } catch (e) {
                    // ignored
                    //alert(e);
                }
                if (iframeInit)
                    iframeInit(ko, valueAccessor());
                else if (iframedoc)
                    ko.applyBindings(valueAccessor(), iframedoc);
            };
            bindIframe();
            ko.utils.registerEventHandler(element, 'load', bindIframe);
        },

        update: function (element, valueAccessor, allBindingsAccessor) {
            
        }
    };

    var layoutModel;

    $('#layout').ready(function () {
        $('.mobile-templates button').click(function () {
            var type = $(this).val();
            switch (type) {
                case "simple":
                    break;
                case "tabs":
                    break;
                case "accordion":
                    break;
                case "grid":
                    break;
            }
        });

        layoutModel = new Layout.Model();
        //initialize the first page
        layoutModel.addPage();
        //apply the bindings to the model
        ko.applyBindings(layoutModel, $('#layout')[0]);
        ko.applyBindings(layoutModel, $('#mframe')[0]);

        //$('#ulPages').buttonset();
        //$('#btnNewPage').button();
    });

    $('#services').ready(function () {

        $('#btnGo').click(function () {
            var url = $('#inpUrl').val();
            App.baseUrl = url;

            //create model
            App.gismodel = new App.GISModel();
            ko.applyBindings(App.gismodel, $('#services')[0]);

            $.ajax({
                url: url + "?f=json&callback=?", //extra string added to url for cross domain requests
                dataType: 'json',
                data: null,
                async: true,
                success: function (data) {
                    if (data) {
                        var i, il = 0;
                        for (i = 0, il = data.services.length; i < il; i = i + 1) {
                            App.gismodel.addService(data.services[i].name, data.services[i].type, "configure");
                        }
                        if (il > 0) {
                            $('#services').show();
                        }
                    } else {
                        error("Did not find any services for this url");
                    }
                }
            });
            return false;
        });

        //UI management
        $('#services').hide();
        $('#configure').hide();

        //jquery-layout init
        $('body').layout({ west__size: 500 });
        $('.accordion').accordion({ fillSpace: true });
        $('.collapse').collapsiblePanel();
    });
});

function error(msg) {
    alert(msg);
}

function show(msg) {
    alert(msg);
}
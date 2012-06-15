var App = {};

App.Extent = function (xmin, ymin, xmax, ymax, wkt) {

};

App.Field = function (name, type, alias) {
    var self = this;
    self.name = name;
    self.type = type;
    self.alias = ko.observable(alias);
    self.included = ko.observable(true);
};

//model for a layer within mapservice, may have many fields
App.Layer = function (name, id, url) {

    var self = this;
    self.name = name;
    self.id = id;
    self.svcUrl = url;
    self.type = "";
    self.included = ko.observable(false);
    self.fields = ko.observableArray([]);
    self.included.subscribe(function (newValue) {
        //if the layer checkbox is checked instantiate the fields
        if (newValue) {
            self.fetchFields();
        }
    });
    self.fetchFields = function () {
        $.getJSON(self.svcUrl + "/" + self.id + "?f=json&callback=?", function (data) {
            if (data && data.fields) {
                var i, il = 0;
                for (i = 0, il = data.fields.length; i < il; i = i + 1) {
                    self.fields().push(new App.Field(data.fields[i].name, data.fields[i].type, data.fields[i].alias));
                }
                self.fields.valueHasMutated();
            }
        });
    };


};

//model for map service that may have many layers
App.Service = function (name, type) {
    var self = this;
    self.name = name;
    self.type = type;
    self.extent = null;
    self.url = ko.observable(App.baseUrl + "/" + name + "/MapServer");
    self.included = ko.observable(false);
    self.layers = ko.observableArray([]);
    //self.allLayerData = null;

    self.configure = function () {
        $.getJSON(self.url() + "?f=json&callback=?", function (data) {
            if (data) {
                var i, il = 0;

                var spRef = data.spatialReference.wkt;
                if (!spRef) spRef = data.spatialReference.wkid;

                var fE = data.fullExtent;
                self.extent = new App.Extent(fE.xmin, fE.ymin, fE.xmax, fE.ymax, null);

                var underlyingArray = self.layers();
                var svcUrl = self.url();

                var j, jl;
                for (j = 0, jl = Math.floor(data.layers.length / 10); j < jl; j++) {
                    for (var k = 10 * j; k < 10 * (j + 1); k++) {
                        var layerData = data.layers[k];
                        //Layer JSON Object members => id, name, parentLayerId, defaultVisibility, subLayerIds, minScale, maxScale
                        var layer = new App.Layer(layerData.name, layerData.id, svcUrl);
                        underlyingArray.push(layer);
                    }
                    self.layers.valueHasMutated();
                }

                for (var k = 10 * jl; k < data.layers.length; k++) {
                    var layerData = data.layers[k];
                    //Layer JSON Object members => id, name, parentLayerId, defaultVisibility, subLayerIds, minScale, maxScale
                    var layer = new App.Layer(layerData.name, layerData.id, svcUrl);
                    underlyingArray.push(layer);
                }
                self.layers.valueHasMutated();

                //                for (var i = 0, il = data.layers.length; i < il; i = i + 1) {
                //                    var layerData = data.layers[i];
                //                    //Layer JSON Object members => id, name, parentLayerId, defaultVisibility, subLayerIds, minScale, maxScale
                //                    var layer = new App.Layer(layerData.name, layerData.id, svcUrl);
                //                    underlyingArray.push(layer);
                //                }

                //                self.layers.valueHasMutated();
            }
        });
    };
};

App.Model = function () {
    var self = this;
    self.Services = ko.observableArray([]);
    self.addService = function (name, type) {
        self.Services.push(new App.Service(name, type));
    };

    self.canConfigure = ko.computed(function () {
        var flag = false;
        for (var i = 0, il = self.Services().length; i < il; i++) {
            if (self.Services()[i].included()) {
                flag = true;
            }
        }
        return flag;
    });

    self.services_being_configured = ko.observableArray([]);
};

$(document).ready(function () {

    $('#btnGo').click(function () {
        var url = $('#inpUrl').val();
        App.baseUrl = url;
        var datasent = {};

        $.ajax({
            url: url + "?f=json&callback=?", //extra string added to url for cross domain requests
            dataType: 'json',
            data: null,
            async: true,
            success: function (data) {
                if (data) {
                    var i, il = 0;
                    for (i = 0, il = data.services.length; i < il; i = i + 1) {
                        model.addService(data.services[i].name, data.services[i].type);
                    }
                    if (il > 0) {
                        $('#services').show('slow');
                    }
                } else {
                    error("Did not find any services for this url");
                }
            }
        });

        return false;
    });

    $('#btnConfigure').click(function () {
        var i, il = 0;
        for (i = 0, il = model.Services().length; i < il; i = i + 1) {
            var item = model.Services()[i];
            if (item.included()) {
                model.services_being_configured.push(item);
                item.configure();
            }
        }

        $('#configure').show();
        //ko.applyBindings(model, $('#configure')[0]);
        $('#tabs').tabs();
    });

    //UI management
    $('#services').hide();
    $('#configure').hide();

    //create model and apply bindings
    var model = new App.Model();
    //ko.applyBindings(model, $('#services')[0]);
    ko.applyBindings(model);

    //jquery-layout init
    $('body').layout({ west__size: 500 });
    $('.accordion').accordion({ fillSpace: true });
    $('.collapse').collapsiblePanel();
});


function error(msg) {
    alert(msg);
}
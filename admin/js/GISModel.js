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
App.Service = function (name, type, config_id) {
    var self = this;
    self.name = name;
    self.type = type;
    self.extent = null;
    self.url = ko.observable(App.baseUrl + "/" + name + "/MapServer");
    self.included = ko.observable(false);
    self.layers = ko.observableArray([]);
    self.config_id = config_id;

    self.configure = function () {

        $('#' + self.config_id).dialog({ width: 800, height: 600, modal: true });
        $('#' + self.config_id).show();

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
                ko.applyBindings(self, $('#' + self.config_id)[0]);
            }
        });
    };

    self.layersRendered = function () {
        //show("layers rendered");
        $('#' + self.config_id + ' .layers').quickPagination();
    }
};

App.GISModel = function () {
    var self = this;
    self.Services = ko.observableArray([]);
    self.addService = function (name, type, config_id) {
        self.Services.push(new App.Service(name, type, config_id));
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

    self.servicesRendered = function () {

    }

};
var Layout = {};

Layout.Element = function (title, type, context) {
    var self = this;
    self.title = ko.observable(title);
    self.type = ko.observable(type);
    self.selected = ko.observable(false);
    self.parent = context;
    self.remove = function () {
        self=null;
    }
};

Layout.Header = function (title) {
    var self = this;
    self.title = ko.observable(title);
    self.type = "header";
    self.visible = ko.observable(true);
};

Layout.Footer = function (title) {
    var self = this;
    self.title = ko.observable(title);
    self.type = "footer";
    self.visible = ko.observable(true);
};

Layout.Page = function (num, title) {
    var self = this;
    self.pagenum = ko.observable(num);
    var id = "page" + String(num);
    var rdid = "rd" + String(num);
    self.id = ko.observable(id);
    self.rdid = ko.observable(rdid);
    self.title = ko.observable(title);
    var menu_title = title.substring(0, 5);
    self.menutitle = ko.observable(menu_title);
    self.menutitle.subscribe(function (newvalue) { postRefresh('refresh-navbar'); });
    self.type = "page";
    self.header = new Layout.Header("");
    self.showheader = ko.observable(true);
    self.footer = new Layout.Footer("");
    self.showfooter = ko.observable(true);
    self.elements = ko.observableArray([]);
    var url = '#' + id;
    self.url = ko.observable(url);
};

Layout.Model = function () {
    this.pages = ko.observableArray();
    this.currentPage = ko.observable(null);
    this.addPage = function () {
        var num = this.pages().length + 1;
        if (num > 5) {
            alert("You can only add upto 5 pages");
            return;
        }
        var title = "Title " + num;
        var newPage = new Layout.Page(num, title);
        this.pages.push(newPage);
        this.currentPage(newPage);
        Layout.postRefresh('refresh-page');
    };
    this.addElement = function (data, event, type) {
        for (var i = 0; i < this.currentPage().elements().length; ++i) {
            var el = this.currentPage().elements()[i];
            if (el) el.selected(false);
        }
        var elem = new Layout.Element('title', type);
        elem.selected(true);
        this.currentPage().elements.push(elem);
        Layout.postRefresh('refresh-page-contents');
    };
};

Layout.postRefresh = function (command) {
    var iframe_window = $('#mframe').get(0).contentWindow;
    var target_url = "http://localhost/esrimobileappbuilder/admin/mobile.html";
    $.postMessage(command, target_url, iframe_window);
    $('#ulPages').buttonset().button('refresh');
};

define(function() {
    var gui = node.gui;

    var clipboardMenu = new gui.Menu();
    clipboardMenu.append(new gui.MenuItem({
        label: "Cut",
        click: function() {
            document.execCommand("cut");
            console.log('Menu:', 'cutted to clipboard');
        }
    }));
    clipboardMenu.append(new gui.MenuItem({
        label: "Copy",
        click: function() {
            document.execCommand("copy");
            console.log('Menu:', 'copied to clipboard');
        }
    }));
    clipboardMenu.append(new gui.MenuItem({
        label: "Paste",
        click: function() {
            document.execCommand("paste");
            console.log('Menu:', 'pasted to textarea');
        }
    }));

    var init = function() {
        $(document).on("contextmenu", function(e) {
            e.preventDefault();
            clipboardMenu.popup(e.originalEvent.x, e.originalEvent.y);
        });
    }

    return {
        init: init
    };
});
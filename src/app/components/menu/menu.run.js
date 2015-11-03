'use strict';
export function menuRunBlock(gui, nwwindow, cwd, $rootScope, menuService) {
  'ngInject';


  var menu = new gui.Menu({
    type: 'menubar'
  });

  var menuItems = new gui.Menu();

  menuItems.append(new gui.MenuItem({
    label: 'Open',
    click: function() {
      menuService.open();
    }
  }));
  menuItems.append(new gui.MenuItem({
    label: 'Close',
    click: function() {
      nwwindow.close();
    }
  }));

  menu.createMacBuiltin('tree-view', {
    hideEdit: true,
    hideWindow: true
  });

  menu.append(
    new gui.MenuItem({
      label: 'File',
      submenu: menuItems
    })
  );

  nwwindow.menu = menu;


}

/* global malarkey:false, moment:false */

import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
import { MainController } from './main/main.controller';
import { TreeViewDirective } from '../app/components/tree-view/tree-view.directive';
import { TreeViewItemDirective} from '../app/components/tree-view/item/tree-view-item.directive';
import { PathService} from '../app/components/path/path.service';
import { menuRunBlock } from '../app/components/menu/menu.run';
import { MenuService } from '../app/components/menu/menu.service';

angular.module('tree-view', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngMessages', 'ngAria', 'ngResource', 'ui.router', 'ngMaterial', 'toastr'])
  .constant('malarkey', malarkey)
  .constant('moment', moment)
  .config(config)
  .config(routerConfig)
  .run(runBlock)
  .service('pathService', PathService)
  .service('menuService', MenuService)
  .factory('gui', function($window){
    return $window.require('nw.gui');
  })
  .factory('nwwindow', function(gui){
    return gui.Window.get();
  })
  .run(menuRunBlock)
  .factory('fs', function($window){
    return $window.require('fs');
  })
  .factory('path', function($window){
    return $window.require('path');
  })
  .factory('chokidar', function($window){
    return $window.require('chokidar');
  })
  .controller('MainController', MainController)
  .directive('treeView', TreeViewDirective)
  .directive('treeViewItem', TreeViewItemDirective)
  .value('cwd', { value: null})

;

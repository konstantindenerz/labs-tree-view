export function TreeViewItemDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    templateUrl: 'app/components/tree-view/item/tree-view-item.html',
    scope: {

    },
    controller: TreeViewItemController,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;
}

class TreeViewItemController {
  constructor($scope, pathService) {
    'ngInject';
    $scope.$parent.$watch('node', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.node = $scope.$parent.node;
      }
    });
    $scope.node = $scope.$parent.node;
    $scope.handleClick = function(node) {

      if (node.details.isDirectory && node.details.isClosed) {
        if (!node.nodes || node.nodes.length == 0) {
          pathService.watch(node);
        }
        node.details.isClosed = false;
      } else if (node.details.isDirectory) {
        node.details.isClosed = true;
      }

    }

  }
}

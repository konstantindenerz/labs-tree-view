export function TreeViewDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    templateUrl: 'app/components/tree-view/tree-view.html',
    scope: {

    },
    controller: TreeViewController,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;
}

class TreeViewController {
  constructor($scope, pathService, cwd, $rootScope) {
    'ngInject';

    $scope.vm.cwd = cwd;
    $scope.$watch('vm.cwd.value', function() {
      if (null !== $scope.vm.cwd.value) {
        pathService.unwatchAll();
        $scope.node = pathService.watchRoot($scope.vm.cwd.value);
      }
    });

  }
}

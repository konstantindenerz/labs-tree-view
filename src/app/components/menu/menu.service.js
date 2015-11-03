export class MenuService {
  constructor(cwd, $rootScope) {
    'ngInject';

    this.$cwd = cwd;
    this.$rootScope = $rootScope;
  }

  open() {
    var self = this;
    // open directory dialog
    var chooser = document.querySelector("#currentDirectoryControl");
    chooser.addEventListener("change", function() {
      self.$cwd.value = this.value;
      self.$rootScope.$apply();
    }, false);

    chooser.click();

  }

}

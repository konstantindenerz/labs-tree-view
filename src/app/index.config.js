export function config ($logProvider, toastrConfig, $mdThemingProvider) {
  'ngInject';
  // Enable log
  $logProvider.debugEnabled(true);

  // Set options third-party lib
  toastrConfig.allowHtml = true;
  toastrConfig.timeOut = 3000;
  toastrConfig.positionClass = 'toast-top-right';
  toastrConfig.preventDuplicates = true;
  toastrConfig.progressBar = true;


  $mdThemingProvider.theme('default')
    .primaryPalette('light-blue', {
      'default': '100'
    });
}

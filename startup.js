define(['knockout', 'knockout-projections'], function(ko) {

  // Page Components

  ko.components.register('nav-bar', { require: 'standard-components/nav-bar/nav-bar' });
  
  ko.components.register('about-page', { require: 'standard-components/about-page/about' });

  ko.components.register('settings-page', { require: 'standard-components/settings-page/settings-page' });

  // Components

  ko.components.register('settings-manager', { require: 'standard-components/settings-manager/settings-manager' });

  ko.components.register('cadviewer', { require: 'standard-components/cadviewer/cadviewer' });

  ko.components.register('scatter-plot', { require: 'standard-components/scatter-plot/scatter-plot' });

  ko.components.register('datatable', { require: 'standard-components/datatable/datatable' });

  ko.components.register('bar-chart', { require: 'standard-components/bar-chart/bar-chart' });

  ko.components.register('engrid-simple', { require: 'standard-components/engrid-simple/engrid-simple' });

  ko.components.register('stacked-bar-chart', { require: 'standard-components/stacked-bar-chart/stacked-bar-chart' });

  ko.components.register('grouped-bar-chart', { require: 'standard-components/grouped-bar-chart/grouped-bar-chart' });

  ko.components.register('risk-plot', { require: 'standard-components/risk-plot/risk-plot' });

  ko.components.register('us-map', { require: 'standard-components/us-map/us-map' });

  ko.components.register('radar-plot', { require: 'standard-components/radar-plot/radar-plot' });

  ko.components.register('ko-datatable', { require: 'standard-components/ko-datatable/ko-datatable' });

  ko.components.register('controls', { require: 'standard-components/controls/controls' });

  ko.components.register('grouptable', { require: 'standard-components/grouptable/grouptable' });

  ko.components.register('ranking-table', { require: 'standard-components/ranking-table/ranking-table' });

  ko.components.register('boot-strap-table', { require: 'standard-components/boot-strap-table/boot-strap-table' });

  ko.components.register('boot-strap-controls', { require: 'standard-components/boot-strap-controls/boot-strap-controls' });

  ko.components.register('pie-chart', { require: 'standard-components/pie-chart/pie-chart' });

  ko.components.register('color-selection', { require: 'standard-components/color-selection/color-selection' });

  ko.components.register('sequential-color-selector', { require: 'standard-components/sequential-color-selector/sequential-color-selector' });

  ko.components.register('diverging-color-selector', { require: 'standard-components/diverging-color-selector/diverging-color-selector' });

  ko.components.register('qualitative-color-selector', { require: 'standard-components/qualitative-color-selector/qualitative-color-selector' });

  ko.components.register('doc-viewer', { require: 'standard-components/doc-viewer/doc-viewer' });

  return 'successfully loaded standard components'

});

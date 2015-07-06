define(['knockout', 'knockout-projections'], function(ko) {

  // Page Components

  ko.components.register('nav-bar', { require: 'standard_components/nav-bar/nav-bar' });
  
  ko.components.register('about-page', { require: 'standard_components/about-page/about' });

  ko.components.register('settings-page', { require: 'standard_components/settings-page/settings-page' });

  // Components

  ko.components.register('settings-manager', { require: 'standard_components/settings-manager/settings-manager' });

  ko.components.register('cadviewer', { require: 'standard_components/cadviewer/cadviewer' });

  ko.components.register('scatter-plot', { require: 'standard_components/scatter-plot/scatter-plot' });

  ko.components.register('datatable', { require: 'standard_components/datatable/datatable' });

  ko.components.register('bar-chart', { require: 'standard_components/bar-chart/bar-chart' });

  ko.components.register('engrid-simple', { require: 'standard_components/engrid-simple/engrid-simple' });

  ko.components.register('stacked-bar-chart', { require: 'standard_components/stacked-bar-chart/stacked-bar-chart' });

  ko.components.register('grouped-bar-chart', { require: 'standard_components/grouped-bar-chart/grouped-bar-chart' });

  ko.components.register('risk-plot', { require: 'standard_components/risk-plot/risk-plot' });

  ko.components.register('us-map', { require: 'standard_components/us-map/us-map' });

  ko.components.register('radar-plot', { require: 'standard_components/radar-plot/radar-plot' });

  ko.components.register('ko-datatable', { require: 'standard_components/ko-datatable/ko-datatable' });

  ko.components.register('controls', { require: 'standard_components/controls/controls' });

  ko.components.register('grouptable', { require: 'standard_components/grouptable/grouptable' });

  ko.components.register('ranking-table', { require: 'standard_components/ranking-table/ranking-table' });

  ko.components.register('boot-strap-table', { require: 'standard_components/boot-strap-table/boot-strap-table' });

  ko.components.register('boot-strap-controls', { require: 'standard_components/boot-strap-controls/boot-strap-controls' });

  ko.components.register('pie-chart', { require: 'standard_components/pie-chart/pie-chart' });

  ko.components.register('color-selection', { require: 'standard_components/color-selection/color-selection' });

  ko.components.register('sequential-color-selector', { require: 'standard_components/sequential-color-selector/sequential-color-selector' });

  ko.components.register('diverging-color-selector', { require: 'standard_components/diverging-color-selector/diverging-color-selector' });

  ko.components.register('qualitative-color-selector', { require: 'standard_components/qualitative-color-selector/qualitative-color-selector' });

  ko.components.register('doc-viewer', { require: 'standard_components/doc-viewer/doc-viewer' });

  return 'successfully loaded standard components'

});

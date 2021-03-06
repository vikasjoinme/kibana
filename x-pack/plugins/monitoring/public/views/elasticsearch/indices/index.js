/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { find } from 'lodash';
import uiRoutes from 'ui/routes';
import { routeInitProvider } from 'plugins/monitoring/lib/route_init';
import { MonitoringViewBaseTableController } from '../../';
import { ElasticsearchIndices } from '../../../components';
import template from './index.html';

uiRoutes.when('/elasticsearch/indices', {
  template,
  resolve: {
    clusters(Private) {
      const routeInit = Private(routeInitProvider);
      return routeInit();
    }
  },
  controllerAs: 'elasticsearchIndices',
  controller: class ElasticsearchIndicesController extends MonitoringViewBaseTableController {
    constructor($injector, $scope) {
      const $route = $injector.get('$route');
      const globalState = $injector.get('globalState');
      const features = $injector.get('features');

      const { cluster_uuid: clusterUuid } = globalState;
      $scope.cluster = find($route.current.locals.clusters, { cluster_uuid: clusterUuid });

      let showSystemIndices = features.isEnabled('showSystemIndices', false);

      super({
        title: 'Elasticsearch - Indices',
        storageKey: 'elasticsearch.indices',
        apiUrlFn: () => `../api/monitoring/v1/clusters/${clusterUuid}/elasticsearch/indices?show_system_indices=${showSystemIndices}`,
        reactNodeId: 'elasticsearchIndicesReact',
        defaultData: {},
        $scope,
        $injector,
        $scope,
        $injector
      });

      // for binding
      const toggleShowSystemIndices = isChecked => {
        // flip the boolean
        showSystemIndices = isChecked;
        // preserve setting in localStorage
        features.update('showSystemIndices', isChecked);
        // update the page (resets pagination and sorting)
        this.updateData();
      };

      $scope.$watch(() => this.data, data => {
        this.renderReact(data);
      });

      this.renderReact = ({ clusterStatus, indices }) => {
        super.renderReact(
          <ElasticsearchIndices
            clusterStatus={clusterStatus}
            indices={indices}
            showSystemIndices={showSystemIndices}
            toggleShowSystemIndices={toggleShowSystemIndices}
          />
        );
      };
    }
  }
});

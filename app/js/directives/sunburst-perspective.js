define(['angular', 'services'], function(angular, services) {
  'use strict';

  /* Sunburst perspective display directive
   * Displays a small view of the entire sunburst and highlights slices displayed in the main sunburst
   * 
   * This code was modified from the example found at http://bl.ocks.org/kerryrodden/7090426
   * which is covered by the Apache v2.0 License. A copy of this license is as follows:
   *    --- BEGIN ---
   *    Copyright 2013 Google Inc. All Rights Reserved.
   *
   *    Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
   *
   *    http://www.apache.org/licenses/LICENSE-2.0
   *
   *    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
   *  --- END ---
   * Developers: Do not remove this notification or license.
   */
  angular.module('recursiviz.directives')
    .directive('sunburstperspective', ['$rootScope', 'd3Service', 'wordFormat', 'clear', 'nodeService', 'mouseevents', function($rootScope, d3Service, wordFormat, clear, nodeService, mouseevents) {
        return {
          restrict: 'A',
          scope: {
            data: "="
          },
          link: function(scope) {
            d3Service.getD3(function(d3) {

              // Watch for changes in data
              scope.$watch('data', function(newVals) {
                if (newVals)
                  return render(newVals);
                else
                  return;
              }, false);

              // Listener to trigger render
              scope.$on('renderSunburst', function(ev) {
                render(scope.data);
              });

              scope.$on('updatePerspective', function(ev, ancestors, children) {
                drawPerspective(ancestors, children);
              });

              function drawPerspective(ancestors, children) {
                var nodes = _.union(ancestors, children);
                d3.selectAll('#perspective-path').each(function(d, i) {
                  if (nodes.indexOf(d) !== -1) {
                    d3.select(this)
                      .style("opacity", 1);
                  }
                  else {
                    d3.select(this)
                      .style("opacity", 0.15);
                  }
                });
              }

              // Renders the sunburst with current dataset
              function render(root) {
                // Dimensions of sunburst.
                var margin = 200;
                var width = d3.select("#perspective-sunburst-wrapper")[0][0].clientWidth / 2.5;
                var height = (angular.element(window)[0].innerHeight - margin) / 2.5;
                var radius = Math.min(width, height) / 2;
                var x = d3.scale.linear()
                  .range([0, 2 * Math.PI]);
                var y = d3.scale.sqrt()
                  .range([0, radius]);

                var vis = d3.select("#perspective-sunburst").append("svg:svg")
                  .attr("class", "perspective-sunburst-svg")
                  .attr("width", width)
                  .attr("height", height)
                  .append("svg:g")
                  .attr("id", "container")
                  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                var partition = d3.layout.partition()
                  .value(function(d) {
                    return d.depth;
                  });

                var arc = d3.svg.arc()
                  .startAngle(function(d) {
                    return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
                  })
                  .endAngle(function(d) {
                    return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
                  })
                  .innerRadius(function(d) {
                    return Math.max(0, y(d.y));
                  })
                  .outerRadius(function(d) {
                    return Math.max(0, y(d.y + d.dy));
                  });

                vis.data([root]).selectAll("path")
                  .data(partition.nodes(root))
                  .enter().append("svg:path")
                  .attr("d", arc)
                  .attr("id", "perspective-path")
                  .attr("fill-rule", "evenodd")
                  .style("fill", function(d) {
                    return d.color;
                  })
                  .style("opacity", 0.8);
              }
            });
          }
        };
      }]);
});



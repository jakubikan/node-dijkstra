"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }g.dijkstra = f();
  }
})(function () {
  var define, module, exports;return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw (f.code = "MODULE_NOT_FOUND", f);
        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) s(r[o]);return s;
  })({ 1: [function (require, module, exports) {
      'use strict';

      var Queue = require('./PriorityQueue');
      var populateMap = require('./populateMap');

      var Graph = (function () {

        /**
         * Constrict the graph
         *
         * @param {object} [graph] - Nodes to initiate the graph with
         */

        function Graph(graph) {
          _classCallCheck(this, Graph);

          this.graph = new Map();

          if (graph) populateMap(this.graph, graph, Object.keys(graph));
        }

        /**
         * Add a node to the graph
         *
         * @param {string} name      - Name of the node
         * @param {object} neighbors - Neighbouring nodes and cost to reach them
         */

        _createClass(Graph, [{
          key: "addNode",
          value: function addNode(name, neighbors) {
            var _neighbors = new Map();

            populateMap(_neighbors, neighbors, Object.keys(neighbors));
            this.graph.set(name, _neighbors);

            return this;
          }

          /**
           * Alias of addNode
           */
        }, {
          key: "addVertex",
          value: function addVertex() {
            console.log('Graph#addVertex is deprecated, use Graph#addNode instead');

            return this.addNode.apply(this, arguments);
          }

          /**
           * Compute the shortest path between the specified nodes
           *
           * @param {string}  start     - Starting node
           * @param {string}  goal      - Node we want to reach
           * @param {object}  [options] - Options
           *
           * @param {boolean} [options.trim]    - Exclude the origin and destination nodes from the result
           * @param {boolean} [options.reverse] - Return the path in reversed order
           * @param {boolean} [options.cost]    - Also return the cost of the path when set to true
           *
           * @return {array|object} Computed path between the nodes.
           *  When `option.cost` is set to true, the returned value will be an object
           *  with keys:
           *
           *    - `Array path`: Computed path between the nodes
           *    - `Number cost`: Cost of the path
           */
        }, {
          key: "path",
          value: function path(start, goal, options) {
            var _this = this;

            options = options || {};

            // Don't run when we don't have nodes set
            if (!this.graph.size) {
              if (options.cost) return { path: null, cost: 0 };

              return null;
            }

            var explored = new Set();
            var frontier = new Queue();
            var previous = new Map();

            var path = [];
            var totalCost = 0;

            // Add the starting point to the frontier, it will be the first node visited
            frontier.set(start, 0);

            // Run until we have visited every node in the frontier

            var _loop = function () {
              // Get the node in the frontier with the lowest cost (`priority`)
              var node = frontier.next();

              // When the node with the lowest cost in the frontier in our goal node,
              // we can compute the path and exit the loop
              if (node.key === goal) {
                // Set the total cost to the current value
                totalCost = node.priority;

                var _nodeKey = node.key;
                while (previous.has(_nodeKey)) {
                  path.push(_nodeKey);
                  _nodeKey = previous.get(_nodeKey);
                }

                return "break";
              }

              // Add the current node to the explored set
              explored.add(node.key);

              // Loop all the neighboring nodes
              var neighbors = _this.graph.get(node.key) || new Map();
              neighbors.forEach(function (_cost, _node) {
                // If we already explored the node, skip it
                if (explored.has(_node)) return false;

                // If the neighboring node is not yet in the frontier, we add it with
                // the correct cost
                if (!frontier.has(_node)) {
                  previous.set(_node, node.key);
                  return frontier.set(_node, node.priority + _cost);
                }

                var frontierPriority = frontier.get(_node).priority;
                var nodeCost = node.priority + _cost;

                // Othewhise we only update the cost of this node in the frontier when
                // it's below what's currently set
                if (nodeCost < frontierPriority) {
                  previous.set(_node, node.key);
                  frontier.set(_node, nodeCost);
                }
              });
            };

            while (!frontier.isEmpty()) {
              var _ret = _loop();

              if (_ret === "break") break;
            }

            // Return null when no path can be found
            if (!path.length) {
              if (options.cost) return { path: null, cost: 0 };

              return null;
            }

            // From now on, keep in mind that `path` is populated in reverse order,
            // from destination to origin

            // Remove the first value (the goal node) if we want a trimmed result
            if (options.trim) {
              path.shift();
            } else {
              // Add the origin waypoint at the end of the array
              path = path.concat([start]);
            }

            // Reverse the path if we don't want it reversed, so the result will be
            // from `start` to `goal`
            if (!options.reverse) {
              path = path.reverse();
            }

            // Return an object if we also want the cost
            if (options.cost) {
              return {
                path: path,
                cost: totalCost
              };
            }

            return path;
          }

          /**
           * Alias of `path`
           */
        }, {
          key: "shortestPath",
          value: function shortestPath() {
            console.log('Graph#shortestPath is deprecated, use Graph#path instead');

            return this.path.apply(this, arguments);
          }
        }]);

        return Graph;
      })();

      module.exports = Graph;
    }, { "./PriorityQueue": 2, "./populateMap": 3 }], 2: [function (require, module, exports) {
      'use strict';

      /**
       * This very basic implementation of a priority queue is used to select the
       * next node of the graph to walk to.
       *
       * The queue is always sorted to have the least expensive node on top. Some
       * comodoty methods are also implemented.
       *
       * You should **never** modify the queue directly, but only using the methods
       * provided by the class.
       */

      var PriorityQueue = (function () {

        /**
         * Creates a new empty priority queue
         */

        function PriorityQueue() {
          _classCallCheck(this, PriorityQueue);

          // The `_keys` set is used to greately improve the speed at which we can
          // check the presence of a value in the queue
          this._keys = new Set();

          this._queue = [];
        }

        /**
         * Sort the queue to have the least expensive node to visit on top
         *
         * @private
         */

        _createClass(PriorityQueue, [{
          key: "_sort",
          value: function _sort() {
            this._queue.sort(function (a, b) {
              return a.priority - b.priority;
            });
          }

          /**
           * Sets a priority for a key in the queue.
           * Inserts it in the queue if it does not already exists.
           *
           * @param {any}     key       Key to update or insert
           * @param {number}  priority  Priority of the key
           * @return {number} Size of the queue
           */
        }, {
          key: "set",
          value: function set(key, priority) {
            priority = Number(priority);
            if (isNaN(priority)) throw new TypeError('"priority" must be a number');

            if (!this._keys.has(key)) {
              // Insert a new entry if the key is not already in the queue
              this._keys.add(key);
              this._queue.push({ key: key, priority: priority });
            } else {
              // Update the priority of an existing key
              this._queue.map(function (element) {
                if (element.key === key) element.priority = priority;

                return element;
              });
            }

            this._sort();

            return this._queue.length;
          }

          /**
           * The next method is used to dequeue a key:
           * It removes the first element from the queue and returns it
           *
           * @return {object} First priority queue entry
           */
        }, {
          key: "next",
          value: function next() {
            var element = this._queue.shift();

            // Remove the key from the `_keys` set
            this._keys["delete"](element.key);

            return element;
          }

          /**
           * @return {boolean} `true` when the queue is empty
           */
        }, {
          key: "isEmpty",
          value: function isEmpty() {
            return Boolean(this._queue.length === 0);
          }

          /**
           * Check if the queue has a key in it
           *
           * @param {any} key   Key to lookup
           * @return {boolean}
           */
        }, {
          key: "has",
          value: function has(key) {
            return this._keys.has(key);
          }

          /**
           * Get the element in the queue with the specified key
           *
           * @param {any} key   Key to lookup
           * @return {object}
           */
        }, {
          key: "get",
          value: function get(key) {
            return this._queue.find(function (element) {
              return element.key === key;
            });
          }
        }]);

        return PriorityQueue;
      })();

      module.exports = PriorityQueue;
    }, {}], 3: [function (require, module, exports) {
      'use strict';

      /**
       * Assert that the provided cost in a positive number
       *
       * @private
       * @param {number} cost   Cost to validate
       * @return {number} cost
       */
      function validateNode(cost) {
        cost = Number(cost);

        if (isNaN(cost)) {
          throw new TypeError("Cost must be a number, istead got " + cost);
        }

        if (cost < 0) {
          throw new TypeError("The cost must be a number above 0, instead got " + cost);
        }

        return cost;
      }

      /**
       * Populates the `Map` passed as first agument with the values in the provided
       * object. Supports nested objects, recursively adding them to a `Map`
       *
       * @param {Map}    map      `Map` to populate with the values from the object
       * @param {object} object   Object to translate into the `Map`
       * @param {array}  keys     Keys of the object to assign to the `Map`
       *
       * @return {Map} Populated `Map` with nested `Map`s
       */
      function populateMap(_x, _x2, _x3) {
        var _again = true;

        _function: while (_again) {
          var map = _x,
              object = _x2,
              keys = _x3;
          _again = false;

          // Return the map once all the keys have been populated
          if (!keys.length) return map;

          var key = keys.shift();
          var value = object[key];

          if (value !== null && typeof value === 'object') {
            // When the key is an object, we recursevely populate its proprieties into
            // a new `Map`
            value = populateMap(new Map(), value, Object.keys(value));
          } else {
            // Ensure the node is a positive number
            value = validateNode(value);
          }

          // Set the value into the map
          map.set(key, value);

          // Recursive call
          _x = map;
          _x2 = object;
          _x3 = keys;
          _again = true;
          key = value = undefined;
          continue _function;
        }
      }

      module.exports = populateMap;
    }, {}] }, {}, [1])(1);
});
import _ from 'lodash';

const DEFAULT_NAME = "\x00",
      KEY_DELIM = "\x01";

/**
 * Graph class
 */
export default class Graph {
    /**
     * @constructs Graph
     */
    constructor () {
        this._node = {};
        this._edge = {};
        this._connectivity = {};

        this._count = {
            node: 0,
            edge: 0
        };
    }

    /**
     * @function count
     *
     * @desc Return count object, including number of nodes and number of edges.
     *
     * @returns {Count}
     */
    count () {
        return this._count;
    }

    /**
     * @function setNode
     *
     * @desc Set the node in the graph. If the node has already been set, the
     *       value will be overrided.
     *
     * @param {string[]|string} keys The key or keys of the node(s)
     * @param {Object} value Value of the node, could be anything.
     *
     * @returns {Graph}
     */
    setNode (keys, value = null) {
        if (!_.isArray(keys)) {
            keys = [keys];
        }

        _.forEach(keys, key => {
            if (_.has(this._node, key)) {
                this._node[key] = value || this._node[key];
                return this;
            }

            this._node[key] = value || this._node[key];

            this._connectivity[key] = {};

            this._count.node++;
        });

        return this;
    }

    removeNode (keys) {
        // TODO
    }

    hasNode (v) {
        return _.has(this._node, v);
    }

    nodes () {
        return _.keys(this._node);
    }

    values () {
        return _.values(this._node);
    }

    value (key) {
        return this._node[key];
    }

    edgeId (v, w) {
        if (v > w) {
            return w + KEY_DELIM + v;
        }
        return v + KEY_DELIM + w;
    }

    edgeObj (v, w, value) {
        if (v > w) {
            var tmp = v;
            v = w;
            w = tmp;
        }
        return {
            v, w, value
        };
    }

    setEdge (v, w, value) {
        this.setNode(v);
        this.setNode(w);

        let e = this.edgeId.apply(this, arguments);

        if (_.has(this._edge, e)) {
            return this;
        }

        let o = this.edgeObj.apply(this, arguments);
        Object.freeze(o);

        this._connectivity[w][v] = o;
        this._connectivity[v][w] = o;
        this._edge[e] = o;

        this._count.edge++;

        return this;
    }

    removeEdge (v, w) {
        // TODO
    }

    connectivity (key) {
        return this._connectivity[key]
    }

    connectedNode (key) {
        return _.keys(this._connectivity[key]);
    }

    data () {
        return {
            _node: this._node,
            _edge: this._edge,
            _connectivity: this._connectivity,
            _count: this._count
        };
    }

    restore (obj) {
        this._node = obj._node;
        this._edge = obj._edge;
        this._connectivity = obj._connectivity;
        this._count = obj._count;
    }
}

import _ from 'lodash';

const KEY_DELIM = '\x01';

/**
 * Class Graph
 * Graph class
 */
const Graph = class {
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
     * @memberof Graph
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
     * @memberof Graph
     * @function edgeId
     *
     * @desc Return key of the edge by given keys of nodes
     *
     * @param {string} v The key of the node
     * @param {string} w The key of another node
     *
     * @returns {string} Key of the edge
     */
    edgeId (v, w) {
        if (v > w) {
            return w + KEY_DELIM + v;
        }
        return v + KEY_DELIM + w;
    }

    /**
     * @memberof Graph
     * @function edgeObj
     * 
     * @desc Return edge object by given keys and value
     *
     * @param {string} v The key of the node
     * @param {string} w The key of another node
     * @param {Object} value The value on the edge
     *
     * @returns {Object} Edge object
     */
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

    /**
     * @memberof Graph
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

    /**
     * @memberof Graph
     * @function removeNode
     *
     * @desc Remove node from the graph, also delete the corresponding edges.
     *
     * @param {string[]|string} keys The keys of nodes that need to be removed
     *
     * @returns {Graph}
     */
    removeNode (keys) {
        if (!_.isArray(keys)) {
            keys = [keys];
        }

        _.each(keys, key => {
            if (!_.has(this._node, key)) return;

            delete this._node[key];
            _.each(this._connectivity[key], ({ v, w }) => {
                delete this._edge[this.edgeId(v, w)];
                if (v !== key) { delete this._connectivity[v][w]; }
                if (w !== key) { delete this._connectivity[w][v]; }
                this._count.edge--;
            });

            delete this._connectivity[key];

            this._count.node--;
        });
    }

    /**
     * @memberof Graph
     * @function hasNode
     *
     * @desc Return true if the node exists.
     *
     * @param {string} key The key of the node
     *
     * @returns {boolean}
     */
    hasNode (key) {
        return _.has(this._node, key);
    }

    /**
     * @memberof Graph
     * @function nodes
     *
     * @desc Return the keys of all the nodes.
     *
     * @returns {string[]} All the keys
     */
    nodes () {
        return _.keys(this._node);
    }

    /**
     * @memberof Graph
     * @function values
     *
     * @desc Return the values of all nodes.
     *
     * @returns {Object[]} All the values
     */
    values () {
        return _.values(this._node);
    }

    /**
     * @memberof Graph
     * @function value
     *
     * @desc Return value of a specific node.
     *
     * @param {string} key Key of a specific node
     *
     * @returns {Object} The value of the node
     */
    value (key) {
        return this._node[key];
    }

    /**
     * @memberof Graph
     * @function setEdge
     *
     * @desc Set edge in the graph. Multiple edges is not allowed.
     *
     * @param {string} v The key of the node
     * @param {string} w The key of another node
     * @param {Object} value The value on the edge
     *
     * @return {Graph}
     */
    setEdge (v, w, value) {
        if (!_.has(this._node, v)) { this.setNode(v); }
        if (!_.has(this._node, w)) { this.setNode(w); }

        let e = this.edgeId.apply(this, arguments);
        if (!_.has(this._edge, e)) { this._count.edge++; }

        let o = this.edgeObj.apply(this, arguments);
        Object.freeze(o);

        this._connectivity[w][v] = o;
        this._connectivity[v][w] = o;
        this._edge[e] = o;

        return this;
    }

    /**
     * @memberof Graph
     * @function removeEdge
     *
     * @desc Remove edge from the graph.
     *
     * @param {string} v The key of the node
     * @param {string} w The key of another node
     *
     * @return {Graph}
     */
    removeEdge (v, w) {
        // TODO
    }

    /**
     * @memberof Graph
     * @function connectivity
     *
     * @desc Return connectivity of a node.
     *
     * @param {string} key The key of the node
     *
     * @returns {Edge[]}
     */
    connectivity (key) {
        return this._connectivity[key];
    }

    /**
     * @memberof Graph
     * @function connectedNode
     *
     * @desc Return connected nodes of a node.
     *
     * @param {string} key The key of the node
     *
     * @returns {string[]} Keys of connected nodes.
     */
    connectedNode (key) {
        return _.keys(this._connectivity[key]);
    }

    /**
     * @memberof Graph
     * @function data
     *
     * @desc Return all data stored in the graph.
     *
     * @returns {Object}
     */
    data () {
        return {
            _node: this._node,
            _edge: this._edge,
            _connectivity: this._connectivity,
            _count: this._count
        };
    }

    /**
     * @memberof Graph
     * @function restore
     *
     * @desc Restore data from outside.
     *
     * @param {Object} obj
     *
     * @returns {Graph}
     */
    restore (obj) {
        this._node = obj._node;
        this._edge = obj._edge;
        this._connectivity = obj._connectivity;
        this._count = obj._count;

        return this;
    }

    /**
     * @memberof Graph
     * @function reset
     *
     * @desc Reset everything.
     *
     * @returns {Graph}
     */
    reset () {
        this._node = {};
        this._edge = {};
        this._connectivity = {};
        this._count = { node: 0, edge: 0 };

        return this;
    }
};

export default Graph;

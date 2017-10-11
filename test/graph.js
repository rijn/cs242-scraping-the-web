import Graph from '../graph';
import assert from 'assert';
import chai from 'chai';
import _ from 'lodash';
should = chai.should();

describe('Graph', () => {
    let graph;

    beforeEach(() => {
        graph = new Graph();
    });

    describe('constructor', () => {
        it('should initialize an empty graph', () => {
            graph.should.eql({
                _connectivity: {},
                _count: {
                    edge: 0,
                    node: 0,
                },
                _edge: {},
                _node: {}
            });
        });
    });

    describe('node', () => {
        describe('set', () => {
            let key = 'test';
            let value = 'TEST';
            let returnValue;

            beforeEach(() => {
                returnValue = graph.setNode(key, value);
            });

            it('should create a node and have correct value', () => {
                graph._node[key].should.equal(value);
            });

            it('should create connectivity', () => {
                graph._connectivity[key].should.eql({});
            });

            it('node count should add', () => {
                graph._count.node.should.equal(1);
            });

            it('should return the graph', () => {
                graph.should.equal(returnValue);
            });
        });

        describe('set array', () => {
            let keys = ['test1', 'test2'];
            let value = 'TEST';
            let returnValue;

            beforeEach(() => {
                returnValue = graph.setNode(keys, value);
            });

            it('should create a node and have correct value', () => {
                _.each(keys, key => {
                    graph._node[key].should.equal(value);
                });
            });

            it('should create connectivity', () => {
                _.each(keys, key => {
                    graph._connectivity[key].should.eql({});
                });
            });

            it('node count should add', () => {
                graph._count.node.should.equal(keys.length);
            });
        });

        describe('value override', () => {
            it('should override old value', () => {
                let key = 'test';
                graph.setNode(key, 'TEST1');
                graph._node[key].should.equal('TEST1');
                graph.setNode(key, 'TEST2');
                graph._node[key].should.equal('TEST2');
            });
        });

        it('remove', () => {
            // TODO
            graph.removeNode();
        });

        describe('has', () => {
            let key = 'test';
            let value = 'TEST';

            beforeEach(() => {
                graph.setNode(key, value);
            });

            it('should return true if the node exists', () => {
                graph.hasNode(key).should.to.be.true;
            });

            it('should return false if the node doesn\'t exist', () => {
                graph.hasNode(key + 'test').should.to.be.false;
            });
        });

        describe('node', () => {
            let keys = ['test1', 'test2'];
            let value = 'TEST';

            beforeEach(() => {
                graph.setNode(keys, value);
            });

            it('should return keys of the nodes', () => {
                graph.nodes().should.eql(keys);
            });

            it('should return value of the node', () => {
                graph.value(keys[0]).should.equal(value);
            });

            it('should return values of the nodes', () => {
                _.each(graph.values(), value => {
                    value.should.equal(value);
                });
            });
        });
    });

    describe('edge', () => {
        describe('id', () => {
            let v = '1', w = '2', id;

            beforeEach(() => {
                id = graph.edgeId(v, w);
            });

            it('should return id with correct order', () => {
                id.should.equal(graph.edgeId(w, v));
            });

            it('should joined by delimiter', () => {
                id.should.have.string('\x01');
            });
        });

        describe('obj', () => {
            let v = '1', w = '2', value = 'TEST', o;

            beforeEach(() => {
                o = graph.edgeObj(v, w, value);
            });

            it('should return obj with correct order', () => {
                o.should.eql(graph.edgeObj(w, v, value));
            });

            it('should contain the value', () => {
                o.value.should.equal(value);
            });
        });

        describe('set', () => {
            let keys = ['test1', 'test2'];
            let value = 'TEST';

            beforeEach(() => {
                graph.setNode(keys[0], value);
                graph.setNode(keys[1], value);
                graph.setEdge(keys[0], keys[1], value);
            });

            it('should set two nodes', () => {
                graph.nodes().should.eql(keys);
            });

            it('should set corresponding connectivity', () => {
                graph.connectedNode(keys[0]).should.eql([keys[1]]);
                graph.connectedNode(keys[1]).should.eql([keys[0]]);
            });

            it('should add an edge', () => {
                graph._edge.should.have.all.keys(graph.edgeId(keys[0], keys[1]));
            });

            it('edge obj should be freezed', () => {
                Object.isFrozen(graph.connectivity(keys[0])[0]).should.be.true;
            });

            it('edge count should increase', () => {
                graph.count().edge.should.be.equal(1);
            });

            it('set multiple edge should be ignored', () => {
                graph.setEdge(keys[0], keys[1], value);
                graph.count().edge.should.be.equal(1);
            });
        });

        it('remove', () => {
            // TODO
            graph.removeEdge();
        });
    });

    describe('connectivity', () => {
        let keys = ['test1', 'test2'];
        let value = 'TEST';

        beforeEach(() => {
            graph.setNode(keys[0], value);
            graph.setNode(keys[1], value);
            graph.setEdge(keys[0], keys[1], value);
        });

        it('should return connectivity of the node', () => {
            graph.connectivity(keys[0]).should.equal(graph._connectivity[keys[0]]);
        });

        it('should return connected nodes of the node', () => {
            graph.connectedNode(keys[0]).should.eql([keys[1]]);
        });
    });

    describe('helper fn', () => {
        it('count should return count object', () => {
            graph.count().should.equal(graph._count);
        });

        it('can restore data', () => {
            let mockGraph = {
                _connectivity: 'mock',
                _count: 'mock',
                _edge: 'mock',
                _node: 'mock'
            };

            graph.restore(mockGraph);
            graph.should.eql(mockGraph);
        });

        it('can save data', () => {
            graph.data().should.eql({
                _connectivity: {},
                _count: {
                    edge: 0,
                    node: 0,
                },
                _edge: {},
                _node: {}
            });
        });
    });
});

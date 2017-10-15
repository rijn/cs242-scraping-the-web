var requireHelper = require('../require-helper');
let Model = requireHelper('./model').default;
let Parsers = requireHelper('./utils/parsers');



describe('Model', () => {
    describe('constructor', () => {
        it('should contain an graph', () => {
            (Model.graph instanceof requireHelper('./graph').default).should.be.true;
        });
    });

    beforeEach(() => {
        Model.load([]);
    });

    let value = { name: 'test', age: 10, isActor: true };

    describe('get', () => {
        beforeEach(() => {
            Model.graph.setNode(value.name, value);
        });

        it('without filter should return everything', () => {
            Model.get(() => true, {}).should.eventually.eql([value]);
        });

        it('with filter should return actors', () => {
            Model.get(Parsers.isActor, {}).should.eventually.eql([value]);
        });

        it('with filter should return no movie', () => {
            Model.get(Parsers.isMovie, {}).should.eventually.eql([]);
        });

        it('actor get should return same result', () => {
            Model.actor.get().should.eventually.eql([value]);
        });

        it('movie get should return same result', () => {
            Model.movie.get().should.eventually.eql([]);
        });
    });

    describe('insert', () => {
        let setNode = sinon.spy();

        beforeEach(() => {
            Model.graph.setNode = setNode;
        });

        it('should call setNode in graph', () => {
            Model.insert(value.name, value);
            setNode.should.have.been.calledWith('test', value);
        });

        it('model update should call setNode as well', () => {
            Model.actor.insert(value);
            setNode.should.have.been.calledWith('test', value);
        });

        it('model update should call setNode as well', () => {
            Model.movie.insert(value);
            setNode.should.have.been.calledWith('test', value);
        });
    });

    describe('update', () => {
        let setNode = sinon.spy();
        let newAttr = { 'new_attr': 'new_value' };

        beforeEach(() => {
            Model.insert(value.name, value);
            Model.graph.setNode = setNode;
            Model.update(value.name, newAttr);
        });

        it('should call setNode in graph', () => {
            setNode.should.have.been.calledWith(value.name, _.assign(value, newAttr));
        });

        it('update should be the same', () => {
            Model.actor.update.should.equal(Model.update);
            Model.movie.update.should.equal(Model.update);
        });
    });

    describe('delete', () => {
        let removeNode = sinon.spy();

        beforeEach(() => {
            Model.graph.removeNode = removeNode;
            Model.delete(value.name);
        });

        it('should call removeNode in graph', () => {
            removeNode.should.have.been.calledWith(value.name);
        });

        it('delete should be the same', () => {
            Model.actor.delete.should.equal(Model.delete);
            Model.movie.delete.should.equal(Model.delete);
        });
    });
});

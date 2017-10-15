describe('actor get', () => {
    it('without filter should response 200 and return all actors', () => {
        return request(_server)
            .get(`/actors`)
            .expect(200)
            .then(response => {
                response.body.map(({ name }) => name).should.eql(_.keys(_data[0]));
            });
    });

    describe('with filter', () => {
        let _name = 'Bruce Willis';
        let _age = 60;

        it('name should response single actor', () => {
            return request(_server)
                .get(`/actors`)
                .query({ name: _name })
                .expect(200)
                .then(response => {
                    response.body.length.should.equal(1);
                    response.body[0].name.should.equal(_name);
                });
        });

        it('age should parse string and return all actors with specific age', () => {
            return request(_server)
                .get(`/actors`)
                .query({ age: _age })
                .expect(200)
                .then(response => {
                    response.body.map(({ name }) => name)
                        .should.eql(_.chain(_data[0]).pickBy(({ age }) => age === _age).keys().value());
                });
        });

        it('should return 404 if no actor found', () => {
            return request(_server)
                .get(`/actors`)
                .query({ name: _name, age: _age })
                .expect(404);
        });
    });

    describe('with param', () => {
        let data;

        before(() => {
            data = _data[0]['Bruce Willis'];
        });

        it('should return 200 and the info', () => {
            return request(_server)
                .get(`/actors/${data.name}`)
                .expect(200)
                .then(response => {
                    response.body.should.eql(data);
                });
        });

        it('should return 404 not found if the actor does not exist', () => {
            return request(_server)
                .get(`/actors/12321`)
                .expect(404);
        });
    });
});

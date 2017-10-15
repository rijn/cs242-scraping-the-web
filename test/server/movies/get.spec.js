describe('movie get', () => {
    it('without filter should response 200 and return all movies', () => {
        return request(_server)
            .get(`/movies`)
            .expect(200)
            .then(response => {
                response.body.map(({ name }) => name).length
                    .should.equal(_.keys(_data[1]).length);
            });
    });

    describe('with filter', () => {
        let _name = 'The First Deadly Sin';
        let _year = 1982;

        it('name should response single movie', () => {
            return request(_server)
                .get(`/movies`)
                .query({ name: _name })
                .expect(200)
                .then(response => {
                    response.body.length.should.equal(1);
                    response.body[0].name.should.equal(_name);
                });
        });

        it('year should parse string and return all movies with specific year', () => {
            return request(_server)
                .get(`/movies`)
                .query({ year: _year })
                .expect(200)
                .then(response => {
                    response.body.map(({ name }) => name)
                        .should.eql(_.chain(_data[1]).pickBy(({ year }) => year === _year).keys().value());
                });
        });

        it('should return 404 if no movie found', () => {
            return request(_server)
                .get(`/movies`)
                .query({ name: _name, year: _year })
                .expect(404);
        });
    });

    describe('with param', () => {
        let data;

        before(() => {
            data = _data[1]['The First Deadly Sin'];
        });

        it('should return 200 and the info', () => {
            return request(_server)
                .get(`/movies/${data.name}`)
                .expect(200)
                .then(response => {
                    response.body.should.eql(data);
                });
        });

        it('should return 404 not found if the movie does not exist', () => {
            return request(_server)
                .get(`/movies/12321`)
                .expect(404);
        });
    });
});

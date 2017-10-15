describe('movie put', () => {
    let data = { name: 'test put' };
    let attr = { age: 0 };

    it('should return 400 if the movie does not exist', () => {
        return request(_server)
            .put(`/movies/${data.name}`)
            .expect(400);
    });

    it('should return 200 if success and should update the data', () => {
        return request(_server).post(`/movies`).send(data).then(() => {
            return request(_server).put(`/movies/${data.name}`).send(attr).expect(200);
        }).then(() => {
            return request(_server).get(`/movies/${data.name}`).expect(200).then(response => {
                response.body.should.eql(_.assign(data, attr, { isMovie: true }));
            });
        }).then(() => {
            return request(_server).delete(`/movies/${data.name}`).expect(200);
        });
    });
});

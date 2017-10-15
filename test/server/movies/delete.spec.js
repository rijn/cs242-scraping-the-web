describe('movie delete', () => {
    let data = { name: 'test delete' };

    it('should return 400 if the movies does not exist', () => {
        return request(_server)
            .delete(`/movies/${data.name}`)
            .expect(400);
    });

    it('should return 200 if movie delete and should delete the movie', () => {
        return request(_server).post(`/movies`).send(data).then(() => {
            return request(_server).delete(`/movies/${data.name}`).expect(200);
        }).then(() => {
            return request(_server).get(`/movies/${data.name}`).expect(404);
        });
    });
});

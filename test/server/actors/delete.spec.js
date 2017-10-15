describe('actor delete', () => {
    let data = { name: 'test delete' };

    it('should return 400 if the actor does not exist', () => {
        return request(_server)
            .delete(`/actors/${data.name}`)
            .expect(400);
    });

    it('should return 200 if actor delete and should delete the actor', () => {
        return request(_server).post(`/actors`).send(data).then(() => {
            return request(_server).delete(`/actors/${data.name}`).expect(200);
        }).then(() => {
            return request(_server).get(`/actors/${data.name}`).expect(404);
        });
    });
});

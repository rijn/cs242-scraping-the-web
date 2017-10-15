describe('actor put', () => {
    let data = { name: 'test put' };
    let attr = { age: 0 };

    it('should return 400 if the actor does not exist', () => {
        return request(_server)
            .put(`/actors/${data.name}`)
            .expect(400);
    });

    it('should return 200 if success and should update the data', () => {
        return request(_server).post(`/actors`).send(data).then(() => {
            return request(_server).put(`/actors/${data.name}`).send(attr).expect(200);
        }).then(() => {
            return request(_server).get(`/actors/${data.name}`).expect(200).then(response => {
                response.body.should.eql(_.assign(data, attr, { isActor: true }));
            });
        }).then(() => {
            return request(_server).delete(`/actors/${data.name}`).expect(200);
        });
    });
});

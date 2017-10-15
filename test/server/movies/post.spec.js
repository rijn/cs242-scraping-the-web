describe('movie post', () => {
    let data = { name: 'test', age: 60 };

    it('without name should return 400 br', () => {
        return request(_server)
            .post(`/movies`)
            .send(_.omit(data, 'name'))
            .expect(400);
    });

    it('send regular request should return 201 created', () => {
        return request(_server)
            .post(`/movies`)
            .send(data)
            .expect(201);
    });

    it('send request which is already existed should return 409 conflict', () => {
        return request(_server)
            .post(`/movies`)
            .send(data)
            .expect(409);
    });
});

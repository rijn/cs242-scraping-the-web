import _ from 'lodash';

export const isExist = (model, name) => {
    return model.get({ name }).then(r => {
        return !_.isEmpty(r);
    });
};

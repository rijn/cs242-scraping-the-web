import _ from 'lodash';

/**
 * @function isExist
 * 
 * @desc Test if current key exist in the model
 *
 * @param {Model} model
 * @param {string} name
 */
export const isExist = (model, name) => {
    return model.get({ name }).then(r => {
        return !_.isEmpty(r);
    });
};

import getHandler from './get';
import postHandler from './post';
exports.index = [
    {
        method: 'GET',
        handler: getHandler
    },
    {
        method: 'POST',
        handler: postHandler
    }
];

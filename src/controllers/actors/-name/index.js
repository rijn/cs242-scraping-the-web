import getHandler from './get';
import putHandler from './put';

exports.index = [
    {
        method: 'GET',
        handler: getHandler
    },
    {
        method: 'PUT',
        handler: putHandler
    }
];

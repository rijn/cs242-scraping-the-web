import getHandler from './get';
import putHandler from './put';
import deleteHandler from './delete';

exports.index = [
    {
        method: 'GET',
        handler: getHandler
    },
    {
        method: 'PUT',
        handler: putHandler
    },
    {
        method: 'DELETE',
        handler: deleteHandler
    }
];

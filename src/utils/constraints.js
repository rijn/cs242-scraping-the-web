import _ from 'lodash';
import Model from '../model';
import { ServerError } from './error-handler';

export const checkActorExist = (name) => {
    return Model.actor.get({ name }).then(r => {
        if (!_.isEmpty(r)) {
            throw new ServerError('Actor already existed', 409);
        }
    });
};

export const checkMovieExist = (name) => {
    return Model.movie.get({ name }).then(r => {
        if (!_.isEmpty(r)) {
            throw new ServerError('Actor already existed', 409);
        }
    });
};

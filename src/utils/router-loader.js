'use strict';

import glob from 'glob';
import os from 'os';

import compose from './compose';

const METHOD_ENUM = ['get', 'post', 'put', 'delete'];

/**
 * @function loadRouter
 *
 * @desc Load all controllers in the directory.
 *
 * @param {Application} app
 * @param {string} root
 * @param {Object} options
 */
const loadRouter = (app, root, options) => {
    const opt = options || {};

    glob.sync(`${root}/**/*.js`).forEach((file) => {
        const realRoot = os.platform() === 'win32' ? root.replace(/\\/ig, '/') : root;
        const filePath = file.replace(/\.[^.]*$/, '');
        const controller = require(filePath);
        const constPrefix = opt.constPrefix || '';
        const urlPrefix = filePath.replace(realRoot, '').replace(/\/index$/, '');
        const methods = Object.keys(controller);

        // Handle options
        // const excludeRules = opt.excludeRules || null;
        const rewriteRules = opt.rewriteRules || new Map();

        function applyMethod (name, methodBody) {
            const body = methodBody;
            let modifiedUrl = `${constPrefix}${urlPrefix}${name === 'index' ? '' : `/${name}`}`;
            let middlewares = [];
            let method = 'get';
            let handler;
            let params;

            switch (typeof body) {
            case 'object':
                params = body.params || [];
                middlewares = body.middlewares || [];
                modifiedUrl += `/${params.join('/')}`;
                modifiedUrl = modifiedUrl.replace(/-/gi, ':');
                handler = body.handler;
                method = (body.method || 'get').toLowerCase();
                break;
            case 'function':
                handler = body;
                break;
            default: return;
            }

            if (METHOD_ENUM.indexOf(method) !== -1) {
                if (!handler) throw Error('[router-loader]: no handler for method: ', method);

                if (process.env.NODE_ENV !== 'prod') console.log('[router-loader]: Register ' + modifiedUrl + ' - ' + method);

                app[method](
                    rewriteRules.has(modifiedUrl)
                        ? rewriteRules.get(modifiedUrl)
                        : modifiedUrl,
                    compose(middlewares, modifiedUrl),
                    handler
                );
            } else {
                throw Error('[router-loader]: invalid method: ', method);
            }
        }

        methods.forEach((method) => {
            const methodName = method;
            const methodBody = controller[method];

            if (Array.isArray(methodBody)) {
                methodBody.forEach((m) => {
                    applyMethod(methodName, m);
                });
            // } else {
            //     applyMethod(methodName, methodBody);
            }
        });
    });
};

export default loadRouter;

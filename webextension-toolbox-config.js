const {
    dedupeModules,
    fixZipPackage,
    useImages,
    useExternal,
    useSourceMap,
    useTypescript,
} = require('@spadin/webextension-build-utils');


var path = require('path');

module.exports = {
    webpack: (config, { dev }) => {
        // Set up source maps to work nicely with the Chrome debugger.
        useSourceMap(config, dev);

        // Build TypeScript files and allow them as entry points.
        useTypescript(config);

        // Bundle CSS files and any resources referenced by them.
        useImages(config, {
            optimizeImages: !dev,
        });

        // Don't bundle certain large modules to speed up build times and allow
        // the browser to cache them between builds.
        const mode = dev ? 'development' : 'production.min';

        
        // Fix for duplicate modules in bundles when some of our dependencies
        // are installed via npm link.
        dedupeModules(config, [
            'webextension-polyfill',
            'webextension-polyfill-ts',
            '@spadin/webextension-storage',
        ]);

        // Workaround for issue in webextension-toolbox v3.0.0:
        // The ZipPlugin added by webextension-toolbox will get run before the
        // copy done in useExternal(), so the external libraries won't be
        // included in the output package unless we move ZipPlugin to the end of
        // the plugins list.
        fixZipPackage(config);

        /*config.module.rules.push({
            test: /\.(js|jsx|mjs)$/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  babelrc: true,
                  extends: path.join(__dirname + '/.babelrc'),
                  cacheDirectory: true,
                  envName: dev ? 'development' : 'production'
                }
              }
            ]
          });*/

        return config;
    },
    copyIgnore: [
        '**/*.js',
        '**/*.json',
        '**/*.ts',
        '**/*.tsx',
    ]
};
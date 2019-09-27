import {injectScript} from './util'

injectScript('/scripts/hijacks/alma-table-freeze.js')

injectScript('', 'html', 'script', `

YUI().use('alma-table-freeze', (Y) => {
    var doc = Y.one('doc'),
            body = doc.one('body'),
    
            content = Y.one('#content'),
    container = content.one('.freeze-wrapper'),
            
    gradebook = container.one('.gradebook'),
            gradebookFreeze = new Y.Alma.TableFreeze(gradebook);
    gradebookFreeze.enable();
    gradebookFreeze.reset();

    // Only enable gradebook freeze in fullscreen
    Y.Global.on('alma:fullscreenChange', function (evt) {
        gradebookFreeze.reset();
    });

    // sync gradebook freeze sizes on density change
    Y.Global.on('alma:densityChange', function (evt) {
        gradebookFreeze.reset();
    });
            
    } )

`)
const args = require('yargs').argv;
const glob = require('glob');
const path = require('path');
const fs = require('fs');

if (!args.root) {
    console.log(args);
    throw new Error('Please supply the root');
}

let selectors = [];

glob('**/*.js', { cwd: path.resolve(process.cwd(), args.root) }, (err, jsFiles) => {
    if (err) {
        throw err;
    }

    jsFiles.forEach((jsFile) => {
        let content = fs.readFileSync(path.resolve(process.cwd(), args.root, jsFile), { encoding: 'utf-8' });

        content.replace(/ngModule\.component\('([A-z]+)'\)/g, (fullMatch, componentName) => {
            selectors.push('<' + componentName.replace(/[A-Z]/g, (letter) => {
                return `-${letter.toLowerCase()}`;
            }));
        });

        content.replace(/ngModule\.directive\('([A-z]+)'\)/g, (fullMatch, componentName) => {
            let compName = componentName.replace(/[A-Z]/g, (letter) => {
                return `-${letter.toLowerCase()}`;
            });

            selectors.push('<' + compName);
            selectors.push(' ' + compName);
        });
    });

    glob('**/*.html', { cwd: path.resolve(process.cwd(), args.root) }, (err, htmlFiles) => {
        if (err) {
            throw err;
        }

        htmlFiles.forEach((htmlFile) => {
            let content = fs.readFileSync(path.resolve(process.cwd(), args.root, htmlFile), { encoding: 'utf-8' });

            selectors.forEach((selector) => {
                console.log(selector, content);
                if (new RegExp(selector).test(content)) {
                    const componentName = selector.replace(/^[\s<]/, '');

                    selectors = selectors.filter((sel) => {
                        return !(sel === ' ' + componentName || sel === '<' + componentName);
                    });
                }
            })
        });

        console.log(selectors);
    });
});

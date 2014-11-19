'use strict';

var fs          = require('fs');
var path        = require('path');
var glob        = require('glob');
var Handlebars  = require('handlebars');
var metalsmith  = require('metalsmith');
var kss         = require('metalsmith-kss');
var markDown    = require('metalsmith-markdown');
var navigation  = require('metalsmith-navigation');
var templates   = require('metalsmith-templates');
var assets      = require('metalsmith-assets');

var navConfigs = {
    primary:{
        sortBy: 'title',
        filterProperty: 'nav_groups'
    },
    footer: {
        sortBy: 'title',
        filterProperty: 'nav_groups'
    }
};

var navSettings = {
    navListProperty: 'navs'
};

var meta = {
    title: 'Potec',
    description: 'Styleguide',
    partials: { // Used by metalsmith-templates
        breadcrumbs: '_breadcrumbs',
        nav_global : '_nav_global',
        nav_relative : '_nav_relative',
        nav_footer : '_nav_footer',
        nav__children: '_nav__children'
    }
};

/**
 * Registers a Handlebars partial for all matches in the given directory
 */
function getModulePartials(directory, callback) {
    directory = directory || [];
    callback = callback || function() {};
    directory.forEach(function(item, i) {
        fs.readFile(item, { encoding: 'utf8' }, function(err, content) {
            Handlebars.registerPartial(item, content);
            if (i + 1 >= directory.length) {
                callback();
            }
        });
    });
}

/**
 * Normalizes and removes starting slash from path
 */
function getRelativePath(current, target) {
    if(!current || !target){
        return '';
    }
    current = path.normalize(current).slice(0);
    target = path.normalize(target).slice(0);
    current = path.dirname(current);
    return path.relative(current, target);
}

Handlebars.registerHelper('relative_path', getRelativePath);
Handlebars.registerHelper('exists', function (value, fallback) {
    return new Handlebars.SafeString(value || fallback);
});

metalsmith(__dirname)
    .clean(true)
    .metadata(meta)
    .use(kss({ source: 'less/', target: 'styleguide/', pageTemplate: 'page.html', fixtures: glob.sync('less/**/*.hbs') }))
    .use(markDown())
    .use(navigation(navConfigs, navSettings))
    .use(templates({ engine: 'handlebars', directory: 'src/prototyp', inPlace: true, partials: getModulePartials(glob.sync('modules/**/*.html')) }))
    .use(templates({ engine: 'handlebars' }))
    .use(assets({ source: './assets', destination: './assets' }))
    .build(function(err) {
        if (err) throw err;
    });

'use strict';

var path        = require('path');
var Handlebars  = require('handlebars');
var metalsmith  = require('metalsmith');
var kss         = require('metalsmith-kss');
var markDown    = require('metalsmith-markdown');
var hbs         = require('metalsmith-handlebars-content');
var navigation  = require('metalsmith-navigation');
var templates   = require('metalsmith-templates');
var assets      = require('metalsmith-assets');

var navConfigs = {
    primary:{
        sortBy: 'nav_sort',
        filterProperty: 'nav_groups'
    },
    footer: {
        sortBy: 'nav_sort',
        filterProperty: 'nav_groups'
    }
};

var navSettings = {
    navListProperty: 'navs'
};

var meta = {
    title: 'Potec',
    description: 'Styleguide',
    // used by metalsmith-templates
    partials: {
        breadcrumbs: '_breadcrumbs',

        nav_global : '_nav_global',
        nav_relative : '_nav_relative',
        nav_footer : '_nav_footer',

        nav__children: '_nav__children'
    }
};

var relativePathHelper = function(current, target) {
    // normalize and remove starting slash from path
    if(!current || !target){
        return '';
    }
    current = path.normalize(current).slice(0);
    target = path.normalize(target).slice(0);
    current = path.dirname(current);
    return path.relative(current, target);
};

Handlebars.registerHelper('relative_path', relativePathHelper);

metalsmith(__dirname)
    .clean(true)
    .metadata(meta)
    .use(kss({ source: 'less/', target: 'styleguide/', pageTemplate: 'page.html' }))
    .use(markDown())
    .use(hbs({ Handlebars: Handlebars }))
    .use(navigation(navConfigs, navSettings))
    .use(templates({ engine: 'handlebars' }))
    .use(assets({ source: './assets', destination: './assets' }))
    .build(function(err) {
        if (err) throw err;
    });

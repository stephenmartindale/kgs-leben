var path = require('path');
var isarray = require('isarray');
tmp = "gulp/.tmp";

// Build Inputs
inputs = {
    root: {
        sources: [
            'index.html',
            'LICENSE'
        ]
    },
    dependencies: {
        fonts: 'node_modules/font-awesome/fonts/**',
        scripts: [
            'node_modules/webcomponents.js/webcomponents-lite.*',
            'node_modules/jquery/dist/jquery.js',
            'node_modules/jquery/dist/jquery.min.*'
        ]
    },
    templates: {
        sources: {
            html: 'views/**/*.html',
            scss: 'views/**/*.scss'
        },
        footer: "framework/Templates.Footer.html"
    },
    scripts: {
        sources: '**/*.ts',
        project: 'tsconfig.json'
    },
    styles: {
        sources: 'scss/**/*.scss',
        views: 'scss/_views.scss',
        include: [
            tmp,
            'node_modules/bootstrap/scss'
        ]
    }
};

// Build Outputs
outputs = {
    root: "dist",
    dependencies: {
        fonts: 'fonts',
        scripts: 'scripts'
    },
    templates: 'templates.html',
    scripts: 'ts.js',
    styles: 'stylesheet.css'
};

// Supported Browsers and Versions
// See CSV data from: gs.statcounter.com
var browsers = [
    'Chrome >= 42',
    'Firefox >= 38',    // Firefox Extended Support Release (ESR) on 2015-12-22
    'Edge >= 12',       // EdgeHTML rendering engine version (not the Edge app. version)
    'Explorer >= 10',
    'iOS >= 8',
    'Safari >= 9',
    'Opera >= 15'
];

// Gulp: The streaming build system
var gulp = require('gulp');
var rimraf = require('rimraf');
var merge = require('merge-stream');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

// Tool-Chain: Scripts
var typescript = require('gulp-typescript');

// Tool-Chain: Styles
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

// Helper Functions
var multisource = function(p) {
    if ((p) && (isarray(p))) {
        var sources = [];
        for (var j = 0; j < p.length; ++j) {
            sources.push(gulp.src(p[j]));
        }
        return merge(sources);
    }
    else if (p) return gulp.src(p);
    else return null;
}

var buildTypeScript = function(tsconfig, outputPath) {
    var ts = tsconfig.src()
                     .pipe(sourcemaps.init())
                     .pipe(typescript(tsconfig));
    return merge(
        ts.dts.pipe(gulp.dest(path.join(outputs.root, "tsd"))),
        ts.js.pipe(sourcemaps.write(".")).pipe(gulp.dest(outputs.root))
    );
}

// Task(s): Clean
gulp.task('clean:dependencies:fonts', function(callback) {
    rimraf(path.join(outputs.root, outputs.dependencies.fonts), callback);
});
gulp.task('clean:dependencies:scripts', function(callback) {
    rimraf(path.join(outputs.root, outputs.dependencies.scripts), callback);
});
gulp.task('clean:dependencies', ['clean:dependencies:fonts', 'clean:dependencies:scripts']);

gulp.task('clean:templates', function(callback) {
    rimraf(path.join(outputs.root, outputs.templates), callback);
});

gulp.task('clean:scripts', function(callback) {
    rimraf(path.join(outputs.root, outputs.scripts), callback);
});

gulp.task('clean:styles', function(callback) {
    rimraf(path.join(outputs.root, outputs.styles), callback);
});

gulp.task('clean:tmp', function(callback) {
    rimraf(tmp, callback);
});
gulp.task('clean', ['clean:tmp'], function(callback) {
    rimraf(outputs.root, callback);
});

// Task(s): Deploy Dependency Artefacts
gulp.task('dependencies:fonts', function() {
    var p = path.join(outputs.root, outputs.dependencies.fonts);
    return multisource(inputs.dependencies.fonts).pipe(gulp.dest(p));
});
gulp.task('dependencies:scripts', function() {
    var p = path.join(outputs.root, outputs.dependencies.scripts);
    return multisource(inputs.dependencies.scripts).pipe(gulp.dest(p));
});
gulp.task('dependencies', ['dependencies:fonts', 'dependencies:scripts']);

// Task(s): Build or Deploy Root Artefacts
gulp.task('build:root', function() {
    multisource(inputs.root.sources).pipe(gulp.dest(outputs.root));
});

// Task(s): Build Web Component Templates
gulp.task('build:templates', function() {
    return gulp.src([inputs.templates.sources.html, inputs.templates.footer])
               .pipe(concat(outputs.templates))
               .pipe(gulp.dest(outputs.root));
});

// Task(s): Build TypeScript Outputs
var tsconfig = typescript.createProject(inputs.scripts.project);
gulp.task('build:scripts', buildTypeScript.bind(null, tsconfig, outputs.scripts));

// Task(s): Build Sass Outputs
gulp.task('build:styles:views', function() {
    return gulp.src(inputs.templates.sources.scss)
               .pipe(concat('__views.scss'))
               .pipe(gulp.dest(tmp));
});
gulp.task('build:styles', ['build:styles:views'], function() {
    return gulp.src(inputs.styles.sources)
               .pipe(sass({ includePaths: inputs.styles.include }).on('error', sass.logError))
               .pipe(postcss([autoprefixer({ browsers: browsers })]))
               .pipe(gulp.dest(outputs.root));
});

// Task(s): Build et al.
gulp.task('build', ['build:root', 'dependencies', 'build:templates', 'build:scripts', 'build:styles']);

gulp.task('default', ['build']);

gulp.task('rebuild:templates', ['clean:templates'], function() { gulp.start('build:templates') });
gulp.task('rebuild:scripts', ['clean:scripts'], function() { gulp.start('build:scripts') });
gulp.task('rebuild:styles', ['clean:styles'], function() { gulp.start('build:styles') });
gulp.task('rebuild', ['clean'], function() { gulp.start('build') });

// Task(s): Incremental Compilation
var watch = function() {
    gulp.watch(inputs.root.sources, ['build:root']);

    gulp.watch(inputs.templates.sources.html, ['build:templates']);
    gulp.watch(inputs.templates.footer, ['build:templates']);

    gulp.watch(inputs.scripts.sources, ['build:scripts']);

    gulp.watch(inputs.templates.sources.scss, ['build:styles']);
    gulp.watch(inputs.styles.sources, ['build:styles']);
};
gulp.task('watch', ['build'], watch);
gulp.task('rewatch', ['rebuild'], watch);

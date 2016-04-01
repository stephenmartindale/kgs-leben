// Build Inputs
inputs = {
    dependencies: {
        fonts: 'node_modules/font-awesome/fonts/**',
        scripts: [
            'node_modules/jquery/dist/jquery.js',
            'node_modules/jquery/dist/jquery.min.*'
        ]
    },
    typescript: {
        sources: 'ts/**/*.ts',
        project: 'ts/tsconfig.json'
    },
    sass: {
        sources: 'scss/**/*.scss',
        include: [
            'node_modules/bootstrap/scss'
        ]
    }
};

// Build Outputs
outputs = {
    fonts: 'fonts',
    scripts: 'js',
    styles: 'css'
};

// Supported Browsers and Versions
// See CSV data from: gs.statcounter.com
var browsers = [
    'Chrome >= 42',
    'Firefox >= 38',    // Firefox Extended Support Release (ESR) on 2015-12-22
    'Edge >= 12',       // EdgeHTML rendering engine version (not the Edge app. version)
    'Explorer >= 10',
    'iOS >= 8',
    'Safari >= 8',
    'Android 2.3',
    'Android >= 4',
    'Opera >= 12'
];

// Gulp: The streaming build system
var gulp = require('gulp');
var rimraf = require('rimraf');
var isarray = require('isarray');
var merge = require('merge-stream');
var newer = require('gulp-newer');

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

// Task(s): Clean
gulp.task('clean:fonts', function(callback) {
    rimraf(outputs.fonts, callback);
});
gulp.task('clean:scripts', function(callback) {
    rimraf(outputs.scripts, callback);
});
gulp.task('clean:styles', function(callback) {
    rimraf(outputs.styles, callback);
});
gulp.task('clean', ['clean:fonts', 'clean:scripts', 'clean:styles']);

// Task(s): Deploy Dependency Artefacts
gulp.task('dependencies:fonts', function() {
    return multisource(inputs.dependencies.fonts).pipe(newer(outputs.fonts)).pipe(gulp.dest(outputs.fonts));
});
gulp.task('dependencies:scripts', function() {
    return multisource(inputs.dependencies.scripts).pipe(newer(outputs.scripts)).pipe(gulp.dest(outputs.scripts));
});
gulp.task('dependencies', ['dependencies:fonts', 'dependencies:scripts']);

// Task(s): Build TypeScript Outputs
var tsconfig = typescript.createProject(inputs.typescript.project);
gulp.task('build:scripts', function() {
    var ts = tsconfig.src().pipe(typescript(tsconfig));
    return merge(
        ts.dts.pipe(gulp.dest(outputs.scripts + "/definitions")),
        ts.js.pipe(gulp.dest(outputs.scripts))
    );
});

// Task(s): Build Sass Outputs
gulp.task('build:styles', function() {
    return gulp.src(inputs.sass.sources)
               .pipe(newer(outputs.styles + '/stylesheet.css'))
               .pipe(sass({
                   includePaths: inputs.sass.include,
               }).on('error', sass.logError))
               .pipe(postcss([autoprefixer({ browsers: browsers })]))
               .pipe(gulp.dest(outputs.styles));
});

// Task(s): Build et al.
gulp.task('build', ['dependencies', 'build:scripts', 'build:styles']);
gulp.task('default', ['build']);

gulp.task('rebuild:scripts', ['clean:scripts'], function() { gulp.start('build:scripts') });
gulp.task('rebuild:styles', ['clean:styles'], function() { gulp.start('build:styles') });
gulp.task('rebuild', ['clean'], function() { gulp.start('build') });

// Task(s): Incremental Compilation
var watch = function() {
    gulp.watch(inputs.typescript.sources, ['build:scripts']);
    gulp.watch(inputs.sass.sources, ['build:styles']);
};
gulp.task('watch', ['build'], watch);
gulp.task('rewatch', ['rebuild'], watch);

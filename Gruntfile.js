module.exports = function (grunt) {
  const sass = require('sass');
  var path = require('path');
  const PORT = 9000;

  require('load-grunt-tasks')(grunt);

  var uiConfig = {
    ui: 'src/assets',
  };

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var _ = require('lodash');
  var oldassets = grunt.file.isFile('assets.json')
    ? grunt.file.readJSON('assets.json')
    : {};

  grunt.loadNpmTasks('grunt-filerev-assets');

  grunt.initConfig({
    ui: uiConfig,
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
        nonull: true,
      },
      all: {
        files: {
          '<%= ui.ui %>/scripts/dist/head.js': [
            // 'node_modules/lazysizes/lazysizes.js',
            // 'node_modules/lazysizes/plugins/blur-up/ls.blur-up.js',
            // '<%= ui.ui %>/scripts/thirdparty/modernizr.js',
            // 'node_modules/picturefill/dist/picturefill.js',
          ],
          '<%= ui.ui %>/scripts/dist/main.js': [
            // 'node_modules/jquery/dist/jquery.js',
            // '<%= ui.ui %>/scripts/src/modal.js',
            // '<%= ui.ui %>/scripts/src/main.js',
          ],
        },
      },
    },
    uglify: {
      dist: {
        options: {
          mangle: false,
          compress: {
            drop_console: true,
          },
        },
        files: {
          // '<%= ui.ui %>/scripts/dist/main.min.js': '.tmp/scripts/dist/main.js',
          // '<%= ui.ui %>/scripts/dist/head.min.js': '.tmp/scripts/dist/head.js',
        },
      },
    },
    filerev: {
      options: {
        length: 8,
      },
      images: {
        src: '<%= ui.ui %>/images/**/*.{png,jpg,jpeg,svg,gif}',
        dest: '<%= ui.ui %>/rev/images',
      },
      css: {
        src: '<%= ui.ui %>/css/**/*.css',
        dest: '<%= ui.ui %>/rev/css',
      },
      js: {
        src: '<%= ui.ui %>/scripts/dist/**/*.js',
        dest: '<%= ui.ui %>/rev/scripts',
      },
    },
    filerev_assets: {
      dist: {
        options: {
          dest: 'assets.json',
          cwd: 'src',
        },
      },
    },
    watch: {
      assets: {
        files: ['src/assets/scss/**/*', 'src/assets/images/**/*'],
        tasks: ['assets', 'shell:eleventy'],
      },
      content: {
        files: ['src/**/*', '!src/assets/**/*'],
        tasks: ['shell:eleventy'],
      },
      options: {
        livereload: true,
      },
    },
    connect: {
      server: {
        options: {
          keepalive: true,
          port: PORT,
          base: '_site',
        },
      },
      watch: {
        options: {
          livereload: true,
          port: PORT,
          base: '_site',
        },
      },
    },
    clean: {
      dist: ['<%= ui.ui %>/css/**/*'],
      assets: {
        src: ['<%= ui.ui %>/rev/**/*'],
        filter: function (filepath) {
          // delete all assetrev files except the latest
          // the end result will be the last version and current version
          // will stay, anything older gets deleted.
          var deleteThis = false;

          if (grunt.file.isFile(filepath)) {
            var filepath = filepath;
            var result = _.findKey(oldassets, function (o) {
              return 'web' + o == filepath;
            });

            if (result) {
              deleteThis = false;
            } else {
              deleteThis = true;
            }
          }

          return deleteThis;
        },
      },
      tmp: ['.tmp'],
    },
    sass: {
      options: {
        implementation: sass,
        sourceMap: true,
        includePaths: ['node_modules'],
      },
      dev: {
        files: [
          {
            expand: true,
            cwd: '<%= ui.ui %>/scss',
            src: ['**/*.scss'],
            dest: '<%= ui.ui %>/css',
            ext: '.css',
          },
        ],
      },
    },
    postcss: {
      dev: {
        options: {
          map: true,
          processors: [
            require('autoprefixer')(), // add vendor prefixes
            // require('css-mqpacker')({sort: true}) // combine media queries
          ],
        },
        expand: true,
        dot: true,
        cwd: '<%= ui.ui %>/css',
        dest: '<%= ui.ui %>/css',
        ext: '.css',
        src: ['**/*.css', '!**/*.min.css', '!**/*.gz.css'],
      },
      dist: {
        options: {
          map: false,
          processors: [
            require('cssnano')({
              mergeLonghand: false,
              convertValues: false,
              autoprefixer: false,
              discardUnused: false,
              zindex: false,
              mergeIdents: false,
              reduceIdents: false,
              safe: true,
            }), // minify the result

            require('@fullhuman/postcss-purgecss')({
              content: ['./src/**/*.njk'],
            }),
          ],
        },
        expand: true,
        dot: true,
        cwd: '.tmp/css',
        dest: '<%= ui.ui %>/css',
        src: ['**/*.css', '!**/*.min.css', '!**/*.gz.css'],
      },
    },
    shell: {
      eleventy: {
        command: 'npx @11ty/eleventy --quiet',
        options: {
          execOptions: {},
        },
      },
      eleventyProduction: {
        command: 'NODE_ENV=production npx @11ty/eleventy --quiet',
        options: {
          execOptions: {},
        },
      },
    },
    copy: {
      coc: {
        expand: true,
        src: 'CODE_OF_CONDUCT.md',
        dest: 'src/_generatedfiles',
      },
    },
    replace: {
      dist: {
        options: {
          patterns: [
            {
              json: function (done) {
                done(grunt.updatedfilerevsummary);
              },
            },
          ],
          usePrefix: false,
        },
        files: [
          {
            expand: true,
            cwd: '<%= ui.ui %>',
            dest: '.tmp',
            src: ['css/**/*.css'],
          },
        ],
      },
    },
  });

  grunt.registerTask('assets', ['sass', 'postcss:dev']);

  grunt.registerTask('default', ['assets', 'shell:eleventy']);

  grunt.registerTask('start', ['default', 'connect:watch', 'watch']);

  grunt.registerTask('release-prep', [
    'clean:dist',
    'assets',
    'clean:assets',
    'filerev:images',
    'updatesummary',
    'replace',
    'postcss:dist',
    // 'uglify',
    'clean:tmp',
    'filerev:css',
    // 'filerev:js',
    'filerev_assets',
    'copy:coc',
    'shell:eleventyProduction',
  ]);

  grunt.registerTask('updatesummary', function () {
    var newobj = {};
    for (var prop in grunt.filerev.summary) {
      if (grunt.filerev.summary.hasOwnProperty(prop)) {
        var newprop = prop.substr('web'.length);
        newobj[newprop] = grunt.filerev.summary[prop].substr('web'.length);
      }
    }

    grunt.updatedfilerevsummary = newobj;
  });
};

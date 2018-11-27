"use strict";
module.exports = function(grunt) {
  require("time-grunt")(grunt); // Show elapsed time after tasks run
  // Load all Grunt tasks
  require("load-grunt-tasks")(grunt);

  grunt.initConfig({
    site: {
      source: "app",
      dest: "dist",
      temp: ".tmp"
    },

    //
    // --- linters ---
    jshint: {
      options: {
        jshintrc: ".jshintrc",
        reporter: require("jshint-stylish")
      },
      all: [
        "Gruntfile.js",
        "<%= site.source %>/js/**/*.js",
        "test/spec/**/*.js"
      ]
    },

    scsslint: {
      // https://github.com/robwierzbowski/generator-jekyllrb/issues/106
      allFiles: ["<%= site.source %>/_scss/**/*.scss"],
      options: {
        bundleExec: true,
        config: ".scss-lint.yml",
        colorizeOutput: true
      }
    },

    csslint: {
      options: {
        csslintrc: ".csslintrc"
      },
      check: {
        src: ["<%= site.source %>/css/**/*.css"]
      }
    },

    //
    // --- sass server ---
    sass: {
      options: {
        debugInfo: false,
        lineNumbers: false,
        style: "expanded",
        loadPath: "<%= site.source %>/_bower_components"
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: "<%= site.source %>/_scss",
            src: "**/*.{scss,sass}",
            dest: "<%= site.temp %>/css",
            ext: ".css",
            bundleExec: true
          }
        ]
      },
      server: {
        options: {
          debugInfo: true,
          lineNumbers: true
        },
        files: [
          {
            expand: true,
            cwd: "<%= site.source %>/_scss",
            src: "**/*.{scss,sass}",
            dest: "<%= site.temp %>/css",
            ext: ".css"
          }
        ]
      }
    },

    //
    // --- minification ---
    imagemin: {
      dist: {
        options: {
          progressive: true
        },
        files: [
          {
            expand: true,
            cwd: "<%= site.dest %>",
            src: "**/*.{jpg,jpeg,png}",
            dest: "<%= site.dest %>"
          }
        ]
      }
    },
    svgmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: "<%= site.dest %>",
            src: "**/*.svg",
            dest: "<%= site.dest %>"
          }
        ]
      }
    },

    //
    // --- Prep & Build ---
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              "<%= site.temp %>/*",
              "<%= site.dest %>/*",
              "!<%= site.dest %>/.git*"
            ]
          }
        ]
      },
      server: ["<%= site.temp %>/*", ".jekyll"]
    },

    autoprefixer: {
      options: {
        browsers: ["last 2 versions"]
      },
      dist: {
        expand: true,
        cwd: "<%= site.temp %>",
        src: "**/{css,concat}/*.css",
        dest: "<%= site.temp %>"
      }
    },

    modernizr: {
      dist: {
        dest: "<%= site.source %>/_bower_components/modernizr.js",
        uglify: false
      }
    },

    //useminPrepare builds tasks for concat
    concat: {},

    useminPrepare: {
      html: "<%= site.dest %>/*.html",
      options: {
        dest: "<%= site.dest %>",
        flow: {
          steps: {
            js: ["concat"],
            css: ["concat"]
          }
        }
      }
    },

    usemin: {
      html: ["<%= site.dest %>/**/*.html"],
      css: ["<%= site.dest %>/css/**/*.css"],
      options: {
        assetsDirs: ["<%= site.dest %>", "<%= site.dest %>/img"]
      }
    },

    copy: {
      dist: {
        // Jekyll processes and moves HTML and text files.
        files: [
          {
            expand: true,
            dot: true,
            cwd: "<%= site.source %>",
            src: [
              // exclude files & folders prefixed with an underscore.
              "!**/_*{,/**}",
              // exclude bower_components folder
              "!_bower_components",
              // assets
              "img/**/*",
              "fonts/**/*",
              "favicon.ico",
              "apple-touch*.png"
            ],
            dest: "<%= site.dest %>"
          },
          {
            // bring in font-awesome font files
            expand: true,
            dot: true,
            cwd: "<%= site.source %>/_bower_components/fontawesome/",
            src: ["fonts/*"],
            dest: "<%= site.dest %>"
          }
        ]
      },
      stageCss: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: "<%= site.source %>/css",
            src: "**/*.css",
            dest: "<%= site.temp %>/css"
          }
        ]
      }
    },

    jekyll: {
      options: {
        config: "_config.yml,_config.build.yml",
        src: "<%= site.source %>"
      },
      dist: {
        options: {
          dest: "<%= site.dest %>"
        }
      },
      server: {
        options: {
          config: "_config.yml",
          dest: ".jekyll"
        }
      },
      check: {
        options: {
          doctor: true
        }
      }
    },

    //
    // Server: browserSync, watch, reload
    browserSync: {
      server: {
        bsFiles: {
          src: [
            ".jekyll/**/*.html",
            "<%= site.temp %>/css/**/*.css",
            "{<%= site.temp %>,<%= site.source %>}/js/**/*.js",
            "{<%= site.source %>}/_bower_components/**/*.js",
            "<%= site.source %>/img/**/*.{gif,jpg,jpeg,png,svg,webp}"
          ]
        },
        options: {
          server: {
            baseDir: [".jekyll", "<%= site.temp %>", "<%= site.source %>"]
          },
          ghostMode: {
            clicks: true,
            forms: true,
            scroll: true
          },
          notify: false,
          // tunnel: true,
          watchTask: true
        }
      },
      dist: {
        options: {
          server: {
            baseDir: "<%= site.dest %>"
          }
        }
      }
    },

    watch: {
      options: {
        // spawn: false
      },
      sass: {
        files: ["<%= site.source %>/_scss/**/*.{scss,sass}"],
        tasks: ["sass:server", "autoprefixer:dist", "bsReload:css", "scsslint"]
      },
      autoprefixer: {
        files: ["<%= site.source %>/css/**/*.css"],
        tasks: ["copy:stageCss", "autoprefixer:dist", "bsReload:css"]
      },
      js: {
        files: ["<%= site.source %>/js/**/*.{js,coffee}"],
        tasks: ["jekyll:server", "bsReload:all", "jshint:all"]
      },
      jekyll: {
        files: [
          "<%= site.source %>/**/*.{html,yml,md,mkd,markdown}",
          "!<%= site.source %>/_bower_components/**/*"
        ],
        tasks: ["jekyll:server", "bsReload:all"]
      }
    },

    bsReload: {
      css: {
        reload: "*.css"
      },
      all: {
        reload: true
      }
    },

    concurrent: {
      server: ["sass:server", "copy:stageCss", "jekyll:server"],
      dist: ["sass:dist", "copy:dist"]
    }
  });

  // // // // // // // //
  // Define Tasks
  grunt.registerTask("serve", function(target) {
    if (target === "dist") {
      return grunt.task.run(["build", "browserSync:dist"]);
    }

    grunt.task.run([
      "clean:server",
      "concurrent:server",
      "autoprefixer:dist",
      "browserSync:server",
      "watch"
    ]);
  });

  grunt.registerTask("check", [
    "clean:server",
    "jekyll:check",
    "sass:server",
    "jshint:all",
    "csslint:check",
    "scsslint"
  ]);

  grunt.registerTask("build", [
    "jshint:all",
    "clean",
    "jekyll:dist",
    "concurrent:dist",
    "useminPrepare",
    "concat",
    "sass:dist",
    "autoprefixer:dist",
    "copy:dist",
    "usemin",
    "imagemin",
    "svgmin"
  ]);

  grunt.registerTask("b", ["build"]);
  grunt.registerTask("default", ["check", "build"]);
};

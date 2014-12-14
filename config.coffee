exports.config =
  # See http://brunch.readthedocs.org/en/latest/config.html for documentation.
  paths:
    watched: ['sonotone']
    public: 'bin'
  files:
    javascripts:
      defaultExtension: 'js'
      joinTo:
        'sonotone.js': /^sonotone/
      order:
        before: [
        ]
  plugins:
    jshint:
      pattern: /^sonotone\/.*\.js$/
      options:
        bitwise: true
        curly: true
      globals:
        jQuery: true
      warnOnly: true
    uglify:
      mangle: false
      compress:
        global_defs: 
          DEBUG: false

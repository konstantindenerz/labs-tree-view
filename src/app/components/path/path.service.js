export class PathService {
  constructor($rootScope, $log, $filter, $state, fs, path, chokidar) {
    'ngInject';
    this.$rootScope = $rootScope;
    this.$log = $log;
    this.$filter = $filter;
    this.$state = $state;
    this.$fs = fs;
    this.$path = path;
    this.$chokidar = chokidar;
    this.directories = {};
    this.root = {};
  }

  unwatchAll() {
    for (var path in this.directories) {
      var directory = this.directories[path];
      directory.watcher.close();
    }
    this.directories = {};
    delete this.root;
  }

  registerWatcher(normalizedPath, root) {
      if (this.directories.hasOwnProperty(normalizedPath)) return; // watcher exists
      var self = this;
      var watcher = this.$chokidar.watch(normalizedPath, {
        //ignored: /[\/\\]\./,
        persistent: true,
        ignoreInitial: false, // load files from directory
        depth: 0 // no recursion
      });

      this.directories[normalizedPath] = {
        watcher: watcher
      };



      watcher
        .on('add', function(path) {
          self.loadFile(path, self.root);
        })
        .on('change', function(path) {

        })
        .on('unlink', function(path) {

        })
        // More events.
        .on('addDir', function(path) {
          self.loadDirectory(path, self.root);

        })
        .on('unlinkDir', function(path) {
          self.unloadDirectory(path, self.root);
        })
        .on('error', function(error) {
          this.$log.error('Error happened', error);
        })
        .on('ready', function() {

        })
        .on('raw', function(event, path, details) {

        })

    }
    /**
      Start the watching of given path.
    */
  watchRoot(folderPath) {

    var normalizedPath = this.$path.normalize(folderPath);
    var path = this.$path.parse(folderPath)
      // root node
    var root = {
      key: path.base,
      details: {
        path: path,
        type: 'directory',
        isClosed: false,
        isDirectory: true
      },
      nodes: []
    };
    this.registerWatcher(normalizedPath, this.root);
    this.root = root;
    return root;
  }

  watch(node) {
    var normalizedPath = this.$path.format(node.details.path);
    this.registerWatcher(normalizedPath, this.root);
  }

  loadFile(nodePath, rootNode) {
    var path = this.$path.parse(nodePath);
    var file = {
      key: path.base,
      details: {
        path: path,
        type: 'file'
      },
      nodes: []
    };
    this.attachFile(rootNode, file);
  }

  attachFile(rootNode, file) {
      var self = this;
      this.$rootScope.$apply(function() {
        var path = self.$path.format(file.details.path);
        self.insert(path, rootNode, function loadDetails(node /*, parent*/ ) {
          angular.extend(node, file);

        });
      });
    }
    /**
      Add new dictionary to the model.
    */
  loadDirectory(nodePath, rootNode) {
    var path = this.$path.parse(nodePath);
    var d = {
      key: path.base,
      details: {
        path: path,
        type: 'dictionary',
        isClosed: true,
        isDirectory: true
      },
      nodes: []
    };
    if (rootNode.details.path.dir === path.dir && rootNode.details.path.base === path.base) {
      angular.extend(d, rootNode);
    } else {
      this.attachDirectory(rootNode, d);
    }
  }


  /**
    Removes the directory from model and
    stops the watcher for given dictionary if exists.
  */
  unloadDirectory(nodePath, rootNode) {
    var normalizedPath = this.$path.normalize(nodePath);
    this.detachDictionary(rootNode, normalizedPath);
    if (this.directories[normalizedPath]) {
      this.directories[normalizedPath].watcher.close();
      delete this.directories[normalizedPath];
    }
  }


  /**
    Removes the node from model and refresh root scope.
  */
  detachDictionary(rootNode, nodePath) {
    var self = this;
    this.$rootScope.$apply(function() {
      var path = self.$path.normalize(nodePath);
      self.remove(path, rootNode);
    });
  }


  /**
    Removes an existing node in the given node tree.
  */
  remove(nodePath, rootNode) {
    var path = this.$path.parse(nodePath);

    var rootPath = rootNode.details.path;
    if (path.dir.startsWith(rootPath.dir)) {
      var targetPath = path.dir.slice(rootPath.dir.length)
      var targetPathParts = this.cleanArray(targetPath.split(this.$path.sep));
      var parts = targetPathParts.slice(0);
      var parent = this.findParent(rootNode, parts, path.base);
      for (var i = 0; i < parent.nodes.length; i++) {
        var child = parent.nodes[i];
        if (child.key === path.base) {
          parent.nodes.splice(i, 1);
          break;
        }
      }
    }
  }


  /**
  Attach a directory to the node tree and refresh the root scope.
  */
  attachDirectory(rootNode, d) {
    var self = this;
    this.$rootScope.$apply(function() {
      var path = self.$path.format(d.details.path);
      self.insert(path, rootNode, function loadDetails(node /*, parent*/ ) {
        angular.extend(node, d);

      });
    });
  }

  /**
    Recursive function to find the parent and validate unique children key.
  */
  findParent(node, pathParts, childKey) {
    if (pathParts.length == 0) return;
    var firstElement = pathParts[0];

    if (node.key === firstElement) {
      pathParts.shift();
      for (var i = 0; i < node.nodes.length; i++) {
        var child = node.nodes[i];
        if (pathParts.length === 0 && child.key === childKey) {
          throw 'Target node exists.';
        }
        var result = this.findParent(child, pathParts, childKey);
        if (result) {
          return result;
        }
      }
      return node; // return last match
    } else {
      return;
    }
  }

  /**
    Remove all empty items from given array.
  */
  cleanArray(array) {
    var temp = [];

    for (var i = 0; i < array.length; i++) {
      if (array[i] !== '') temp.push(array[i]);
    }
    array = temp;
    return array;
  }

  /**
    Insert a new node in the node tree on the nodePath and
    call the callback to fill the node data if success.
  */
  insert(nodePath, rootNode, loadDetailsCallback) {

    try {


      var path = this.$path.parse(nodePath);

      var rootPath = rootNode.details.path;
      if (path.dir.startsWith(rootPath.dir)) {
        var targetPath = path.dir.slice(rootPath.dir.length)
        var targetPathParts = this.cleanArray(targetPath.split(this.$path.sep));
        var parts = targetPathParts.slice(0);
        var parent = this.findParent(rootNode, parts, path.base);
        //console.log(parent, parts);
        if (parts.length > 0) {
          // Create parent nodes or throw exception
          //console.warn('Create parent nodes or throw exception or ignore', parent, parts)
        } else {
          var newChild = {
            key: path.base
          };
          loadDetailsCallback(newChild, parent);
          parent.nodes.push(newChild);
        }
      }

    } catch (exception) {
      //this.$log.log(exception);
    }

  }

  load(path) {

    var files = this.$fs.readdirSync(path);

    var nodes = [];
    for (let file of files) {
      var fullFilename = this.$path.join(path, file);
      var f;

      f = this.$fs.lstatSync(fullFilename);

      var node = {
        path: fullFilename,
        name: file,
        isDirectory: f.isDirectory(),
        isClosed: true,
        type: f.isDirectory() ? 'directory' : 'file',
        hasChildren: f.isDirectory() ? this.$fs.readdirSync(fullFilename).length > 0 : false,
        extname: this.$path.extname(fullFilename)
      };

      nodes.push(node);
    }


    return nodes;
  }
}

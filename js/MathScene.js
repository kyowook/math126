(function() {
  var MarchingCubesModel, MathModel, MathScene, ParametricPathModel, PlaneShadowModel, VectorModel,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MathScene = (function() {
    MathScene.prototype.HEIGHT = 400;

    MathScene.prototype.WIDTH = 700;

    MathScene.prototype.shadow = null;

    MathScene.prototype.live = null;

    MathScene.prototype.guiActive = false;

    function MathScene(containerName) {
      this.renderloop = __bind(this.renderloop, this);
      if (containerName != null) {
        this.container = document.getElementById(containerName);
      } else {
        this.container = document.body.appendChild(document.createElement("div"));
      }
      this.container.style.position = "relative";
      this.populate();
      this.mathUp();
      this.live = true;
      this.shadow = false;
      this.guiActive = false;
    }

    MathScene.prototype.setrenderer = function() {
      if (Detector.webgl) {
        this.renderer = new THREE.WebGLRenderer({
          preserveDrawingBuffer: true,
          antialias: true
        });
        this.renderer.setClearColor(0x111111, 1);
      } else {
        this.renderer = new THREE.CanvasRenderer();
      }
    };

    MathScene.prototype.loader = new THREE.JSONLoader(true);

    MathScene.prototype.enableShadow = function() {
      this.renderer.shadowMapEnabled = true;
      this.renderer.shadowMapSoft = true;
      this.renderer.shadowMapBias = 0.0039;
      this.renderer.shadowMapDarkness = 1.0;
      this.renderer.shadowMapWidth = 1024;
      this.renderer.shadowMapHeight = 1024;
      return null;
    };

    MathScene.prototype.populate = function() {
      this.scene = new THREE.Scene();
      this.scene.add(new THREE.AmbientLight(0xffffff));
      this.scene.add(new THREE.DirectionalLight(0xffffff));
      if (!this.camera) {
        this.camera = new THREE.PerspectiveCamera(45, this.WIDTH / this.HEIGHT);
        this.camera.position.set(3, 3, 3);
      }
      if (this.shadow) {
        this.enableShadow();
        this.pointLight = new THREE.SpotLight(0xffffff);
        this.pointLight.castShadow = true;
      } else {
        this.pointLight = new THREE.PointLight(0xffffff);
      }
      this.pointLight.intensity = 1;
      this.pointLight.position.set(0, 0, 100);
      this.scene.add(this.pointLight);
      this.scene.add(this.camera);
      this.setrenderer();
      this.renderer.setSize(this.WIDTH, this.HEIGHT);
      this.renderer.domElement.style.position = "relative";
      this.container.appendChild(this.renderer.domElement);
      this.renderer.clear();
      this.gui = new dat.GUI({
        autoPlace: false
      });
      this.gui.domElement.style.position = "absolute";
      this.gui.domElement.style.left = 0;
      this.gui.domElement.style.top = 0;
      this.gui.close();
      this.cameraControls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
      this.cameraControls.target.set(0, 0, 0);
      return null;
    };

    MathScene.prototype.activateGui = function() {
      if (!this.guiActive) {
        this.container.appendChild(this.gui.domElement);
        this.guiActive = true;
      }
      return null;
    };

    MathScene.prototype.mathUp = function() {
      return this.camera.up = new THREE.Vector3(0, 0, 1);
    };

    MathScene.prototype.addaxes = function(length) {
      this.scene.add(new THREE.AxisHelper(length));
      return null;
    };

    MathScene.prototype.render = function() {
      if (this.live) {
        this.cameraControls.update();
        this.pointLight.position = this.camera.position;
      }
      this.renderer.render(this.scene, this.camera);
      return null;
    };

    MathScene.prototype.calc = function(t) {};

    MathScene.prototype.animate = function() {
      var framing, self;
      self = this;
      framing = function(t) {
        self.calc(t);
        self.render();
        if (self.live) {
          requestAnimationFrame(framing, self.container);
        }
        return null;
      };
      framing(new Date().getTime());
      return null;
    };

    MathScene.prototype.initTime = 3000;

    MathScene.prototype.renderloop = function() {
      this.live = true;
      return this.animate();
    };

    MathScene.prototype.init = function() {
      var T;
      T = new Date().getTime();
      this.live = false;
      this.render();
      return null;
    };

    MathScene.prototype.go = function() {
      this.init();
      return null;
    };

    return MathScene;

  })();

  MathModel = (function() {
    function MathModel() {}

    MathModel.prototype.calc = null;

    MathModel.prototype.needsGui = false;

    MathModel.embedInScene = function(model, mathScene) {
      var old_calc;
      model.mathScene = mathScene;
      model.embedObjects();
      old_calc = mathScene.calc;
      mathScene.calc = function(t) {
        if (model.calc != null) {
          model.calc()(t);
        }
        old_calc(t);
        return null;
      };
      if (model.needsGui) {
        mathScene.activateGui();
        model.addGui(mathScene.gui);
      }
      return null;
    };

    return MathModel;

  })();

  ParametricPathModel = (function(_super) {
    __extends(ParametricPathModel, _super);

    ParametricPathModel.prototype.limits = [-1, 1];

    ParametricPathModel.prototype.speed = 2;

    ParametricPathModel.prototype.resolution = 100;

    ParametricPathModel.prototype.mover = null;

    ParametricPathModel.prototype.calc = null;

    ParametricPathModel.prototype.objects = null;

    ParametricPathModel.prototype.needsGui = false;

    function ParametricPathModel(x, y, z, limits, speed) {
      var geometry, i, t, _i;
      this.x = x;
      this.y = y;
      this.z = z;
      if (limits == null) {
        limits = [-1, 1];
      }
      if (speed == null) {
        speed = 2;
      }
      this.limits = limits;
      this.speed = speed;
      this.mover = new THREE.Mesh(new THREE.SphereGeometry(0.03), new THREE.MeshNormalMaterial());
      this.calc = function() {
        var self;
        self = this;
        return function(t) {
          var T;
          T = self.speed * t / 1000;
          self.mover.position.set(self.x(T), self.y(T), self.z(T));
          return null;
        };
      };
      geometry = new THREE.Geometry();
      for (i = _i = 1; _i <= 100; i = ++_i) {
        t = this.limits[0] + (this.limits[1] - this.limits[0]) * i / 100.0;
        geometry.vertices.push(new THREE.Vector3(this.x(t), this.y(t), this.z(t)));
      }
      this.path = new THREE.Line(geometry, new THREE.LineBasicMaterial({
        color: 0xff0000
      }));
    }

    ParametricPathModel.prototype.embedObjects = function() {
      this.mathScene.scene.add(this.mover);
      return this.mathScene.scene.add(this.path);
    };

    return ParametricPathModel;

  })(MathModel);

  MarchingCubesModel = (function(_super) {
    __extends(MarchingCubesModel, _super);

    MarchingCubesModel.prototype.xmin = -3.00;

    MarchingCubesModel.prototype.xmax = 3.00;

    MarchingCubesModel.prototype.ymin = -3.00;

    MarchingCubesModel.prototype.ymax = 3.00;

    MarchingCubesModel.prototype.zmin = -3.00;

    MarchingCubesModel.prototype.zmax = 3.00;

    MarchingCubesModel.prototype.level = 0;

    MarchingCubesModel.prototype.func = null;

    MarchingCubesModel.prototype.resolution = 40;

    MarchingCubesModel.prototype.calc = null;

    MarchingCubesModel.prototype.smoothingLevel = 0;

    MarchingCubesModel.prototype.needsGui = false;

    MarchingCubesModel.prototype.name = "";

    MarchingCubesModel.prototype.surface = null;

    MarchingCubesModel.prototype.algorithm = null;

    function MarchingCubesModel(_arg) {
      this.func = _arg.func, this.xmin = _arg.xmin, this.xmax = _arg.xmax, this.ymin = _arg.ymin, this.ymax = _arg.ymax, this.zmin = _arg.zmin, this.zmax = _arg.zmax, this.resolution = _arg.resolution, this.smoothingLevel = _arg.smoothingLevel, this.material = _arg.material, this.name = _arg.name, this.algorithm = _arg.algorithm;
      if (this.xmin == null) {
        this.xmin = -3.00;
      }
      if (this.xmax == null) {
        this.xmax = 3.00;
      }
      if (this.ymin == null) {
        this.ymin = -3.00;
      }
      if (this.ymax == null) {
        this.ymax = 3.00;
      }
      if (this.zmin == null) {
        this.zmin = -3.00;
      }
      if (this.zmax == null) {
        this.zmax = 3.00;
      }
      if (this.resolution == null) {
        this.resolution = 40;
      }
      if (this.smoothingLevel == null) {
        this.smoothingLevel = 0;
      }
      if (this.material == null) {
        this.material = new THREE.MeshNormalMaterial({
          side: THREE.DoubleSide
        });
      }
      if (this.name == null) {
        this.name = "Surface";
      }
      this.debug = false;
      if (this.algorithm == null) {
        this.algorithm = "surfaceNets";
      }
      this.march_async(true);
      this.needsGui = true;
    }

    MarchingCubesModel.prototype.embedObjects = function() {
      this.march_async(true, this.algorithm);
      return null;
    };

    MarchingCubesModel.prototype.rerender = function() {
      var geom;
      if (this.mathScene != null) {
        this.mathScene.scene.remove(this.surface);
        console.log("surface removed");
        geom = this.march();
        this.surface = new THREE.Mesh(geom, this.material);
        console.log("surface constructed");
        this.mathScene.scene.add(this.surface);
        console.log("surface embedded");
      }
      return null;
    };

    MarchingCubesModel.prototype.rerender_async = function() {
      return this.march_async(true, this.algorithm);
    };

    MarchingCubesModel.prototype.addGui = function(gui) {
      var f;
      f = gui.addFolder(this.name);
      f.add(this, 'xmin').step(0.05);
      f.add(this, 'xmax').step(0.05);
      f.add(this, 'ymin').step(0.05);
      f.add(this, 'ymax').step(0.05);
      f.add(this, 'zmin').step(0.05);
      f.add(this, 'zmax').step(0.05);
      f.add(this, 'resolution', 40, 800).step(1);
      f.add(this, 'algorithm', ['marchingCubes', 'marchingTetrahedra', 'surfaceNets']);
      f.add(this, 'rerender_async');
      f.open();
      return null;
    };

    MarchingCubesModel.prototype.march_async = function(b, algorithm) {
      var blob, debug, e, f, mc, response, that, worker;
      if (algorithm == null) {
        algorithm = "marchingCubes";
      }
      that = this;
      debug = this.debug;
      window.URL = window.URL || window.webkitURL;
      f = this.func.toString();
      mc = null;
      if (this.algorithm === 'marchingCubes') {
        mc = marchingCubes.toString();
      } else if (this.algorithm === 'marchingTetrahedra') {
        mc = marchingTetrahedra.toString();
      } else if (this.algorithm === 'surfaceNets') {
        mc = surfaceNets.toString();
      }
      response = "" + algorithm + " = " + mc + "\nself.onmessage = function (e) {\n  output = " + algorithm + "([" + this.resolution + ", " + this.resolution + ", " + this.resolution + "], " + f + ", [[" + this.xmin + ", " + this.ymin + ", " + this.zmin + "],[" + this.xmax + ", " + this.ymax + ", " + this.zmax + "]]);\n  postMessage(output);\n  }";
      blob = null;
      try {
        blob = new Blob([response], {
          type: 'application/javascript'
        });
      } catch (_error) {
        e = _error;
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        blob = new BlobBuilder();
        blob.append(response);
        blob = blob.getBlob();
      }
      worker = new Worker(URL.createObjectURL(blob));
      worker.onmessage = function(e) {
        var flat_normals, flat_positions, geometry, new_surface, raw_data, smooth;
        raw_data = e.data;
        flat_positions = raw_data.positions;
        flat_normals = raw_data.normals;
        geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.BufferAttribute(flat_positions, 3));
        geometry.addAttribute('normal', new THREE.BufferAttribute(flat_normals, 3));
        smooth = geometry;
        new_surface = new THREE.Mesh(smooth, that.material);
        if (b) {
          if (that.mathScene != null) {
            that.mathScene.scene.remove(that.surface);
            console.log("surface removed");
            that.surface = new_surface;
            console.log("surface constructed");
            that.mathScene.scene.add(that.surface);
            console.log("surface embedded");
          }
        }
        return null;
      };
      worker.postMessage("Go!");
      return null;
    };

    MarchingCubesModel.prototype.modify = function(geometry) {
      var modifier, smooth;
      smooth = geometry.clone();
      smooth.mergeVertices();
      modifier = new THREE.SubdivisionModifier(this.smoothingLevel);
      modifier.modify(smooth);
      return smooth;
    };

    return MarchingCubesModel;

  })(MathModel);

  VectorModel = (function(_super) {
    __extends(VectorModel, _super);

    VectorModel.prototype.origin = null;

    VectorModel.prototype.vector = null;

    VectorModel.prototype.arrow = null;

    function VectorModel(_arg) {
      var color, dir, origin, vector;
      origin = _arg.origin, vector = _arg.vector, color = _arg.color;
      if (origin == null) {
        origin = [0, 0, 0];
      }
      this.orig = new THREE.Vector3(origin[0], origin[1], origin[2]);
      if (vector == null) {
        vector = [1, 0, 0];
      }
      this.vec = new THREE.Vector3(vector[0], vector[1], vector[2]);
      if (color == null) {
        color = 0xff00ff;
      }
      this.col = color;
      dir = this.vec.clone().normalize();
      this.arrow = new THREE.ArrowHelper(dir, this.orig.clone(), this.vec.length(), this.col);
      this.arrow.cone.material = new THREE.MeshLambertMaterial({
        ambient: this.col,
        color: 0xcccccc,
        opacity: 1.0
      });
      return;
    }

    VectorModel.prototype.embedObjects = function() {
      this.mathScene.scene.add(this.arrow);
      return null;
    };

    return VectorModel;

  })(MathModel);

  PlaneShadowModel = (function(_super) {
    __extends(PlaneShadowModel, _super);

    PlaneShadowModel.prototype.normal = null;

    PlaneShadowModel.prototype.position = null;

    PlaneShadowModel.prototype.xrange = null;

    PlaneShadowModel.prototype.yrange = null;

    function PlaneShadowModel(_arg) {
      var color, normal, position, s, xrange, yrange;
      normal = _arg.normal, position = _arg.position, xrange = _arg.xrange, yrange = _arg.yrange, color = _arg.color;
      if (position == null) {
        position = [0, 0, 0];
      }
      this.position = new THREE.Vector3(position[0], position[1], position[2]);
      if (normal == null) {
        normal = [0, 0, 1];
      }
      this.normal = new THREE.Vector3(normal[0], normal[1], normal[2]);
      if (xrange == null) {
        xrange = [-2, 2];
      }
      if (yrange == null) {
        yrange = [-2, 2];
      }
      this.xrange = xrange;
      this.yrange = yrange;
      if (color == null) {
        color = 0x555555;
      }
      this.color = color;
      this.plane = new THREE.Mesh(new THREE.PlaneGeometry(this.xrange[1] - this.xrange[0], this.yrange[1] - this.yrange[0]), new THREE.MeshPhongMaterial({
        ambient: this.color,
        color: 0x111111,
        specular: 0x0c0c0c,
        shininess: 60,
        side: THREE.DoubleSide
      }));
      this.plane.position = this.position;
      this.plane.quaternion = this.plane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.normal.normalize());
      this.plane.receiveShadow = true;
      this.spotLight = new THREE.DirectionalLight(0xffffff, 1);
      s = 10;
      this.spotLight.position.set(s * normal[0], s * normal[1], s * normal[2]);
      this.spotLight.castShadow = true;
      this.spotLight.shadowDarkness = 1.0;
      this.spotLight.shadowCameraFar = 20;
      this.spotLight.shadowCameraNear = 1;
      this.spotLight.shadowCameraLeft = -10;
      this.spotLight.shadowCameraRight = 10;
      this.spotLight.shadowCameraBottom = -10;
      this.spotLight.shadowCameraTop = 10;
      return;
    }

    PlaneShadowModel.prototype.embedObjects = function() {
      this.mathScene.enableShadow();
      this.mathScene.scene.add(this.plane);
      this.mathScene.scene.add(this.spotLight);
    };

    return PlaneShadowModel;

  })(MathModel);

  window.MathScene = MathScene;

  window.MathModel = MathModel;

  window.ParametricPathModel = ParametricPathModel;

  window.MarchingCubesModel = MarchingCubesModel;

  window.VectorModel = VectorModel;

  window.PlaneShadowModel = PlaneShadowModel;

}).call(this);

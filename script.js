let scene, camera, renderer, controls;

init();
loadModel();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 3);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById("viewer").appendChild(renderer.domElement);

  // Lights
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  // Controls (كمبيوتر + موبايل)
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = false;

  // Resize
  window.addEventListener("resize", onResize);
}

function loadModel() {
  const loader = new THREE.GLTFLoader();

  loader.load(
    "models/scene.gltf",
    (gltf) => {
      const model = gltf.scene;

      // ضبط الحجم والتمركز
      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);

      scene.add(model);

      // Zoom تلقائي على المودل
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      controls.target.copy(center);
      camera.position.set(
        center.x,
        center.y + size.y,
        center.z + size.z * 1.5
      );
      controls.update();
    },
    (xhr) => {
      console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
    },
    (error) => {
      console.error("Model load error:", error);
    }
  );
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

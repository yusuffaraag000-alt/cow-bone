let scene, camera, renderer, controls;

init();
loadModel();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0e0e);

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    500
  );
  camera.position.set(0, 1.5, 4);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.getElementById("viewer").appendChild(renderer.domElement);

  // Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(0x88aaff, 0.4);
  rimLight.position.set(-5, 5, -5);
  scene.add(rimLight);

  // Controls — تحريك كامل حول المودل
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = true;        // تفعيل التحريك الجانبي
  controls.enableZoom = true;       // تفعيل التكبير/التصغير
  controls.minDistance = 0.5;
  controls.maxDistance = 50;
  controls.maxPolarAngle = Math.PI; // تقدر تشوف المودل من كل الاتجاهات
  controls.minPolarAngle = 0;

  window.addEventListener("resize", onResize);
}

function loadModel() {
  const loader = new THREE.GLTFLoader();

  // DRACO Loader لتفريغ المودل المضغوط
  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    "cowq.glb", // اسم المودل
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      // توسيط المودل في المشهد بدون تعديل في شكله
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x += (model.position.x - center.x);
      model.position.y += (model.position.y - center.y);
      model.position.z += (model.position.z - center.z);

      // ضبط الكاميرا بشكل احترافي
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
      cameraZ *= 0.85;

      camera.position.set(0, size.y * 0.15, cameraZ);
      camera.lookAt(0, 0, 0);

      camera.near = maxDim / 100;
      camera.far = maxDim * 100;
      camera.updateProjectionMatrix();

      controls.target.set(0, 0, 0);
      controls.update();
    },
    (xhr) => {
      console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
    },
    (error) => { console.error("Model load error:", error); }
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

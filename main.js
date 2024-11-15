// Import Three.js and OrbitControls
import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./style.css";
//import glb loader
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
//gsap
import gsap from "gsap";

//load cubetexture from standard-cube-map
const cubeTextureLoader = new THREE.CubeTextureLoader();
const smokeTexture = new THREE.TextureLoader().load("whitePuff04.png");
const cubeTexture = cubeTextureLoader.load([
  "px.png",
  "nx.png",
  "py.png",
  "ny.png",
  "pz.png",
  "nz.png",
]);

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
scene.environment = cubeTexture;
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xeeeeee); // Light gray background
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Set up OrbitControls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true; // Smooth deceleration
// controls.dampingFactor = 0.25;
// controls.enableZoom = true;

// const radians45 = THREE.MathUtils.degToRad(45); // Convert 45 degrees to radians
// const radians30 = THREE.MathUtils.degToRad(20); // Convert 30 degrees to radians
// const radians75 = THREE.MathUtils.degToRad(75); // Convert 45 degrees to radians

// controls.minPolarAngle = Math.PI / 2 - radians45; // Minimum 45 degrees up
// controls.maxPolarAngle = Math.PI / 2 + radians30; // Maximum 45 degrees down

// controls.minAzimuthAngle = -radians75; // Minimum 45 degrees to the left
// controls.maxAzimuthAngle = radians30; // Maximum 45 degrees to the right

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const backgroundSphere = new THREE.Mesh(
  new THREE.SphereGeometry(100, 32, 32),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("background.png"),
    side: THREE.BackSide,
    //rotate the background image on the x-axis
  })
);
scene.add(backgroundSphere);

const diverLight = new THREE.PointLight(0xffffff, 20, 70); // Bright white light
diverLight.position.set(0, 5, 0); // Position it above the diver
diverLight.castShadow = true; // Enable shadow casting for the light
scene.add(diverLight);
// Position the camera

// // add lighthelper for diverLight
// const lightHelper = new THREE.PointLightHelper(diverLight);
// scene.add(lightHelper);

let mixer;

const loader = new GLTFLoader();
loader.load(
  "diver.glb",
  function (gltf) {
    // Access the scene from the loaded GLTF model
    scene.add(gltf.scene);

    // Scale the model
    gltf.scene.scale.set(2, 2, 2);

    // Position and adjust lighting above the diver
    const diverPosition = gltf.scene.position;
    diverLight.position.set(
      diverPosition.x,
      diverPosition.y + 5,
      diverPosition.z
    );

    // Traverse over children and apply a Matcap material
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshMatcapMaterial({
          matcap: new THREE.TextureLoader().load("matcap.png"),
          color: 0xffffff,
          reflectivity: 0.9,
          metalness: 0.9,
          roughness: 0.5,
        });
      }
    });

    // Check if animations are included in the GLTF file
    if (gltf.animations && gltf.animations.length > 0) {
      // Create an AnimationMixer
      mixer = new THREE.AnimationMixer(gltf.scene);

      // Play the first animation
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }
  },
  undefined,
  function (error) {
    console.error("An error occurred loading the model:", error);
  }
);

camera.position.z = 10;
//detect scroll

// loop 20x, make plane with smoke texture in random position with smoketexture
for (let i = 0; i < 500; i++) {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: smokeTexture,
      transparent: true,
      side: THREE.DoubleSide,
      opacity: 0.07,
    })
  );
  plane.position.set(
    Math.random() * 10 - 5,
    Math.random() * 10 - 5,
    Math.random() * 10 - 5
  );
  scene.add(plane);
}
window.addEventListener("scroll", () => {
  //get the scroll position
  let scroll = window.scrollY;
  // move the camera closer to the diver
  camera.position.z = 10 + scroll * -0.006;
  camera.updateProjectionMatrix();
});

// Rotate the cube and update controls
function animate() {
  requestAnimationFrame(animate);
  if (mixer) {
    const delta = clock.getDelta(); // Get the time elapsed since the last frame
    mixer.update(delta);
  }
  // controls.update(); // Required if damping is enabled
  renderer.render(scene, camera);
}

const clock = new THREE.Clock();

// Handle window resizing
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

animate();

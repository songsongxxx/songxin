// qqspace.js
// ✅ 使用 ES module CDN
//import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
//import { FBXLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/FBXLoader.js';
//import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';

// ✅ 使用 UNPKG 的 ES 模块 CDN（不能混用其他 CDN）


let mixer;
let smallMixer;
let model;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(155, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/');
const loader = new THREE.GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = true;
controls.enableRotate = true;
controls.minDistance = 0.01;
controls.maxDistance = 100;

// 红色坐标轴
const axisLength = 100;
const redMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
function createRedAxis(start, end) {
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, redMaterial);
}
scene.add(createRedAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(axisLength, 0, 0)));
scene.add(createRedAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, axisLength, 0)));
scene.add(createRedAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, axisLength)));

loader.load('hurtmice.glb', function (gltf) {
    model = gltf.scene;
    model.traverse((child) => {
        if (child.isMesh) {
            child.material.transparent = false;
            child.material.opacity = 1;
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material.map) {
                child.material.map.minFilter = THREE.NearestFilter;
                child.material.map.magFilter = THREE.NearestFilter;
                child.material.map.generateMipmaps = false;
                child.material.map.needsUpdate = true;
            }
        }
    });
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center);

    const pointLight = new THREE.PointLight(0xffffff, 10);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    model.position.set(0, 0, 0);
    model.scale.set(0.03, 0.03, 0.03);
    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
    });

    document.getElementById('loading').style.display = 'none';
    animate();
}, undefined, function (error) {
    console.error("❌ GLB 加载失败:", error);
});

// 删除聚光灯和光束相关代码
// const spotTarget = new THREE.Object3D();
// spotTarget.position.set(0, 0, 0); // 指向模型中心
// scene.add(spotTarget);

// const spot = new THREE.SpotLight(0xff2a2a, 4, 14, Math.PI / 9, 0.4, 2);
// spot.position.set(0, 5, 0); // 放在模型正上方
// spot.target = spotTarget;
// spot.castShadow = true;
// spot.shadow.mapSize.set(1024, 1024);
// spot.shadow.bias = -0.0001;
// scene.add(spot);
// scene.add(spot.target);

// const height = spot.distance || 10;
// const radius = Math.tan(spot.angle) * height;
// const coneGeo = new THREE.ConeGeometry(radius, height, 32, 1, true);
// coneGeo.translate(0, -height/2, 0);
// const coneMat = new THREE.MeshBasicMaterial({
//     color: 0xff2a2a,
//     transparent: true,
//     opacity: 0.22,
//     depthWrite: false,
//     blending: THREE.AdditiveBlending,
//     side: THREE.DoubleSide
// });
// const beam = new THREE.Mesh(coneGeo, coneMat);
// beam.position.copy(spot.position);
// scene.add(beam);

// const tmp = new THREE.Vector3();
// function updateBeam() {
//     spot.target.getWorldPosition(tmp);
//     beam.lookAt(tmp);
// }

// 用网格线替换地面
// 删除或注释原地面 mesh：
// const ground = new THREE.Mesh(
//     new THREE.PlaneGeometry(12, 12),
//     new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 })
// );
// ground.rotation.x = -Math.PI / 2;
// ground.position.y = -0.1;
// ground.receiveShadow = true;
// scene.add(ground);

// 新增线框地面
const grid = new THREE.GridHelper(12, 24, 0xff2222, 0x888888);
grid.position.y = -0.1;
scene.add(grid);

camera.position.set(0, 0.1, 0.29); // 例如设置初始距离为2
controls.update();

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    let distance = camera.position.length();
    const xinMsg = document.getElementById('xin-message');
    const body = document.body;
    if (distance < 0.15) { // 距离更近才触发
        ambientLight.color.set(0xff2222);
        directionalLight.color.set(0xff2222);
        renderer.setClearColor(0x000000, 1);
        if (xinMsg) xinMsg.style.display = 'block';
        body.classList.add('red-glow-all');
    } else {
        ambientLight.color.set(0xffffff);
        directionalLight.color.set(0xffffff);
        renderer.setClearColor(0xffffff, 1);
        if (xinMsg) xinMsg.style.display = 'none';
        body.classList.remove('red-glow-all');
    }

    if (mixer) mixer.update(0.016);
    if (smallMixer) smallMixer.update(0.016);

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    location.reload();
});
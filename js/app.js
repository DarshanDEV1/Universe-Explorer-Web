import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three@0.127.0/examples/jsm/renderers/CSS2DRenderer.js';
import { FBXLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/FBXLoader.js';

let scene, camera, renderer, labelRenderer, controls, raycaster, mouse;
let planets = [];

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 50);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Label Renderer
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.body.appendChild(labelRenderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enablePan = true;

    // Raycaster and Mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    // Create Planets and Other Objects
    createSun();
    createPlanets();
    loadExternalModels();

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onClick, false);
    window.addEventListener('touchstart', onTouchStart, false);
    window.addEventListener('touchmove', onTouchMove, false);

    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);
}

function createSun() {
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(geometry, material);
    sun.userData = { name: 'Sun' };
    scene.add(sun);

    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = 'Sun';
    div.style.marginTop = '-1em';
    const label = new CSS2DObject(div);
    label.position.set(0, 5, 0);
    sun.add(label);
}

function createPlanets() {
    const planetData = [
        { name: 'Mercury', size: 1, distance: 10, color: 0xaaaaaa },
        { name: 'Venus', size: 1.5, distance: 15, color: 0xffdd44 },
        { name: 'Earth', size: 2, distance: 20, color: 0x44aaff },
        { name: 'Mars', size: 1.2, distance: 25, color: 0xff4444 },
        { name: 'Jupiter', size: 4, distance: 30, color: 0xffaa44 },
        { name: 'Saturn', size: 3.5, distance: 35, color: 0xffcc66 },
        { name: 'Uranus', size: 2.5, distance: 40, color: 0x66ccff },
        { name: 'Neptune', size: 2.5, distance: 45, color: 0x6666ff },
    ];

    planetData.forEach(data => {
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: data.color });
        const planet = new THREE.Mesh(geometry, material);
        planet.position.x = data.distance;
        planet.userData = { name: data.name };
        scene.add(planet);
        planets.push(planet);

        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = data.name;
        div.style.marginTop = '-1em';
        const label = new CSS2DObject(div);
        label.position.set(0, data.size, 0);
        planet.add(label);
    });
}

function loadExternalModels() {
    const loader = new FBXLoader();

    // Load ISS
    loader.load('path/to/iss.fbx', function (object) {
        object.scale.set(0.01, 0.01, 0.01);
        object.position.set(10, 0, 10);
        object.userData = { name: 'International Space Station' };
        scene.add(object);
    });

    // Load Hubble Telescope
    loader.load('path/to/hubble.fbx', function (object) {
        object.scale.set(0.01, 0.01, 0.01);
        object.position.set(15, 0, 15);
        object.userData = { name: 'Hubble Telescope' };
        scene.add(object);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onClick() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        const object = intersects[0].object;
        alert(`You clicked on ${object.userData.name}`);
    }
}

function onTouchStart(event) {
    if (event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
}

function onTouchMove(event) {
    if (event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
}

function zoomIn() {
    camera.position.z -= 5;
}

function zoomOut() {
    camera.position.z += 5;
}

function animate() {
    requestAnimationFrame(animate);

    // Update planetary positions for basic orbital motion
    const time = Date.now() * 0.0001;
    planets.forEach((planet, index) => {
        planet.position.x = Math.cos(time * (index + 1)) * (10 + index * 5);
        planet.position.z = Math.sin(time * (index + 1)) * (10 + index * 5);
    });

    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

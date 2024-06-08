import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls, raycaster, mouse;
let planets = [];

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 50, 50);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

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

    // Stars background
    const starsGeometry = new THREE.SphereGeometry(500, 64, 64);
    const starsMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('textures/stars.jpg'),
        side: THREE.BackSide
    });
    const starField = new THREE.Mesh(starsGeometry, starsMaterial);
    scene.add(starField);

    // Create Sun
    createSun();

    // Create Planets
    createPlanets();

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onClick, false);

    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);
    document.getElementById('close-panel').addEventListener('click', closePanel);

    // Joystick controls
    const joystick = document.getElementById('joystick');
    joystick.addEventListener('pointerdown', onJoystickDown);
    joystick.addEventListener('pointermove', onJoystickMove);
    joystick.addEventListener('pointerup', onJoystickUp);
    joystick.addEventListener('pointercancel', onJoystickUp);
}

function createSun() {
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(geometry, material);
    sun.userData = { name: 'Sun', info: 'The Sun is the star at the center of the Solar System...' };
    scene.add(sun);
}

function createPlanets() {
    const planetData = [
        { name: 'Mercury', size: 1, distance: 10, texture: 'textures/mercury.jpg', info: 'Mercury is the closest planet to the Sun...', speed: 0.04 },
        { name: 'Venus', size: 1.5, distance: 15, texture: 'textures/venus.jpg', info: 'Venus is the second planet from the Sun...', speed: 0.03 },
        { name: 'Earth', size: 2, distance: 20, texture: 'textures/earth.jpg', info: 'Earth is the third planet from the Sun...', speed: 0.02 },
        { name: 'Mars', size: 1.2, distance: 25, texture: 'textures/mars.jpg', info: 'Mars is the fourth planet from the Sun...', speed: 0.017 },
        { name: 'Jupiter', size: 4, distance: 30, texture: 'textures/jupiter.jpg', info: 'Jupiter is the fifth planet from the Sun...', speed: 0.01 },
        { name: 'Saturn', size: 3.5, distance: 35, texture: 'textures/saturn.jpg', info: 'Saturn is the sixth planet from the Sun...', speed: 0.009 },
        { name: 'Uranus', size: 2.5, distance: 40, texture: 'textures/uranus.jpg', info: 'Uranus is the seventh planet from the Sun...', speed: 0.005 },
        { name: 'Neptune', size: 2.5, distance: 45, texture: 'textures/neptune.jpg', info: 'Neptune is the eighth planet from the Sun...', speed: 0.004 },
    ];

    planetData.forEach(data => {
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        const material = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load(data.texture) });
        const planet = new THREE.Mesh(geometry, material);
        planet.userData = { name: data.name, info: data.info, distance: data.distance, speed: data.speed };
        scene.add(planet);
        planets.push(planet);

        // Create Orbit Rings
        const ringGeometry = new THREE.RingGeometry(data.distance - 0.05, data.distance + 0.05, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onClick(event) {
    // Raycasting
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        // Check if clicked on a planet or external object
        if (planets.includes(obj)) {
            showInfoPanel(obj.userData.name, obj.userData.info);
        }
    }
}

function showInfoPanel(name, info) {
    const infoPanel = document.getElementById('info-panel');
    const infoContent = document.getElementById('info-content');

    infoContent.innerHTML = `
        <h2>${name}</h2>
        <p>${info}</p>
    `;
    infoPanel.style.display = 'block';
}

function closePanel() {
    document.getElementById('info-panel').style.display = 'none';
}

function zoomIn() {
    controls.dollyIn(1.2);
}

function zoomOut() {
    controls.dollyOut(1.2);
}

function onJoystickDown(event) {
    event.target.setPointerCapture(event.pointerId);
}

function onJoystickMove(event) {
    const joystick = document.getElementById('joystick');
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width    / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > rect.width / 2) {
        const angle = Math.atan2(deltaY, deltaX);
        controls.rotateLeft(angle);
    }
}

function onJoystickUp(event) {
    event.target.releasePointerCapture(event.pointerId);
}

function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Animate planets
    planets.forEach(planet => {
        const time = Date.now() * 0.001;
        const distance = planet.userData.distance;
        const speed = planet.userData.speed;

        planet.position.x = distance * Math.cos(time * speed);
        planet.position.z = distance * Math.sin(time * speed);
    });

    // Render scene
    renderer.render(scene, camera);
}


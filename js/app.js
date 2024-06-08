import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls, raycaster, mouse;
let planets = [];
let zoomFactor = 1;

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
    controls.enableZoom = true; // Enable default zoom

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
    window.addEventListener('touchmove', onTouchMove, false);
    window.addEventListener('touchend', onClick, false);

    document.getElementById('zoomIn').addEventListener('click', zoomIn);
    document.getElementById('zoomOut').addEventListener('click', zoomOut);
    document.getElementById('close-panel').addEventListener('click', closePanel);

    // Joystick controls
    const joystick = document.getElementById('joystick');
    joystick.addEventListener('pointerdown', onJoystickDown);
    joystick.addEventListener('pointermove', onJoystickMove);
    joystick.addEventListener('pointerup', onJoystickUp);
    joystick.addEventListener('pointercancel', onJoystickUp);

    const handle = document.createElement('div');
    handle.id = 'joystick-handle';
    joystick.appendChild(handle);
}

function createSun() {
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load('textures/sun.jpg') });
    // const material = createCustomMaterial();

    // const sunShaderCode = `
    //   // Copy and paste the shader code here from the provided document
    //   // Vertex shader
    //     #vertex shader
    //     // begin vertex shader
    //     precision highp float;

    //     attribute vec3 position;
    //     attribute vec2 uv;

    //     uniform mat4 modelViewMatrix;
    //     uniform mat4 projectionMatrix;

    //     varying vec2 vUv;

    //     void main() {
    //         vUv = uv;
    //         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    //     }
    //     // end vertex shader

    //     // Fragment shader
    //     #fragment shader
    //     // begin fragment shader
    //     precision highp float;

    //     uniform float iTime;
    //     uniform vec2 iResolution;
    //     uniform vec2 iMouse;

    //     varying vec2 vUv;

    //     void main() {
    //         vec2 uv = vUv;
    //         vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0, 2, 4));

    //         gl_FragColor = vec4(col, 1.0);
    //     }
    //     // end fragment shader
    // `;
    // const material = new THREE.RawShaderMaterial({
    //     vertexShader: sunShaderCode.match(/^((\/\/.*)?\r?\n|\/\*[\s\S]*?\*\/|[^\/])*?#\s*?vertex\s*?shader.*?\/\/\s*begin\s*?vertex\s*?shader([\s\S]*?)\/\/\s*end\s*?vertex\s*?shader/m)[3],
    //     fragmentShader: sunShaderCode.match(/^((\/\/.*)?\r?\n|\/\*[\s\S]*?\*\/|[^\/])*?#\s*?fragment\s*?shader.*?\/\/\s*begin\s*?fragment\s*?shader([\s\S]*?)\/\/\s*end\s*?fragment\s*?shader/m)[3],
    //     uniforms: {
    //         iTime: { value: 0 },
    //         iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    //         iMouse: { value: new THREE.Vector2(0, 0) }
    //     }
    // });

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
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onTouchMove(event) {
    if (event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
}

function onClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (planets.includes(obj)) {
            showInfoPanel(obj.userData.name, obj.userData.info);
        }
    }
}

function showInfoPanel(name, info) {
    const infoPanel = document.getElementById('info-panel');
    const infoContent = document.getElementById('info-content');
    infoContent.innerHTML = `<h2>${name}</h2><p>${info}</p>`;
    infoPanel.style.display = 'block';
}

function closePanel() {
    document.getElementById('info-panel').style.display = 'none';
}

function zoomIn() {
    camera.position.setLength(camera.position.length() * 0.8);
}

function zoomOut() {
    camera.position.setLength(camera.position.length() * 1.2);
}

function onJoystickDown(event) {
    event.target.setPointerCapture(event.pointerId);
}

function onJoystickMove(event) {
    const joystick = document.getElementById('joystick');
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;

    // Normalize deltaX and deltaY
    const maxDistance = rect.width / 2;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normalizedX = deltaX / maxDistance;
    const normalizedY = deltaY / maxDistance;

    // Apply joystick movement to camera controls
    controls.rotateLeft(normalizedX * 0.05);
    controls.rotateUp(normalizedY * 0.05);

    const handle = document.getElementById('joystick-handle');
    handle.style.left = `${Math.min(Math.max(deltaX + centerX - rect.left, 0), rect.width - handle.offsetWidth)}px`;
    handle.style.top = `${Math.min(Math.max(deltaY + centerY - rect.top, 0), rect.height - handle.offsetHeight)}px`;
}

function onJoystickUp(event) {
    const joystick = document.getElementById('joystick');
    const handle = document.getElementById('joystick-handle');
    handle.style.left = '50%';
    handle.style.top = '50%';
    event.target.releasePointerCapture(event.pointerId);
}

function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Animate planets
    const time = Date.now() * 0.001;
    planets.forEach(planet => {
        const distance = planet.userData.distance;
        const speed = planet.userData.speed;

        planet.position.x = distance * Math.cos(time * speed);
        planet.position.z = distance * Math.sin(time * speed);
    });

    // Render scene
    renderer.render(scene, camera);
}

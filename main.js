import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let scene, camera, renderer, hatObject;

init();
animate();

// Initialize the Three.js scene
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera setup
    camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 800);
    camera.position.set(5, 5, 5);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting setup
    const pointLight = new THREE.PointLight(0xffffcc, 20, 200);
    pointLight.position.set(4, 20, -20);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x20202A, 20, 100);
    scene.add(ambientLight);

    // Load the wizard hat model
    const loader = new GLTFLoader();
    loader.load('stylized_wizard_hat.glb', (data) => {
        hatObject = data.scene;
        hatObject.position.set(0, -5, 0);
        scene.add(hatObject);
    });

    // Load and display the credit text as 3D text in the scene
    const fontLoader = new FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        const textGeometry = new TextGeometry('Wizard Hat by Kateryna Babych', {
            font: font,
            size: 0.1,
            height: 0.01,
            curveSegments: 12,
        });
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position the text towards the bottom of the screen
        textMesh.position.set(-1, -3, 0);
        scene.add(textMesh);
    });

    // Update camera and renderer on window resize
    window.addEventListener('resize', onWindowResize, false);

    // Add mouse movement interaction
    document.onmousemove = function (e) {
        var centerX = window.innerWidth * 0.5;
        var centerY = window.innerHeight * 0.5;
        camera.position.x = (e.clientX - centerX) * 0.001;
        camera.position.y = (e.clientY - centerY) * 0.001;
        
    };
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


var frame = 0
// Animate the scene
function animate() {
    requestAnimationFrame(animate);
    frame += 1
    // Add particles following mouse 
    // Rotate the hat for effect
    if (hatObject) {
        hatObject.rotation.y += 0.01;
        hatObject.position.y = Math.cos(frame * 0.01) - 5;
    }

    renderer.render(scene, camera);
}

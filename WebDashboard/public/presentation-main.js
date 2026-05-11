import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// MOBILE / TOUCH DETECTION
// iPad iPadOS 13+ sends 'Macintosh' UA — must use touch detection!
// ==========================================
const isMobile = (
    navigator.maxTouchPoints > 1 ||
    ('ontouchstart' in window) ||
    (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches)
);

// GSAP ScrollTrigger mobile config — normalizeScroll is REQUIRED for iOS/iPadOS
if (isMobile) {
    // normalizeScroll creates a unified scroll proxy so iOS rubber-band scroll works
    ScrollTrigger.normalizeScroll({
        allowNestedScroll: true,
        lockAxis: false,
        momentum: self => Math.min(1, self.velocityY * 0.02),
        type: 'touch,wheel,pointer'
    });
    ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
    });
}

// ==========================================
// SCENE & CAMERA SETUP
// ==========================================
const canvasContainer = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x02040a, 0.005);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(25, 8, 45);

const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
// Lower resolution on mobile to keep 60fps
renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
canvasContainer.appendChild(renderer.domElement);

// ==========================================
// POST-PROCESSING (BLOOM EFFECT)
// ==========================================
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.85; 
// Reduce bloom on mobile for performance
bloomPass.strength = isMobile ? 0.08 : 0.15; 
bloomPass.radius = 0.5;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// ==========================================
// TOUCH 2: HOLOGRAPHIC GRID FLOOR
// ==========================================
const gridHelper = new THREE.GridHelper(300, 150, 0x00e5ff, 0x004466);
gridHelper.position.y = -20;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0; // Starts invisible
scene.add(gridHelper);

// ==========================================
// TOUCH 3: DYNAMIC SCAN RING
// ==========================================
const scanRingGeo = new THREE.TorusGeometry(35, 0.15, 16, 100);
const scanRingMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0 });
const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
scanRing.rotation.x = Math.PI / 2;
scene.add(scanRing);

// ==========================================
// TOUCH 8: SHOCKWAVE EXPANSION
// ==========================================
// Changed shockwave color from aggressive red to warm amber
const ringGeo = new THREE.RingGeometry(0.1, 1.5, 64);
const ringMat = new THREE.MeshBasicMaterial({ color: 0xff7700, transparent: true, opacity: 0, side: THREE.DoubleSide });
const shockwave = new THREE.Mesh(ringGeo, ringMat);
scene.add(shockwave);

// ==========================================
// CINEMATIC PARTICLES & SPARKS (Touch 1)
// ==========================================
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);
for(let i=0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 150; 
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 0.2, color: 0x00e5ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending 
});
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

// Sparks for Max Thrust
const sparksGeo = new THREE.BufferGeometry();
const sparksCount = 150;
const sparksPos = new Float32Array(sparksCount * 3);
const sparksVel = [];
for(let i=0; i<sparksCount; i++) {
    sparksPos[i*3] = 0; sparksPos[i*3+1] = 0; sparksPos[i*3+2] = 0;
    sparksVel.push(new THREE.Vector3((Math.random()-0.5)*3, (Math.random()-0.5)*3, Math.random()*8 + 5));
}
sparksGeo.setAttribute('position', new THREE.BufferAttribute(sparksPos, 3));
const sparksMat = new THREE.PointsMaterial({ size: 0.5, color: 0xff8800, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
const sparksMesh = new THREE.Points(sparksGeo, sparksMat);
scene.add(sparksMesh);

// ==========================================
// LIGHTING SETUP (FIXED BLACK ENGINE)
// ==========================================
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x112244, 1.2);
scene.add(hemiLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
mainLight.position.set(20, 30, 20);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0x00e5ff, 2.0);
fillLight.position.set(-20, -10, 10);
scene.add(fillLight);

// Changed from aggressive 0xff3300 to warm amber 0xff6600 — easier on the eyes
const heatLight = new THREE.DirectionalLight(0xff6600, 0);
heatLight.position.set(0, 0, 30);
scene.add(heatLight);

const coreGlow = new THREE.PointLight(0xff7700, 0, 150);
coreGlow.position.set(0, 0, 0);
scene.add(coreGlow);

// Dedicated light for the Robot to make it pop
const robotLight = new THREE.DirectionalLight(0xffffff, 0);
robotLight.position.set(10, 20, 15);
scene.add(robotLight);

// Touch: Strong Rim Light to highlight black metallic objects against the dark void
const robotRimLight = new THREE.DirectionalLight(0x00e5ff, 0);
robotRimLight.position.set(-15, 10, -20);
scene.add(robotRimLight);

const robotRimLight2 = new THREE.DirectionalLight(0xffffff, 0);
robotRimLight2.position.set(15, -5, -20);
scene.add(robotRimLight2);

// Ambient light specifically to lift shadows on the robot
const robotAmbientLight = new THREE.AmbientLight(0xffffff, 0);
scene.add(robotAmbientLight);

// ==========================================
// TOUCH 7: LENS FLARE (Fake)
// ==========================================
const flareGeo = new THREE.PlaneGeometry(25, 25); // Reduced size from 50 to 25
const flareCanvas = document.createElement('canvas');
flareCanvas.width = 256; flareCanvas.height = 256;
const ctx = flareCanvas.getContext('2d');
const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
gradient.addColorStop(0, 'rgba(255,200,100,0.8)');
gradient.addColorStop(0.2, 'rgba(255,50,0,0.4)'); // Softer orange
gradient.addColorStop(1, 'rgba(0,0,0,0)');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 256, 256);
const flareTex = new THREE.CanvasTexture(flareCanvas);
const flareMat = new THREE.MeshBasicMaterial({ map: flareTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
const lensFlare = new THREE.Mesh(flareGeo, flareMat);
scene.add(lensFlare);

// ==========================================
// VARIABLES & STATE
// ==========================================
let engineModel, robotModel;
let linesMesh; // Touch 15: Assembly Lines
const engineParts = [];
const originalPositions = new Map();
const originalRotations = new Map();
const explodeTargets = new Map();
const labeledParts = [];

const labelsContainer = document.getElementById('labels-container');
const effectState = { particleSpeed: 0.001, shake: 0, sparksActive: false }; 

// Touch 9: Raycaster Tooltip
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.getElementById('3d-tooltip');
const ttName = document.getElementById('tt-name');
let hoveredPart = null;

// ==========================================
// TOUCH 1 & 5: MOUSE PARALLAX & CUSTOM CURSOR
// ==========================================
let mouseX = 0, mouseY = 0;
const cursor = document.querySelector('.custom-cursor');
const cursorDot = document.querySelector('.cursor-dot');

// Only track mouse on non-touch devices
if (!isMobile) {
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Raycaster Mouse
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        if (cursor) { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; }
        if (cursorDot) { cursorDot.style.left = e.clientX + 'px'; cursorDot.style.top = e.clientY + 'px'; }
        
        if(tooltip) {
            tooltip.style.left = e.clientX + 'px';
            tooltip.style.top = e.clientY + 'px';
        }
    });

    document.querySelectorAll('.action-btn, .presentation-panel, .part-label').forEach(el => {
        el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hover'));
    });
} else {
    // Hide cursor elements on touch
    if (cursor) cursor.style.display = 'none';
    if (cursorDot) cursorDot.style.display = 'none';
}

// ==========================================
// TOUCH 6: SCRAMBLE TEXT HUD
// ==========================================
const scrambleEl = document.getElementById('system-nominal');
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
setInterval(() => {
    if(Math.random() > 0.8 && scrambleEl) {
        let text = scrambleEl.innerText.split('');
        const idx = Math.floor(Math.random() * text.length);
        if(text[idx] !== ' ' && text[idx] !== ':') {
            const oldChar = text[idx];
            text[idx] = chars[Math.floor(Math.random() * chars.length)];
            scrambleEl.innerText = text.join('');
            setTimeout(() => {
                text[idx] = oldChar;
                scrambleEl.innerText = text.join('');
            }, 100);
        }
    }
}, 500);

// ==========================================
// MODEL PROCESSING
// ==========================================
function processModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const globalCenter = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const targetSize = 25;
    const scale = targetSize / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);
    model.position.sub(globalCenter.clone().multiplyScalar(scale));

    const wrapper = new THREE.Group();
    wrapper.add(model);
    scene.add(wrapper);

    let originalMeshes = [];
    model.traverse((child) => {
        if (child.isMesh) {
            originalMeshes.push(child);
        }
    });

    let allMeshes = [];

    originalMeshes.forEach((child) => {
        child.geometry.computeVertexNormals();
        tweakMaterial(child.material);
        
        // Touch 2: Holographic Wireframe Clone for Deep Dive
        const wireMat = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, wireframe: true, transparent: true, opacity: 0,
            depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
        });
        const wireMesh = new THREE.Mesh(child.geometry, wireMat);
        child.add(wireMesh);
        child.userData.wireMat = wireMat;
        
        engineParts.push(child);
        originalPositions.set(child, child.position.clone());
        originalRotations.set(child, child.rotation.clone());

        child.geometry.computeBoundingBox();
        const meshCenter = child.geometry.boundingBox.getCenter(new THREE.Vector3());
        child.userData.center = meshCenter; 

        allMeshes.push(child);
    });

    allMeshes.sort((a,b) => {
        const boxA = new THREE.Box3().setFromObject(a);
        const boxB = new THREE.Box3().setFromObject(b);
        return boxB.getSize(new THREE.Vector3()).lengthSq() - boxA.getSize(new THREE.Vector3()).lengthSq();
    });

    const totalParts = allMeshes.length;
    const gridSize = Math.ceil(Math.cbrt(totalParts));
    const spacing = 30; // Increased spacing to prevent parts from overlapping! 

    allMeshes.forEach((mesh, index) => {
        const x = (index % gridSize) - (gridSize / 2);
        const y = (Math.floor(index / gridSize) % gridSize) - (gridSize / 2);
        const z = (Math.floor(index / (gridSize * gridSize))) - (gridSize / 2);

        const worldTargetPos = new THREE.Vector3(x * spacing, y * spacing, z * spacing);
        const localTargetPos = worldTargetPos.clone().divideScalar(scale);
        const finalPos = localTargetPos.clone().sub(mesh.userData.center);
        
        explodeTargets.set(mesh, finalPos);
    });
    
    // Touch 15: Holographic Assembly Lines setup
    const linesMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
    const linesGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(allMeshes.length * 6);
    linesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    linesMesh = new THREE.LineSegments(linesGeo, linesMat);
    wrapper.add(linesMesh);

    const numLabels = Math.min(4, allMeshes.length);
    const names = ["CORE MODULE", "COMPRESSOR RING", "COMBUSTION CASING", "TURBINE SECTION"];
    const offsets = [{ x: -60, y: -60 }, { x: 60, y: -90 }, { x: -90, y: 60 }, { x: 90, y: 90 }];

    for(let i=0; i<numLabels; i++) {
        const mesh = allMeshes[i];
        const div = document.createElement('div');
        div.className = 'part-label';
        div.innerHTML = `<div class="dot"></div><div class="line"></div><div class="text">${names[i%names.length]}<br><span>GRID ALIGNED</span></div>`;
        
        // Target Lock Interactive Effect
        div.addEventListener('mouseenter', () => div.classList.add('active'));
        div.addEventListener('mouseleave', () => div.classList.remove('active'));
        
        labelsContainer.appendChild(div);
        labeledParts.push({ mesh: mesh, element: div, offset: offsets[i%offsets.length] });
    }

    return wrapper;
}

function processRobotModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const globalCenter = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const targetSize = 25;
    const scale = targetSize / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);
    model.position.sub(globalCenter.clone().multiplyScalar(scale));

    const wrapper = new THREE.Group();
    wrapper.add(model);
    scene.add(wrapper);

    model.traverse((child) => {
        if (child.isMesh) {
            child.geometry.computeVertexNormals();
            tweakRobotMaterial(child.material);
        }
    });
    
    wrapper.visible = false;
    wrapper.scale.set(0.001, 0.001, 0.001);
    
    return wrapper;
}

function tweakRobotMaterial(mat) {
    if(Array.isArray(mat)) {
        mat.forEach(m => tweakRobotMaterial(m));
        return;
    }
    mat.side = THREE.DoubleSide;
    
    // Real Satin Metal base - grey, not white
    mat.color.setHex(0x777777); 

    if (mat.isMeshStandardMaterial) {
        mat.metalness = 0.9;  // Strong metallic feel
        mat.roughness = 0.4;  // Satin finish - subtle highlights, no mirror glare
        mat.emissive.setHex(0x000000);
    }
    
    // Force remove any emissive glow that might have come from the FBX
    if (mat.emissive) {
        mat.emissive.setHex(0x000000);
    }
}

function tweakMaterial(mat) {
    if(Array.isArray(mat)) {
        mat.forEach(m => tweakMaterial(m));
        return;
    }
    mat.side = THREE.DoubleSide;
    if (mat.isMeshStandardMaterial) {
        mat.metalness = Math.max(0.85, mat.metalness || 0);
        mat.roughness = Math.min(0.2, mat.roughness || 1);
        mat.emissive = new THREE.Color(0x000000); 
    }
}

// ==========================================
// LOADING MANAGER & CINEMATIC LETTERBOX
// ==========================================
const loadingScreen = document.createElement('div');
loadingScreen.id = 'loader';
loadingScreen.innerHTML = `<div class="spinner-container"></div><div id="loader-text">INITIALIZING HIGH-RES SCAN...</div>`;
document.body.appendChild(loadingScreen);

let modelsLoaded = 0;
function checkLoad() {
    modelsLoaded++;
    if(modelsLoaded === 2) {
        gsap.to(loadingScreen, {
            opacity: 0, duration: 1, ease: "power2.inOut",
            onComplete: () => {
                loadingScreen.remove();
                document.body.classList.add('loaded'); // Triggers Cinematic Letterbox
                gsap.from(camera.position, { x: 0, y: 0, z: 90, duration: 3, ease: "power3.out" });
            }
        });
        setupAnimations();
    }
}

const loader = new FBXLoader();
loader.load(
    'assets/Untitled1.fbx',
    (object) => {
        engineModel = processModel(object);
        checkLoad();
    },
    (xhr) => {
        if (modelsLoaded === 0) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            const text = document.getElementById('loader-text');
            if(text) text.innerText = `COMPILING MESH DATA ${percent}%`;
        }
    },
    (error) => console.error(error)
);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load(
    'assets/fullrobot.glb',
    (gltf) => {
        robotModel = processRobotModel(gltf.scene);
        checkLoad();
    },
    (xhr) => {
        if (modelsLoaded === 1) { // If engine is loaded, show robot progress
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            const text = document.getElementById('loader-text');
            if(text) text.innerText = `DECODING ROBOT GEOMETRY ${percent}%`;
        }
    },
    (error) => console.error(error)
);

// ==========================================
// GSAP SCROLL ANIMATIONS
// ==========================================
let isExploded = false;

function setupAnimations() {
    gsap.utils.toArray('.presentation-panel').forEach((panel) => {
        gsap.to(panel, {
            scrollTrigger: {
                trigger: panel.parentElement,
                start: "top 60%", end: "bottom 40%",
                toggleActions: "play reverse play reverse",
            },
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out"
        });
    });

    // Touch 4: Animated Progress Bars
    gsap.utils.toArray('.bar-fill').forEach((bar) => {
        gsap.to(bar, {
            scrollTrigger: {
                trigger: "#step4",
                start: "top center",
                toggleActions: "play reverse play reverse",
            },
            width: bar.dataset.target, duration: 1.5, ease: "power3.out"
        });
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#scroll-content",
            start: "top top", end: "bottom bottom",
            // Mobile: lower scrub = snappier, more responsive to touch
            scrub: isMobile ? 1.2 : 2.5,
            onUpdate: (self) => {
                const p = self.progress;

                // Timeline UI
                const progressEl = document.getElementById('timeline-progress');
                if(progressEl) progressEl.style.height = (p * 100) + '%';
                
                for(let i=1; i<=11; i++) {
                    const dot = document.getElementById('dot-step' + i);
                    if(dot) {
                        if (p >= (i-1)/10 - 0.05) {
                            dot.classList.add('active');
                        } else {
                            dot.classList.remove('active');
                        }
                    }
                }

                if(p > 0.1 && p < 0.4) {
                    if(!isExploded) {
                        isExploded = true;
                        labeledParts.forEach(p => p.element.style.opacity = '1');
                    }
                } else {
                    if(isExploded) {
                        isExploded = false;
                        labeledParts.forEach(p => p.element.style.opacity = '0');
                    }
                }
                // Tech Counter in Step 2 — kept minimal; auto-animation handles it via IntersectionObserver below
                // Just reset to 0 when far from step2
                if(p <= 0.04) {
                    const el = document.getElementById('tech-counter');
                    if(el && el._counted) {
                        el.innerText = '0';
                        el._counted = false;
                    }
                }
                
                // RPM Counter in Step 6
                if(p > 0.8) {
                    const rpm = Math.floor(((p - 0.8) / 0.2) * 35000);
                    const el = document.getElementById('rpm-counter');
                    if(el) el.innerText = rpm.toLocaleString();
                } else {
                    const el = document.getElementById('rpm-counter');
                    if(el) el.innerText = "0";
                }
            }
        }
    });

    const dur = 1;

    // STEP 1 -> 2: EXPLODE TO 3D GRID
    tl.to(camera.position, { x: 35, y: 15, z: 40, duration: dur, ease: "power2.inOut" }, 0);
    tl.to(bloomPass, { strength: 0.5, duration: dur }, 0); 
    tl.to(gridHelper.material, { opacity: 0.25, duration: dur }, 0); 
    tl.to(linesMesh.material, { opacity: 0.15, duration: dur }, 0); // Fade in Assembly Lines
    
    engineParts.forEach((part, index) => {
        const cascadeDelay = index * 0.003; // Magical Touch: Staggered Cascading Explosion
        tl.to(part.position, {
            x: explodeTargets.get(part).x, y: explodeTargets.get(part).y, z: explodeTargets.get(part).z,
            duration: dur, ease: "back.out(1.5)"
        }, cascadeDelay);
        tl.to(part.rotation, {
            x: originalRotations.get(part).x + Math.PI * 2, 
            y: originalRotations.get(part).y + Math.PI * 2,
            duration: dur, ease: "power2.inOut"
        }, cascadeDelay);
    });

    // NEW STEP 2 -> 3: FOUR LAYERS (Engine still exploded, slow pull-back pan)
    tl.to(camera.position, { x: 30, y: 12, z: 45, duration: dur, ease: "power1.inOut" }, dur);

    // NEW STEP 3 -> 4: VR CARD (Engine wraps up, held wide shot)
    tl.to(camera.position, { x: 20, y: 8, z: 50, duration: dur, ease: "power1.inOut" }, dur * 2);
    tl.to(bloomPass, { strength: 0.3, duration: dur }, dur * 2);

    // STEP 4 -> 5: DEEP DIVE -> ROBOT APPEARS
    tl.to(camera.position, { x: 0, y: 3, z: 32, duration: dur, ease: "power1.inOut" }, dur * 3);
    
    // Fog and Bloom adjustments
    tl.to(scene.fog, { density: 0.012 }, dur * 3); 
    tl.to(bloomPass, { strength: 0.2 }, dur * 3);
    
    // Hide engine
    tl.to(engineModel.scale, { x: 0.001, y: 0.001, z: 0.001, duration: dur/2, ease: "back.in(2)" }, dur * 3);
    tl.to(linesMesh.material, { opacity: 0, duration: dur/2 }, dur * 3);
    
    // Show and animate Robot (Boosted intensities for "Much Clearer" look)
    tl.to(robotLight, { intensity: 4.0, duration: dur }, dur * 3);
    tl.to(robotRimLight, { intensity: 6.0, duration: dur }, dur * 3);
    tl.to(robotRimLight2, { intensity: 4.0, duration: dur }, dur * 3);
    tl.to(robotAmbientLight, { intensity: 0.5, duration: dur }, dur * 3); // Subtle lift, not washout
    tl.to(robotModel, { visible: true, duration: 0.01 }, dur * 3);
    tl.to(robotModel.scale, { x: 0.45, y: 0.45, z: 0.45, duration: dur/2, ease: "back.out(2)" }, (dur * 3) + dur/2);
    tl.fromTo(robotModel.position, { y: -10 }, { y: -2, duration: dur, ease: "power1.out" }, dur * 3);

    // Scan Ring sweeps the robot
    tl.to(scanRingMat, { opacity: 1, duration: dur*0.2 }, dur * 3);
    tl.fromTo(scanRing.position, { z: -35 }, { z: 35, duration: dur, ease: "power1.inOut" }, dur * 3);
    tl.to(scanRingMat, { opacity: 0, duration: dur*0.2 }, (dur * 3) + dur*1.8);

    // STEP 5 -> 6: AI THREE ALGORITHMS (robot fades, camera floats)
    tl.to(camera.position, { x: 0, y: 5, z: 30, duration: dur, ease: "power1.inOut" }, dur * 4);
    tl.to(robotLight, { intensity: 0, duration: dur/2 }, dur * 4);
    tl.to(robotRimLight, { intensity: 0, duration: dur/2 }, dur * 4);
    tl.to(robotRimLight2, { intensity: 0, duration: dur/2 }, dur * 4);
    tl.to(robotModel.scale, { x: 0.001, y: 0.001, z: 0.001, duration: dur/2, ease: "back.in(2)" }, dur * 4);
    tl.to(scene.fog, { density: 0.005 }, dur * 4);
    tl.to(bloomPass, { strength: 0.15 }, dur * 4);
    tl.to(gridHelper.material, { opacity: 0, duration: dur }, dur * 4);

    // STEP 6 -> 7: AI CHATBOT (gentle pan, same environment)
    tl.to(camera.position, { x: -5, y: 4, z: 32, duration: dur, ease: "power1.inOut" }, dur * 5);

    // STEP 7 -> 8: THERMODYNAMICS -> ENGINE RETURNS
    tl.to(camera.position, { x: -15, y: -10, z: 35, duration: dur, ease: "power1.inOut" }, dur * 6);
    tl.to(particlesMesh.scale, { x: 1, y: 1, z: 1, duration: dur }, dur * 6);
    tl.to(engineModel.scale, { x: 1, y: 1, z: 1, duration: dur/2, ease: "back.out(2)" }, (dur * 6) + dur/2);
    engineParts.forEach((part) => {
        tl.to(part.position, { x: originalPositions.get(part).x, y: originalPositions.get(part).y, z: originalPositions.get(part).z, duration: 0.01 }, dur * 6);
        tl.to(part.rotation, { x: originalRotations.get(part).x, y: originalRotations.get(part).y, duration: 0.01 }, dur * 6);
    });

    // STEP 8 -> 9: WEB ANALYTICS (camera drifts gently)
    tl.to(camera.position, { x: 5, y: -5, z: 38, duration: dur, ease: "power1.inOut" }, dur * 7);

    // STEP 9 -> 10: SDG (slow ambient float)
    tl.to(camera.position, { x: -8, y: 3, z: 42, duration: dur, ease: "power1.inOut" }, dur * 8);

    // STEP 10 -> 11: MAX THRUST
    tl.to(camera.position, { x: 0, y: 2, z: 40, duration: dur, ease: "power1.inOut" }, dur * 9);
    tl.to(engineModel.rotation, { z: Math.PI * 12, duration: dur, ease: "power2.in" }, dur * 9);
    tl.to(particlesMesh.scale, { x: 0.15, y: 3.0, z: 0.15, duration: dur, ease: "power2.in" }, dur * 9);
    tl.to(coreGlow, { intensity: 18, duration: dur, ease: "power2.inOut" }, dur * 9);
    tl.to(heatLight, { intensity: 3, duration: dur, ease: "power2.inOut" }, dur * 9);
    tl.to(bloomPass, { strength: 0.18, duration: dur, ease: "power2.in" }, dur * 9);
    tl.to(effectState, { particleSpeed: 0.08, duration: dur, ease: "power2.in" }, dur * 9);
    tl.to(effectState, { shake: 0.03, duration: dur, ease: "power3.in" }, dur * 9);
    tl.to(flareMat, { opacity: 0.15, duration: dur }, dur * 9);
    tl.fromTo(shockwave.scale, { x: 0.1, y: 0.1, z: 0.1 }, { x: 60, y: 60, z: 60, duration: dur, ease: "power2.out" }, dur * 9);
    tl.fromTo(shockwave.material, { opacity: 0.35 }, { opacity: 0, duration: dur * 0.7, ease: "power3.out" }, dur * 9);

    // HUD Pulse
    const hudOverlay = document.querySelector('.hud-overlay');
    tl.to({}, {
        onUpdate: function() {
            if(this.progress() > 9/10 - 0.05 && this.progress() < 9/10 + 0.1) {
                hudOverlay.classList.add('danger');
                effectState.sparksActive = true;
                sparksMat.opacity = 1;
            } else {
                hudOverlay.classList.remove('danger');
                effectState.sparksActive = false;
                sparksMat.opacity = 0;
            }
        },
        duration: dur * 2,
        ease: "none"
    }, dur * 9);

    // STEP 10 -> 11: CONCLUSION
    tl.to(camera.position, { x: 0, y: 15, z: 60, duration: dur, ease: "power2.inOut" }, dur * 10);
    tl.to(engineModel.scale, { x: 0.001, y: 0.001, z: 0.001, duration: dur, ease: "power2.in" }, dur * 10);
    tl.to(particlesMesh.scale, { x: 0.001, y: 0.001, z: 0.001, duration: dur }, dur * 10);
    tl.to(coreGlow, { intensity: 0, duration: dur }, dur * 10);
    tl.to(heatLight, { intensity: 0, duration: dur }, dur * 10);
    tl.to(bloomPass, { strength: 0.05, duration: dur }, dur * 10);
    tl.to(robotAmbientLight, { intensity: 0, duration: dur }, dur * 10);
    tl.to(flareMat, { opacity: 0, duration: dur }, dur * 10);
}

// ==========================================
// RENDER LOOP
// ==========================================
const clock = new THREE.Clock();
const tempV = new THREE.Vector3();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Touch 1: Mouse Parallax Effect (Whole scene tilts slightly)
    scene.rotation.x = THREE.MathUtils.lerp(scene.rotation.x, mouseY * 0.05, 0.1);
    scene.rotation.y = THREE.MathUtils.lerp(scene.rotation.y, mouseX * 0.05, 0.1);

    if(engineModel && !ScrollTrigger.isScrolling()) {
        engineModel.position.y = Math.sin(time * 0.5) * 0.15;
    }
    
    // Auto-rotate robot continuously when visible
    if(robotModel && robotModel.visible && robotModel.scale.x > 0.01) {
        robotModel.rotation.y = time * 0.6; // Constant spin
    }

    if(particlesMesh) {
        particlesMesh.rotation.y += effectState.particleSpeed;
        particlesMesh.rotation.x += (effectState.particleSpeed * 0.5);
    }
    
    // Sparks Physics
    if(effectState.sparksActive && sparksMesh) {
        const positions = sparksMesh.geometry.attributes.position.array;
        for(let i=0; i<150; i++) {
            positions[i*3] += sparksVel[i].x * 0.1;
            positions[i*3+1] += sparksVel[i].y * 0.1;
            positions[i*3+2] += sparksVel[i].z * 0.1;
            
            if(positions[i*3+2] > 60) {
                positions[i*3] = (Math.random()-0.5)*2;
                positions[i*3+1] = (Math.random()-0.5)*2;
                positions[i*3+2] = 0;
            }
        }
        sparksMesh.geometry.attributes.position.needsUpdate = true;
    }
    
    // Touch 15: Animate Assembly Lines
    if(engineParts.length > 0 && linesMesh && linesMesh.material.opacity > 0) {
        const pos = linesMesh.geometry.attributes.position.array;
        engineParts.forEach((part, i) => {
            const p1 = originalPositions.get(part);
            const p2 = part.position;
            pos[i*6] = p1.x; pos[i*6+1] = p1.y; pos[i*6+2] = p1.z;
            pos[i*6+3] = p2.x; pos[i*6+4] = p2.y; pos[i*6+5] = p2.z;
        });
        linesMesh.geometry.attributes.position.needsUpdate = true;
    }
    
    lensFlare.lookAt(camera.position);

    // Touch 9: Interactive Tooltip
    if(engineParts.length > 0 && !ScrollTrigger.isScrolling()) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(engineParts, false);
        
        if(intersects.length > 0) {
            const object = intersects[0].object;
            if(hoveredPart !== object) {
                if(hoveredPart && hoveredPart.material.emissive) hoveredPart.material.emissive.setHex(0x000000);
                hoveredPart = object;
                if(hoveredPart.material.emissive) hoveredPart.material.emissive.setHex(0x001a33); 
                if(tooltip) tooltip.style.opacity = '1';
                if(ttName) ttName.innerText = "MODULE ID: 0x" + object.id.toString(16).toUpperCase();
                cursor.classList.add('hover');
            }
        } else {
            if(hoveredPart) {
                if(hoveredPart.material.emissive) hoveredPart.material.emissive.setHex(0x000000);
                hoveredPart = null;
                if(tooltip) tooltip.style.opacity = '0';
                cursor.classList.remove('hover');
            }
        }
    } else {
        if(tooltip) tooltip.style.opacity = '0';
    }

    if(isExploded && labeledParts.length > 0) {
        labeledParts.forEach(item => {
            tempV.copy(item.mesh.userData.center);
            tempV.applyMatrix4(item.mesh.matrixWorld);
            tempV.project(camera);
            
            const x = (tempV.x * 0.5 + 0.5) * window.innerWidth + item.offset.x;
            const y = (tempV.y * -0.5 + 0.5) * window.innerHeight + item.offset.y;
            
            item.element.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    const lookAtTarget = new THREE.Vector3(0, 0, 0);
    if (effectState.shake > 0) {
        lookAtTarget.x = (Math.random() - 0.5) * effectState.shake;
        lookAtTarget.y = (Math.random() - 0.5) * effectState.shake;
    }
    camera.lookAt(lookAtTarget);
    
    composer.render();
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// AUTO COUNTER — Engineering Gap (710,000)
// ==========================================
(function() {
    const el = document.getElementById('tech-counter');
    if (!el) return;
    const target = 710000;
    const duration = 2400; // ms — smooth ease-out
    let animFrame;

    function runCounter() {
        if (el._counted) return;
        el._counted = true;
        const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.innerText = Math.floor(eased * target).toLocaleString();
            if (progress < 1) {
                animFrame = requestAnimationFrame(tick);
            } else {
                el.innerText = target.toLocaleString();
            }
        }
        animFrame = requestAnimationFrame(tick);
    }

    const step2 = document.getElementById('step2');
    if (!step2) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runCounter();
            } else {
                cancelAnimationFrame(animFrame);
                el._counted = false;
                el.innerText = '0';
            }
        });
    }, { threshold: 0.25 });

    observer.observe(step2);
})();

// ==========================================
// VIDEO SLOWDOWN — AI Chatbot Demo (0.6x)
// ==========================================
(function() {
    function applySlowVideo() {
        document.querySelectorAll('video').forEach(v => {
            v.playbackRate = 0.6;
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applySlowVideo);
    } else {
        applySlowVideo();
    }
    setTimeout(applySlowVideo, 1200);
})();

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Add loading overlay after canvas
const canvasHtml = `        <!-- The Canvas that renders the 3D rotating frames -->\n        <canvas id="vr-canvas"></canvas>`;
if (html.includes(canvasHtml)) {
    html = html.replace(canvasHtml, `${canvasHtml}

        <!-- Loading Overlay for 3D Model -->
        <div id="vr-loading-overlay">
            <div class="vr-spinner"></div>
            <div id="vr-loading-text">Loading 3D Engine...</div>
        </div>`);
}

// 2. Replace the script sequence completely
// We will replace everything from "// ─── SMART DYNAMIC CANVAS ENGINE ───" down to "        }, 3.5);"
// then replace the script block cleanly.

const newScript = `// ─── 3D CINEMATIC ENGINE ───
        gsap.registerPlugin(ScrollTrigger);

        const canvas = document.getElementById("vr-canvas");
        const loadingOverlay = document.getElementById("vr-loading-overlay");
        const loadingText = document.getElementById("vr-loading-text");

        // Scene Setup
        const scene = new THREE.Scene();
        
        // Camera Setup
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.outputEncoding = THREE.sRGBEncoding;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 2);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0x00f2ff, 1.2);
        fillLight.position.set(-5, 0, -5);
        scene.add(fillLight);

        const backLight = new THREE.PointLight(0xff00ff, 2, 20);
        backLight.position.set(0, 3, -5);
        scene.add(backLight);

        // Load 3D Model
        let questModel = null;
        let isVideoTransitioned = false;

        // Make sure three cdn is present
        if(!window.THREE) { console.error("THREE not loaded"); }
        if(!THREE.GLTFLoader) { console.error("GLTFLoader not loaded"); }
        const loader = new THREE.GLTFLoader();
        
        loader.load('assets/quest3.glb', function (gltf) {
            questModel = gltf.scene;
            
            // Center model
            const box = new THREE.Box3().setFromObject(questModel);
            const center = box.getCenter(new THREE.Vector3());
            questModel.position.x += (questModel.position.x - center.x);
            questModel.position.y += (questModel.position.y - center.y);
            questModel.position.z += (questModel.position.z - center.z);
            
            // Initial positioning & scale
            questModel.scale.set(1.4, 1.4, 1.4); 
            // Position for aesthetic front branding look
            questModel.rotation.y = 0; 
            questModel.rotation.x = 0;
            scene.add(questModel);

            // Hide loader smoothly
            gsap.to(loadingOverlay, { opacity: 0, duration: 0.5, onComplete: () => { if(loadingOverlay) loadingOverlay.style.display = 'none'; } });

            // Setup GSAP Animation
            setupScrollAnimation();
            
        }, undefined, function (error) {
            console.error('An error happened loading the GLB', error);
            if (loadingText) loadingText.innerText = "Error Loading 3D Model.";
        });

        // Resize handler
        window.addEventListener('resize', onWindowResize, false);
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        // Animation Loop
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            // Idle hover effect before scrolling begins
            if (questModel && window.scrollY < 50) {
                const time = clock.getElapsedTime();
                questModel.position.y = Math.sin(time * 1.5) * 0.05;
            } else if (questModel && window.scrollY >= 50) {
            	// Reset hover effect when scrolling to ensure clean animation path
                questModel.position.y = 0;
            }
            renderer.render(scene, camera);
        }
        animate();

        // ─── SCROLL TRIGGER SEQUENCE ───
        function setupScrollAnimation() {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#scroll-stage",
                    start: "top top",     
                    end: "+=4000",        
                    pin: true,            
                    scrub: 1,             
                    anticipatePin: 1
                }
            });

            tl.to("#stage-text", { opacity: 0, y: -50, duration: 0.5 }, 0);

            // Phase 1: Rotate to show lenses (Math.PI / 180 degrees)
            tl.to(questModel.rotation, {
                y: Math.PI,     // rotate to show lenses!
                x: 0,
                ease: "none",
                duration: 1.5
            }, 0);

            // Move camera slightly closer during rotation
            tl.to(camera.position, {
                z: 2.5,
                ease: "power2.inOut",
                duration: 1.5
            }, 0);

            // Phase 2: Push camera directly into the lenses inside
            tl.to(camera.position, {
                z: -1, // Push straight through the center
                ease: "power3.in",
                duration: 1.5
            }, 1); // execute after duration 1 (while rotating finishes)

            // Phase 3: Fade out canvas entirely exactly when clipping starts
            tl.to(canvas, {
                opacity: 0,
                ease: "power2.inOut",
                duration: 0.5
            }, 2.0);

            // Phase 4: Reveal and play video under the exact timeframe
            tl.fromTo("#video-container", {
                opacity: 0,
                scale: 0.95
            }, {
                opacity: 1,
                scale: 1,
                ease: "power2.out",
                duration: 1,
                onStart: () => {
                    const vid = document.getElementById('demo-video');
                    if (vid && vid.paused && !isVideoTransitioned) {
                        isVideoTransitioned = true;
                        vid.play().catch(e => console.log('Video autoplay blocked:', e));
                    }
                }
            }, 2.2);
        }`;

// Replace script lines
const startMarker = "// ─── SMART DYNAMIC CANVAS ENGINE ───";
const endMarker = "        }, 3.5);";

const startIndex = html.indexOf(startMarker);
const endIndex = html.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const beforeScript = html.substring(0, startIndex);
    const afterScript = html.substring(endIndex + endMarker.length);
    html = beforeScript + newScript + "\n" + afterScript;
}

// Add ThreeJS CDNs above GSAP
if(!html.includes("three.min.js")) {
    html = html.replace(\`<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>\`,
        \`<!-- Three.js + GLTFLoader -->\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>\n\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>\`);
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log("SUCCESS");

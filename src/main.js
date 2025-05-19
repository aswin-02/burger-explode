import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
gsap.registerPlugin(ScrollTrigger);

// Init Lenis
// const lenis = new Lenis();

// function raf(time){
//   lenis.raf(time);
//   requestAnimationFrame(raf);
// }

// requestAnimationFrame(raf);

function loadSvg(){
  fetch("./assets/burger.svg")
  .then((response) => {return response.text();})
  .then((svg) => {
    document.getElementById("burger").innerHTML = svg;
    document.querySelector("#burger svg").setAttribute("preserveAspectRatio","xMidYMid slice");
    setAnimationScroll();
  })
}

loadSvg();
function setAnimationScroll(){
  let runAnimation = gsap.timeline(
    {
      scrollTrigger:{
        trigger:"#burger-container",
        start:"top top",
        end:"+=1000",
        scrub:true,
        pin:true
      }
    }
  );


  runAnimation.add([
    gsap.to("#cover", 10, {
      // duration: 10,
      x:150,
      y:-100,
      rotate: 14,
      opacity:0,
      scrub:true,
      ease: "back.out",
    })
  ])
  .add([
    gsap.to("#top-bun", 30, {
      y: -600,
      ease: "back.out",
    })
  ])
  .add([
    gsap.to("#spinach", 30, {
      y: -500,
      ease: "back.out",
    })
  ])
  .add([
    gsap.to("#tomato", 30, {
      y: -300,
      ease: "back.out",
    })
  ])
  .add([
    gsap.to("#cheese", 30, {
      y: -200,
      ease: "back.out",
    }),
    gsap.to("#ham", 7, {
      y: -100,
      ease: "back.out",
    })
  ])
  .add([
    gsap.to('.paper-folding', 40, {
      x: 350,
      y: 350,
      // ease: "back.out",
    })
  ])
}

document.addEventListener("DOMContentLoaded", function () {
  const modelContainer = document.getElementById("model-container");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.z = 5;
  camera.position.y = 0;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  modelContainer.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight1.position.set(1, 1, 1);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight2.position.set(-1, 0.5, -1);
  scene.add(directionalLight2);

  let model;
  let modelLoaded = false;
  let modelRotation = { x: 0, y: 0, z: 0 };

  function getResponsiveScale(maxDim) {
    const isMobile = window.innerWidth <= 768;
    return isMobile ? 1 / maxDim : 2 / maxDim;
  }

  loadModel();

  function loadModel() {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "/assets/model/scene.gltf",
      function (gltf) {
        model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = getResponsiveScale(maxDim);
        model.scale.set(scale, scale, scale);

        model.position.x = -center.x * scale  + 2;
        model.position.y = -center.y * scale; // increased for better alignment
        model.position.z = -center.z * scale;

        scene.add(model);

        modelLoaded = true;

        setupScrollAnimations();
      },

      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },

      function (error) {
        console.error("An error happened while loading the model:", error);
      }
    );
  }

  function setupScrollAnimations() {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".model-wrapper",
        start: "top top",
        end: "bottom bottom",
        pin: "#model-container",
        scrub: 1,
      }
    });

    tl.to(modelRotation, {
      x: Math.PI / 6,
      y: Math.PI * 2, // full spin
      duration: 2,
      ease: "none",
      onUpdate: () => updateModel()
    })
    .to(modelContainer, {
      x: -200,
      duration: 2,
      ease: "none",
      onUpdate: () => updateModel()
    });
  }

  function updateModel() {
    if (model) {
      model.rotation.x = modelRotation.x;
      model.rotation.y = modelRotation.y;
      model.rotation.z = modelRotation.z;
    }
  }



  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  animate();
});
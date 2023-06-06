import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import * as TWEEN from 'tween';

document.querySelector('#app').innerHTML = `
  <div>
   
  </div>
`

// setupCounter(document.querySelector('#counter'))
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  
  return color;
}




const scene = new THREE.Scene();

// const axesGroup = new THREE.Group();
// scene.add(axesGroup);

// const axeshelper = new THREE.AxesHelper(50);
// scene.add(axeshelper)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);


// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);

// orbit controls
const orbit = new OrbitControls(camera,renderer.domElement);

camera.position.set(0,0,100);
camera.lookAt(scene.position);
orbit.update()

let startPosition = 0;

let cubes = []
let temp;

let size = 10
let width = 10
let gap = 15

// plane
const planeGeometry = new THREE.PlaneGeometry(500,500);
const planeMaterial = new THREE.MeshBasicMaterial({color : "pink"});
const plane = new THREE.Mesh(planeGeometry,planeMaterial);
plane.rotation.x = -0.5 * Math.PI 

// scene.add(plane);

// gridhelper 
// const gridHelper = new THREE.GridHelper(60);
// scene.add(gridHelper);

function swap(object1,object2){
  console.log('swapping',object1,object2)
  const position1 = { x: object1.position.x};
  const position2 = { x: object2.position.x};
  console.log(position1,position2)
  new TWEEN.Tween(object1.position)
    .to({ x: position2.x }, 800)
    .easing(TWEEN.Easing.Quadratic.Out) 
    // .onUpdate(() => {
    //   object1.position.setX(position2.x);
    // })
    .start();
  new TWEEN.Tween(object2.position)
    .to({ x: object1.position.x }, 800)
    .easing(TWEEN.Easing.Quadratic.Out) 
    // .onUpdate(() => {
    //   object2.position.setX(position1.x);
    // })
    .start();
  console.log(cubes);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addBorder(object){
  console.log('adding border to',object)
  const wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
  const border = new THREE.Mesh(object.geometry, wireframeMaterial);
  scene.add(border)
}


async function bubbleSort(){
  console.log('sorting');
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size - i - 1; j++) {
          let temp1 = cubes[j].material
          let temp2 = cubes[j+1].material
          await delay(500);
          cubes[j].material = new THREE.MeshBasicMaterial({color : "white"});
          cubes[j+1].material = new THREE.MeshBasicMaterial({color : "white"});
          await delay(500);
          if(cubes[j].geometry.parameters.height > cubes[j+1].geometry.parameters.height){
            swap(cubes[j],cubes[j+1]);
            [cubes[j],cubes[j+1]] = [cubes[j+1],cubes[j]]
            cubes[j].material = temp2;
            cubes[j+1].material = temp1;
          } else{
            cubes[j].material = temp1;
            cubes[j+1].material = temp2;  
          }
        }
        await delay(600);
        cubes[size - i - 1].material.opacity = .3;
    }
}


async function insertionSort(){
  for(let i = 1 ; i < size ; i++){
    scene.remove(cubes[i])
    await delay(500)
    let key = cubes[i]

    // cloning key element in array
    temp = new THREE.Mesh(key.geometry.clone(), key.material.clone());
    temp.position.x = key.position.x
    temp.position.y = key.position.y
    scene.add(temp)

    await delay(500)
    // cubes[i].material = new THREE.MeshBasicMaterial({color : "white"});
    // moving temp cube away from other cubes
    new TWEEN.Tween(temp.position)
    .to({ x : -50 }, 800)
    .easing(TWEEN.Easing.Quadratic.Out) 
    .start();

    let j = i - 1;

    while(j >= 0 && cubes[j].geometry.parameters.height > temp.geometry.parameters.height){
      await delay(500)
      // moving temp cube to next position ie j to j+1 position
      new TWEEN.Tween(cubes[j].position)
        .to({ x : cubes[j + 1].position.x }, 800)
        .easing(TWEEN.Easing.Quadratic.Out) 
        .start();
      
      cubes[j + 1] = cubes[j];
      j--;
      // 
    }
    
    await delay(500)
    new TWEEN.Tween(temp.position)
      .to({ x : cubes[j + 1].position.x }, 800)
      .easing(TWEEN.Easing.Quadratic.Out) 
      .start();
    cubes[j + 1] = temp
  }

}


function randomizeArray(){
  cubes.forEach(cube => {
    scene.remove(cube);
  })
  scene.remove(temp)
  cubes = []
  generateArray()
}

function generateArray(){
  for(let i = 0 ; i < size ; i++){
    let height = Math.random() * (50 - 3) + 3
    
    // box
    const boxGeometry = new THREE.BoxGeometry(width,height,5);
    const boxMaterial = new THREE.MeshBasicMaterial(
        {
            color : getRandomColor()
        }
    );
    const box = new THREE.Mesh(boxGeometry,boxMaterial);
    box.material.transparent = true;
    scene.add(box)
    cubes.push(box)
    box.position.y = height / 2
    box.position.x = startPosition + gap * i
  }
}


window.addEventListener("keypress",(e) => {
  if(e.keyCode == "32"){
    sort();
  }else if(e.keyCode == "114"){
    randomizeArray()
  }
})

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    // Render the scene with the camera
    TWEEN.update();
    renderer.render(scene, camera);
}

// Start the animation loop
animate();
generateArray();

console.log(cubes)

document.querySelector("button.randomize").addEventListener("click",(e) => randomizeArray())
document.querySelector("button.bubbleSort").addEventListener("click",(e) => bubbleSort())
document.querySelector("button.insertionSort").addEventListener("click",(e) => insertionSort())






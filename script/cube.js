
var renderer;
var width;
var height;
var unit = 50;
var cubes = [];
var colors = [0xFFFFFF, 0xFF0000, 0x00FF00, 0x0000FF, 0x00FFFF, 0xFF8000]
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.webkitRequestAnimationFrame;
})();

function begin() {
    initThree();
    initCamera();
    initScene();
    initLight();
    initObject();
    render();
}

function initThree() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer = new THREE.WebGLRenderer({
        antialias : true
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0xFFFFFF, 1.0);
    document.getElementById('canvas-frame').appendChild(renderer.domElement);
}

var camera;
var controller;
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.z = 600;
    camera.up.y = 1;
    controller = new THREE.OrbitControls(camera, render.domElement);
    controller.target = new THREE.Vector3(0, 0, -75);
}

var scene;
function initScene() {
    scene = new THREE.Scene();
    drawCubes();
    for (let cube of cubes)
        scene.add(cube)
}

var light;
function initLight() {
    light = new THREE.AmbientLight(0xfefefe);
    scene.add(light);
}

var cubes
function initObject() {
}

function render(){
    renderer.clear();
    renderer.render(scene, camera);
    window.requestAnimFrame(render);
}

function drawCubes() {
    for (let i = -1; i < 2; ++i)
        for (let j = -1; j < 2; ++j)
            for (let k = -1; k < 2; ++k) {
                let geometry = new THREE.BoxGeometry( unit, unit, unit );
                for (let index = 0; index < 6; index++) {
					geometry.faces[2 * index].color.setHex(colors[index]);
					geometry.faces[2 * index + 1].color.setHex(colors[index]);
				}
                let material = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, overdraw: 0.5 });
                let cube = new THREE.Mesh( geometry, material );
                cube.position.x = i * unit;
                cube.position.y = j * unit;
                cube.position.z = k * unit;
                cubes.push(cube);
			}
}
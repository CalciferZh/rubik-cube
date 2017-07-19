
var renderer;
var width;
var height;
var unit = 50;
var cubes = [];
var colors = ['#60ff50', '#30a0ff', '#efff50', '#ffffff', '#ffa000', '#ff0000', '#000000'];

var camera;
var controller;
var scene;
var light;
var cubes;
var canRotate=true;


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
    window.addEventListener('keydown', handleKeyDown);
}

function initThree() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0F0F0, 1.0);
    document.getElementById('canvas-frame').appendChild(renderer.domElement);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.z = 600;
    camera.up.y = 1;
    controller = new THREE.OrbitControls(camera, render.domElement);
    controller.target = new THREE.Vector3(0, 0, -75);
}

function initScene() {
    scene = new THREE.Scene();
    drawCubes();
    for (let cube of cubes)
        scene.add(cube)
}

function initLight() {
    light = new THREE.AmbientLight(0xfefefe);
    scene.add(light);
}

function initObject() {
}

function render(){
    renderer.clear();
    renderer.render(scene, camera);
    window.requestAnimFrame(render);
}

function drawCubes() {
    let canvases = generateCanvases();
    for (let i = -1; i < 2; ++i)
        for (let j = -1; j < 2; ++j)
            for (let k = -1; k < 2; ++k) {
                let geometry = new THREE.BoxGeometry( unit, unit, unit );
                let material = generateMaterial(canvases, i, j, k);
                let cube = new THREE.Mesh( geometry, material );
                cube.position.x = i * unit;
                cube.position.y = j * unit;
                cube.position.z = k * unit;
                cubes.push(cube);
			}
}
function generateCanvases(){
    let canvases = [];
    for (let color of colors) {
        let canvas = document.createElement('canvas');
        let len = 64;
        canvas.width = canvas.height = len;
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, len, len);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, len, len);
        canvases.push(canvas)
    }
    return canvases;
}
function generateMaterial(canvases, i, j, k) {
    let materials = [];
    let select = [6, 6, 6, 6, 6, 6];
    if (i === 1) select[0] = 0;
    if (i === -1) select[1] = 1;
    if (j === 1) select[2] = 2;
    if (j === -1) select[3] = 3;
    if (k === 1) select[4] = 4;
    if (k === -1) select[5] = 5;
    for (let index of select) {
        let texture = new THREE.Texture(canvases[index]);
        texture.needsUpdate = true;
        materials.push(new THREE.MeshBasicMaterial({ map: texture}));
    }
    return materials;
}
function rotateOnX(objs, rad) {
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    for (let cube of objs) {
        let y = cube.position.y;
        let z = cube.position.z;
        let quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), rad);
        cube.quaternion.premultiply(quaternion);
        cube.position.y = y * cos - z * sin;
        cube.position.z = z * cos + y * sin;
    }
}
function rotateOnY(objs, rad) {
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    for (let cube of objs) {
        let x = cube.position.x;
        let z = cube.position.z;
        let quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rad);
        cube.quaternion.premultiply(quaternion);
        cube.position.z = z * cos - x * sin;
        cube.position.x = x * cos + z * sin;
    }
}
function rotateOnZ(objs, rad) {
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);
    for (let cube of objs) {
        let x = cube.position.x;
        let y = cube.position.y;
        let quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), rad);
        cube.quaternion.premultiply(quaternion);
        cube.position.x = x * cos - y * sin;
        cube.position.y = y * cos + x * sin;
    }
}

function OP(op) {
    let objs = [];
    switch(op) {
        case 'R':
            for (let cube of cubes) {
                if (appro(cube.position.x, unit)) 
                objs.push(cube);
            }
            break;
        case 'L':
            for (let cube of cubes) {
                if (appro(cube.position.x, -unit)) 
                objs.push(cube);
            }
            break;
        case 'U':
            for (let cube of cubes) {
                if (appro(cube.position.y, unit)) 
                objs.push(cube);
            }
            break;
        case 'D':
            for (let cube of cubes) {
                if (appro(cube.position.y, -unit)) 
                objs.push(cube);
            }
            break;
        case 'F':
            for (let cube of cubes) {
                if (appro(cube.position.z, unit)) 
                objs.push(cube);
            }
            break;
        case 'B':
            for (let cube of cubes) {
                if (appro(cube.position.z, -unit)) 
                objs.push(cube);
            }
            break;
    }
    window.requestAnimFrame(function(timestamp){rotate(objs,op,timestamp,0);});
}
function rotate(objs, op, now, start, last){
    let total = 300;
    if (start === 0) {
        start = now;
        last = now;
    }
    if (now - start > total) {
        now = start + total;
        canRotate = true;
    }
    switch(op) {
        case 'R': rotateOnX(objs, - (now - last) / total * Math.PI / 2); break;
        case 'L': rotateOnX(objs, - (now - last) / total * Math.PI / 2); break;
        case 'U': rotateOnY(objs, - (now - last) / total * Math.PI / 2); break;
        case 'D': rotateOnY(objs, - (now - last) / total * Math.PI / 2); break;
        case 'F': rotateOnZ(objs, - (now - last) / total * Math.PI / 2); break;
        case 'B': rotateOnZ(objs, - (now - last) / total * Math.PI / 2); break;
    }
    if (now - start < total){
         window.requestAnimFrame(function(timestamp){rotate(objs, op,timestamp,start,now);});
    }
}

function appro(lhs, rhs) { return Math.abs(lhs - rhs) < 1;}

function handleKeyDown(evt) {
    if (canRotate) {
        canRotate = false;
        switch(evt.keyCode) {
            case 82: OP('R');break;
            case 76: OP('L');break;
            case 85: OP('U');break;
            case 68: OP('D');break;
            case 70: OP('F');break;
            case 66: OP('B');break;
            default: canRotate = true;
        }
    }
}
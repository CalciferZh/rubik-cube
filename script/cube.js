//if you are draging in cubes, both click are accepted
//if you are draging in background, left-click means view, right-click means rotate whole cube

var renderer;
var width;
var height;
var unit = 50;
var cubes = [];
var colors = ['#30a0ff', '#60ff50', '#ff0000', '#ffa000', '#efff50','#ffffff', '#303030'];//blue green red orange yellow white
var basicMaterials;
var canvas;
var ctx;

var camera;
var controller;
var scene;
var light;
var cubes;
var canRotate=true;
var raycaster = new THREE.Raycaster();

var timer;

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.webkitRequestAnimationFrame;
})();

function begin() {
    initHTML();
    initThree();
    initCamera();
    initScene();
    initLight();
    initObject();
    render();
    let canvasFrame = document.getElementById('canvas-frame');   
    canvasFrame.addEventListener('mousedown', handleStart);
    canvasFrame.addEventListener('mousemove', handleMove);
    canvasFrame.addEventListener('mouseup', handleEnd);
    canvasFrame.addEventListener('touchstart', handleStart, {passive:false});
    canvasFrame.addEventListener('touchmove', handleMove, {passive:false});
    canvasFrame.addEventListener('touchend', handleEnd, {passive:false});
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', onWindowResize);
}
function initHTML() {
    let body = document.getElementsByTagName('body')[0];
    for (let i = 0; i <= 6; ++i) {
        let colorbox = document.createElement('button');
        colorbox.setAttribute('class', 'colorBox');
        colorbox.setAttribute('id', 'color' + i);
        colorbox.style.backgroundColor = colors[i];
        colorbox.style.top = (20 + 60 * i) + "px";
        colorbox.style.display = "none";
        // colorbox.innerHTML = '9';
        body.appendChild(colorbox);
    }
    document.getElementsByClassName('colorBox')[6].innerHTML = "";
    document.getElementById('finish').style.display = 'none';
}

function initThree() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setClearColor(0xF0F0F0, 1.0);
    canvas = document.getElementById('canvas-frame');
    canvas.appendChild(renderer.domElement);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.x = 400;
    camera.position.y = 300;
    camera.position.z = 500;
    camera.lookAt({x:0,y:0,z:0});
    controller = new THREE.OrbitControls(camera, render.domElement);
    controller.enableRotate = true;
    controller.enablePan = false;
    controller.enableZoom = false;
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
    basicMaterials = generateBasicMaterials();
    for (let i = -1; i < 2; ++i)
        for (let j = -1; j < 2; ++j)
            for (let k = -1; k < 2; ++k) {
                let geometry = new THREE.BoxGeometry(unit, unit, unit);
                let material = generateMaterial(i, j, k);
                let cube = new THREE.Mesh(geometry, material);
                cube.position.x = i * unit;
                cube.position.y = j * unit;
                cube.position.z = k * unit;
                cubes.push(cube);               
			}
}
function generateBasicMaterials(){
    let basicMaterials = [];
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
        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        basicMaterials.push(new THREE.MeshBasicMaterial({ map: texture}));    
    }
    return basicMaterials;
}
function generateMaterial(i, j, k) {
    let materials = [];
    let select = [6, 6, 6, 6, 6, 6];
    if (i === 1) select[0] = 4;
    if (i === -1) select[1] = 5;
    if (j === 1) select[2] = 0;
    if (j === -1) select[3] = 1;
    if (k === 1) select[4] = 2;
    if (k === -1) select[5] = 3;
    for (let index of select) {
        materials.push(basicMaterials[index]);
    }
    return materials;
}
function redrawCube(indexes) {
    for (let i = 0; i < 9; ++i) {
        //[6,15,24,7,16,25,8,17,26] UP
        cubes[Math.floor(i / 3) + 6 + 9 * (i % 3)].material[2] = basicMaterials[indexes[i]];
        //[6,7,8,3,4,5,0,1,2] LEFT
        cubes[Math.floor(i / 3) * 3 + (i % 3)].material[1] = basicMaterials[indexes[9 + i]];
        //[8,17,26,5,14,23,2,11,20] FRONT
        cubes[8 - 3 * Math.floor(i / 3) + 9 * (i % 3)].material[4] = basicMaterials[indexes[18 + i]];
        //[26,25,24,23,22,21,20,19,18] RIGHT
        cubes[26 - i].material[0] = basicMaterials[indexes[27 + i]];
        //[24,15,6,21,12,3,18,9,0] BACK
        cubes[24 - 3 * Math.floor(i / 3) - 9 * (i % 3)].material[5] = basicMaterials[indexes[36 + i]];
        //[0,9,18,1,10,19,2,11,20] DOWN
        cubes[Math.floor(i / 3) + 9 * (i % 3)].material[3] = basicMaterials[indexes[45 + i]];
    }
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

function OP(op, rad) {
    canRotate = false;
    let objs = [];
    let axis;
    let sgn = 1;
    switch(op) {
        case 'R':
            for (let cube of cubes) {
                if (appro(cube.position.x, unit)) 
                objs.push(cube);
            }
            axis = 'X';
            sgn = -1;
            break;
        case 'L':
            for (let cube of cubes) {
                if (appro(cube.position.x, -unit)) 
                objs.push(cube);
            }
            axis = 'X';
            break;
        case 'LR':
            objs = cubes;
            axis = 'X';
            break;
        case 'U':
            for (let cube of cubes) {
                if (appro(cube.position.y, unit)) 
                objs.push(cube);
            }
            axis = 'Y';
            sgn = -1;
            break;
        case 'D':
            for (let cube of cubes) {
                if (appro(cube.position.y, -unit)) 
                objs.push(cube);
            }
            axis = 'Y';
            break;
        case 'UD':
            objs = cubes;
            axis = 'Y';
            break;
        case 'F':
            for (let cube of cubes) {
                if (appro(cube.position.z, unit)) 
                objs.push(cube);
            }
            axis = 'Z';
            sgn = -1;
            break;
        case 'B':
            for (let cube of cubes) {
                if (appro(cube.position.z, -unit)) 
                objs.push(cube);
            }
            axis = 'Z';
            break;
        case 'FB':
            objs = cubes;
            axis = 'Z';
            break;
    }
    window.requestAnimFrame(function(timestamp){rotate(objs,axis,sgn * rad,timestamp,0);});
}

function opClosure(ops, i, end) {
    return (function(){
        let op = ops[i];
        if (op.length === 1)
            OP(op, Math.PI / 2);
        else if (op[1] === '2')
            OP(op[0], Math.PI);
        else if (op[1] === "'")
            OP(op[0], -Math.PI / 2);
        ++i;
        if (i === end) {
            clearInterval(timer);
            canRotate = true;
        }
    });
}
function stepByStepRotate(ops) {
    var closure = opClosure(ops, 0, ops.length);
    timer = setInterval(closure, 1200);
}

function rotate(objs, axis, rad, now, start, last){
    let total = 200 * Math.abs(rad);
    if (start === 0) {
        start = now;
        last = now;
    }
    if (now - start > total) {
        now = start + total;
        canRotate = true;
    }
    switch(axis) {
        case 'X': rotateOnX(objs, (now - last) / total * rad); break;
        case 'Y': rotateOnY(objs, (now - last) / total * rad); break;
        case 'Z': rotateOnZ(objs, (now - last) / total * rad); break;
    }
    if (now - start < total - 1){
        window.requestAnimFrame(function(timestamp){rotate(objs, axis, rad, timestamp,start,now);});
    }
}
function cameraRotate(axis, rad, now, start, last){
    let total = 500;
    if (start === 0) {
        start = now;
        last = now;
    }
    if (now - start > total) {
        now = start + total;
    }
    camera.position.applyAxisAngle(axis, rad * (now - last) / total) ;
    controller.update();
    if (now - start < total){
        requestAnimationFrame(function(timestamp){cameraRotate(axis, rad, timestamp,start,now);});
    }
}

function appro(lhs, rhs) { return Math.abs(lhs - rhs) < 1;}


function getIntersectCube(x, y) {
    let mouse = new THREE.Vector2(x, y);
    raycaster.setFromCamera(mouse, camera);
    let cubes = raycaster.intersectObjects(scene.children);
    return cubes.length > 0 ? cubes[0] : null;
}

var last = {//use for mouseevent, store the infomation about rotation and mouse .
    total:0,
    x:0,
    y:0,
    rotatingNineCubes:false,
    rotatingAllCubes:false,
    objs: [],
    main: '',
    point: '',//the intersect point in which face? x or y or z
    axis: '',//the rotating axis
    sgn: 1,
    intersectPoint:null,
}



function handleKeyDown(evt) {
    if (canRotate) {
        let sgn = evt.shiftKey === true ? -1 : 1;
        switch(evt.keyCode) {
            case 82: OP('R', sgn * Math.PI / 2);break;
            case 76: OP('L', sgn * Math.PI / 2);break;
            case 85: OP('U', sgn * Math.PI / 2);break;
            case 68: OP('D', sgn * Math.PI / 2);break;
            case 70: OP('F', sgn * Math.PI / 2);break;
            case 66: OP('B', sgn * Math.PI / 2);break;
        }
    }
}

function handleStart(evt) {
    if (!canRotate || rotating)return;
    let clientX, clientY;
    if (evt.touches) {
        evt.preventDefault();
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
    } else {
        clientX = evt.clientX;
        clientY = evt.clientY;
    }
    if (evt.button === 2 || (evt.touches && evt.touches.length === 2)) {//right-clike or double-finger touch
        console.info(rotating);
        controller.enableRotate = false;
        last.x = clientX;
        last.y = clientY;
        last.rotatingAllCubes = true;
        return;
    }
    let cube = getIntersectCube((clientX / width) * 2 - 1, -(clientY / height) * 2 + 1);
    if (cube !== null) {//pointing to the cube
        last.intersectPoint = cube.point;
        if (appro(Math.abs(cube.point.x), unit * 1.5))
            last.point = 'X';
        else if (appro(Math.abs(cube.point.y), unit * 1.5))
            last.point = 'Y';
        else if (appro(Math.abs(cube.point.z), unit * 1.5))
            last.point = 'Z';
        canRotate = false
        last.x = clientX;
        last.y = clientY;
        last.rotatingNineCubes = true;
        controller.enableRotate = false;
        return;
    } 
}
function handleEnd(evt) {
    if (controller.enableRotate) { //set camera back after viewing
        let vec1 = new THREE.Vector3(400, 300, 500).normalize();
        let vec2 = camera.position.clone().normalize();
        let rad = Math.acos(vec1.dot(vec2));
        let axis = vec2.cross(vec1).normalize();
        requestAnimationFrame(function(timestamp){cameraRotate(axis, rad, timestamp,0);});
        return;
    }
    controller.enableRotate = true;
    if (last.rotatingNineCubes) {
        last.rotatingNineCubes = false;
        if (last.total === 0) {//not rotating at all
            canRotate = true;
            return;
        }
        let sgn = last.total > 0 ? 1 : -1;
        let count = sgn * last.total / 100 / Math.PI;
        count = (count - Math.floor(count) > 0.25) ? Math.floor(count) + 1 : Math.floor(count);
        let correct = sgn * count * 100 * Math.PI;
        let objs = [];
        for (let cube of last.objs)
             objs.push(cube);
        let rad = (correct - last.total) / 200;
        let axis = last.axis;
        window.requestAnimFrame(function(timestamp){rotate(objs,axis,rad,timestamp,0);});
        last.total = 0;
        last.objs.splice(0, last.objs.length);
        last.main='';
        last.point='';
        last.axis='';
        last.intersectPoint = null;
    } else if (last.rotatingAllCubes) {
        last.rotatingAllCubes = false;
        let axis = last.axis;
        let rad = Math.PI / 2 * last.sgn;
        window.requestAnimFrame(function(timestamp){rotate(cubes,axis,rad,timestamp,0);});
        last.axis = '';
    } 
}

function handleMove(evt) {
    let clientX, clientY;
    if (evt.touches) {
        evt.preventDefault();
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
    } else {
        clientX = evt.clientX;
        clientY = evt.clientY;
    }
    if (last.rotatingNineCubes) {
        let diff = 0;
        switch (last.main) {
            case 'X': diff = clientX - last.x; last.x = clientX; break;
            case 'Y': diff = clientY - last.y; last.y = clientY; break;
            default://not decide the direction of rotation yet
                let dx = clientX - last.x;
                let dy = clientY - last.y;
                diff = dx > dy ? dx : dy;
                if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;//movement is so small, not gonna update last.x or last.y
                let cube = getIntersectCube((clientX / width) * 2 - 1, -(clientY / height) * 2 + 1);
                if (cube === null) return;
                let ddx = Math.abs(cube.point.x - last.intersectPoint.x);
                let ddy = Math.abs(cube.point.y - last.intersectPoint.y);
                let ddz = Math.abs(cube.point.z - last.intersectPoint.z);           
                last.main = Math.abs(dx) > 2 * Math.abs(dy) ? 'X' : 'Y';
                switch(last.point) {
                     case 'X': last.axis = ddz < ddy ? 'Z' : 'Y'; break;
                     case 'Y': last.axis = ddx < ddz ? 'X' : 'Z'; break;
                     case 'Z': last.axis = ddx < ddy ? 'X' : 'Y'; break;
                 }
                switch (last.axis) {
                    case 'X':
                        let x = Math.round(last.intersectPoint.x / 50) * 50;
                        for (let cube of cubes) {
                            if (appro(cube.position.x, x))
                                last.objs.push(cube);
                        }
                        last.sgn = 1;
                        break;
                    case 'Y':
                        let y = Math.round(last.intersectPoint.y / 50) * 50;
                        for (let cube of cubes) {
                            if (appro(cube.position.y, y))
                                last.objs.push(cube);
                        }
                        last.sgn = 1;
                        break;
                    case 'Z':
                        let z = Math.round(last.intersectPoint.z / 50) * 50;
                        for (let cube of cubes) {
                            if (appro(cube.position.z, z))
                                last.objs.push(cube);
                        }
                        last.sgn = -1;
                        break;
                }
        }
        diff *= last.sgn;
        last.total += diff;
        switch(last.axis) {
            case 'X': rotateOnX(last.objs, diff / 200);break;
            case 'Y': rotateOnY(last.objs, diff / 200);break;
            case 'Z': rotateOnZ(last.objs, diff / 200);break;
        }
    } else if (last.rotatingAllCubes) {
        let dx = clientX - last.x;
        let dy = clientY - last.y;
        if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
        if (Math.abs(dx) > Math.abs(dy)) {
            last.axis = 'Y';
            last.sgn = dx > 0 ? 1 : -1;
        } else {
            last.sgn = dy > 0 ? 1 : -1;
            if (clientX < width / 2) {
                last.axis = 'X';
            } else {
                last.axis = 'Z';
                last.sgn = -last.sgn;
            }
        }
    }
}
function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
            










//use for backend.js
function modeling() {
    let clockwise = 1;
    let anticlockwise = 2;
    let cp = [0, 0, 0, 0, 0, 0, 0, 0];
    let co = [0, 0, 0, 0, 0, 0, 0, 0];
    let ep = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; 
    for (let cube of cubes) {
        let x = Math.round(cube.position.x / unit);
        let y = Math.round(cube.position.y / unit);
        let z = Math.round(cube.position.z / unit);
        let direction = getDirection(cube);
        let orientation;
        let kind = getKind(cube);
        if (Math.abs(x) + Math.abs(y) + Math.abs(z) === 3) {
            if (direction === 'y') orientation = 0;
            else {
                if ((x * y * z === 1 && direction === 'x') || (x * y * z === -1 && direction === 'z'))
                    orientation = clockwise;
                else
                    orientation = anticlockwise;
            }
            let loc = getCornelLoc(x, y, z);
            co[loc] = orientation;
            cp[loc] = kind;
        } else if (Math.abs(x) + Math.abs(y) + Math.abs(z) === 2) {
            if (y === 0)
                orientation = (direction === 'z') ? 0 : 1;
            else
                orientation = (direction === 'y') ? 0 : 1;
            let loc = getEdgeLoc(x, y, z);
            eo[loc] = orientation;
            ep[loc] = kind;
        }
    }
    let result = new Object();
    result.cp = cp;
    result.co = co;
    result.ep = ep;
    result.eo = eo;
    return result;
}
function getKind(cube) {
    let colorIndexs = [];
    for (let i = 0; i < 6; ++i)
        for (let j = 0; j < 6; ++j) {
            if (basicMaterials[i] === cube.material[j]) {
                colorIndexs.push(i);
                break;
            }
        }
    if (colorIndexs.length === 2) {
        if (colorIndexs[0] === 0) {
            if (colorIndexs[1] === 4) return 0;
            if (colorIndexs[1] === 2) return 1;
            if (colorIndexs[1] === 5) return 2;
            if (colorIndexs[1] === 3) return 3;
        }
        if (colorIndexs[0] === 1) {
            if (colorIndexs[1] === 4) return 4;
            if (colorIndexs[1] === 2) return 5;
            if (colorIndexs[1] === 5) return 6;
            if (colorIndexs[1] === 3) return 7;
        }
        if (colorIndexs[0] === 2) {
            if (colorIndexs[1] === 4) return 8;
            if (colorIndexs[1] === 5) return 9;
        }
        if (colorIndexs[0] === 3) {
            if (colorIndexs[1] === 5) return 10;
            if (colorIndexs[1] === 4) return 11;
        }
    } else {
        if (colorIndexs[0] === 0 && colorIndexs[1] === 2 && colorIndexs[2] === 4) return 0;
        if (colorIndexs[0] === 0 && colorIndexs[1] === 2 && colorIndexs[2] === 5) return 1;
        if (colorIndexs[0] === 0 && colorIndexs[1] === 3 && colorIndexs[2] === 5) return 2;
        if (colorIndexs[0] === 0 && colorIndexs[1] === 3 && colorIndexs[2] === 4) return 3;
        if (colorIndexs[0] === 1 && colorIndexs[1] === 2 && colorIndexs[2] === 4) return 4;
        if (colorIndexs[0] === 1 && colorIndexs[1] === 2 && colorIndexs[2] === 5) return 5;
        if (colorIndexs[0] === 1 && colorIndexs[1] === 3 && colorIndexs[2] === 5) return 6;
        if (colorIndexs[0] === 1 && colorIndexs[1] === 3 && colorIndexs[2] === 4) return 7;
    }
}
function getDirection(cube) {//blue & green first, red & orange second, white & yellow last. return 'x','y','z'
    let masterMaterialIndex = -1;
    for (let i = 0; i < 6; ++i) {
        if (cube.material[i] === basicMaterials[0] || cube.material[i] === basicMaterials[1])
            masterMaterialIndex = i;
    }
    if　(masterMaterialIndex === -1)
        for (let i = 0; i < 6; ++i) {
            if (cube.material[i] === basicMaterials[2] || cube.material[i] === basicMaterials[3])
                masterMaterialIndex = i;
        }
    for (let i = 0; i < 12; i += 2) {
        if (cube.geometry.faces[i].materialIndex === masterMaterialIndex) {
            let v1 = cube.geometry.vertices[cube.geometry.faces[i].a].clone();
            let v2 = cube.geometry.vertices[cube.geometry.faces[i].b].clone();
            let v3 = cube.geometry.vertices[cube.geometry.faces[i].c].clone();
            v1.applyMatrix4(cube.matrixWorld);
            v2.applyMatrix4(cube.matrixWorld);
            v3.applyMatrix4(cube.matrixWorld);
            let x = Math.abs(v1.x + v2.x + v3.x);
            let y = Math.abs(v1.y + v2.y + v3.y);
            let z = Math.abs(v1.z + v2.z + v3.z);
            if (appro(x, 4.5 * unit)) return 'x';
            if (appro(y, 4.5 * unit)) return 'y';
            if (appro(z, 4.5 * unit)) return 'z';
        }
    }
}
function getCornelLoc(x, y, z) {
    if (x === 1 && y === 1 && z === 1) return 0;
    if (x === -1 && y === 1 && z === 1) return 1;
    if (x === -1 && y === 1 && z === -1) return 2;
    if (x === 1 && y === 1 && z === -1) return 3;
    if (x === 1 && y === -1 && z === 1) return 4;
    if (x === -1 && y === -1 && z === 1) return 5;
    if (x === -1 && y === -1 && z === -1) return 6;
    if (x === 1 && y === -1 && z === -1) return 7; 
}
function getEdgeLoc(x, y, z) {
    if (x === 1 && y === 1 && z === 0) return 0;
    if (x === 0 && y === 1 && z === 1) return 1;
    if (x === -1 && y === 1 && z === 0) return 2;
    if (x === 0 && y === 1 && z === -1) return 3;
    if (x === 1 && y === -1 && z === 0) return 4;
    if (x === 0 && y === -1 && z === 1) return 5;
    if (x === -1 && y === -1 && z === 0) return 6;
    if (x === 0 && y === -1 && z === -1) return 7; 
    if (x === 1 && y === 0 && z === 1) return 8;
    if (x === -1 && y === 0 && z === 1) return 9;
    if (x === -1 && y === 0 && z === -1) return 10;
    if (x === 1 && y === 0 && z === -1) return 11; 
}


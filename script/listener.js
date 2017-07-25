var last = {//use for mouseevent, store the infomation about rotation and mouse.
    total:0,
    x:0,
    y:0,
    rotatingNineCubes:false,
    rotatingAllCubes:false,
    objs: [],
    axis: '',
    main: '',//use which value of mouse move? x or y
    intersectFace: '',//the intersect point in which face? x or y or z
    sgn: 1,
    intersectPoint:null,
}

function handleKeyDown(evt) {
    if (!canRotate || rotating)return;
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
            last.intersectFace = 'X';
        else if (appro(Math.abs(cube.point.y), unit * 1.5))
            last.intersectFace = 'Y';
        else if (appro(Math.abs(cube.point.z), unit * 1.5))
            last.intersectFace = 'Z';
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
        last.intersectFace='';
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
                switch(last.intersectFace) {
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
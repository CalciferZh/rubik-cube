function solveCube() {
  let pre = pretreatment();
  setTimeout('solve();', 1000 * (pre+1));
}

function scrambling(){
  let ops = [];
  let faces = ['U','D','F','B','L','R'];
  let directions = ['', "'", '2'];
  for (let i = 0; i < 12; ++i) {
    let face = Math.floor(Math.random() * 6);
    let dir = Math.floor(Math.random() * 3);
    ops.push(faces[face] + directions[dir]);
  }
  stepByStepRotate(ops);
}

var selected = 6;
var colorArray = [9,9,9,9,9,9];
var total = 54;

function clearCube(){
  for (let cube of cubes) {
    for (let i = 0; i < 6; ++i) 
      cube.material[i] = basicMaterials[6];
  }
  let colorBoxes = document.getElementsByClassName('colorBox');
  for (let elem of colorBoxes) {
    elem.style.display = "block";
    elem.addEventListener('mousedown', selectColor);
    window.addEventListener('mousedown', setColor);
  }
  document.getElementById('solve').style.display = 'none';
  document.getElementById('draw').style.display = 'none';
  document.getElementById('scramble').style.display = 'none';
  document.getElementById('finish').style.display = 'block';
  colorBoxes[6].style.borderWidth="3px";
  selected = 6;
  colorArray = [9,9,9,9,9,9];
  total = 54;
}

function finishBuild() {
  //certificate the status of cube here?
  let colorBoxes = document.getElementsByClassName('colorBox');
  for (let elem of colorBoxes) {
    elem.style.display = "none";
    elem.removeEventListener('mousedown', selectColor);
    window.removeEventListener('mousedown', setColor);
  }
  document.getElementById('finish').style.display = 'none';
  document.getElementById('solve').style.display = 'block';
  document.getElementById('draw').style.display = 'block';
  document.getElementById('scramble').style.display = 'block';
}



function selectColor(evt) {
  let index = +evt.target.id[5];
  if (index !== 6 && colorArray[index] === 0) return;
  document.getElementById('color' + selected).style.borderWidth = "0px";
  selected = index;
  document.getElementById('color' + selected).style.borderWidth = "3px";
}

function setColor(evt) {
    let x = evt.clientX;
    let y = evt.clientY;
    let mouse = new THREE.Vector2(x / width * 2 - 1, - y / height * 2 + 1);
    raycaster.setFromCamera(mouse, camera);
    let cubes = raycaster.intersectObjects(scene.children);
    if (cubes.length !== 0) {
      let oldMaterial = cubes[0].object.material[cubes[0].face.materialIndex];
      let oldMaterialIndex;
      for (let i = 0; i <= 6; ++i)
        if (oldMaterial === basicMaterials[i])
          oldMaterialIndex = i;
      if (oldMaterialIndex !== 6) {
        colorArray[oldMaterialIndex]++;
        document.getElementById('color' + oldMaterialIndex).innerHTML = colorArray[oldMaterialIndex];
      }
      let faceIndex = Math.floor(cubes[0].faceIndex / 2);     
      cubes[0].object.material[faceIndex] = basicMaterials[selected];
      if (selected !== 6) {
        colorArray[selected]--;
        document.getElementById('color' + selected).innerHTML = colorArray[selected];
      }
      if (colorArray[selected] === 0) {
        document.getElementById('color' + selected).style.borderWidth = "0px";
        selected = 6;
        document.getElementById('color' + selected).style.borderWidth = "3px";
      }
    }
      
}










function cube2face(cube) {
  if (appro(cube.position.x, unit)) return 'R';
  if (appro(cube.position.y, unit)) return 'U';
  if (appro(cube.position.z, unit)) return 'F';
  if (appro(cube.position.x, -unit)) return 'L';
  if (appro(cube.position.y, -unit)) return 'D';
  if (appro(cube.position.z, -unit)) return 'B';
}
function pretreatment() {
  let center = [4, 10, 12, 14, 16, 22];//U -> blueFace
  let face = [1, 3, 5, 4, 2, 0];
  let color2face = ['U','D','F','B','R','L']
  let bluePos, redPos;
  for (let i = 0; i < 6; ++i) {
    if (cubes[center[i]].material[face[i]] === basicMaterials[0]) {
      blue = cube2face(cubes[center[i]]);
      break;
    }
  }
  let ops = [];
  switch(blue) {
    case 'D':ops.push("LR");ops.push("LR");break;
    case 'F':ops.push("LR");ops.push("LR");ops.push("LR");break;
    case 'B':ops.push("LR");break;
    case 'L':ops.push("FB");ops.push("FB");ops.push("FB");break;
    case 'D':ops.push("FB");break;
  }
  for (let i = 0; i < 6; ++i) {
    if (cubes[center[i]].material[face[i]] === basicMaterials[2]) {
      red = cube2face(cubes[center[i]]);
      break;
    }
  }
  switch(red) {
    case 'B':ops.push("UD");ops.push("UD");break;
    case 'L':ops.push("UD");break;
    case 'R':ops.push("UD");ops.push("UD");ops.push("UD");break;
  }
  stepByStepRotate(ops);
  return ops.length;
}
function solve(){
  let opstr = (new CubieCube(modeling()).solve());
  stepByStepRotate(opstr.split(' '));
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
        else
            OP(op, Math.PI / 2);
        ++i;
        if (i === end)
            clearInterval(timer);
    });
}
function stepByStepRotate(ops) {
    var closure = opClosure(ops, 0, ops.length);
    timer = setInterval(closure, 900);
}
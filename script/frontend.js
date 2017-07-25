var initialized = false;
var rotating = false;
let showInfo = false;

function init() {
  begin();
}

// Eerror code:
// 0: Cube is solvable
// 1: Not all 12 edges exist exactly once
// 2: Flip error: One edge has to be flipped
// 3: Not all corners exist exactly once
// 4: Twist error: One corner has to be twisted
// 5: Parity error: Two corners ore two edges have to be exchanged
function verify(c) {
  let sum = 0;
  let errCode = [];

//++++++++++++++++++++++++++++++++ edge check ++++++++++++++++++++++++++++++++
  let edgeCnt = (function() {
    let result = [];
    for (let i = 0; i < 12; ++i) {
      result.push(0);
    }
    return result;
  })();
  for (let patch of c.ep) {
    ++edgeCnt[patch];
  }
  for (let cnt of edgeCnt) {
    if (cnt != 1) {
      errCode.push(1);
      break;
    }
  }

  for (let i = 0; i < 12; ++i) {
    sum += c.eo[i];
  }
  if (sum % 2 !== 0) {
    errCode.push(2);
  }

//+++++++++++++++++++++++++++++++++ corner check +++++++++++++++++++++++++++++
  let cornerCnt = (function() {
    let result = [];
    for (let i = 0; i < 8; ++i) {
      result.push(0);
    }
    return result;
  })();
  for (let patch of c.cp) {
    ++cornerCnt[patch];
  }
  for (let cnt of cornerCnt) {
    if (cnt != 1) {
      errCode.push(3);
      break;
    }
  }

  sum = 0;
  for (let i = 0; i < 8; ++i) {
    sum += c.co[i];
  }
  if (sum % 3 !== 0) {
    errCode.push(4);
  }

//++++++++++++++++++++++++++++++++ parity check ++++++++++++++++++++++++++++++
  let sum1 = 0;
  for (let i = DRB; i > URF; --i) {
    for (let j = i - 1; j > URF - 1; --j) {
      if (c.cp[j] > c.cp[i]) {
        ++sum1;
      }
    }
  }
  sum1 = (sum1 % 2) & 0xffff



  let sum2 = 0;
  for (let i = BR; i > UR; --i) {
    for (let j = i - 1; j < UR - 1; --j) {
      if (c.ep[j] > c.ep[i]) {
        ++sum2;
      }
    }
  }
  sum2 = (sum2 % 2) & 0xffff;

  if (sum1 ^ sum2 != 0) {
    errCode.push(5);
  }

  if (errCode.length === 0) {
    return true;
  }

  let errMsg = "The given cube is illegal:\n";
  for (let code of errCode) {
    switch(code) {
      case 1:
        errMsg += "Not all 12 edges exist exactly once.\n";
        break;
      case 2:
        errMsg += "One edge was flipped.\n";
        break;
      case 3:
        errMsg += "Not all 8 corners exist excatly once.\n";
        break;
      case 4:
        errMsg += "One corner was twisted.\n";
        break;
      case 5:
        errMsg += "Two corners or two edges were exchanged.\n"
        break;
      default:
        console.log("Wrong error code in cube verify.")
        break;
    }
  }
  alert(errMsg);
  return false;
}

function solveCube() {
  if (!initialized) {
    CubieCube.initSolver();
    initialized = true;
  }
  if (rotating) {
    return;
  }
  let model = modeling();
  if (!verify(model)) {
    return;
  }
  rotating = true;
  let opstr = (new CubieCube(model).solve());
  let ops = opstr.split(' ');
  let pre = pretreatment();
  setTimeout('solve();', 1000 * (pre+1));
}

function scrambling(){
  if (rotating) {
    return;
  }
  rotating = true;
  let ops = [];
  let faces = ['U','D','F','B','L','R'];
  let directions = ['', "'", '2'];
  let last = -1;
  for (let i = 0; i < 16; ++i) {
    let face = Math.floor(Math.random() * 6);
    if (face === last)
      face = (face + 1) % 6;
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
  document.getElementById('color' + selected).style.borderWidth = "1px";
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
        if (colorArray[oldMaterialIndex] === 1)
          document.getElementById('color' + oldMaterialIndex).style.borderWidth = "1px";
        // document.getElementById('color' + oldMaterialIndex).innerHTML = colorArray[oldMaterialIndex];
      }
      let faceIndex = Math.floor(cubes[0].faceIndex / 2);     
      cubes[0].object.material[faceIndex] = basicMaterials[selected];
      if (selected !== 6) {
        colorArray[selected]--;
        // document.getElementById('color' + selected).innerHTML = colorArray[selected];
      }
      if (colorArray[selected] === 0) {
        document.getElementById('color' + selected).style.borderWidth = "0px";
        selected = 6;
        document.getElementById('color' + selected).style.borderWidth = "3px";
      }
    }
      
}

function switchInfo() {
  let block = document.getElementById("info_content");
  if (showInfo) {
    block.setAttribute("class", "invisible");
    showInfo = false;
  } else {
    block.setAttribute("class", "visible");
    showInfo = true;
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
  let center = [4, 10, 12, 14, 16, 22];
  let face = [1, 3, 5, 4, 2, 0];
  let color2face = ['U','D','F','B','R','L']
  let bluePos, redPos;
  for (let i = 0; i < 6; ++i) {
    if (cubes[center[i]].material[face[i]] === basicMaterials[0])
      blue = cube2face(cubes[center[i]]);
    if (cubes[center[i]].material[face[i]] === basicMaterials[2])
      red = cube2face(cubes[center[i]]);
  }

  let ops = [];
  switch(blue) {
    case 'U':break;
    case 'D':ops.push("LR");ops.push("LR");break;
    case 'F':ops.push("LR");ops.push("LR");ops.push("LR");break;
    case 'B':ops.push("LR");break;
    case 'L':ops.push("FB");ops.push("FB");ops.push("FB");break;
    case 'R':ops.push("FB");break;
  }
  if (ops.length !== 0)  {
    red = redTransform(red, ops[0], ops.length);
  }
  switch(red) {
    case 'B':ops.push("UD");ops.push("UD");break;
    case 'L':ops.push("UD");break;
    case 'R':ops.push("UD");ops.push("UD");ops.push("UD");break;
  }
  if (ops.length !== 0)
    stepByStepRotate(ops);
  return ops.length;
}
function redTransform(red, op, times) {
  let transformLR = ['U', 'F', 'D', 'B'];
  let transformFB = ['U', 'L', 'D', 'R'];
  if (op === "LR") {
    let i;
    for (i = 0; i < 4; ++i)
      if(transformLR[i] === red) break;
    return i === 4 ? red : transformLR[(i + times) % 4];
  } else if (op === "FB") {
    let i;
    for (i = 0; i < 4; ++i)
      if(transformFB[i] === red) break;
    return i === 4 ? red : transformFB[(i + times) % 4];
  }
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
        if (i === end) {
          clearInterval(timer);
          rotating = false;
        }
    });
}
function stepByStepRotate(ops) {
    var closure = opClosure(ops, 0, ops.length);
    timer = setInterval(closure, 900);
}
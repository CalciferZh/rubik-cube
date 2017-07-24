var initialized = false;
var tip;

function init() {
  begin();
}

function solveCube() {
  if (!initialized) {
    CubieCube.initSolver();
    initialized = true;
  }
  let opstr = (new CubieCube(modeling()).solve());
  let ops = opstr.split(' ');
  document.getElementById("solve").setAttribute("disabled", "disabled");
  stepByStepRotate(ops);
}
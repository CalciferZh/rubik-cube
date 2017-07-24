function init() {
  begin();
  let body = document.getElementsByTagName("body")[0];
  body.width = 20;
  body.height = 20;
  // body.width = window.innerWidth();
  // body.height = window.innerWidth();
  // CubieCube.initSolver();
}

function solveCube() {
  document.getElementById("solution").innerHTML = (new CubieCube(modeling()).solve());
}
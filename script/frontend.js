function solveCube() {
  document.getElementById("solution").innerHTML = (new CubieCube(modeling()).solve());
}
function solveCube() {
  let opstr = (new CubieCube(modeling()).solve());
  let ops = opstr.split(' ');
  stepByStepRotate(ops);
}
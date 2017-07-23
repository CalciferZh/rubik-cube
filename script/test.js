function test() {
  CubieCube.initSolver();
  let c = new CubieCube();
  c.F();
  c.U();
  c.R();
  c.F();
  c.U();
  c.F();
  console.info(c.solve());
  console.info("Should be F' U' F' R' U' F U2 D2 F2 B2 U2 D2 B2");
}
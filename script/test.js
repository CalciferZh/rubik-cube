function test() {
  console.info("Solving...");
  let c = new CubieCube();
  c.F();
  c.U();
  c.R();
  c.F();
  c.U();
  c.F();
  console.info(c.solve());
  console.info("F' U' F' R' U' F U2 D2 F2 B2 U2 D2 B2 (should be)");
}
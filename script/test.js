function test() {
  let c = new Cube();
  c.rotate("F");
  c.rotate("R");
  let ex = c.export();
  console.info(ex);
}
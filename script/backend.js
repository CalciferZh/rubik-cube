// corner patches
const URF = 0,
      UFL = 1,
      ULB = 2,
      UBR = 3,
      DFR = 4,
      DLF = 5,
      DBL = 6,
      DRB = 7;

// edge patches
const UR = 0,
      UF = 1,
      UL = 2,
      UB = 3,
      DR = 4,
      DF = 5,
      DL = 6,
      DB = 7,
      FR = 8,
      FL = 9,
      BL = 10,
      BR = 11;

const faceID = {
  U: 0,
  R: 1,
  F: 2,
  D: 3,
  L: 4,
  B: 5
};

const faceName = ['U', 'R', 'F', 'D', 'L', 'B'];

const cornerID = {
  URF: 0,
  UFL: 1,
  ULB: 2,
  UBR: 3,
  DFR: 4,
  DLF: 5,
  DBL: 6,
  DRB: 7
};

const cornerName = ["URF", "UFL", "ULB", "UBR", "DFR", "DLF", "DBL", "DRB"];

const edgeID = {
  UR: 0,
  UF: 1,
  UL: 2,
  UB: 3,
  DR: 4,
  DF: 5,
  DL: 6,
  DB: 7,
  FR: 8,
  FL: 9,
  BL: 10,
  BR: 11
}

const edgeName = ["UR", "UF", "UL", "UB", "DR", "DF", "DL", "DB", "FR", "FL", "BL", "BR"];

const cornerNum = 8;
const edgeNum = 12;

class Cube {
  constructor() {
    // cp: corner patch
    this.cp = [URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB];
    // co: corner orientation
    this.co = [0, 0, 0, 0, 0, 0, 0, 0];
    // ep: edge patch
    this.ep = [UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR];
    // eo: edge orientation
    this.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // stores the status of a cube tranformed from initial status after
    // atomic manipulation
    this.rotation = [
      { // U
        cp: [UBR, URF, UFL, ULB, DFR, DLF, DBL, DRB],
        co: [0, 0, 0, 0, 0, 0, 0, 0],
        ep: [UB, UR, UF, UL, DR, DF, DL, DB, FR, FL, BL, BR],
        eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }, { // R
        cp: [DFR, UFL, ULB, URF, DRB, DLF, DBL, UBR],
        co: [2, 0, 0, 1, 1, 0, 0, 2],
        ep: [FR, UF, UL, UB, BR, DF, DL, DB, DR, FL, BL, UR],
        eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }, { // F
        cp: [UFL, DLF, ULB, UBR, URF, DFR, DBL, DRB],
        co: [1, 2, 0, 0, 2, 1, 0, 0],
        ep: [UR, FL, UL, UB, DR, FR, DL, DB, UF, DF, BL, BR],
        eo: [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0]
      }, { // D
        cp: [URF, UFL, ULB, UBR, DLF, DBL, DRB, DFR],
        co: [0, 0, 0, 0, 0, 0, 0, 0],
        ep: [UR, UF, UL, UB, DF, DL, DB, DR, FR, FL, BL, BR],
        eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }, { // L
        cp: [URF, ULB, DBL, UBR, DFR, UFL, DLF, DRB],
        co: [0, 1, 2, 0, 0, 2, 1, 0],
        ep: [UR, UF, BL, UB, DR, DF, FL, DB, FR, UL, DL, BR],
        eo: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      }, { // B
        cp: [URF, UFL, UBR, DRB, DFR, DLF, ULB, DBL],
        co: [0, 0, 1, 2, 0, 0, 2, 1],
        ep: [UR, UF, UL, BR, DR, DF, DL, BL, FR, FL, UB, DB],
        eo: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1]
      }
    ];
  }

  // only accept Singmaster Symbols:
  // F = rotate 90 degree
  // F2 = rotate 180 degree
  // F' = rotate 270 degree
  // all is clockwise
  rotate(command) {
    // which face
    let face = faceID[command[0]];
    // how many times
    let repeat = null;

    if (command.length === 1) {
      repeat = 1;
    } else if (command[1] === "2") {
      repeat = 2;
    } else {
      repeat = 3;
    }
    for (let i = 0; i < repeat; ++i) {
      this.implement(face);
    }
    return this;
  }

  U() {this.rotate("U")};
  D() {this.rotate("D")};
  F() {this.rotate("F")};
  B() {this.rotate("B")};
  L() {this.rotate("L")};
  R() {this.rotate("R")};

  implement(face) {
    // see what initial cube will turn to be
    let ref = this.rotation[face];
    this.moveCorner(ref);
    this.moveEdge(ref);
  }

  // move: we have a cube: ref, which is transformed from the initial
  // cube through a series of magic tranformations.
  // Now we want to apply the same 
  // transformations on this cube, what will this cube become to?

  // only concentrate on corner
  moveCorner(ref) {
    let newCp = [];
    let newCo = [];
    for (let to = 0; to < cornerNum; ++to) { // for each position
      // "from" is the patch at position "to" (cube: other).
      // Remeber that patch "from" was at position "from" initially,
      // we can say that, after the magic tranformations, the patch "from"
      // was moved from initial position "from" to the current position "to".
      // Similarly, if we apply the same tranformations on this cube, 
      // the patch now at position "from" will also be moved to position "to",
      // so we have the sentences below
      let from = ref.cp[to];
      newCp[to] = this.cp[from];
      newCo[to] = (this.co[from] + ref.co[to]) % 3;
    }
    this.cp = newCp;
    this.co = newCo;
  }

  // only concentrate on edges
  moveEdge(ref) {
    let newEp = [];
    let newEo = []
    for (let to = 0; to < edgeNum; ++to) {
      let from = ref.ep[to];
      newEp[to] = this.ep[from];
      newEo[to] = (this.eo[from] + ref.eo[to]) % 2;
    }
    this.ep = newEp;
    this.eo = newEo;
  }

  shift(str, repeat) {
    for (let i = 0; i < repeat; ++i) {
      let back = str.substring(0, str.length - 1);
      str = str[str.length - 1];
      str += back;
    }
    return str;
  }

  // what the color distribution become after rotation?
  getCornerName(num) {
    let patch = this.cp[num];
    let name = cornerName[patch];
    let ori = this.co[num];
    return this.shift(name, ori);
  }

  getEdgeName(num) {
    let patch = this.ep[num];
    let name = edgeName[patch];
    let ori = this.eo[num];
    return this.shift(name, ori);
  }

  // assign color with name
  assignColor() {
    let name = arguments[arguments.length-1]; // color distribution
    for (let i = 0; i < name.length; ++i) {// for each color to be assigned
      let array = arguments[i * 2];
      let index = arguments[i * 2 + 1];
      array[index] = name[i];
    }
  }

  //
  // +------------+
  // | F0  F1  F2 |
  // |            |
  // | F3  F4  F5 |
  // |            |
  // | F6  F7  F8 |
  // +------------+
  //
  // initial status
  // [URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB]
  // [UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR]
  export() {
    let entity = new Object();
    entity.F = [];
    entity.B = [];
    entity.U = [];
    entity.D = [];
    entity.L = [];
    entity.R = [];

    // assignm color for corners
    this.assignColor(entity.U, 8, entity.R, 0, entity.F, 2, this.getCornerName(0));
    this.assignColor(entity.U, 6, entity.F, 0, entity.L, 2, this.getCornerName(1));
    this.assignColor(entity.U, 0, entity.L, 0, entity.B, 2, this.getCornerName(2));
    this.assignColor(entity.U, 2, entity.B, 0, entity.R, 2, this.getCornerName(3));
    this.assignColor(entity.D, 2, entity.F, 8, entity.R, 6, this.getCornerName(4));
    this.assignColor(entity.D, 0, entity.L, 8, entity.F, 6, this.getCornerName(5));
    this.assignColor(entity.D, 6, entity.B, 8, entity.L, 6, this.getCornerName(6));
    this.assignColor(entity.D, 8, entity.R, 8, entity.B, 6, this.getCornerName(7));

    //assign color for edges
    this.assignColor(entity.U, 5, entity.R, 1, this.getEdgeName(0));
    this.assignColor(entity.U, 7, entity.F, 1, this.getEdgeName(1));
    this.assignColor(entity.U, 3, entity.L, 1, this.getEdgeName(2));
    this.assignColor(entity.U, 1, entity.B, 1, this.getEdgeName(3));
    this.assignColor(entity.D, 5, entity.R, 7, this.getEdgeName(4));
    this.assignColor(entity.D, 1, entity.F, 7, this.getEdgeName(5));
    this.assignColor(entity.D, 3, entity.L, 7, this.getEdgeName(6));
    this.assignColor(entity.D, 7, entity.B, 7, this.getEdgeName(7));
    this.assignColor(entity.F, 5, entity.R, 3, this.getEdgeName(8));
    this.assignColor(entity.F, 3, entity.L, 5, this.getEdgeName(9));
    this.assignColor(entity.B, 5, entity.L, 3, this.getEdgeName(10));
    this.assignColor(entity.B, 3, entity.R, 5, this.getEdgeName(11));

    entity.B[4] = "B";
    entity.F[4] = "F";
    entity.U[4] = "U";
    entity.D[4] = "D";
    entity.L[4] = "L";
    entity.R[4] = "R";

    return entity;
  }
}
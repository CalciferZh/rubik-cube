//+++++++++++++++++++++++++++ Cubie Cube +++++++++++++++++++++++++++++++++++++
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

var Include, allMoves1, allMoves2, computeMoveTable, computePruningTable, factorial, key, max, mergeURtoDF, moveTableParams, nextMoves1, nextMoves2, permutationIndex, pruning, pruningTableParams, ref, ref1, value,
  slice1 = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

const N_TWIST = 2187,
      N_FLIP = 2048,
      N_PARITY = 2,
      N_FRtoBR = 11880,
      N_SLICE1 = 495,
      N_SLICE2 = 24,
      N_URFtoDLF = 20160,
      N_URtoDF = 20160,
      N_URtoUL = 1320,
      N_UBtoDF = 1320;

class CubieCube {
  constructor() {
    // cp: corner patch
    this.cp = [URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB];
    // co: corner orientation
    this.co = [0, 0, 0, 0, 0, 0, 0, 0];
    // ep: edge patch
    this.ep = [UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR];
    // eo: edge orientation
    this.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    if (arguments.length !== 0) {
      let src = arguments[0];
      this.cp = src.cp;
      this.co = src.co;
      this.ep = src.ep;
      this.eo = src.eo;
    }

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

CubieCube.rotation = [
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


//+++++++++++++++++++++++++++ prepare ++++++++++++++++++++++++++++++++++++++++

Include = {
  // The twist of the 8 corners, 0 <= twist < 3^7. The orientation of
  // the DRB corner is fully determined by the orientation of the other
  // corners.
  twist: function(twist) {
    let ori, parity, v;
    if (twist != null) {
      parity = 0;
      for (let i = 6; i >= 0; --i) {
        ori = twist % 3;
        twist = (twist / 3) | 0;
        this.co[i] = ori;
        parity += ori;
      }
      this.co[7] = (3 - parity % 3) % 3;
      return this;
    } else {
      v = 0;
      for (let i = 0; i <= 6; ++i) {
        v = 3 * v + this.co[i];
      }
      return v;
    }
  },
  // The flip of the 12 edges, 0 <= flip < 2^11. The orientation of the
  // BR edge is fully determined by the orientation of the other edges.
  flip: function(flip) {
    let ori, parity, v;
    if (flip != null) {
      parity = 0;
      for (let i = 10; i >= 0; --i) {
        ori = flip % 2;
        flip = flip / 2 | 0;
        this.eo[i] = ori;
        parity += ori;
      }
      this.eo[11] = (2 - parity % 2) % 2;
      return this;
    } else {
      v = 0;
      for (let i = 0; i <= 10; ++i) {
        v = 2 * v + this.eo[i];
      }
      return v;
    }
  },
  // Parity of the corner permutation
  cornerParity: function() {
    let s = 0;
    for (let i = DRB; i >= URF + 1; --i) {
      for (let j = i - 1; j >= URF; --j) {
        if (this.cp[j] > this.cp[i]) {
          ++s;
        }
      }
    }
    return s % 2;
  },
  // Parity of the edges permutation. Parity of corners and edges are
  // the same if the cube is solvable.
  edgeParity: function() {
    let s = 0;
    for (let i = BR; i >= UR + 1; --i) {
      for (let j = i - 1; j >= UR; --j) {
        if (this.ep[j] > this.ep[i]) {
          ++s;
        }
      }
    }
    return s % 2;
  },
  // Permutation of the six corners URF, UFL, ULB, UBR, DFR, DLF
  URFtoDLF: permutationIndex('corners', URF, DLF),
  // Permutation of the three edges UR, UF, UL
  URtoUL: permutationIndex('edges', UR, UL),
  // Permutation of the three edges UB, DR, DF
  UBtoDF: permutationIndex('edges', UB, DF),
  // Permutation of the six edges UR, UF, UL, UB, DR, DF
  URtoDF: permutationIndex('edges', UR, DF),
  // Permutation of the equator slice edges FR, FL, BL and BR
  FRtoBR: permutationIndex('edges', FR, BR, true)
};

for (key in Include) {
  value = Include[key];
  CubieCube.prototype[key] = value;
}

computeMoveTable = function(context, coord, size) {
  // Loop through all valid values for the coordinate, setting cube's
  // state in each iteration. Then apply each of the 18 moves to the
  // cube, and compute the resulting coordinate.
  let apply = context === 'corners' ? 'moveCorner' : 'moveEdge';
  let cube = new CubieCube();
  let results = [];
  for (let i = 0; i < size; ++i) {
    cube[coord](i);
    inner = [];
    for (let j = 0; j < 6; ++j) {
      move = cube.rotation[j];
      for (let k = 0; k < 3; ++k) {
        cube[apply](move);
        inner.push(cube[coord]());
      }
      cube[apply](move);
    }
    results.push(inner);
  }
  return results;
};

mergeURtoDF = (function() {
  var a, b;
  a = new CubieCube();
  b = new CubieCube();
  return function(URtoUL, UBtoDF) {
    var i, m;
    a.URtoUL(URtoUL);
    b.UBtoDF(UBtoDF);
    for (i = m = 0; m <= 7; i = ++m) {
      if (a.ep[i] !== -1) {
        if (b.ep[i] !== -1) {
          return -1;
        } else {
          b.ep[i] = a.ep[i];
        }
      }
    }
    return b.URtoDF();
  };
})();

CubieCube.moveTables = {
  parity: [[1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
           [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]],
  twist: null,
  flip: null,
  FRtoBR: null,
  URFtoDLF: null,
  URtoDF: null,
  URtoUL: null,
  UBtoDF: null,
  mergeURtoDF: null
};

moveTableParams = {
  twist: ['corners', N_TWIST],
  flip: ['edges', N_FLIP],
  FRtoBR: ['edges', N_FRtoBR],
  URFtoDLF: ['corners', N_URFtoDLF],
  URtoDF: ['edges', N_URtoDF],
  URtoUL: ['edges', N_URtoUL],
  UBtoDF: ['edges', N_UBtoDF],
  mergeURtoDF: []
};

CubieCube.computeMoveTables = function() {
  let tables = arguments;
  if (tables.length === 0) {
    tables = (function() {
      let result = [];
      for (name in moveTableParams) {
        result.push(name);
      }
      return result;
    })();
  }
  for (let tableName of tables) {
    if (this.moveTables[tableName] !== null) { // already computed
      continue;
    }
    if (tableName === 'mergeURtoDF') {
      this.moveTables.mergeURtoDF = (function() {
        let results = [];
        for (let URtoUL = 0; URtoUL <= 335; ++URtoUL) {
          results.push((function() {
            let results1 = [];
            for (let UBtoDF = 0; UBtoDF <= 335; ++UBtoDF) {
              results1.push(mergeURtoDF(URtoUL, UBtoDF));
            }
            return results1;
          })());
        }
        return results;
      })();
    } else {
      let scope = null;
      let size = null;
      [scope, size] = moveTableParams[tableName];
      this.moveTables[tableName] = computeMoveTable(scope, tableName, size);
    }
  }
  return this;
};

//+++++++++++++++++++++++++++ search +++++++++++++++++++++++++++++++++++++++++

// Phase 1: All moves are valid
allMoves1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

// The list of next valid phase 1 moves when the given face was turned
// in the last move
nextMoves1 = (function() {
  let results = [];
  for (let lastFace = 0; lastFace < 6; ++lastFace) {
    next = [];
    // Don't allow commuting moves, e.g. U U'. Also make sure that
    // opposite faces are always moved in the same order, i.e. allow
    // U D but no D U. This avoids sequences like U D U'.
    for (let face = 0; face < 6; ++face) {
      if (face !== lastFace && face !== lastFace - 3) {
        for (let power = 0; power < 3; ++power) {
          next.push(face * 3 + power);
        }
      }
    }
    results.push(next);
  }
  return results;
})();

// Phase 2: Double moves of all faces plus quarter moves of U and D
allMoves2 = [0, 1, 2, 4, 7, 9, 10, 11, 13, 16];

nextMoves2 = (function() {
  let results = [];
  for (let lastFace = 0; lastFace < 6; ++lastFace) {
    let next = [];
    for (let face = 0; face < 6; ++face) {
      if (face !== lastFace && face !== lastFace - 3) {
        // Allow all moves of U and D and double moves of others
        let powers = null;
        if (face === 0 || face === 3) {
          powers = [0, 1, 2];
        } else {
          powers = [1];
        }
        for (let power of powers) {
          next.push(face * 3 + power);
        }
      }
    }
    results.push(next);
  }
  return results;
})();

// encode 8 values in one number
pruning = function(table, index, value) {
  let pos = index % 8;
  let slot = index >> 3;
  let shift = pos << 2;
  if (value != null) {
    // set
    table[slot] &= ~(0xF << shift);
    table[slot] |= value << shift;
    return value;
  } else {
    // get
    return (table[slot] & (0xF << shift)) >>> shift;
  }
};

computePruningTable = function(phase, size, currentCoords, nextIndex) {
  let table = (function() {
    let results = [];
    for (let i = 0; i <= Math.ceil(size / 8) - 1; ++i) {
      results.push(0xFFFFFFFF);
    }
    return results;
  })();

  if (phase === 1) {
    moves = allMoves1;
  } else {
    moves = allMoves2;
  }
  
  let depth = 0;
  pruning(table, 0, depth);
  let done = 1;

  // In each iteration, take each state found in the previous depth and
  // compute the next state. Stop when all states have been assigned a
  // depth.
  while (done !== size) {
    for (let index = 0; index < size; ++index) {
      if (pruning(table, index) === depth) {
        let current = currentCoords(index);
        for (let move of moves) {
          let next = nextIndex(current, move);
          if (pruning(table, next) === 0xF) {
            pruning(table, next, depth + 1);
            ++done;
          }
        }
      }
    }
    ++depth;
  }
  return table;
};

CubieCube.pruningTables = {
  sliceTwist: null,
  sliceFlip: null,
  sliceURFtoDLFParity: null,
  sliceURtoDFParity: null
};

pruningTableParams = {
  //[phase, size, currentCoords, nextIndex]
  sliceTwist: [
    1,
    N_SLICE1 * N_TWIST,
    function(index) {
      return [index % N_SLICE1, index / N_SLICE1 | 0];
    },
    function(current, move) {
      let slice = current[0], twist = current[1];
      let newSlice = CubieCube.moveTables.FRtoBR[slice * 24][move] / 24 | 0;
      let newTwist = CubieCube.moveTables.twist[twist][move];
      return newTwist * N_SLICE1 + newSlice;
    }
  ],
  sliceFlip: [
    1,
    N_SLICE1 * N_FLIP,
    function(index) {
      return [index % N_SLICE1, index / N_SLICE1 | 0];
    },
    function(current, move) {
      let slice = current[0], flip = current[1];
      let newSlice = CubieCube.moveTables.FRtoBR[slice * 24][move] / 24 | 0;
      let newFlip = CubieCube.moveTables.flip[flip][move];
      return newFlip * N_SLICE1 + newSlice;
    }
  ],
  sliceURFtoDLFParity: [
    2,
    N_SLICE2 * N_URFtoDLF * N_PARITY,
    function(index) {
      return [index % 2, (index / 2 | 0) % N_SLICE2, (index / 2 | 0) / N_SLICE2 | 0];
    },
    function(current, move) {
      let parity = current[0], slice = current[1], URFtoDLF = current[2];
      let newParity = CubieCube.moveTables.parity[parity][move];
      let newSlice = CubieCube.moveTables.FRtoBR[slice][move];
      let newURFtoDLF = CubieCube.moveTables.URFtoDLF[URFtoDLF][move];
      return (newURFtoDLF * N_SLICE2 + newSlice) * 2 + newParity;
    }
  ],
  sliceURtoDFParity: [
    2,
    N_SLICE2 * N_URtoDF * N_PARITY,
    function(index) {
      return [index % 2, (index / 2 | 0) % N_SLICE2, (index / 2 | 0) / N_SLICE2 | 0];
    },
    function(current, move) {
      let parity = current[0], slice = current[1], URtoDF = current[2];
      let newParity = CubieCube.moveTables.parity[parity][move];
      let newSlice = CubieCube.moveTables.FRtoBR[slice][move];
      let newURtoDF = CubieCube.moveTables.URtoDF[URtoDF][move];
      return (newURtoDF * N_SLICE2 + newSlice) * 2 + newParity;
    }
  ]
};

CubieCube.computePruningTables = function() {
  let  tables = arguments;
  if (tables.length === 0) {
    tables = (function() {
      let results = [];
      for (let name in pruningTableParams) {
        results.push(name);
      }
      return results;
    })();
  }
  for (let tableName of tables) {
    if (this.pruningTables[tableName] !== null) {// already computed
      continue;
    }
    this.pruningTables[tableName] = computePruningTable.apply(null, pruningTableParams[tableName]);
  }
  return this;
};

CubieCube.initSolver = function() {
  CubieCube.computeMoveTables();
  CubieCube.computePruningTables();
};

CubieCube.prototype.solve = function(maxDepth) {
  if (maxDepth == null) {
    maxDepth = 22;
  }
  // Names for all moves, i.e. U, U2, U', F, F2, ...
  moveNames = (function() {
    let faceName = ['U', 'R', 'F', 'D', 'L', 'B'];
    let powerName = ['', '2', "'"];
    let result = [];
    for (let face = 0; face < 6; ++face) {
      for (let power = 0; power < 3; ++power) {
        result.push(faceName[face] + powerName[power]);
      }
    }
    return result;
  })();

  class State {
    constructor(cube) {
      this.parent = null;
      this.lastMove = null;
      this.depth = 0;
      if (cube) {
        this.init(cube);
      }
    }

    init(cube) {
      // Phase 1 coordinates
      this.flip = cube.flip();
      this.twist = cube.twist();
      this.slice = cube.FRtoBR() / N_SLICE2 | 0;
      this.parity = cube.cornerParity();

      // Phase 2 coordinates
      this.URFtoDLF = cube.URFtoDLF();
      this.FRtoBR = cube.FRtoBR();

      // These are later merged to URtoDF when phase 2 begins
      this.URtoUL = cube.URtoUL();
      this.UBtoDF = cube.UBtoDF();
      return this;
    };

    solution() {
      if (this.parent) {
        return this.parent.solution() + moveNames[this.lastMove] + ' ';
      } else {
        return '';
      }
    };

    move(table, index, move) {
      return CubieCube.moveTables[table][index][move];
    };

    pruning(table, index) {
      return pruning(CubieCube.pruningTables[table], index);
    };

    // Phase 1

    // Return the next valid phase 1 moves for this state

    moves1() {
      if (this.lastMove !== null) {
        return nextMoves1[this.lastMove / 3 | 0];
      } else {
        return allMoves1;
      }
    };

    // Compute the minimum number of moves to the end of phase 1
    minDist1() {
      // The maximum number of moves to the end of phase 1 wrt. the
      // combination flip and slice coordinates only
      let d1 = this.pruning('sliceFlip', N_SLICE1 * this.flip + this.slice);
      // The combination of twist and slice coordinates
      let d2 = this.pruning('sliceTwist', N_SLICE1 * this.twist + this.slice);
      return Math.max(d1, d2);
    };

    // Compute the next phase 1 state for the given move
    next1(move) {
      let next = freeStates.pop();
      next.parent = this;
      next.lastMove = move;
      next.depth = this.depth + 1;
      next.flip = this.move('flip', this.flip, move);
      next.twist = this.move('twist', this.twist, move);
      next.slice = this.move('FRtoBR', this.slice * 24, move) / 24 | 0;
      return next;
    };

    // Phase 2

    // Return the next valid phase 2 moves for this state
    moves2() {
      if (this.lastMove !== null) {
        return nextMoves2[this.lastMove / 3 | 0];
      } else {
        return allMoves2;
      }
    };

    // Compute the minimum number of moves to the solved cube
    minDist2() {
      let index1 = (N_SLICE2 * this.URtoDF + this.FRtoBR) * N_PARITY + this.parity;
      let d1 = this.pruning('sliceURtoDFParity', index1);
      let index2 = (N_SLICE2 * this.URFtoDLF + this.FRtoBR) * N_PARITY + this.parity;
      let d2 = this.pruning('sliceURFtoDLFParity', index2);
      return Math.max(d1, d2);
    };

    // Initialize phase 2 coordinate
    init2(top) {
      if (top == null) {
        top = true;
      }
      if (this.parent === null) {// Already assigned for the initial state
        return;
      }
      // For other states, the phase 2 state is computed based on
      // parent's state.
      this.parent.init2(false);
      this.URFtoDLF = this.move('URFtoDLF', this.parent.URFtoDLF, this.lastMove);
      this.FRtoBR = this.move('FRtoBR', this.parent.FRtoBR, this.lastMove);
      this.parity = this.move('parity', this.parent.parity, this.lastMove);
      this.URtoUL = this.move('URtoUL', this.parent.URtoUL, this.lastMove);
      this.UBtoDF = this.move('UBtoDF', this.parent.UBtoDF, this.lastMove);
      if (top) {
        // This is the initial phase 2 state. Get the URtoDF coordinate
        // by merging URtoUL and UBtoDF
        return this.URtoDF = this.move('mergeURtoDF', this.URtoUL, this.UBtoDF);
      }
    };

    // Compute the next phase 2 state for the given move
    next2(move) {
      let next = freeStates.pop();
      next.parent = this;
      next.lastMove = move;
      next.depth = this.depth + 1;
      next.URFtoDLF = this.move('URFtoDLF', this.URFtoDLF, move);
      next.FRtoBR = this.move('FRtoBR', this.FRtoBR, move);
      next.parity = this.move('parity', this.parity, move);
      next.URtoDF = this.move('URtoDF', this.URtoDF, move);
      return next;
    };
  };

  solution = null;
  phase1search = function(state) {
    let results = [];
    for (let i = 1; i <= maxDepth; ++i) {
      let depth = i;
      phase1(state, depth);
      if (solution !== null) {
        break;
      }
      results.push(depth++);
    }
    return results;
  };

  phase1 = function(state, depth) {
    if (depth === 0) {
      if (state.minDist1() === 0) {
        // Make sure we don't start phase 2 with a phase 2 move as the
        // last move in phase 1, because phase 2 would then repeat the
        // same move.
        if (state.lastMove === null || allMoves2.indexOf(state.lastMove) == -1) {
          return phase2search(state);
        }
      }
    } else if (depth > 0) {
      if (state.minDist1() <= depth) {
        let results = [];
        for (let move of state.moves1()) {
          let next = state.next1(move);
          phase1(next, depth - 1);
          freeStates.push(next);
          if (solution !== null) {
            break;
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    }
  };

  phase2search = function(state) {
    // Initialize phase 2 coordinates
    state.init2();
    let results = [];
    for (let i = 1; i <= maxDepth - state.depth; ++i) {
      let depth = i;
      phase2(state, depth);
      if (solution !== null) {
        break;
      }
      results.push(depth++);
    }
    return results;
  };

  phase2 = function(state, depth) {
    if (depth === 0) {
      if (state.minDist2() === 0) {
        return solution = state.solution();
      }
    } else if (depth > 0) {
      if (state.minDist2() <= depth) {
        let results = [];
        for (let move of state.moves2()) {
          let next = state.next2(move);
          phase2(next, depth - 1);
          freeStates.push(next);
          if (solution !== null) {
            break;
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    }
  };

  freeStates = (function() {
    results = [];
    for (let i = 0; i <= maxDepth + 1; ++i) {
      results.push(new State());
    }
    return results;
  })();
  state = freeStates.pop().init(this);
  phase1search(state);
  freeStates.push(state);

  // Trim the trailing space
  if (solution.length > 0) {
    solution = solution.substring(0, solution.length - 1);
  }
  return solution;
};



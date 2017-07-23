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

//+++++++++++++++++++++++++ solve ++++++++++++++++++++++++++++++++++++++++

var Cnk, Include, N_FLIP, N_FRtoBR, N_PARITY, N_SLICE1, N_SLICE2, N_TWIST, N_UBtoDF, N_URFtoDLF, N_URtoDF, N_URtoUL, allMoves1, allMoves2, computeMoveTable, computePruningTable, factorial, key, max, mergeURtoDF, moveTableParams, nextMoves1, nextMoves2, permutationIndex, pruning, pruningTableParams, ref, ref1, rotateLeft, rotateRight, value,
  slice1 = [].slice,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Cnk = function(n, k) {
  var i, j, s;
  if (n < k) {
    return 0;
  }
  if (k > n / 2) {
    k = n - k;
  }
  s = 1;
  i = n;
  j = 1;
  while (i !== n - k) {
    s *= i;
    s /= j;
    i--;
    j++;
  }
  return s;
};

factorial = function(n) {
  var f, i, m, ref2;
  f = 1;
  for (i = m = 2, ref2 = n; 2 <= ref2 ? m <= ref2 : m >= ref2; i = 2 <= ref2 ? ++m : --m) {
    f *= i;
  }
  return f;
};

max = function(a, b) {
  if (a > b) {
    return a;
  } else {
    return b;
  }
};

rotateLeft = function(array, l, r) {
  var i, m, ref2, ref3, tmp;
  tmp = array[l];
  for (i = m = ref2 = l, ref3 = r - 1; ref2 <= ref3 ? m <= ref3 : m >= ref3; i = ref2 <= ref3 ? ++m : --m) {
    array[i] = array[i + 1];
  }
  return array[r] = tmp;
};

rotateRight = function(array, l, r) {
  var i, m, ref2, ref3, tmp;
  tmp = array[r];
  for (i = m = ref2 = r, ref3 = l + 1; ref2 <= ref3 ? m <= ref3 : m >= ref3; i = ref2 <= ref3 ? ++m : --m) {
    array[i] = array[i - 1];
  }
  return array[l] = tmp;
};

permutationIndex = function(context, start, end, fromEnd) {
  var i, maxAll, maxB, maxOur, our, permName;
  if (fromEnd == null) {
    fromEnd = false;
  }
  maxOur = end - start;
  maxB = factorial(maxOur + 1);
  if (context === 'corners') {
    maxAll = 7;
    permName = 'cp';
  } else {
    maxAll = 11;
    permName = 'ep';
  }
  our = (function() {
    var m, ref2, results;
    results = [];
    for (i = m = 0, ref2 = maxOur; 0 <= ref2 ? m <= ref2 : m >= ref2; i = 0 <= ref2 ? ++m : --m) {
      results.push(0);
    }
    return results;
  })();
  return function(index) {
    var a, b, c, j, k, m, o, p, perm, q, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, t, u, w, x, y, z;
    if (index != null) {
      for (i = m = 0, ref2 = maxOur; 0 <= ref2 ? m <= ref2 : m >= ref2; i = 0 <= ref2 ? ++m : --m) {
        our[i] = i + start;
      }
      b = index % maxB;
      a = index / maxB | 0;
      perm = this[permName];
      for (i = o = 0, ref3 = maxAll; 0 <= ref3 ? o <= ref3 : o >= ref3; i = 0 <= ref3 ? ++o : --o) {
        perm[i] = -1;
      }
      for (j = p = 1, ref4 = maxOur; 1 <= ref4 ? p <= ref4 : p >= ref4; j = 1 <= ref4 ? ++p : --p) {
        k = b % (j + 1);
        b = b / (j + 1) | 0;
        while (k > 0) {
          rotateRight(our, 0, j);
          k--;
        }
      }
      x = maxOur;
      if (fromEnd) {
        for (j = q = 0, ref5 = maxAll; 0 <= ref5 ? q <= ref5 : q >= ref5; j = 0 <= ref5 ? ++q : --q) {
          c = Cnk(maxAll - j, x + 1);
          if (a - c >= 0) {
            perm[j] = our[maxOur - x];
            a -= c;
            x--;
          }
        }
      } else {
        for (j = t = ref6 = maxAll; ref6 <= 0 ? t <= 0 : t >= 0; j = ref6 <= 0 ? ++t : --t) {
          c = Cnk(j, x + 1);
          if (a - c >= 0) {
            perm[j] = our[x];
            a -= c;
            x--;
          }
        }
      }
      return this;
    } else {
      perm = this[permName];
      for (i = u = 0, ref7 = maxOur; 0 <= ref7 ? u <= ref7 : u >= ref7; i = 0 <= ref7 ? ++u : --u) {
        our[i] = -1;
      }
      a = b = x = 0;
      if (fromEnd) {
        for (j = w = ref8 = maxAll; ref8 <= 0 ? w <= 0 : w >= 0; j = ref8 <= 0 ? ++w : --w) {
          if ((start <= (ref9 = perm[j]) && ref9 <= end)) {
            a += Cnk(maxAll - j, x + 1);
            our[maxOur - x] = perm[j];
            x++;
          }
        }
      } else {
        for (j = y = 0, ref10 = maxAll; 0 <= ref10 ? y <= ref10 : y >= ref10; j = 0 <= ref10 ? ++y : --y) {
          if ((start <= (ref11 = perm[j]) && ref11 <= end)) {
            a += Cnk(j, x + 1);
            our[x] = perm[j];
            x++;
          }
        }
      }
      for (j = z = ref12 = maxOur; ref12 <= 0 ? z <= 0 : z >= 0; j = ref12 <= 0 ? ++z : --z) {
        k = 0;
        while (our[j] !== start + j) {
          rotateLeft(our, 0, j);
          k++;
        }
        b = (j + 1) * b + k;
      }
      return a * maxB + b;
    }
  };
};

Include = {
  twist: function(twist) {
    var i, m, o, ori, parity, v;
    if (twist != null) {
      parity = 0;
      for (i = m = 6; m >= 0; i = --m) {
        ori = twist % 3;
        twist = (twist / 3) | 0;
        this.co[i] = ori;
        parity += ori;
      }
      this.co[7] = (3 - parity % 3) % 3;
      return this;
    } else {
      v = 0;
      for (i = o = 0; o <= 6; i = ++o) {
        v = 3 * v + this.co[i];
      }
      return v;
    }
  },
  flip: function(flip) {
    var i, m, o, ori, parity, v;
    if (flip != null) {
      parity = 0;
      for (i = m = 10; m >= 0; i = --m) {
        ori = flip % 2;
        flip = flip / 2 | 0;
        this.eo[i] = ori;
        parity += ori;
      }
      this.eo[11] = (2 - parity % 2) % 2;
      return this;
    } else {
      v = 0;
      for (i = o = 0; o <= 10; i = ++o) {
        v = 2 * v + this.eo[i];
      }
      return v;
    }
  },
  cornerParity: function() {
    var i, j, m, o, ref2, ref3, ref4, ref5, s;
    s = 0;
    for (i = m = ref2 = DRB, ref3 = URF + 1; ref2 <= ref3 ? m <= ref3 : m >= ref3; i = ref2 <= ref3 ? ++m : --m) {
      for (j = o = ref4 = i - 1, ref5 = URF; ref4 <= ref5 ? o <= ref5 : o >= ref5; j = ref4 <= ref5 ? ++o : --o) {
        if (this.cp[j] > this.cp[i]) {
          s++;
        }
      }
    }
    return s % 2;
  },
  edgeParity: function() {
    var i, j, m, o, ref2, ref3, ref4, ref5, s;
    s = 0;
    for (i = m = ref2 = BR, ref3 = UR + 1; ref2 <= ref3 ? m <= ref3 : m >= ref3; i = ref2 <= ref3 ? ++m : --m) {
      for (j = o = ref4 = i - 1, ref5 = UR; ref4 <= ref5 ? o <= ref5 : o >= ref5; j = ref4 <= ref5 ? ++o : --o) {
        if (this.ep[j] > this.ep[i]) {
          s++;
        }
      }
    }
    return s % 2;
  },
  URFtoDLF: permutationIndex('corners', URF, DLF),
  URtoUL: permutationIndex('edges', UR, UL),
  UBtoDF: permutationIndex('edges', UB, DF),
  URtoDF: permutationIndex('edges', UR, DF),
  FRtoBR: permutationIndex('edges', FR, BR, true)
};

for (key in Include) {
  value = Include[key];
  CubieCube.prototype[key] = value;
}

computeMoveTable = function(context, coord, size) {
  var apply, cube, i, inner, j, k, m, move, o, p, ref2, results;
  apply = context === 'corners' ? 'moveCorner' : 'moveEdge';
  cube = new CubieCube();
  results = [];
  for (i = m = 0, ref2 = size - 1; 0 <= ref2 ? m <= ref2 : m >= ref2; i = 0 <= ref2 ? ++m : --m) {
    cube[coord](i);
    inner = [];
    for (j = o = 0; o <= 5; j = ++o) {
      move = CubieCube.rotation[j];
      for (k = p = 0; p <= 2; k = ++p) {
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
  a = new CubieCube;
  b = new CubieCube;
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

N_TWIST = 2187;

N_FLIP = 2048;

N_PARITY = 2;

N_FRtoBR = 11880;

N_SLICE1 = 495;

N_SLICE2 = 24;

N_URFtoDLF = 20160;

N_URtoDF = 20160;

N_URtoUL = 1320;

N_UBtoDF = 1320;

CubieCube.moveTables = {
  parity: [[1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1], [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]],
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
  var len, m, name, ref2, scope, size, tableName, tables;
  tables = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
  if (tables.length === 0) {
    tables = (function() {
      var results;
      results = [];
      for (name in moveTableParams) {
        results.push(name);
      }
      return results;
    })();
  }
  for (m = 0, len = tables.length; m < len; m++) {
    tableName = tables[m];
    if (this.moveTables[tableName] !== null) {
      continue;
    }
    if (tableName === 'mergeURtoDF') {
      this.moveTables.mergeURtoDF = (function() {
        var UBtoDF, URtoUL, o, results;
        results = [];
        for (URtoUL = o = 0; o <= 335; URtoUL = ++o) {
          results.push((function() {
            var p, results1;
            results1 = [];
            for (UBtoDF = p = 0; p <= 335; UBtoDF = ++p) {
              results1.push(mergeURtoDF(URtoUL, UBtoDF));
            }
            return results1;
          })());
        }
        return results;
      })();
    } else {
      ref2 = moveTableParams[tableName], scope = ref2[0], size = ref2[1];
      this.moveTables[tableName] = computeMoveTable(scope, tableName, size);
    }
  }
  return this;
};

allMoves1 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

nextMoves1 = (function() {
  var face, lastFace, m, next, o, p, power, results;
  results = [];
  for (lastFace = m = 0; m <= 5; lastFace = ++m) {
    next = [];
    for (face = o = 0; o <= 5; face = ++o) {
      if (face !== lastFace && face !== lastFace - 3) {
        for (power = p = 0; p <= 2; power = ++p) {
          next.push(face * 3 + power);
        }
      }
    }
    results.push(next);
  }
  return results;
})();

allMoves2 = [0, 1, 2, 4, 7, 9, 10, 11, 13, 16];

nextMoves2 = (function() {
  var face, lastFace, len, m, next, o, p, power, powers, results;
  results = [];
  for (lastFace = m = 0; m <= 5; lastFace = ++m) {
    next = [];
    for (face = o = 0; o <= 5; face = ++o) {
      if (!(face !== lastFace && face !== lastFace - 3)) {
        continue;
      }
      powers = face === 0 || face === 3 ? [0, 1, 2] : [1];
      for (p = 0, len = powers.length; p < len; p++) {
        power = powers[p];
        next.push(face * 3 + power);
      }
    }
    results.push(next);
  }
  return results;
})();

pruning = function(table, index, value) {
  var pos, shift, slot;
  pos = index % 8;
  slot = index >> 3;
  shift = pos << 2;
  if (value != null) {
    table[slot] &= ~(0xF << shift);
    table[slot] |= value << shift;
    return value;
  } else {
    return (table[slot] & (0xF << shift)) >>> shift;
  }
};

computePruningTable = function(phase, size, currentCoords, nextIndex) {
  var current, depth, done, index, len, m, move, moves, next, o, ref2, table, x;
  table = (function() {
    var m, ref2, results;
    results = [];
    for (x = m = 0, ref2 = Math.ceil(size / 8) - 1; 0 <= ref2 ? m <= ref2 : m >= ref2; x = 0 <= ref2 ? ++m : --m) {
      results.push(0xFFFFFFFF);
    }
    return results;
  })();
  if (phase === 1) {
    moves = allMoves1;
  } else {
    moves = allMoves2;
  }
  depth = 0;
  pruning(table, 0, depth);
  done = 1;
  while (done !== size) {
    for (index = m = 0, ref2 = size - 1; 0 <= ref2 ? m <= ref2 : m >= ref2; index = 0 <= ref2 ? ++m : --m) {
      if (!(pruning(table, index) === depth)) {
        continue;
      }
      current = currentCoords(index);
      for (o = 0, len = moves.length; o < len; o++) {
        move = moves[o];
        next = nextIndex(current, move);
        if (pruning(table, next) === 0xF) {
          pruning(table, next, depth + 1);
          done++;
        }
      }
    }
    depth++;
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
  sliceTwist: [
    1, N_SLICE1 * N_TWIST, function(index) {
      return [index % N_SLICE1, index / N_SLICE1 | 0];
    }, function(current, move) {
      var newSlice, newTwist, slice, twist;
      slice = current[0], twist = current[1];
      newSlice = CubieCube.moveTables.FRtoBR[slice * 24][move] / 24 | 0;
      newTwist = CubieCube.moveTables.twist[twist][move];
      return newTwist * N_SLICE1 + newSlice;
    }
  ],
  sliceFlip: [
    1, N_SLICE1 * N_FLIP, function(index) {
      return [index % N_SLICE1, index / N_SLICE1 | 0];
    }, function(current, move) {
      var flip, newFlip, newSlice, slice;
      slice = current[0], flip = current[1];
      newSlice = CubieCube.moveTables.FRtoBR[slice * 24][move] / 24 | 0;
      newFlip = CubieCube.moveTables.flip[flip][move];
      return newFlip * N_SLICE1 + newSlice;
    }
  ],
  sliceURFtoDLFParity: [
    2, N_SLICE2 * N_URFtoDLF * N_PARITY, function(index) {
      return [index % 2, (index / 2 | 0) % N_SLICE2, (index / 2 | 0) / N_SLICE2 | 0];
    }, function(current, move) {
      var URFtoDLF, newParity, newSlice, newURFtoDLF, parity, slice;
      parity = current[0], slice = current[1], URFtoDLF = current[2];
      newParity = CubieCube.moveTables.parity[parity][move];
      newSlice = CubieCube.moveTables.FRtoBR[slice][move];
      newURFtoDLF = CubieCube.moveTables.URFtoDLF[URFtoDLF][move];
      return (newURFtoDLF * N_SLICE2 + newSlice) * 2 + newParity;
    }
  ],
  sliceURtoDFParity: [
    2, N_SLICE2 * N_URtoDF * N_PARITY, function(index) {
      return [index % 2, (index / 2 | 0) % N_SLICE2, (index / 2 | 0) / N_SLICE2 | 0];
    }, function(current, move) {
      var URtoDF, newParity, newSlice, newURtoDF, parity, slice;
      parity = current[0], slice = current[1], URtoDF = current[2];
      newParity = CubieCube.moveTables.parity[parity][move];
      newSlice = CubieCube.moveTables.FRtoBR[slice][move];
      newURtoDF = CubieCube.moveTables.URtoDF[URtoDF][move];
      return (newURtoDF * N_SLICE2 + newSlice) * 2 + newParity;
    }
  ]
};

CubieCube.computePruningTables = function() {
  var len, m, name, params, tableName, tables;
  tables = 1 <= arguments.length ? slice1.call(arguments, 0) : [];
  if (tables.length === 0) {
    tables = (function() {
      var results;
      results = [];
      for (name in pruningTableParams) {
        results.push(name);
      }
      return results;
    })();
  }
  for (m = 0, len = tables.length; m < len; m++) {
    tableName = tables[m];
    if (this.pruningTables[tableName] !== null) {
      continue;
    }
    params = pruningTableParams[tableName];
    this.pruningTables[tableName] = computePruningTable.apply(null, params);
  }
  return this;
};

CubieCube.initSolver = function() {
  CubieCube.computeMoveTables();
  return CubieCube.computePruningTables();
};

CubieCube.prototype.solve = function(maxDepth) {
  var State, freeStates, moveNames, phase1, phase1search, phase2, phase2search, solution, state, x;
  if (maxDepth == null) {
    maxDepth = 22;
  }
  moveNames = (function() {
    var face, faceName, m, o, power, powerName, result;
    faceName = ['U', 'R', 'F', 'D', 'L', 'B'];
    powerName = ['', '2', "'"];
    result = [];
    for (face = m = 0; m <= 5; face = ++m) {
      for (power = o = 0; o <= 2; power = ++o) {
        result.push(faceName[face] + powerName[power]);
      }
    }
    return result;
  })();
  State = (function() {
    function State(cube) {
      this.parent = null;
      this.lastMove = null;
      this.depth = 0;
      if (cube) {
        this.init(cube);
      }
    }

    State.prototype.init = function(cube) {
      this.flip = cube.flip();
      this.twist = cube.twist();
      this.slice = cube.FRtoBR() / N_SLICE2 | 0;
      this.parity = cube.cornerParity();
      this.URFtoDLF = cube.URFtoDLF();
      this.FRtoBR = cube.FRtoBR();
      this.URtoUL = cube.URtoUL();
      this.UBtoDF = cube.UBtoDF();
      return this;
    };

    State.prototype.solution = function() {
      if (this.parent) {
        return this.parent.solution() + moveNames[this.lastMove] + ' ';
      } else {
        return '';
      }
    };

    State.prototype.move = function(table, index, move) {
      return CubieCube.moveTables[table][index][move];
    };

    State.prototype.pruning = function(table, index) {
      return pruning(CubieCube.pruningTables[table], index);
    };

    State.prototype.moves1 = function() {
      if (this.lastMove !== null) {
        return nextMoves1[this.lastMove / 3 | 0];
      } else {
        return allMoves1;
      }
    };

    State.prototype.minDist1 = function() {
      var d1, d2;
      d1 = this.pruning('sliceFlip', N_SLICE1 * this.flip + this.slice);
      d2 = this.pruning('sliceTwist', N_SLICE1 * this.twist + this.slice);
      return max(d1, d2);
    };

    State.prototype.next1 = function(move) {
      var next;
      next = freeStates.pop();
      next.parent = this;
      next.lastMove = move;
      next.depth = this.depth + 1;
      next.flip = this.move('flip', this.flip, move);
      next.twist = this.move('twist', this.twist, move);
      next.slice = this.move('FRtoBR', this.slice * 24, move) / 24 | 0;
      return next;
    };

    State.prototype.moves2 = function() {
      if (this.lastMove !== null) {
        return nextMoves2[this.lastMove / 3 | 0];
      } else {
        return allMoves2;
      }
    };

    State.prototype.minDist2 = function() {
      var d1, d2, index1, index2;
      index1 = (N_SLICE2 * this.URtoDF + this.FRtoBR) * N_PARITY + this.parity;
      d1 = this.pruning('sliceURtoDFParity', index1);
      index2 = (N_SLICE2 * this.URFtoDLF + this.FRtoBR) * N_PARITY + this.parity;
      d2 = this.pruning('sliceURFtoDLFParity', index2);
      return max(d1, d2);
    };

    State.prototype.init2 = function(top) {
      if (top == null) {
        top = true;
      }
      if (this.parent === null) {
        return;
      }
      this.parent.init2(false);
      this.URFtoDLF = this.move('URFtoDLF', this.parent.URFtoDLF, this.lastMove);
      this.FRtoBR = this.move('FRtoBR', this.parent.FRtoBR, this.lastMove);
      this.parity = this.move('parity', this.parent.parity, this.lastMove);
      this.URtoUL = this.move('URtoUL', this.parent.URtoUL, this.lastMove);
      this.UBtoDF = this.move('UBtoDF', this.parent.UBtoDF, this.lastMove);
      if (top) {
        return this.URtoDF = this.move('mergeURtoDF', this.URtoUL, this.UBtoDF);
      }
    };

    State.prototype.next2 = function(move) {
      var next;
      next = freeStates.pop();
      next.parent = this;
      next.lastMove = move;
      next.depth = this.depth + 1;
      next.URFtoDLF = this.move('URFtoDLF', this.URFtoDLF, move);
      next.FRtoBR = this.move('FRtoBR', this.FRtoBR, move);
      next.parity = this.move('parity', this.parity, move);
      next.URtoDF = this.move('URtoDF', this.URtoDF, move);
      return next;
    };

    return State;

  })();
  solution = null;
  phase1search = function(state) {
    var depth, m, ref2, results;
    depth = 0;
    results = [];
    for (depth = m = 1, ref2 = maxDepth; 1 <= ref2 ? m <= ref2 : m >= ref2; depth = 1 <= ref2 ? ++m : --m) {
      phase1(state, depth);
      if (solution !== null) {
        break;
      }
      results.push(depth++);
    }
    return results;
  };
  phase1 = function(state, depth) {
    var len, m, move, next, ref2, ref3, results;
    if (depth === 0) {
      if (state.minDist1() === 0) {
        if (state.lastMove === null || (ref2 = state.lastMove, indexOf.call(allMoves2, ref2) < 0)) {
          return phase2search(state);
        }
      }
    } else if (depth > 0) {
      if (state.minDist1() <= depth) {
        ref3 = state.moves1();
        results = [];
        for (m = 0, len = ref3.length; m < len; m++) {
          move = ref3[m];
          next = state.next1(move);
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
    var depth, m, ref2, results;
    state.init2();
    results = [];
    for (depth = m = 1, ref2 = maxDepth - state.depth; 1 <= ref2 ? m <= ref2 : m >= ref2; depth = 1 <= ref2 ? ++m : --m) {
      phase2(state, depth);
      if (solution !== null) {
        break;
      }
      results.push(depth++);
    }
    return results;
  };
  phase2 = function(state, depth) {
    var len, m, move, next, ref2, results;
    if (depth === 0) {
      if (state.minDist2() === 0) {
        return solution = state.solution();
      }
    } else if (depth > 0) {
      if (state.minDist2() <= depth) {
        ref2 = state.moves2();
        results = [];
        for (m = 0, len = ref2.length; m < len; m++) {
          move = ref2[m];
          next = state.next2(move);
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
    var m, ref2, results;
    results = [];
    for (x = m = 0, ref2 = maxDepth + 1; 0 <= ref2 ? m <= ref2 : m >= ref2; x = 0 <= ref2 ? ++m : --m) {
      results.push(new State);
    }
    return results;
  })();
  state = freeStates.pop().init(this);
  phase1search(state);
  freeStates.push(state);
  if (solution.length > 0) {
    solution = solution.substring(0, solution.length - 1);
  }
  return solution;
};

CubieCube.scramble = function() {
  return CubieCube.inverse(CubieCube.random().solve());
};




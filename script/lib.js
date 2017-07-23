// n choose k, i.e. the binomial coeffiecient
Cnk = function(n, k) {
  let i = null;
  let j = null;
  let s = null;
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

// n!
factorial = function(n) {
  let result = 1;
  for (let i = 1; i <= n; ++i) {
    result *= i;
  }
  return result;
};

// move array[l] to array[r] (l < r), and shift elements between
moveLeft = function(array, l, r) {
  if (l >= r) {
    console.log("Error in shiftLeft");
  }
  let tmp = array[l];
  for (let i = l; i < r; ++i) {
    array[i] = array[i + 1];
  }
  array[r] = tmp;
};

// move array[r] to array[l] (l < r), and shift elements between
moveRight = function(array, l, r) {
  if (l >= r) {
    console.log("Error in shiftLeft");
  }
  let tmp = array[r];
  for (let i = r; i > l; --i) {
    array[i] = array[i - 1];
  }
  array[l] = tmp;
}

// Generate a function that computes permutation indices.
//
// The permutation index actually encodes two indices: Combination,
// i.e. positions of the cubies start..end (A) and their respective
// permutation (B). The maximum value for B is
//
//   maxB = (end - start + 1)!
//
// and the index is A * maxB + B
permutationIndex = function(context, start, end, fromEnd) {
  let maxAll, maxB, maxOur, our, permName;
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
  our = new Int32Array(maxOur);
  return function(index) {
    // reset our to [start...end]
    if (index != null) {
      for (let i = 0; i <= maxOur; ++i) {
        our[i] = i + start;
      }

      let b = index % maxB; // permutation
      let a = index / maxB | 0; // combination

      // invalidate all edges
      perm = this[permName];
      for (let i = 0; i <= maxAll; ++i) {
        perm[i] = -1;
      }

      // generate permutation from index b
      for (let j = 1; j <= maxOur; ++j) {
        let k = b % (j + 1);
        b = b / (j + 1) | 0;
        while (k > 0) {
          moveRight(our, 0, j);
          --k;
        }
      }

      // generate combination and set our edges
      let x = maxOur;
      if (fromEnd) {
        for (let j = 0; j <= maxLll; ++j) {
          let c = Cnk(maxAll - j, x + 1);
          if (a - c >= 0) {
            perm[j] = our[maxOur - x];
            a -= c;
            x--;
          }

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



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
// The permutation index actually encodes two indices: Combination,
// i.e. positions of the cubies start..end (A) and their respective
// permutation (B). The maximum value for B is
//   maxB = (end - start + 1)!
// and the index is A * maxB + B
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
    let result;
    result = [];
    for (let i = 0; i <= maxOur; ++i) {
      result.push(0);
    }
    return result;
  })();

  return function(index) {
    let perm, x;

    if (index != null) {
      // Reset our to [start..end]
      for (let i = 0; i <= maxOur; ++i) {
        our[i] = i + start;
      }

      let a = index / maxB | 0;
      let b = index % maxB;

      // Invalidate all edges
      perm = this[permName];
      for (let i = 0; i <= maxAll; ++i) {
        perm[i] = -1;
      }

      // Generate permutation from index b
      for (let j = 0; j <= maxOur; ++j) {
        let k = b % (j + 1);
        b = b / (j + 1) | 0;
        while (k > 0) {
          moveRight(our, 0, j);
          --k;
        }
      }

      // Generate combination and set our edges
      x = maxOur;

      if (fromEnd) {
        for (let j = 0; j <= maxAll; ++j) {
          let c = Cnk(maxAll - j, x + 1);
          if (a - c >= 0) {
            perm[j] = our[maxOur - x];
            a -= c;
            --x;
          }
        }
      } else {
        for (let j = maxAll; j >= 0; --j) {
          let c = Cnk(j, x + 1);
          if (a - c >= 0) {
            perm[j] = our[x];
            a -= c;
            --x;
          }
        }
      }
      return this;
    } else {
      perm = this[permName];
      for (let i = 0; i <= maxOur; ++i) {
        our[i] = -1;
      }
      a = b = x = 0;

      // Compute the index a < ((maxAll + 1) choose (maxOur + 1)) and
      // the permutation
      if (fromEnd) {
        for(let j = maxAll; j >= 0; --j) {
          if (start <= perm[j] && perm[j] <= end) {
            a += Cnk(maxAll - j, x + 1);
            our[maxOur - x] = perm[j];
            ++x;
          }
        }
      } else {
        for (let j = 0; j <= maxAll; ++j) {
          if (start <= perm[j] && perm[j] <= end) {
            a += Cnk(j, x + 1);
            our[x] = perm[j];
            ++x;
          }
        }
      }

      // Compute the index b < (maxOur + 1)! for the permutation
      for (let j = maxOur; j >= 0; --j) {
        let k = 0;
        while (our[j] != start + j) {
          moveLeft(our, 0, j);
          ++k;
        }
        b = (j + 1) * b + k;
      }
      return a * maxB + b;
    }
  };
};



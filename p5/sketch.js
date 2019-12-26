var n_x = 1000;
var x = [], f_x = [], s_x = [];
var indices;

var n_unif = 10000;
var unif = [], f_unif = [], s_unif = [];
var lim_inf, lim_sup, volume_support;

setup = () => {
  createCanvas(600, 600);
  background("#F6F6F6");

  // generate data
  
  for (let i = 0; i < n_x; i++) {
    let value = randomGaussian(0,1)
    x.push(value);
    f_x.push(pdf(value, 0, 1.5));
    s_x.push(pdf(value, 0, 1));
  }
  indices = new Array(n_x);
  for (var i = 0; i < n_x; ++i) indices[i] = i;
  indices.sort(function (a, b) { return x[a] < x[b] ? -1 : x[a] > x[b] ? 1 : 0; });

  // generate uniform data
  lim_inf = Math.min.apply(Math, x);
  lim_sup = Math.max.apply(Math, x);
  volume_support = lim_sup - lim_inf;
  for (let i = 0; i < n_unif; i++) {
    let value = uniform(lim_inf, lim_sup)
    unif.push(value);
    f_unif.push(pdf(value, 0, 1.5));
    s_unif.push(pdf(value, 0, 1));
  }

  // generate alpha

  translate(width/2, height/2);
  noFill();
  beginShape();
  for (let i = 0; i < n_x; i++) {
    let pos = indices[i]
    vertex(x[pos]*30, -f_x[pos]*300);
  }
  endShape();


  console.log();
}

// draw = () => {
//   background("#F6F6F6");

//   // for(v in x){
//   //   console.log(v);
//   // }
// }


pdf = function(x, mean, std) {
  var m = std * Math.sqrt(2 * Math.PI);
  var e = Math.exp(-Math.pow(x - mean, 2) / (2 * pow(std,2)));
  return e / m;
};

uniform = (min, max) => {
  return Math.random() * (max - min) + min;
}


Array.prototype.sortIndices = function (func) {
  var i = j = this.length,
      that = this;

  while (i--) {
      this[i] = { k: i, v: this[i] };
  }

  this.sort(function (a, b) {
      return func ? func.call(that, a.v, b.v) : 
                    a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
  });

  while (j--) {
      this[j] = this[j].k;
  }
}
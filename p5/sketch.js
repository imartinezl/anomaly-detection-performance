var n_x = 1000;
var x = [], f_x = [], s_x = [];
var i_x, i_unif;

var n_unif = 1000;
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

  // get ordered indexes
  i_x = new Array(n_x);
  for (var i = 0; i < n_x; ++i) i_x[i] = i;
  i_x.sort(function (a, b) { return x[a] < x[b] ? -1 : x[a] > x[b] ? 1 : 0; });

  // generate uniform data
  lim_y = Math.max(Math.max.apply(Math, f_x), Math.max.apply(Math, s_x));
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
  let alpha_min = 0.0;
  let alpha_max = 0.999;
  let alpha_by = 0.001;
  let alpha = [];
  for (let a = alpha_min; a <= alpha_max; a+=alpha_by) {
    alpha.push(a)
  }

  // plots

  translate(width/2, height/2);

  let sx = 50, sy=500;

  line(lim_inf*sx, 0, lim_sup*sx, 0);
  line(0, 0, 0, -lim_y*sy);

  // plot true density
  noFill();
  stroke(255,0,0);
  beginShape();
  for (let i = 0; i < n_x; i++) {
    let pos = i_x[i]
    vertex(x[pos]*sx, -f_x[pos]*sy);
  }
  endShape();

  // plot scoring function
  noFill();
  stroke(0,255,0);
  beginShape();
  for (let i = 0; i < n_x; i++) {
    let pos = i_x[i]
    vertex(x[pos]*sx, -s_x[pos]*sy);
  }
  endShape();

  // plot rug on margin
  noFill();
  stroke(0, 50);
  strokeWeight(0.5);
  for (let i = 0; i < n_x; i++) {
    push();
    let pos = i_x[i]
    translate(x[pos]*sx, 10);
    line(0,0,0,10);
    pop();
  }

  // calculate mass-volume
  i_unif = new Array(n_unif);
  for (var i = 0; i < n_unif; ++i) i_unif[i] = i;
  i_unif.sort(function (a, b) { return unif[a] < unif[b] ? -1 : unif[a] > unif[b] ? 1 : 0; });

  let t = 0.3;
  let dif = [], dif_sign = [];
  for (let i = 0; i < n_unif; i++) {
    let pos = i_unif[i];
    dif.push(s_unif[pos]-t);
    dif_sign.push(Math.sign(dif));
  }
  console.log(dif);
  for (let i = 0; i < n_unif-1; i++) {
    let d = dif[i+1]-dif[i]; // TO-DO
    if(d === 0){
      console.log(i);
    }
  }


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
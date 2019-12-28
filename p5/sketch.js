



let distributions, alpha = [];
let j = 0, jj = 1;

setup = () => {
  createCanvas(1000, 1000);
  background("#F6F6F6");
  
  //generate alpha
  let alpha_min = 0.0;
  let alpha_max = 0.999;
  let alpha_by = 0.005;
  for (let a = alpha_min; a <= alpha_max; a += alpha_by) {
    alpha.push(a);
  }

  let n_x = 1000;
  let n_unif = 10000;
  let pos = createVector(300, 400);
  let scl = createVector(70, -700);

  // TO-DO: create new generator to allow multiple modes
  let gen = { f: randomGaussian, p: [0, 1] };
  let pdf = { f: dnorm, p: [0, 1] };
  gen = {f: custom_gen, p: []};
  pdf = {f: custom_pdf, p: []};
  let dA = new Distribution(n_x, n_unif, gen, pdf, alpha, pos, scl);

  // gen = { f: randomGaussian, p: [0, 1] };
  // pdf = { f: dnorm, p: [0, 1.5] };
  // let dB = new Distribution(n_x, n_unif, gen, pdf, alpha, pos, scl);

  distributions = [dA];

}

draw = () => {
  background("#F6F6F6");
  for (let i = 0; i < distributions.length; i++) {
    distributions[i].display(j);
  }
  j += jj;
  if (j >= alpha.length - 1 | j < 0) {
    jj *= -1;
    j += jj;
  }
}

custom_gen = (seed) => {
  let num;
  if(random() > 0.5) num = randomGaussian(0,1);
  else num = randomGaussian(5,1.5);
  return num
}

custom_pdf = (x) => {
  let num = dnorm(x, 0, 1) + dnorm(x, 5, 1.5) + random()/100;
  return num
}


dnorm = (x, mean, std) =>{
  var m = std * Math.sqrt(2 * Math.PI);
  var e = Math.exp(-Math.pow(x - mean, 2) / (2 * pow(std, 2)));
  return e / m;
};

runif = (min, max) => {
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
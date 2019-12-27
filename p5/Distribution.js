class Distribution {

  constructor(nx, nunif, gen, pdf, pos, scl) {
    this.nx = nx;
    this.nunif = nunif;
    this.gen = gen;
    this.pdf = pdf;
    this.pos = pos;
    this.scl = scl;
    this.generate_data();
    this.generate_uniform_data();
    colorMode(HSB,255)
    this.color = color(random(255),255,255,100);
    //this.color.setAlpha(100);

  }

  
  // generate data
  generate_data() {
    this.x = [], this.sx = [];
    for (let i = 0; i < this.nx; i++) {
      let value = this.gen.f(...this.gen.p);
      this.x.push(value);
      this.sx.push(this.pdf.f(value, ...this.pdf.p));
    }
    this.id_x = this.order(this.x);
    this.id_sx = this.order(this.sx)
  }
  
  // generate uniform data
  generate_uniform_data() {
    this.unif = [], this.sunif = [];
    this.lim_y = Math.max.apply(Math, this.sx);
    this.lim_inf = Math.min.apply(Math, this.x);
    this.lim_sup = Math.max.apply(Math, this.x);
    this.volume_support = this.lim_sup - this.lim_inf;
    for (let i = 0; i < this.nunif; i++) {
      let value = runif(this.lim_inf, this.lim_sup);
      this.unif.push(value);
      this.sunif.push(this.pdf.f(value,...this.pdf.p));
    }
    this.id_unif = this.order(this.unif);
  }
  
  // get ordered indexes
  order(x) {
    let id = new Array(x.length);
    for (var i = 0; i < x.length; ++i) id[i] = i;
    id.sort(function (a, b) { return x[a] < x[b] ? -1 : x[a] > x[b] ? 1 : 0; });
    return id;
  }
  
  get_threshold(alpha) {
    let mass = 0;
    let cont = 0;
    let t = 0;
    while (mass < alpha) {
      cont++;
      t = this.sx[this.id_sx[this.nx - cont - 1]];
      mass = cont / this.nx;
    }
    return t;
  }

  get_cut_points(t) {

    let sign_prev;
    let cut_index = [0];
    let cut_sign = [-1];
    for (let i = 0; i < this.nunif; i++) {
      let pos = this.id_unif[i];
      let sign = Math.sign(this.sunif[pos] - t);
      if (sign_prev && sign - sign_prev !== 0) {
        cut_index.push(i - 1);
        cut_sign.push(sign_prev);
      }
      sign_prev = sign;
    }
    cut_index.push(this.nunif - 2);
    cut_sign.push(-1);
    //console.log(cut_index, cut_sign);

    let cut_points = [];
    let cont = 0;
    for (let i = 0; i < cut_index.length - 1; i++) {
      let good = cut_sign[i] * cut_sign[i + 1] === -1;
      if (good) {
        if (cont % 2 === 0) {
          cut_points.push({ a: cut_index[i], b: cut_index[i + 1] });
        }
        cont++;
      }
    }
    return cut_points;
  }

  update(alpha) {
    let t = this.get_threshold(alpha);
    let cut_points = this.get_cut_points(t);
    return {alpha, t, cut_points};
  }

  set_data(data){
    this.alpha = data.alpha;
    this.t = data.t;
    this.cut_points = data.cut_points;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    this.plot_axis();
    //this.plot_fx();
    this.plot_sx();
    this.plot_rug();
    if(this.t) this.plot_threshold();
    if(this.cut_points) this.plot_cut_points();
    pop();
  }

  // plot_axis
  plot_axis() {
    noFill();
    strokeWeight(1);
    stroke(0);
    line(this.lim_inf*this.scl.x, 0, this.lim_sup*this.scl.x, 0);
    line(0, 0, 0, this.lim_y*this.scl.y);
  }

  // plot scoring function
  plot_sx() {
    noFill();
    strokeWeight(1.5);
    stroke(this.color);
    beginShape();
    for (let i = 0; i < this.nx; i++) {
      let pos = this.id_x[i]
      vertex(this.x[pos]*this.scl.x, this.sx[pos]*this.scl.y);
    }
    endShape();
  }

  // plot rug on margin
  plot_rug() {
    noFill();
    strokeWeight(0.5);
    stroke(this.color);
    for (let i = 0; i < this.nx; i++) {
      push();
      let pos = this.id_x[i]
      translate(this.x[pos]*this.scl.x, 10);
      line(0, 0, 0, 10);
      pop();
    }

  }

  // plot threshold line
  plot_threshold() {
    strokeWeight(1);
    stroke(this.color);
    noFill();
    line(this.lim_inf*this.scl.x, this.t*this.scl.y, this.lim_sup*this.scl.x, this.t*this.scl.y);
  }

  // plot cut points
  plot_cut_points(){
    stroke(0);
    strokeWeight(0);
    //this.color.setAlpha(100);
    fill(this.color);
    for (let i = 0; i < this.cut_points.length; i++) {
      let a = this.cut_points[i].a;
      let b = this.cut_points[i].b;
      let xa = this.unif[this.id_unif[a]];
      let xb = this.unif[this.id_unif[b]];
      beginShape();
      vertex(xa*this.scl.x, 0);
      for (let j = a; j <= b; j++) {
        let xj = this.unif[this.id_unif[j]];
        let yj = this.sunif[this.id_unif[j]];
        vertex(xj*this.scl.x, yj*this.scl.y);
      }
      vertex(xb*this.scl.x, 0);
      endShape(CLOSE);
    }
  }
}
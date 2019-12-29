
let env, j=0, jj=1;

init = () => {
  init_slider();
  generate_alpha();
  generate_distributions();
}

update = () => {
  j = 0;
  jj = 1;
  generate_alpha();
  update_distributions();
}

setup = () => {
  createCanvas(1000, 1000);
  background("#F6F6F6");
  env = new Environment();
  init();
}

draw = () => {
  background("#F6F6F6");
  env.display();
  for (let i = 0; i < distributions.length; i++) {
    distributions[i].display(j);
  }
  j += jj;
  if (j >= alpha.length - 1 | j < 0) {
    jj *= -1;
    j += jj;
  }
}





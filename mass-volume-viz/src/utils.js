custom_gen = (seed) => {
    let num;
    if (Math.random() > 0.5) num = p5.randomGaussian(0, 1);
    else num = p5.randomGaussian(5, 1.5);
    return num
}

custom_pdf = (x) => {
    let num = dnorm(x, 0, 1) + dnorm(x, 5, 1.5); // + random()/100;
    return num
}

generateGaussian = (mean, std) => {
    const _2PI = Math.PI * 2;
    var u1 = Math.random();
    var u2 = Math.random();

    var z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(_2PI * u2);
    var z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(_2PI * u2);

    return z0 * std + mean;
}

dnorm = (x, mean, std) => {
    var m = std * Math.sqrt(2 * Math.PI);
    var e = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(std, 2)));
    return e / m;
};
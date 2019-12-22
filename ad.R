library(dplyr)


# DATA --------------------------------------------------------------------

n <- 1000
x <- rnorm(n,0,1)
hist(x)


# SCORING FUNCTION --------------------------------------------------------

s <- dnorm(x,0,1)
plot(x,s)


# UNIMODALITY STUDY -------------------------------------------------------

bw <- 1
a <- density(x, bw)
plot(a$x, a$y)

estimate_mode <- function(bw, x){
  d <- density(x,bw)
  mode <- d$x[which.max(d$y)]
  return(mode)
}
x <- c(rnorm(n,0,1),rnorm(1000,5,1.5))
bw <- seq(1e-5, 1, length.out = 100)
est_mode <- lapply(bw, estimate_mode, x)
plot(bw, est_mode)


# MASS-VOLUME -------------------------------------------------------------

auc <- function(x,y){
  return(sum((x-lag(x))*(y+lead(y))/2))
}
mv <- function(axis_alpha, volume_support, s_unif, s_X, n_generated){
  n <- length(s_X)
  s_X_order <- order(s_X)
  mass <- 0
  cpt <- 0
  u <- s_X[s_X_order[n-cpt]]
  mv <- numeric(length(axis_alpha))
  for(i in 1:length(axis_alpha)){
    while(mass < axis_alpha[i]){
      cpt <- cpt + 1
      u <- s_X[s_X_order[n-cpt]]
      mass <- cpt / n
    }
    mv[i] <- sum(s_unif >= u) / n_generated * volume_support
  }
  return(list(auc_mv = auc(axis_alpha, mv), mv = mv))
}

em <- function(t, t_max, volume_support, s_unif, s_X, n_generated){
  EM_t <- numeric(length(t))
  n <- length(s_X)
  s_X_unique <- unique(s_X)
  EM_t[1] <- 1.0
  for(u in s_X_unique){
    EM_t <- pmax(EM_t, sum(s_X > u)/n - t * sum(s_unif > u) / n_generated * volume_support)
  }
  amax <- which.max(EM_t <= t_max) + 1
  if(amax == 1){
    print("\n failed to achieve t_max \n")
    amax <- -1
  }
  auc_em <- auc(t[1:amax], EM_t[1:amax])
  return(list(auc_em=auc_em, EM_t=EM_t, amax=amax))
}


n <- 1000
x <- rnorm(n, 0, 1)
s_X <- dnorm(x, 0, 1)

lim_inf <- min(x)
lim_sup <- max(x)
volume_support <- prod(lim_sup - lim_inf)
n_generated <- 10000
unif <- runif(n_generated, lim_inf, lim_sup)
s_unif <- dnorm(unif, 0, 1)
alpha_min <- 0
alpha_max <- 0.999
axis_alpha <- seq(alpha_min, alpha_max, 0.0001)

mv_result <- mv(axis_alpha, volume_support, s_unif, s_X, n_generated)
plot(axis_alpha, mv_result$mv)

t <- seq(0, 100 / volume_support, by=0.01 / volume_support)
t_max <- 0.9
em_result <- em(t, t_max, volume_support, s_unif, s_X, n_generated)
plot(t, em_result$EM_t)

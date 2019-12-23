library(dplyr)

# DATA --------------------------------------------------------------------

n <- 1000
x <- c(rnorm(n,0,1), rnorm(n, 10, 1))
hist(x, breaks = 100)

# UNIMODALITY STUDY -------------------------------------------------------

bw <- 1
a <- density(x, bw)
plot(a$x, a$y)

estimate_mode <- function(bw, x){
  d <- density(x,bw)
  mode <- d$x[which.max(d$y)]
  return(mode)
}
bins_min <- 10
bw_max <- diff(range(x)) / bins_min
bw <- seq(1e-5, bw_max, length.out = 100)
est_mode <- lapply(bw, estimate_mode, x)
plot(bw, est_mode)

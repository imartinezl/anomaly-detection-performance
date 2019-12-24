library(dplyr)



# AREA-UNDER-CURVE --------------------------------------------------------
auc <- function(x,y){
  return(sum((x-lag(x))*(y+lead(y))/2))
}

# MASS-VOLUME -------------------------------------------------------------
mv <- function(axis_alpha, volume_support, s_unif, s_X, n_generated){
  n <- length(s_X)
  s_X_order <- order(s_X)
  mass <- 0
  cpt <- 0
  u <- s_X[s_X_order[n-cpt]]
  mv <- numeric(length(axis_alpha))
  threshold <- numeric(length(axis_alpha))
  for(i in 1:length(axis_alpha)){
    while(mass < axis_alpha[i]){
      cpt <- cpt + 1
      u <- s_X[s_X_order[n-cpt]]
      mass <- cpt / n
    }
    threshold[i] <- u
    mv[i] <- sum(s_unif >= u) / n_generated * volume_support
  }
  return(list(auc_mv = auc(axis_alpha, mv), mv = mv, threshold=threshold))
}

i <- 10
alpha <- axis_alpha[i]
u <- threshold[i]
mass <- seq(0,1,length.out = length(s_X))
data.frame(mass, s_X, s_X_order, alpha, u) %>% 
  ggplot2::ggplot()+
  ggplot2::geom_line(ggplot2::aes(x=mass, y=s_X[s_X_order]), size=2)+
  ggplot2::geom_point(ggplot2::aes(x=1-alpha,y=u), color="red")+
  ggplot2::geom_vline(ggplot2::aes(xintercept=1-alpha), linetype="dashed")+
  ggplot2::geom_hline(ggplot2::aes(yintercept=u), linetype="dashed")


tol <- 1e-6 # volume_support/n_generated
cut_points <- unif[abs(s_unif - u) < tol]
cut_points <- matrix(sort(cut_points), ncol=2, byrow = T) %>% as.data.frame()
data.frame(unif, s_unif, u, cut_points) %>% 
  dplyr::mutate(f = s_unif >= u) %>% 
  ggplot2::ggplot()+
  ggplot2::geom_area(data=. %>% filter(f), ggplot2::aes(x=unif, y=s_unif), fill="red")+
  # ggplot2::geom_ribbon(data=. %>% filter(f), ggplot2::aes(x=unif, ymin=u, ymax=s_unif), fill="red")+
  ggplot2::geom_line(ggplot2::aes(x=unif, y=s_unif), size=2)+
  ggplot2::geom_hline(ggplot2::aes(yintercept=u), linetype="dashed")+
  ggplot2::geom_segment(data=cut_points, ggplot2::aes(x=V1,y=-0.1,xend=V2,yend=-0.1),
                        arrow = ggplot2::arrow(length = grid::unit(10, 'pt'), type = "closed", angle=15, ends = "both"))


# EXCESS-MASS -------------------------------------------------------------
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


# GENERATOR + SCORING -----------------------------------------------------

true_density <- function(x){
  return(dnorm(x,0,1))
}
generator <- function(n){
  return(c(rnorm(n,0,1)))
}
scoring <- function(x){
  return(dnorm(x,0,1.5))
}

n <- 1000
x <- generator(n)
f_X <- true_density(x)
s_X <- scoring(x)

lim_inf <- min(x)
lim_sup <- max(x)
volume_support <- prod(lim_sup - lim_inf)
n_generated <- 10000
unif <- runif(n_generated, lim_inf, lim_sup)
s_unif <- scoring(unif)
alpha_min <- 0.9
alpha_max <- 0.999
axis_alpha <- seq(alpha_min, alpha_max, 0.0001)

mv_result <- mv(axis_alpha, volume_support, s_unif, s_X, n_generated)
plot(axis_alpha, mv_result$mv)


data.frame(x, s_X, f_X) %>%
  tidyr::gather(key,value, s_X, f_X) %>% 
  ggplot2::ggplot()+
  ggplot2::geom_line(ggplot2::aes(x=x, y=value, color=key), size=2)+
  ggplot2::geom_hline(yintercept = 0)+
  ggplot2::geom_vline(xintercept = lim_inf, linetype="dashed")+
  ggplot2::geom_vline(xintercept = lim_sup, linetype="dashed")+
  ggplot2::geom_segment(ggplot2::aes(x=lim_inf, y=-0.1, xend=lim_sup, yend=-0.1),
                        arrow = ggplot2::arrow(length = grid::unit(10, 'pt'), type = "closed", angle=15, ends = "both"))



  
t <- seq(0, 100 / volume_support, by=0.01 / volume_support)
t_max <- 0.9
em_result <- em(t, t_max, volume_support, s_unif, s_X, n_generated)
plot(t, em_result$EM_t)

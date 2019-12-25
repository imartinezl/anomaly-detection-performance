library(dplyr)



# AREA-UNDER-CURVE --------------------------------------------------------
auc <- function(x,y){
  return(sum((x-lag(x))*(y+lead(y))/2,na.rm=T))
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

i <- 90
alpha <- axis_alpha[i]
u <- mv_result$threshold[i]
mass <- seq(0,1,length.out = length(s_X))
data.frame(mass, s_X, alpha, u) %>% 
  dplyr::mutate(s_X_sorted = sort(s_X)) %>% 
  ggplot2::ggplot()+
  ggplot2::geom_line(ggplot2::aes(x=mass, y=s_X_sorted), size=2)+
  ggplot2::geom_point(ggplot2::aes(x=1-alpha,y=u), color="red")+
  ggplot2::geom_vline(ggplot2::aes(xintercept=1-alpha), linetype="dashed")+
  ggplot2::geom_hline(ggplot2::aes(yintercept=u), linetype="dashed")


dif <- s_unif[order(unif)]-u
xp_index <- which(diff(sign(dif)) != 0)
xp_index <- c(1,xp_index,n_generated-1)
xp_sign <- sign(dif)[xp_index]
xp <- sort(unif)[xp_index]
cut_points <- data.frame(xp, xp_sign) %>% 
  dplyr::arrange(xp) %>% 
  dplyr::mutate(xp_next = lead(xp),
                xp_sign_next = lead(xp_sign),
                good = xp_sign*xp_sign_next == -1) %>% 
  dplyr::filter(good) %>% 
  dplyr::slice(seq(1,n(),2)) %>%
  dplyr::select(xp, xp_next) %>% 
  dplyr::mutate(p = 1:n())
cut_points

data.frame(unif, s_unif, u) %>% 
  merge(cut_points) %>% 
  dplyr::mutate(f = unif >= xp & unif <= xp_next) %>% 
  ggplot2::ggplot()+
  ggplot2::geom_area(data=. %>% dplyr::filter(f), ggplot2::aes(x=unif, y=s_unif, group=p), fill="red")+
  # ggplot2::geom_ribbon(data=. %>% filter(f), ggplot2::aes(x=unif, ymin=u, ymax=s_unif), fill="red")
  ggplot2::geom_line(data=. %>% dplyr::filter(p==1), ggplot2::aes(x=unif, y=s_unif), size=2)+
  ggplot2::geom_hline(yintercept=u, linetype="dashed")+
  ggplot2::geom_segment(data=cut_points, ggplot2::aes(x=xp, y=-0.1, xend=xp_next, yend=-0.1),
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
  return(dnorm(x,0,1)+dnorm(x,10,1))
}
generator <- function(n){
  return(c(rnorm(n,0,1),rnorm(n,10,1)))
}
scoring <- function(x){
  return(dnorm(x,0,1.5)+dnorm(x,10,1.2))
}

n <- 1000
X <- generator(n)
f_X <- true_density(X)
s_X <- scoring(X)

lim_inf <- min(X)
lim_sup <- max(X)
volume_support <- prod(lim_sup - lim_inf)
n_generated <- 10000
unif <- runif(n_generated, lim_inf, lim_sup)
f_unif <- true_density(unif)
s_unif <- scoring(unif)
alpha_min <- 0.9
alpha_max <- 0.999
axis_alpha <- seq(alpha_min, alpha_max, 0.0001)

mv_result <- mv(axis_alpha, volume_support, s_unif, s_X, n_generated)
plot(axis_alpha, mv_result$mv)

data.frame(alpha=axis_alpha, mv=mv_result$mv, auc_mv=mv_result$auc_mv) %>% 
  ggplot2::ggplot()+
  ggplot2::geom_line(ggplot2::aes(x=alpha, y=mv), size=2)+
  ggplot2::geom_text(ggplot2::aes(x=alpha[1], y=mv[1], label=round(auc_mv,2)), check_overlap = T)

# data.frame(x, s_X, f_X) %>%
  # tidyr::gather(key,value, s_X, f_X) %>% 
data.frame(X=unif, Scoring=s_unif, True_Density=f_unif) %>%
  tidyr::gather(key,value, -X) %>% 
  ggplot2::ggplot()+
  ggplot2::geom_line(ggplot2::aes(x=X, y=value, color=key), size=2)+
  ggplot2::geom_hline(yintercept = 0)+
  ggplot2::geom_vline(xintercept = lim_inf, linetype="dashed")+
  ggplot2::geom_vline(xintercept = lim_sup, linetype="dashed")+
  ggplot2::geom_segment(ggplot2::aes(x=lim_inf, y=-0.05, xend=lim_sup, yend=-0.05), alpha=0.01,
                        arrow = ggplot2::arrow(length = grid::unit(10, 'pt'), type = "closed", angle=15, ends = "both"))+
  ggplot2::geom_label(x=(lim_inf+lim_sup)/2, y=-0.05, label="Volume support", check_overlap = T)+
  ggplot2::scale_color_manual(name=NULL, values=c("red","blue"))+
  ggplot2::labs(x="X",y="Density")+
  # ggplot2::ylim(c(-1,NA))+
  # ggplot2::theme_minimal(base_family = "Roboto Condensed")+
  hrbrthemes::theme_ipsum_rc()+
  ggplot2::theme(legend.position = "top")



  
t <- seq(0, 100 / volume_support, by=0.01 / volume_support)
t_max <- 0.9
em_result <- em(t, t_max, volume_support, s_unif, s_X, n_generated)
plot(t, em_result$EM_t)
plot(t[1:em_result$amax], em_result$EM_t[1:em_result$amax])

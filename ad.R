library(dplyr)

# AREA-UNDER-CURVE --------------------------------------------------------
auc <- function(x,y){
  return(sum((x-lag(x))*(y+lead(y))/2,na.rm=T))
}

# MASS-VOLUME -------------------------------------------------------------
mass_volume <- function(s_X, s_unif, alpha, volume_support){
  n_generated <- length(s_unif)
  n <- length(s_X)
  s_X_order <- order(s_X)
  mass <- 0
  cpt <- 0
  u <- s_X[s_X_order[n-cpt]]
  mv <- numeric(length(alpha))
  threshold <- numeric(length(alpha))
  for(i in 1:length(alpha)){
    while(mass < alpha[i]){
      cpt <- cpt + 1
      u <- s_X[s_X_order[n-cpt]]
      mass <- cpt / n
    }
    threshold[i] <- u
    mv[i] <- sum(s_unif >= u) / n_generated * volume_support
  }
  return(list(auc_mv = auc(alpha, mv), mv = mv, threshold=threshold))
}

# EXCESS-MASS -------------------------------------------------------------
excess_mass <- function(s_X, s_unif, t, t_max, volume_support){
  EM_t <- numeric(length(t))
  n_generated <- length(s_unif)
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

# Generate data
n <- 1000
X <- generator(n)
f_X <- true_density(X)
s_X <- scoring(X)

# Generate uniform data
lim_inf <- min(X)
lim_sup <- max(X)
volume_support <- prod(lim_sup - lim_inf)
n_generated <- 10000
unif <- runif(n_generated, lim_inf, lim_sup)
f_unif <- true_density(unif)
s_unif <- scoring(unif)

# Generate alpha
alpha_min <- 0
alpha_max <- 0.999
alpha <- seq(alpha_min, alpha_max, 0.0001)

# MASS-VOLUME
mv_result <- mass_volume(s_X, s_unif, alpha, volume_support)

mv <- mv_result$mv
auc_mv <- mv_result$auc_mv
t_mv <- mv_result$threshold

# PLOT FUNCTIONS ----------------------------------------------------------

plot_mv <- function(alpha, mv, auc_mv, i){
  data.frame(alpha=alpha, mv=mv, auc_mv=auc_mv) %>% 
    ggplot2::ggplot()+
    ggplot2::geom_line(ggplot2::aes(x=alpha, y=mv), size=2)+
    ggplot2::geom_area(ggplot2::aes(x=alpha, y=mv), fill="#F6F6F6")+
    ggplot2::geom_text(ggplot2::aes(x=mean(alpha), y=mv[1]/2, label=round(auc_mv,3)), check_overlap = T)+
    ggplot2::geom_segment(x=alpha[i], xend=alpha[i], y=0, yend=mv[i])+
    ggplot2::geom_segment(x=min(alpha), xend=alpha[i], y=mv[i], yend=mv[i])+
    ggplot2::geom_text(x=alpha[i], y=0, label=alpha[i], vjust=2, check_overlap = T)+
    ggplot2::geom_text(x=min(alpha), y=mv[i], label=round(mv[i],1), hjust=0, vjust=-0.5, check_overlap = T)+
    ggplot2::labs(x=expression(alpha), y="Volume")+
    hrbrthemes::theme_ipsum_rc()+
    ggplot2::theme(
      axis.title.x = ggplot2::element_text(size=12),
      axis.title.y = ggplot2::element_text(size=12)
    )
}
plot_density <- function(X, s_X, f_X){
  lim_inf <- min(X)
  lim_sup <- max(X)
  
  data.frame(X=X, Scoring=s_X, True_Density=f_X) %>%
    tidyr::gather(key,value, -X) %>% 
    ggplot2::ggplot()+
    ggplot2::geom_line(ggplot2::aes(x=X, y=value, color=key), size=1)+
    ggplot2::geom_hline(yintercept = 0)+
    ggplot2::geom_vline(xintercept = lim_inf, linetype="dashed")+
    ggplot2::geom_vline(xintercept = lim_sup, linetype="dashed")+
    ggplot2::geom_segment(ggplot2::aes(x=lim_inf, y=-0.05, xend=lim_sup, yend=-0.05), alpha=0.01,
                          arrow = ggplot2::arrow(length = grid::unit(10, 'pt'), type = "closed", angle=15, ends = "both"))+
    ggplot2::geom_text(x=(lim_inf+lim_sup)/2, y=-0.05, label="Volume support", check_overlap = T)+
    ggplot2::scale_color_manual(name=NULL, values=c("red","blue"))+
    ggplot2::labs(x="X",y="Density")+
    hrbrthemes::theme_ipsum_rc()+
    ggplot2::theme(legend.position = "top")
}
plot_scoring <- function(s_X, alpha, t_mv, i){
  data.frame(s_X) %>% 
    dplyr::mutate(s_X_sorted = sort(s_X),
                  mass = seq(0,1,length.out = n())) %>% 
    ggplot2::ggplot()+
    ggplot2::geom_line(ggplot2::aes(x=1-mass, y=s_X_sorted), size=2)+
    ggplot2::geom_point(ggplot2::aes(x=alpha[i],y=t_mv[i]), color="red")+
    ggplot2::geom_vline(ggplot2::aes(xintercept=alpha[i]), linetype="dashed")+
    ggplot2::geom_hline(ggplot2::aes(yintercept=t_mv[i]), linetype="dashed")
}
plot_volume <- function(unif, s_unif, alpha, t_mv, i){
  n_generated <- length(unif)
  dif <- s_unif[order(unif)]-t_mv[i]
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
    dplyr::mutate(p = 1:n(),
                  d = xp_next - xp)
  cut_points
  cut_points$d %>% sum
  data.frame(unif, s_unif, t_mv[i]) %>% 
    merge(cut_points) %>% 
    dplyr::mutate(f = unif >= xp & unif <= xp_next) %>% 
    ggplot2::ggplot()+
    ggplot2::geom_area(data=. %>% dplyr::filter(f), ggplot2::aes(x=unif, y=s_unif, group=p), fill="red")+
    # ggplot2::geom_ribbon(data=. %>% filter(f), ggplot2::aes(x=unif, ymin=u, ymax=s_unif), fill="red")
    ggplot2::geom_line(data=. %>% dplyr::filter(p==1), ggplot2::aes(x=unif, y=s_unif), size=2)+
    ggplot2::geom_hline(yintercept=t_mv[i], linetype="dashed")+
    ggplot2::geom_segment(data=cut_points, ggplot2::aes(x=xp, y=-0.05, xend=xp_next, yend=-0.05),
                          arrow = ggplot2::arrow(length = grid::unit(10, 'pt'), type = "closed", angle=15, ends = "both"))
}

plot_mv(alpha, mv, auc_mv, 900)
plot_density(X, s_X, f_X)
plot_density(unif, s_unif, f_unif)
plot_scoring(s_X, alpha, t_mv, i)

plot_volume(unif, s_unif, alpha, t_mv, i) %>% ggplot2::ggsave(filename = paste0("Volume_",i,".png"), device = "png", width = 9, height = 6)

# EXCESS - MASS 
t <- seq(0, 100 / volume_support, by=0.01 / volume_support)
t_max <- 0.9
em_result <- em(s_X, s_unif, t, t_max, volume_support)
plot(t, em_result$EM_t)
plot(t[1:em_result$amax], em_result$EM_t[1:em_result$amax])

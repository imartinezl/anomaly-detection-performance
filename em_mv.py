#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Dec 20 18:36:48 2019

@author: imartinez
"""

import numpy as np
from sklearn.metrics import auc


def em(t, t_max, volume_support, s_unif, s_X, n_generated):
    EM_t = np.zeros(t.shape[0])
    n_samples = s_X.shape[0]
    s_X_unique = np.unique(s_X)
    EM_t[0] = 1.
    for u in s_X_unique:
        # if (s_unif >= u).sum() > n_generated / 1000:
        EM_t = np.maximum(EM_t, 1. / n_samples * (s_X > u).sum() -
                          t * (s_unif > u).sum() / n_generated * volume_support)
    amax = np.argmax(EM_t <= t_max) + 1
    if amax == 1:
        print('\n failed to achieve t_max \n')
        amax = -1
    AUC = auc(t[:amax], EM_t[:amax])
    return AUC, EM_t, amax


def mv(axis_alpha, volume_support, s_unif, s_X, n_generated):
    n_samples = s_X.shape[0]
    s_X_argsort = s_X.argsort()
    mass = 0
    cpt = 0
    u = s_X[s_X_argsort[-1]]
    mv = np.zeros(axis_alpha.shape[0])
    for i in range(axis_alpha.shape[0]):
        # pdb.set_trace()
        while mass < axis_alpha[i]:
            cpt += 1
            u = s_X[s_X_argsort[-cpt]]
            mass = 1. / n_samples * cpt  # sum(s_X > u)
        mv[i] = float((s_unif >= u).sum()) / n_generated * volume_support
    return auc(axis_alpha, mv), mv


X = np.random.normal(loc=0,scale=1,size=1000)
from scipy.stats import norm
import matplotlib.pyplot as plt
# Scaling function is gaussian pdf
s_X = norm.pdf(X,loc=0,scale=1)
#plt.scatter(X, s_X)

lim_inf = X.min(axis=0)
lim_sup = X.max(axis=0)
volume_support = (lim_sup - lim_inf).prod()
n_generated = 10000
n_samples = X.shape[0]
n_features = 1
unif = np.random.uniform(lim_inf, lim_sup, size=(n_generated, n_features))
s_unif = norm.pdf(unif, loc=0, scale=1)
alpha_min = 0.90
alpha_max = 0.999
axis_alpha = np.arange(alpha_min, alpha_max, 0.0001)

auc_mv, mass_volume = mv(axis_alpha, volume_support, s_unif, s_X, n_generated)
plt.plot(axis_alpha, mass_volume)


t = np.arange(0, 100 / volume_support, 0.01 / volume_support)
t_max = 0.9
auc_em, excess_mass, amax = em(t, t_max, volume_support, s_unif, s_X, n_generated)
plt.plot(t, excess_mass)

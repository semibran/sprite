export const easeIn = (t) =>
  t * t

export const easeOut = (t) =>
  -t * (t - 2)

export const easeInOut = (t) =>
  t < 0.5
    ? easeIn(t * 2) / 2
    : (easeOut(t * 2 - 1) + 1) / 2

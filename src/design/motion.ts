export const motion = {
  durations: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    sluggish: '500ms',
  },
  easings: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like feel
  }
};

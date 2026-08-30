/** Repeat a complete ordered logo group enough times to fill the viewport at every phase. */
export function partnerScrollMetrics(viewportWidth: number, groupWidth: number) {
  if (groupWidth <= 0) return { loopWidth: 0, copies: 2 };
  return { loopWidth: groupWidth, copies: Math.max(2, Math.ceil(Math.max(0, viewportWidth) / groupWidth) + 1) };
}

type ScrollClock = {
  render: (offset: number) => void;
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (id: number) => void;
};

/** Always advance left. Resetting by one identical group is visually seamless. */
export function createPartnerScroller({ render, requestFrame, cancelFrame }: ScrollClock) {
  let loopWidth = 0;
  let travel = 0;
  let previousTime: number | null = null;
  let frameId: number | null = null;
  let paused = true;
  let destroyed = false;
  const schedule = () => {
    if (!paused && !destroyed && loopWidth > 0 && frameId === null) frameId = requestFrame(tick);
  };
  const cancel = () => {
    if (frameId !== null) cancelFrame(frameId);
    frameId = null;
    previousTime = null;
  };
  function tick(time: number) {
    frameId = null;
    if (paused || destroyed || loopWidth === 0) return;
    const elapsed = previousTime === null ? 0 : Math.max(0, Math.min(50, time - previousTime));
    previousTime = time;
    travel = (travel + elapsed * 0.032) % loopWidth;
    render(travel === 0 ? 0 : -travel);
    schedule();
  }
  return {
    setLoopWidth(next: number) {
      const width = Math.max(0, next);
      if (width === loopWidth || destroyed) return;
      loopWidth = width;
      travel = width > 0 ? travel % width : 0;
      cancel();
      render(travel === 0 ? 0 : -travel);
      schedule();
    },
    play() { if (destroyed) return; paused = false; schedule(); },
    pause() { paused = true; cancel(); },
    destroy() { destroyed = true; paused = true; cancel(); },
  };
}

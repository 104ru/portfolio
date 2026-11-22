export function periodForHour(hour) {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new RangeError('Expected a local hour from 0 to 23');
  if (hour < 6 || hour >= 21) return 'night';
  if (hour < 10) return 'morning';
  if (hour < 18) return 'day';
  return 'evening';
}

export function assetState(scene, period, lightOn) {
  if (!scene.indoor && !scene.linkedLightScene) return period;
  if (scene.windowless) return lightOn ? 'light-on' : 'light-off';
  return period + (lightOn ? '-on' : '-off');
}

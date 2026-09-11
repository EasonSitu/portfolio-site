import {withPublicBasePath, PUBLIC_BASE_PATH} from '../../../lib/publicPath.mjs';

export function getHeroAssets(basePath = PUBLIC_BASE_PATH) {
  const url = name => withPublicBasePath(`/hero-clarity/${name}`, basePath);
  return {
    poster: url('clarity-composite-v2-spaced.png'),
    plate: url('clarity-cleanplate-v1.png'),
    props: url('props-cleanplate.webp'),
    frames: Array.from({length:48}, (_, i) => url(`paper/${String(i+1).padStart(3,'0')}.webp`)),
  };
}

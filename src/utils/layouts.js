import MersenneTwister from 'mersennetwister';

// TODO: Use this lib and not clipper for polygon boolean operation.
// import greinerHormann from 'greiner-hormann';

import {
  createRandomSeed
} from './seeds';

import {
  generateInitialShape,
  generateRandomShape
} from './shapes';

import { VERSIONS } from '../constants';

import {
  getSharingSeedFromURL,
  getSharingVersionFromURL
} from './url';

export const generateRandomLayout = (width, height) => {
  const seed = createRandomSeed();
  const version = VERSIONS.BASIC_FIRST_GEN;

  return generateLayoutBySeedAndVersion(width, height, seed, version);
};

export const generateLayoutBySeedAndVersion = (width, height, seed, version) => {
  const layout = {
    height,
    seed,
    version,
    width
  };

  console.log('gen by seed ver', seed, version)

  const seeder = new MersenneTwister(seed);

  console.log('generate version', version, 'is it', VERSIONS.INIT_FIRST_GEN);

  switch(version) {
    case VERSIONS.BASIC_FIRST_GEN:
      layout.shapes = [generateRandomShape(width, height, seeder)];
      break;
    case VERSIONS.INIT_FIRST_GEN:
      layout.shapes = [generateInitialShape(width, height, seeder)];
      break;
    default:
      layout.shapes = [generateRandomShape(width, height, seeder)];
      break;
  }

  return layout;
};

export const generateInitialLayout = (width, height) => {
  const sharedUrlSeed = getSharingSeedFromURL();
  const sharedUrlVersion = getSharingVersionFromURL();

  const seed = sharedUrlSeed ? sharedUrlSeed : createRandomSeed();
  const version = sharedUrlVersion ? sharedUrlVersion : VERSIONS.INIT_FIRST_GEN;
  
  return generateLayoutBySeedAndVersion(width, height, seed, version);
};

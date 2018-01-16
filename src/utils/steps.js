import { getStepColor } from './color';

const createStartPoint = (radius, rotate, deviation) => {
  const startAngle = rotate;

  const startx = Math.cos(startAngle) * radius + deviation.x;
  const starty = Math.sin(startAngle) * radius + deviation.y;

  return {
    x: startx,
    y: starty
  }
}

const createPathPoint = (radius, point, points, rotate, previousDeviation, deviation, firstDeviation) => {
  const stopAngle = 2 * Math.PI * ((point + 1) / points) + rotate;

  const isLastPoint = point === points - 1;

  const stopx = (Math.cos(stopAngle) * radius) + (isLastPoint ? firstDeviation.x : deviation.x);
  const stopy = (Math.sin(stopAngle) * radius) + (isLastPoint ? firstDeviation.y : deviation.y);

  return {
    type: 'L',
    x: stopx,
    y: stopy
  };
};

const getXYPointsfromxyPoints = points => {
  const newPoints = [];

  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    newPoints.push({
      X: point.x,
      Y: point.y
    });
  }

  return newPoints;
};

// const getxyPointsfromXYPoints = points => {
//   const newPoints = [];

//   for (let i = 0; i < points.length; i++) {
//     const point = points[i];

//     newPoints.push({
//       x: point.X,
//       y: point.Y
//     });
//   }

//   return newPoints;
// };


// Returns an array of all of the steps.
// Where a step is an object with the properties:
// clipPoints
// id (probably just the index of the step right now.)
// depth (probably just the index of the step) depth 0 is the center / deepest
// pathPoints
// color
export const buildSteps = ({
  amountOfSteps,
  centerX,
  centerY,
  colors,
  innerRadius,
  pointDeviationMaxX,
  pointDeviationMaxY,
  points,
  previousPointDeviationInfluence,
  rotateEachStep,
  rotation,
  stepCenterDeviationX,
  stepCenterDeviationY,
  stepLength
}) => {
  const steps = [];

  // https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibcliptype
  const ClipperLib = window.ClipperLib;
  let clippingFilterPoints = ClipperLib.Paths();

  let futureElementsAreHidden = false;

  const buildStep = (x, y, step) => {
    const radius = (step + 1) * stepLength + innerRadius;

    const isFirstStep = step === amountOfSteps - 1;

    const pathPoints = [];

    const firstDeviation = {
      x: 0,
      y: 0
    };

    const previousDeviation = {
      x: 0,
      y: 0
    };

    const rotate = rotateEachStep * step + rotation;

    for (let i = 0; i < points; i++) {
      const pointDeviationX = Math.random() * pointDeviationMaxX - Math.random() * pointDeviationMaxX;
      const pointDeviationY = Math.random() * pointDeviationMaxY - Math.random() * pointDeviationMaxY;    

      const deviation = {
        x: pointDeviationX,
        y: pointDeviationY
      };

      if (previousPointDeviationInfluence) {
        deviation.x += previousDeviation.x;
        deviation.y += previousDeviation.y;

        // Come back to the origin when we're past the half point.
        // This prevents it making a sharp edge back to the starting location when it goes full circle.
        if (i > points - (points / 2)) {
          if (Math.abs(pointDeviationMaxX) > 0 && 
            ((pointDeviationX < 0 && previousDeviation.x > 0) || (pointDeviationX > 0 && previousDeviation.x < 0)))
          {
            const undeviateX = pointDeviationX / 2;

            deviation.x += undeviateX;
          }

          if (Math.abs(pointDeviationMaxY) > 0 && 
            ((pointDeviationY < 0 && previousDeviation.y > 0) || (pointDeviationY > 0 && previousDeviation.y < 0)))
          {
            const undeviateY = pointDeviationY / 2;

            deviation.y += undeviateY;
          }
        }

        // TODO: Undeviate more on the last couple points.
      }

      if (i === 0) {
        firstDeviation.x = deviation.x;
        firstDeviation.y = deviation.y;

        pathPoints.push(createStartPoint(radius, rotate, deviation));
      }

      pathPoints.push(createPathPoint(
        radius,
        i,
        points,
        rotate,
        previousDeviation,
        deviation,
        firstDeviation
      ));

      previousDeviation.x = deviation.x;
      previousDeviation.y = deviation.y;
    }

    // Translate the step to the center.
    for (let i = 0; i < pathPoints.length; i++) {
      pathPoints[i].x += x;
      pathPoints[i].y += y;
    }

    const pathPointsForClip = [];

    if (isFirstStep) {
      for (let i = pathPoints.length - 1; i >= 0; i--) {
        const point = pathPoints[i];

        pathPointsForClip.push({
          x: point.x,
          y: point.y
        });
      }
    } else {
      const pointsToAddToClip = getXYPointsfromxyPoints(pathPoints);

      const clipSolution = new ClipperLib.Paths();
      const c = new ClipperLib.Clipper();

      // NOTE: If these arrays contain NaN then it will infinite loop.
      c.AddPath(pointsToAddToClip, ClipperLib.PolyType.ptSubject, true);
      c.AddPath(clippingFilterPoints, ClipperLib.PolyType.ptClip, true);
      c.Execute(ClipperLib.ClipType.ctIntersection, clipSolution);

      if (clipSolution && clipSolution.length > 0) {
        clippingFilterPoints.length = 0;
        for(let i = 0; i < clipSolution[0].length; i++) {
          clippingFilterPoints[i] = {
            X: clipSolution[0][i].X,
            Y: clipSolution[0][i].Y
          };
        }
      } else {
        futureElementsAreHidden = true;
      }

      // console.log('clippingFilterPoints', clippingFilterPoints);
      // const after = ClipperLib.Clipper.SimplifyPolygons([clippingFilterPoints], ClipperLib.PolyFillType.pftNonZero)[0];
      // console.log('after', after);
      // pftNonZero or pftEvenOdd

      for (let i = clippingFilterPoints.length - 1; i >= 0; i--) {
        const point = clippingFilterPoints[i];

        pathPointsForClip.push({
          x: point.X,
          y: point.Y
        });
      }
    }

    for (let i = 0; i < pathPointsForClip.length; i++) {
      const point = isFirstStep ? pathPoints[i] : pathPointsForClip[i];

      clippingFilterPoints[i] = {
        X: point.x,
        Y: point.y
      }
    }

    steps.push({
      clipPoints: pathPointsForClip,
      color: getStepColor(step, amountOfSteps, colors),
      id: step,
      pathPoints: pathPoints
    });
  };

  for (let i = amountOfSteps - 1; i >= 0; i--) {
    if (futureElementsAreHidden) {
      break;
    }

    buildStep(centerX + (amountOfSteps - i) * stepCenterDeviationX, centerY + (amountOfSteps - i) * stepCenterDeviationY, i);
  }

  return steps;
}



// TODO: Depth for shadow
// Depth for each step.
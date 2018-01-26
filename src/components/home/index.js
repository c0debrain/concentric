import React from 'react';

import './index.css';

import Controls from '../../containers/controls';
import Loader from '../loader';
import SVG from '../../containers/svg';

const Home = props => {
  return (
    <div className="concentric-js-home">
      {/* import { Link } from 'react-router-dom';
      <header>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </header> */}
      <div
        className="concentric-js-home-background"
        style={{
          background: props.radialBackground ?
            `radial-gradient(${props.radialBackgroundColor}, ${props.backgroundColor})` : props.backgroundColor
        }}
      />
      {/* <div className="concentric-js-dotted-background" /> */}

      {/* <div className="concentric-js-home-header">
        <h1 className="concentric-js-home-title">Concentric js</h1>
        <p className="concentric-js-home-description">A tool for building <span role="img" aria-label="nice">&#128293;</span> visuals.</p>
      </div> */}
      {/* <button onClick={() =>  props.changePage()}>Go to about page via redux</button> */}
      {/* <Canvas /> */}
      <SVG />
      {props.isBuilding && <Loader />}
      {/* <p>Get HTML &lt;svg&gt; code</p>
      <p>Choose a gallery</p>
      <button
        onClick={() => props.randomizeVizual()}
      >
        RANDOMIZE
      </button> */}
      <Controls />
    </div>
  );
};

export default Home;

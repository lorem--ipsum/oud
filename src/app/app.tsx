import classNames from 'classnames';
import React from 'react';

import { AttractorRenderer } from '../attractor-renderer/attractor-renderer';
import { Detail } from '../detail/detail';
import { EmitterRenderer } from '../emitter-renderer/emitter-renderer';
import { IconButton } from '../icon-button/icon-button';
import { Attractor, Emitter, Example, EXAMPLES, Particle, Universe } from '../models';
import { Stats } from '../stats/stats';

import * as drawer from './three-drawer';

import './app.css';

interface OudProps {
  deaf?: boolean;
  exampleIndex?: number;
  width?: number;
  height?: number;
}

interface OudState {
  universe: Universe;

  paused?: boolean;

  time: number;
}

export class Oud extends React.Component<OudProps, OudState> {
  static defaultProps = {
    width: 500,
    height: 500,
  };

  private container = React.createRef<HTMLDivElement>();

  private particles: Particle[] = [];

  constructor(props: OudProps, context: any) {
    super(props, context);

    const selectedExample = props.exampleIndex ? EXAMPLES[props.exampleIndex] : undefined;

    this.state = {
      universe: selectedExample
        ? Universe.fromJS(selectedExample.config)
        : Universe.fromHash(location.hash),
      time: 0,
    };

    if (!props.deaf) {
      window.addEventListener('hashchange', () => {
        const { time, universe } = this.state;

        if (window.location.hash === universe.toHash()) return;

        const newUniverse = Universe.fromHash(location.hash).update(time);

        this.setState({
          universe: newUniverse,
        });
      });
    }
  }

  updateHash = () => {
    location.hash = this.state.universe.toHash();
  };

  componentDidMount() {
    drawer.init(this.container.current!, () => drawer.start(this.update));
  }

  update = (time: number) => {
    const { paused, universe } = this.state;

    const newUniverse = universe.update(time);
    const emitters = newUniverse.getEmitters();
    const attractors = newUniverse.getAttractors();

    const discardedParticles: Particle[] = [];
    const particles: Particle[] = [];
    const newParticles: Particle[] = [];

    emitters.forEach(e => {
      if (time >= e.time) e.emit(newParticles);
    });

    let i = this.particles.length;
    while (i--) {
      const p = this.particles[i];

      if ((!paused && p.isDead()) || p.isLost()) {
        discardedParticles.push(p);
        continue;
      }

      p.update(time, attractors);
      particles.push(p);
    }

    this.setState({
      time,
      universe: newUniverse,
    });

    this.particles = particles.concat(newParticles);
    return { newParticles, particles, discardedParticles };
  };

  playPause = () => {
    const { paused } = this.state;

    const isNowPaused = !paused;

    this.setState({
      paused: isNowPaused,
    });

    if (isNowPaused) {
      drawer.stop();
    } else {
      drawer.start(this.update);
    }
  };

  addEmitter = () => {
    const { universe, time } = this.state;

    this.setState(
      {
        universe: universe.addEmitter(time),
      },
      this.updateHash,
    );
  };

  addAttractor = () => {
    const { universe, time } = this.state;

    this.setState(
      {
        universe: universe.addAttractor(time),
      },
      this.updateHash,
    );
  };

  resetDrawer() {
    const { paused } = this.state;

    if (paused) return;

    drawer.start(this.update);
  }

  resetTime = () => {
    this.particles = [];
    drawer.stop();
    drawer.clear();

    this.setState(
      {
        time: 0,
        universe: this.state.universe.resetTime(),
      },
      () => this.resetDrawer(),
    );
  };

  reset = () => {
    this.particles = [];
    drawer.clear();
    drawer.stop();

    this.setState(
      {
        time: 0,
        universe: Universe.DEFAULT,
      },
      () => {
        this.updateHash();
        this.resetDrawer();
      },
    );
  };

  nextSelectedItem = () => {
    this.setState({
      universe: this.state.universe.selectNext(),
    });
  };

  previousSelectedItem = () => {
    this.setState({
      universe: this.state.universe.selectPrevious(),
    });
  };

  onItemsChange = (items: (Attractor | Emitter)[]) => {
    const { universe, time } = this.state;

    this.setState({
      universe: universe.changeItems(items).update(time),
    });
  };

  onAttractorClick = (attractor: Attractor, event: React.MouseEvent<any>) => {
    const { universe } = this.state;

    this.setState({
      universe: universe.select(attractor, event.shiftKey),
    });
  };

  onEmitterClick = (emitter: Emitter, event: React.MouseEvent<any>) => {
    const { universe } = this.state;

    this.setState({
      universe: universe.select(emitter, event.shiftKey),
    });
  };

  toggleHideStuff = () => {
    const { universe } = this.state;

    this.setState(
      {
        universe: universe.toggleControls(),
      },
      this.updateHash,
    );
  };

  removeSelectedItems = () => {
    const { universe } = this.state;

    this.setState(
      {
        universe: universe.deleteSelectedItems(),
      },
      this.updateHash,
    );
  };

  duplicateSelectedItems = () => {
    const { universe } = this.state;

    this.setState(
      {
        universe: universe.duplicateSelectedItems(),
      },
      this.updateHash,
    );
  };

  renderEmitter = (item: Emitter) => {
    const { universe } = this.state;

    return (
      <EmitterRenderer
        key={item.name}
        emitter={item}
        onClick={e => this.onEmitterClick(item, e)}
        selected={universe.getSelectedItems().indexOf(item.name) > -1}
      />
    );
  };

  renderAttractor = (item: Attractor) => {
    const { universe } = this.state;

    return (
      <AttractorRenderer
        key={item.name}
        attractor={item}
        onClick={e => this.onAttractorClick(item, e)}
        selected={universe.getSelectedItems().indexOf(item.name) > -1}
      />
    );
  };

  isExampleSelected(example: Example) {
    const { universe } = this.state;

    return universe.equals(Universe.fromJS(example.config));
  }

  loadExample = (example: Example) => {
    this.resetTime();
    window.location.hash = Universe.fromJS(example.config).toHash();
  };

  public render() {
    const { deaf, width, height } = this.props;
    const { paused, universe, time } = this.state;

    const hideStuff = deaf || universe.controlsHidden;

    return (
      <div className="oud">
        {!hideStuff ? (
          <div className="examples">
            {EXAMPLES.map((example, i) => {
              return (
                <div
                  key={i}
                  className={classNames('example', {
                    selected: this.isExampleSelected(example),
                  })}
                  onClick={() => this.loadExample(example)}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        ) : null}

        {!hideStuff ? <Stats particlesCount={this.particles.length} time={time} /> : null}

        <div className="stage">
          <div ref={this.container} style={{ width, height }} />
          {!hideStuff ? (
            <svg className="overlay" width={width} height={height}>
              <g
                className="event-target"
                onClick={() => this.setState({ universe: universe.changeSelectedItems([]) })}
              >
                <rect x="0" width={width} y="0" height={height} />
              </g>
              {universe.getAttractors().map(this.renderAttractor)}
              {universe.getEmitters().map(this.renderEmitter)}
            </svg>
          ) : null}
        </div>

        {!hideStuff && universe.getSelectedItems().length ? (
          <Detail
            fields={universe.getSelectedItemsFields()}
            items={universe.getActualSelectedItems()}
            onChange={this.onItemsChange}
            next={this.nextSelectedItem}
            previous={this.previousSelectedItem}
            remove={this.removeSelectedItems}
            duplicate={
              universe.getSelectedItems().length === 1 ? this.duplicateSelectedItems : undefined
            }
          />
        ) : null}

        <div className="controls">
          {!deaf && (
            <IconButton
              label="Show/hide info"
              icon={!hideStuff ? 'visibility_off' : 'visibility'}
              type="primary"
              onClick={this.toggleHideStuff}
            />
          )}
          {!hideStuff ? (
            <IconButton
              label="Play/pause"
              onClick={this.playPause}
              type="primary"
              icon={paused ? 'play_arrow' : 'pause'}
            />
          ) : null}

          <div className="spacer" />

          {!hideStuff ? (
            <IconButton
              label="Add an emitter"
              onClick={this.addEmitter}
              type="primary"
              icon="filter_tilt_shift"
            />
          ) : null}
          {!hideStuff ? (
            <IconButton
              label="Add an attractor"
              onClick={this.addAttractor}
              type="primary"
              icon="lens"
            />
          ) : null}

          <div className="spacer" />
          {!hideStuff ? (
            <IconButton label="Reset time" onClick={this.resetTime} type="primary" icon="restore" />
          ) : null}
          {!hideStuff ? (
            <IconButton
              label="Reset everything"
              onClick={this.reset}
              type="warn"
              icon="settings_backup_restore"
            />
          ) : null}
        </div>
      </div>
    );
  }
}

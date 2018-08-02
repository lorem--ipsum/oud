import { Emitter } from './emitter';
import { Attractor } from './attractor';

export interface Config {
  emitters: Emitter[];
  attractors: Attractor[];
  selectedItems: (Emitter | Attractor)[];
  hideStuff: boolean;
}

export interface Example {
  label: string;
  config: Config;
  description?: string;
}

export const EXAMPLES: Example[] = [
  {
    label: 'Waves',
    config: {
      selectedItems: [],
      hideStuff: false,
      attractors: [
        Attractor.fromJS({
          name: "Attractor #0",
          label: "Attractor #0",
          x: "250",
          y: "250",
          mass: "sin(t / 50) * 20"
        })
      ],
      emitters: [
        Emitter.fromJS({
          name: "Emitter #0",
          label: "Emitter #0",
          x: "50",
          y: "250",
          angle: "0",
          spread: "pi / 4",
          velocity: "20",
          batchSize: "6",
          emissionRate: "t % 1 == 0",
          lifeSpan: "500",
          hue: "sin(t / 100)*255",
          saturation: "90",
          lightness: "70"
        }),
        Emitter.fromJS({
          name: "Emitter #1",
          label: "Emitter #1",
          x: "450",
          y: "250",
          angle: "pi",
          spread: "pi / 4",
          velocity: "20",
          batchSize: "6",
          emissionRate: "t % 1 == 0",
          lifeSpan: "500",
          hue: "sin(t / 100)*255",
          saturation: "90",
          lightness: "70"
        })
      ]
    }
  },
  {
    label: 'Flower',
    config: {
      selectedItems: [],
      hideStuff: false,
      attractors: [
        Attractor.fromJS({
          name: "Attractor #0",
          label: "Attractor #0",
          x: "250",
          y: "250",
          mass: "sin(t / 50) * 20"
        })
      ],
      emitters: [
        Emitter.fromJS({
          name: "Emitter #0",
          label: "Emitter #0",
          x: "cos(t/100 + j*pi/2)*200 + 250",
          y: "-sin(t/100 + j*pi/2)*200 + 250",
          angle: "-t/100 + j*pi/2 + (j +1) * pi",
          spread: "pi / 4",
          velocity: "3",
          batchSize: "6",
          emissionRate: "true",
          lifeSpan: "500",
          hue: "sin(t / 100)*255",
          saturation: "70",
          lightness: "70"
        }),
        Emitter.fromJS({
          name: "Emitter #2",
          label: "Emitter #2",
          x: "cos(t/100 + j*pi/2)*200 + 250",
          y: "-sin(t/100 + j*pi/2)*200 + 250",
          angle: "-t/100 + j*pi/2 + (j +1) * pi",
          spread: "pi / 4",
          velocity: "3",
          batchSize: "6",
          emissionRate: "true",
          lifeSpan: "500",
          hue: "sin(t / 100)*255",
          saturation: "70",
          lightness: "70"
        }),
        Emitter.fromJS({
          name: "Emitter #1",
          label: "Emitter #1",
          x: "cos(t/100 + j*pi/2)*200 + 250",
          y: "-sin(t/100 + j*pi/2)*200 + 250",
          angle: "-t/100 + j*pi/2 + (j +1) * pi",
          spread: "pi / 4",
          velocity: "3",
          batchSize: "6",
          emissionRate: "true",
          lifeSpan: "500",
          hue: "sin(t / 100)*255",
          saturation: "70",
          lightness: "70"
        }),
        Emitter.fromJS({
          name: "Emitter #3",
          label: "Emitter #3",
          x: "cos(t/100 + j*pi/2)*200 + 250",
          y: "-sin(t/100 + j*pi/2)*200 + 250",
          angle: "-t/100 + j*pi/2 + (j +1) * pi",
          spread: "pi / 4",
          velocity: "3",
          batchSize: "6",
          emissionRate: "true",
          lifeSpan: "500",
          hue: "sin(t / 100)*255",
          saturation: "70",
          lightness: "70"
        })
      ]
    }
  },
  {
    label: 'Spiral',
    config: {
      selectedItems: [],
      hideStuff: false,
      emitters: [
        Emitter.fromJS({
          name: "Emitter #2",
          label: "Emitter #2",
          x: "cos(t/100 + j*pi)*60 + 250",
          y: "-sin(t/100 + j*pi)*60 + 250",
          angle: "-t/100 + j*pi + pi + sin(t/100)",
          spread: "pi / 4",
          velocity: "20",
          batchSize: "6",
          emissionRate: "t%2 == true",
          lifeSpan: "500",
          hue: "sin(t / 100)*255",
          saturation: "70",
          lightness: "70"
        }),
        Emitter.fromJS({
          name: "Emitter #3",
          label: "Emitter #3",
          x: "cos(t/100 + j*pi)*60 + 250",
          y: "-sin(t/100 + j*pi)*60 + 250",
          angle: "-t/100 + j*pi + pi + sin(t/100)",
          spread: "pi / 4",
          velocity: "20",
          batchSize: "6",
          emissionRate: "t%2 == true",
          lifeSpan: "500",
          hue: "sin(t / 100)*255",
          saturation: "70",
          lightness: "70"
        })
      ],
      attractors: []
    }
  }
];

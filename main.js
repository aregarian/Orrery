import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sun } from "./src/sun";
import { Starfield } from "./src/starfield";
import { Planet } from "./src/planet";
import {messages} from "./AboutPlanet";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 100000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 150, 300);
controls.update();

let planetsVisible = true; 
const planetTrajectories = []; 


const planetsData = [
  { label: 'Mercury', eccentricity: 0.20563, color: 0xffd700, size: 1, inclination: 7.0, omega: 48.331, rotationPeriod: 58.6, raan: 29.124, sma: 0.387098 * 100, texture: 'assets/mercury-map.jpg', period: 88 },
  { label: 'Venus', eccentricity: 0.006772, color: 0xffa500, size: 5.9, inclination: 3.39, omega: 76.68, rotationPeriod: 243, raan: 54.884, sma: 0.723332 * 100, texture: 'assets/venus-map.jpg', period: 224.701 },
  { label: 'Earth', eccentricity: 0.016708, color: 0x0000ff, size: 6.5, inclination: 0.0, omega: -11.26064, rotationPeriod: 1, raan: 114.20783, sma: 1.0 * 100, texture: 'assets/earth-map-1.jpg', period: 365.256 },
  { label: 'Mars', eccentricity: 0.0934, color: 0xff4500, size: 1.85, inclination: 1.85, omega: 49.558, rotationPeriod: 1, raan: 286.502, sma: 1.523679 * 100, texture: 'assets/mars-map.jpg', period: 686.971 },
  { label: 'Jupiter', eccentricity: 0.0489, color: 0xffe4b5, size: 78, inclination: 1.31, omega: 100.464, rotationPeriod: 0.408, raan: 273.867, sma: 5.2044 * 100, texture: 'assets/jupiter-map.jpg', period: 4332.59 },
  { label: 'Saturn', eccentricity: 0.0565, color: 0xffff00, size: 53.9, inclination: 2.49, omega: 113.665, rotationPeriod: 0.425, raan: 339.392, sma: 9.5826 * 100, texture: 'assets/saturn-map.jpg', period: 10759.22},
  { label: 'Uranus', eccentricity: 0.046381, color: 0x00ffff, size: 103.8, inclination: 0.77, omega: 74.006, rotationPeriod: 1.2, raan: 96.998856, sma: 19.2184 * 100, texture: 'assets/uranus-map.jpg', period: 30688.5},
  { label: 'Neptune', eccentricity: 0.009456, color: 0x00008b, size: 97.8, inclination: 1.77, omega: 131.784, rotationPeriod: 0.83, raan: 276.336, sma: 30.110388 * 100, texture: 'assets/neptune-map.jpg', period: 60182.0 },
  { label: 'Pluto', eccentricity: 0.2488, color: 0xffd700, size: 100, inclination: 17.16, omega: 110.299, rotationPeriod: 6.39, raan: 113.834, sma: 39.48 * 100, texture: 'assets/pluto-map.jpg', period: 90560.0 },
];


const buttons = [
  'btn-mercury', 'btn-venus', 'btn-earth', 'btn-mars',
  'btn-jupiter', 'btn-saturn', 'btn-uranus', 'btn-neptune', 'btn-pluto'
];

const infoBox = document.getElementById('info-box');

buttons.forEach((id, index) => {
  document.getElementById(id).addEventListener('click', () => {
      infoBox.innerHTML = messages[index]; 
      infoBox.style.display = 'block'; 
  });
});

window.addEventListener('click', (event) => {
  if (!event.target.closest('#buttons-container')) {
    infoBox.style.display = 'none'; 
  }
});

let asteroidTrajectories = [];
let asteroidsVisible = false ;


fetch('https://data.nasa.gov/resource/b67r-rgxc.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(asteroid => {
      const name = asteroid.object_name;
      const semiMajorAxis = parseFloat(asteroid.q_au_2); 
      const eccentricity = parseFloat(asteroid.e); 
      const inclination = parseFloat(asteroid.i_deg);

      const trajectory = createTrajectory(semiMajorAxis * scaleFactor, eccentricity, inclination, 0xffffff);
      asteroidTrajectories.push(trajectory); 
      scene.add(trajectory);
      trajectory.visible = asteroidsVisible;

      
      const label = createPlanetLabel(name);
      scene.add(label);
    });
  })
  .catch(error => console.error('Error fetching comet data:', error));


document.getElementById('toggleAsteroids').addEventListener('click', () => {
  asteroidsVisible = !asteroidsVisible;

  console.log("Asteroids visibility:", asteroidsVisible); 

  asteroidTrajectories.forEach(trajectory => {
    trajectory.visible = asteroidsVisible;
  });
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


const starfield = new Starfield().getStarfield();
scene.add(starfield);


const sun = new Sun().getSun();
scene.add(sun);


function createPlanetLabel(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 1028;
  canvas.height = 256;

  
  context.font = '300px Arial';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });

  
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(10, 4, 1); 

  return sprite;
}


const scaleFactor = 100;


const planets = [];
planetsData.forEach((data) => {
  const planet = new Planet({
      orbitSpeed: (2 * Math.PI) / data.period * 0.005,
      orbitRadius: data.sma,
      orbitRotationDirection: "clockwise",
      planetSize: data.size,
      planetRotationSpeed: 1 / data.rotationPeriod,
      planetRotationDirection: "counterclockwise",
      planetTexture: data.texture,
      rimHex: data.color
  }).getPlanet();

  planet.userData = {
      label: data.label, 
      semiMajorAxis: data.sma,
      eccentricity: data.eccentricity,
      inclination: data.inclination,
      omega: data.omega,
      raan: data.raan,
      period: data.period,
      angle: Math.random() * Math.PI * 2,
      speed: (0.5 * Math.PI) / data.period 
  };


  const trajectory = createTrajectory(data.sma, data.eccentricity, data.inclination, data.color, data.label);
  planetTrajectories.push(trajectory);
  planets.push(planet);
  scene.add(planet);
});


function createTrajectory(semiMajorAxis, eccentricity, inclination, color, labelText) {
  const points = [];
  const numPoints = 10000;

  const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const x = Math.cos(angle) * semiMajorAxis;
    const z = Math.sin(angle) * semiMinorAxis;
    const y = Math.sin(angle) * Math.sin(THREE.MathUtils.degToRad(inclination)) * semiMajorAxis;

    points.push(new THREE.Vector3(x, y, z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: color, opacity: 1.0, transparent: false });
  const trajectory = new THREE.Line(geometry, material);
  
  
  const midpointIndex = Math.floor(numPoints / 2); 
  const labelPosition = points[midpointIndex]; 
  const labelpoint = Math.floor(numPoints/16);
  const pointPosition = points[labelpoint];

  const hehe = createPlanetLabel(labelText);
  hehe.position.copy(pointPosition);
  trajectory.add(hehe);

  const label = createPlanetLabel(labelText);
  label.position.copy(labelPosition);
  trajectory.add(label);
  
  scene.add(trajectory);
  return trajectory;
}


function animate() {
  requestAnimationFrame(animate);

  planets.forEach(planet => {
    const { semiMajorAxis, eccentricity, inclination } = planet.userData;

    planet.userData.angle += planet.userData.speed;

    const distance = semiMajorAxis;
    const semiMinorAxis = distance * Math.sqrt(1 - eccentricity * eccentricity);

    const x = Math.cos(planet.userData.angle) * distance;
    const z = Math.sin(planet.userData.angle) * semiMinorAxis;
    const y = Math.sin(planet.userData.angle) * Math.sin(THREE.MathUtils.degToRad(inclination)) * distance;

    planet.position.set(x, y, z);

    const distanceToCamera = camera.position.distanceTo(planet.position);
    const labelScale = Math.max(0.5, 10 / distanceToCamera); 

  
    planet.children.forEach(child => {
      if (child instanceof THREE.Sprite) {
        child.scale.set(labelScale * 10, labelScale * 4, 1); 
      }
    });
  });

  controls.update();
  renderer.render(scene, camera); 
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.getElementById('togglePlanets').addEventListener('click', () => {
  planetsVisible = !planetsVisible; 
  console.log("Planets visibility:", planetsVisible);

  planetTrajectories.forEach(trajectory => {
      trajectory.visible = planetsVisible; 
  });
});

animate();

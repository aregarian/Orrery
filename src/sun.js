import {
  Mesh,
  Group,
  Color,
  PointLight,
  TextureLoader,
  MeshBasicMaterial,
  IcosahedronGeometry,
} from "three";

export class Sun {
  group;
  loader;
  animate;

  constructor() {
    this.sunTexture = "/assets/sun-mapp.jpg"; 

    this.group = new Group(); 
    this.loader = new TextureLoader(); 

    this.createSun(); 
    this.addLighting(); 

    this.animate = this.createAnimateFunction(); 
    this.animate(); 
  }

  createSun() {
    const map = this.loader.load(this.sunTexture); 
    const sunGeometry = new IcosahedronGeometry(10, 12); 
    const sunMaterial = new MeshBasicMaterial({
      map, // Apply texture to material
    });

    const sunMesh = new Mesh(sunGeometry, sunMaterial); 
    this.group.add(sunMesh); 

    this.group.userData.update = (t) => {
      this.group.rotation.y = -t *25 ; 
    };
  }

  addLighting() {
    const sunLight = new PointLight(0xfdfbd3, 9, 100_00, 0); 

    sunLight.position.set(0, 0, 0); 
    this.group.add(sunLight); 
  }

  createAnimateFunction() {
    return (t = 0) => {
      const time = t * 0.00051;
      requestAnimationFrame(this.animate); 
      this.group.userData.update(time); 
    };
  }

  getSun() {
    return this.group; 
  }
}

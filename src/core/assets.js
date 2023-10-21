import { AudioLoader, LoadingManager, TextureLoader } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const FileType = {
  AUDIO: 'audio',
  TEXTURE: 'texture',
  GLTF: 'gltf'
};

class Assets {
  path = './assets/';
  manager = null;

  loader = {
    gltf: null,
    audio: null,
    texture: null
  };

  gltfs = { };
  audios = { };
  textures = { };

  files = {
    first: {
      url: 'gltf/first.glb',
      type: FileType.GLTF
    },

    second: {
      url: 'gltf/second.glb',
      type: FileType.GLTF
    },

    third: {
      url: 'gltf/third.glb',
      type: FileType.GLTF
    },
  }

  constructor(czarversve) {
    this.czarversve = czarversve;

    this.manager = new LoadingManager();
    // this.manager.onLoad = this.onLoad.bind(this); // срабатывает несколько раз :\

    this.loader.gltf = new GLTFLoader(this.manager);
    this.loader.gltf.setMeshoptDecoder(MeshoptDecoder);
    this.loader.audio = new AudioLoader(this.manager);
    this.loader.texture = new TextureLoader(this.manager);
  }

  load() {
    const promises = [];

    Object.keys(this.files).forEach(key => {
      const type = this.files[key].type;
      const url = this.files[key].url;

      let loader;
      let storage;

      switch (type) {
        case FileType.AUDIO:
          loader = this.loader.audio;
          storage = this.audios;

          break;

        case FileType.TEXTURE:
          loader = this.loader.texture;
          storage = this.textures;

          break;

        case FileType.GLTF:
          loader = this.loader.gltf;
          storage = this.gltfs;

          break;
      }

      let promise = this.loadAsset(key, this.path + url, loader, storage);

      promises.push(promise);
    });

    return Promise.all(promises);
  }

  loadAsset(key, url, loader, storage) {
    return new Promise((resolve, reject) => {
      loader.load(url, (asset) => {
        storage[key] = asset;

        resolve();
      }, null, reject);
    });
  }
}

export default Assets;

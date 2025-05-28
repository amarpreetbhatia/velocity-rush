/**
 * Three.js renderer setup and management for Velocity Rush
 * Handles scene rendering, post-processing, and optimization
 */

import {
  WebGLRenderer,
  PCFSoftShadowMap,
  sRGBEncoding,
  ACESFilmicToneMapping,
  Vector2
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

class Renderer {
  constructor(options = {}) {
    this.options = {
      antialias: true,
      shadows: true,
      shadowMapSize: 2048,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      postProcessing: true,
      ...options
    };
    
    this.renderer = null;
    this.composer = null;
    this.renderTarget = null;
    this.size = {
      width: 1,
      height: 1
    };
    
    this.passes = {};
    this.quality = 'high'; // 'low', 'medium', 'high', 'ultra'
    
    this.init();
  }
  
  /**
   * Initialize the renderer
   */
  init() {
    // Create WebGL renderer
    this.renderer = new WebGLRenderer({
      antialias: this.options.antialias,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
      alpha: false
    });
    
    // Configure renderer
    this.renderer.setPixelRatio(this.options.pixelRatio);
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.physicallyCorrectLights = true;
    
    // Configure shadows
    if (this.options.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = PCFSoftShadowMap;
      this.renderer.shadowMap.autoUpdate = true;
    }
  }
  
  /**
   * Set up post-processing effects
   * @param {Scene} scene - Three.js scene
   * @param {Camera} camera - Three.js camera
   */
  setupPostProcessing(scene, camera) {
    if (!this.options.postProcessing) return;
    
    // Create effect composer
    this.composer = new EffectComposer(this.renderer);
    
    // Add render pass
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);
    this.passes.renderPass = renderPass;
    
    // Add bloom pass
    const bloomPass = new UnrealBloomPass(
      new Vector2(this.size.width, this.size.height),
      0.2, // strength
      0.3, // radius
      0.9  // threshold
    );
    this.composer.addPass(bloomPass);
    this.passes.bloomPass = bloomPass;
    
    // Add FXAA pass
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms['resolution'].value.set(
      1 / this.size.width,
      1 / this.size.height
    );
    this.composer.addPass(fxaaPass);
    this.passes.fxaaPass = fxaaPass;
    
    // Apply quality settings
    this.setQuality(this.quality);
  }
  
  /**
   * Set rendering quality
   * @param {string} quality - Quality level ('low', 'medium', 'high', 'ultra')
   */
  setQuality(quality) {
    this.quality = quality;
    
    switch (quality) {
      case 'low':
        this.renderer.setPixelRatio(1);
        if (this.passes.bloomPass) {
          this.passes.bloomPass.enabled = false;
        }
        this.renderer.shadowMap.enabled = false;
        break;
        
      case 'medium':
        this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
        if (this.passes.bloomPass) {
          this.passes.bloomPass.enabled = true;
          this.passes.bloomPass.strength = 0.1;
        }
        this.renderer.shadowMap.enabled = true;
        break;
        
      case 'high':
        this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        if (this.passes.bloomPass) {
          this.passes.bloomPass.enabled = true;
          this.passes.bloomPass.strength = 0.2;
        }
        this.renderer.shadowMap.enabled = true;
        break;
        
      case 'ultra':
        this.renderer.setPixelRatio(window.devicePixelRatio);
        if (this.passes.bloomPass) {
          this.passes.bloomPass.enabled = true;
          this.passes.bloomPass.strength = 0.3;
        }
        this.renderer.shadowMap.enabled = true;
        break;
    }
    
    // Update size to apply new pixel ratio
    this.updateSize();
  }
  
  /**
   * Update renderer size
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  updateSize(width, height) {
    if (width !== undefined && height !== undefined) {
      this.size.width = width;
      this.size.height = height;
    }
    
    this.renderer.setSize(this.size.width, this.size.height);
    
    if (this.composer) {
      this.composer.setSize(this.size.width, this.size.height);
      
      // Update FXAA resolution
      if (this.passes.fxaaPass) {
        this.passes.fxaaPass.material.uniforms['resolution'].value.set(
          1 / this.size.width,
          1 / this.size.height
        );
      }
    }
  }
  
  /**
   * Render the scene
   * @param {Scene} scene - Three.js scene
   * @param {Camera} camera - Three.js camera
   */
  render(scene, camera) {
    if (this.composer && this.options.postProcessing) {
      this.composer.render();
    } else {
      this.renderer.render(scene, camera);
    }
  }
  
  /**
   * Get the DOM element
   * @returns {HTMLCanvasElement} Canvas element
   */
  getDomElement() {
    return this.renderer.domElement;
  }
  
  /**
   * Dispose of renderer resources
   */
  dispose() {
    this.renderer.dispose();
    
    if (this.composer) {
      this.composer.renderTarget1.dispose();
      this.composer.renderTarget2.dispose();
    }
  }
}

export default Renderer;

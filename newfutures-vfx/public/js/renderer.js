/**
 * 🎬 NewFutures VFX - 高级渲染器
 * 实现高性能3D渲染和后期处理效果
 */

class AdvancedRenderer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.renderer = null;
        this.composer = null;
        this.passes = new Map();
        
        // 渲染设置
        this.settings = {
            antialias: options.antialias !== false,
            shadows: options.shadows !== false,
            postProcessing: options.postProcessing !== false,
            quality: options.quality || 'high',
            pixelRatio: Math.min(window.devicePixelRatio, 2),
            ...options
        };
        
        this.init();
    }
    
    init() {
        this.createRenderer();
        this.setupPostProcessing();
        this.setupRenderTargets();
        
        console.log('🚀 高级渲染器初始化完成');
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: this.settings.antialias,
            alpha: true,
            powerPreference: 'high-performance',
            precision: 'highp'
        });
        
        // 渲染器配置
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(this.settings.pixelRatio);
        this.renderer.shadowMap.enabled = this.settings.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // 启用扩展
        this.renderer.extensions.get('EXT_color_buffer_float');
        this.renderer.extensions.get('OES_texture_float_linear');
        
        // 性能优化
        this.renderer.sortObjects = true;
        this.renderer.autoClear = false;
    }
    
    setupPostProcessing() {
        if (!this.settings.postProcessing) return;
        
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // 基础渲染通道
        const renderPass = new THREE.RenderPass();
        this.composer.addPass(renderPass);
        this.passes.set('render', renderPass);
        
        // SSAO环境光遮蔽
        const ssaoPass = new THREE.SSAOPass();
        ssaoPass.kernelRadius = 16;
        ssaoPass.minDistance = 0.005;
        ssaoPass.maxDistance = 0.1;
        this.composer.addPass(ssaoPass);
        this.passes.set('ssao', ssaoPass);
        
        // Bloom辉光效果
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, // 强度
            0.4, // 半径
            0.85 // 阈值
        );
        this.composer.addPass(bloomPass);
        this.passes.set('bloom', bloomPass);
        
        // 景深效果
        const bokehPass = new THREE.BokehPass({
            focus: 1.0,
            aperture: 0.025,
            maxblur: 0.01
        });
        this.composer.addPass(bokehPass);
        this.passes.set('bokeh', bokehPass);
        
        // 色彩分级
        const colorGradingPass = this.createColorGradingPass();
        this.composer.addPass(colorGradingPass);
        this.passes.set('colorGrading', colorGradingPass);
        
        // TAA时间抗锯齿
        const taaPass = new THREE.TAARenderPass();
        this.composer.addPass(taaPass);
        this.passes.set('taa', taaPass);
        
        // 最终输出
        const outputPass = new THREE.OutputPass();
        this.composer.addPass(outputPass);
        this.passes.set('output', outputPass);
    }
    
    createColorGradingPass() {
        return new THREE.ShaderPass({
            uniforms: {
                'tDiffuse': { value: null },
                'brightness': { value: 0.0 },
                'contrast': { value: 1.0 },
                'saturation': { value: 1.0 },
                'hue': { value: 0.0 },
                'gamma': { value: 1.0 },
                'exposure': { value: 1.0 },
                'shadows': { value: new THREE.Vector3(1, 1, 1) },
                'midtones': { value: new THREE.Vector3(1, 1, 1) },
                'highlights': { value: new THREE.Vector3(1, 1, 1) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float brightness;
                uniform float contrast;
                uniform float saturation;
                uniform float hue;
                uniform float gamma;
                uniform float exposure;
                uniform vec3 shadows;
                uniform vec3 midtones;
                uniform vec3 highlights;
                varying vec2 vUv;
                
                vec3 adjustHue(vec3 color, float hueAdjust) {
                    const vec3 k = vec3(0.57735, 0.57735, 0.57735);
                    float cosAngle = cos(hueAdjust);
                    return vec3(color * cosAngle + cross(k, color) * sin(hueAdjust) + k * dot(k, color) * (1.0 - cosAngle));
                }
                
                vec3 colorGrade(vec3 color) {
                    // 曝光调整
                    color *= exposure;
                    
                    // 色调映射
                    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
                    
                    // 阴影/中间调/高光调整
                    vec3 shadowsContrib = shadows * (1.0 - smoothstep(0.0, 0.3, luminance));
                    vec3 midtonesContrib = midtones * (1.0 - abs(luminance - 0.5) * 2.0);
                    vec3 highlightsContrib = highlights * smoothstep(0.7, 1.0, luminance);
                    
                    color *= shadowsContrib + midtonesContrib + highlightsContrib;
                    
                    // 亮度调整
                    color += brightness;
                    
                    // 对比度调整
                    color = (color - 0.5) * contrast + 0.5;
                    
                    // 饱和度调整
                    vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
                    color = mix(gray, color, saturation);
                    
                    // 色调调整
                    color = adjustHue(color, hue);
                    
                    // 伽马校正
                    color = pow(color, vec3(1.0 / gamma));
                    
                    return color;
                }
                
                void main() {
                    vec4 texel = texture2D(tDiffuse, vUv);
                    vec3 color = colorGrade(texel.rgb);
                    gl_FragColor = vec4(color, texel.a);
                }
            `
        });
    }
    
    setupRenderTargets() {
        // 创建高质量渲染目标
        this.renderTarget = new THREE.WebGLRenderTarget(
            this.canvas.clientWidth,
            this.canvas.clientHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: THREE.FloatType,
                encoding: THREE.sRGBEncoding,
                samples: this.settings.antialias ? 4 : 0
            }
        );
        
        // 深度缓冲区
        this.depthTarget = new THREE.WebGLRenderTarget(
            this.canvas.clientWidth,
            this.canvas.clientHeight,
            {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.DepthFormat,
                type: THREE.UnsignedShortType
            }
        );
    }
    
    render(scene, camera) {
        if (this.composer) {
            // 更新渲染通道的场景和相机
            const renderPass = this.passes.get('render');
            if (renderPass) {
                renderPass.scene = scene;
                renderPass.camera = camera;
            }
            
            this.composer.render();
        } else {
            this.renderer.render(scene, camera);
        }
    }
    
    setSize(width, height) {
        this.renderer.setSize(width, height);
        
        if (this.composer) {
            this.composer.setSize(width, height);
        }
        
        if (this.renderTarget) {
            this.renderTarget.setSize(width, height);
        }
        
        if (this.depthTarget) {
            this.depthTarget.setSize(width, height);
        }
    }
    
    setPixelRatio(ratio) {
        this.renderer.setPixelRatio(ratio);
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // 重新初始化需要更新的组件
        if (newSettings.postProcessing !== undefined) {
            this.setupPostProcessing();
        }
        
        // 更新渲染器设置
        if (newSettings.shadows !== undefined) {
            this.renderer.shadowMap.enabled = newSettings.shadows;
        }
        
        if (newSettings.pixelRatio !== undefined) {
            this.setPixelRatio(newSettings.pixelRatio);
        }
    }
    
    // 获取渲染统计信息
    getRenderInfo() {
        return {
            memory: this.renderer.info.memory,
            render: this.renderer.info.render,
            programs: this.renderer.info.programs
        };
    }
    
    // 清理资源
    dispose() {
        if (this.composer) {
            this.composer.dispose();
        }
        
        if (this.renderTarget) {
            this.renderTarget.dispose();
        }
        
        if (this.depthTarget) {
            this.depthTarget.dispose();
        }
        
        this.renderer.dispose();
        
        console.log('🗑️ 渲染器资源已清理');
    }
}

/**
 * 🎨 材质工厂
 * 创建各种高级材质
 */
class MaterialFactory {
    static createHolographicMaterial(options = {}) {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(options.color1 || 0x667eea) },
                color2: { value: new THREE.Color(options.color2 || 0xf093fb) },
                opacity: { value: options.opacity || 0.8 },
                fresnelPower: { value: options.fresnelPower || 2.0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                uniform float time;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                    vUv = uv;
                    
                    vec3 pos = position;
                    pos += normal * sin(time * 2.0 + position.x * 10.0) * 0.01;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                uniform float opacity;
                uniform float fresnelPower;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    vec3 viewDirection = normalize(-vPosition);
                    float fresnel = pow(1.0 - dot(viewDirection, vNormal), fresnelPower);
                    
                    vec3 color = mix(color1, color2, fresnel + sin(time + vUv.x * 10.0) * 0.5 + 0.5);
                    
                    float alpha = opacity * (0.5 + 0.5 * sin(time * 3.0 + vUv.y * 15.0));
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
    }
    
    static createEnergyFieldMaterial(options = {}) {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                energy: { value: options.energy || 1.0 },
                color: { value: new THREE.Color(options.color || 0x00ffff) },
                frequency: { value: options.frequency || 5.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                uniform float time;
                uniform float energy;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    
                    vec3 pos = position;
                    float wave = sin(time * 3.0 + position.x * 5.0 + position.z * 3.0) * energy * 0.1;
                    pos.y += wave;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float energy;
                uniform vec3 color;
                uniform float frequency;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    vec2 center = vec2(0.5, 0.5);
                    float dist = distance(vUv, center);
                    
                    float pulse = sin(time * frequency - dist * 10.0) * 0.5 + 0.5;
                    float intensity = (1.0 - dist) * pulse * energy;
                    
                    vec3 finalColor = color * intensity;
                    float alpha = intensity * 0.8;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
    }
    
    static createCrystalMaterial(options = {}) {
        return new THREE.MeshPhysicalMaterial({
            color: options.color || 0xffffff,
            metalness: 0.0,
            roughness: 0.1,
            transmission: 0.9,
            thickness: 0.5,
            envMapIntensity: 1.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            ior: 1.5,
            reflectivity: 0.9,
            transparent: true,
            opacity: 0.8
        });
    }
}

/**
 * 🌟 光照系统
 * 管理动态光照效果
 */
class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.lights = new Map();
        this.time = 0;
        
        this.init();
    }
    
    init() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        this.lights.set('ambient', ambientLight);
        
        // 主方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
        this.lights.set('directional', directionalLight);
        
        // 动态点光源
        this.createDynamicLights();
        
        console.log('💡 光照系统初始化完成');
    }
    
    createDynamicLights() {
        // 彩色点光源
        const colors = [0xff0040, 0x0040ff, 0x40ff00, 0xff4000, 0x4000ff, 0x00ff40];
        
        for (let i = 0; i < 6; i++) {
            const light = new THREE.PointLight(colors[i], 2.0, 30);
            light.position.set(
                Math.cos(i * Math.PI / 3) * 10,
                Math.sin(Date.now() * 0.001 + i) * 5,
                Math.sin(i * Math.PI / 3) * 10
            );
            
            this.scene.add(light);
            this.lights.set(`point${i}`, light);
        }
        
        // 聚光灯
        const spotLight = new THREE.SpotLight(0xffffff, 3.0, 50, Math.PI / 6, 0.5);
        spotLight.position.set(0, 20, 0);
        spotLight.target.position.set(0, 0, 0);
        spotLight.castShadow = true;
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);
        this.lights.set('spot', spotLight);
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        // 动画点光源
        for (let i = 0; i < 6; i++) {
            const light = this.lights.get(`point${i}`);
            if (light) {
                light.position.x = Math.cos(this.time * 0.5 + i * Math.PI / 3) * 10;
                light.position.y = Math.sin(this.time * 0.3 + i) * 5 + 5;
                light.position.z = Math.sin(this.time * 0.5 + i * Math.PI / 3) * 10;
                light.intensity = 1.0 + Math.sin(this.time * 2.0 + i) * 0.5;
            }
        }
        
        // 旋转聚光灯
        const spotLight = this.lights.get('spot');
        if (spotLight) {
            spotLight.target.position.x = Math.cos(this.time * 0.3) * 5;
            spotLight.target.position.z = Math.sin(this.time * 0.3) * 5;
        }
    }
    
    setAmbientIntensity(intensity) {
        const ambientLight = this.lights.get('ambient');
        if (ambientLight) {
            ambientLight.intensity = intensity;
        }
    }
    
    setDirectionalIntensity(intensity) {
        const directionalLight = this.lights.get('directional');
        if (directionalLight) {
            directionalLight.intensity = intensity;
        }
    }
    
    dispose() {
        this.lights.forEach(light => {
            this.scene.remove(light);
        });
        this.lights.clear();
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdvancedRenderer, MaterialFactory, LightingSystem };
}

// 全局访问
window.AdvancedRenderer = AdvancedRenderer;
window.MaterialFactory = MaterialFactory;
window.LightingSystem = LightingSystem; 
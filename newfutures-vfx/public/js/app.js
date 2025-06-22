/**
 * 🎬 NewFutures VFX - 主应用程序 (增强版)
 * 处理3D渲染引擎初始化和用户交互
 */

class VFXApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.effects = new Map();
        this.activeEffects = new Set();
        this.performanceMonitor = new PerformanceMonitor();
        this.gui = null;
        this.composer = null; // 后期处理合成器
        this.clock = new THREE.Clock();
        
        // 渲染设置
        this.renderSettings = {
            quality: 'high',
            resolution: '1920x1080',
            antialiasing: true,
            shadows: true,
            postProcessing: true,
            particleDensity: 1.0,
            bloomStrength: 1.0,
            exposure: 1.2
        };
        
        // 初始化标志
        this.isInitialized = false;
        this.animationFrameId = null;
        
        // 性能优化
        this.frameSkip = 0;
        this.targetFPS = 60;
        this.adaptiveQuality = true;
        
        // 绑定方法
        this.animate = this.animate.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.onScroll = this.onScroll.bind(this);
        
        // 启动应用
        this.init();
    }
    
    /**
     * 初始化3D引擎
     */
    async init() {
        try {
            console.log('🚀 启动NewFutures VFX引擎...');
            
            // 显示加载动画
            this.showLoader();
            
            // 初始化Three.js场景
            await this.initScene();
            
            // 初始化相机
            this.initCamera();
            
            // 初始化渲染器
            this.initRenderer();
            
            // 初始化控制器
            this.initControls();
            
            // 初始化特效系统
            await this.initEffects();
            
            // 初始化GUI
            this.initGUI();
            
            // 初始化事件监听
            this.initEventListeners();
            
            // 开始渲染循环
            this.startRenderLoop();
            
            // 隐藏加载动画
            this.hideLoader();
            
            this.isInitialized = true;
            console.log('✅ NewFutures VFX引擎初始化完成');
            
        } catch (error) {
            console.error('❌ VFX引擎初始化失败:', error);
            this.showError('引擎初始化失败，请刷新页面重试');
        }
    }
    
    /**
     * 初始化Three.js场景
     */
    async initScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 10, 1000);
        
        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // 添加方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // 添加点光源
        const pointLight = new THREE.PointLight(0x667eea, 2, 100);
        pointLight.position.set(0, 10, 0);
        this.scene.add(pointLight);
    }
    
    /**
     * 初始化相机
     */
    initCamera() {
        const canvas = document.getElementById('main-canvas');
        const aspect = canvas.clientWidth / canvas.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }
    
    /**
     * 初始化渲染器
     */
    initRenderer() {
        const canvas = document.getElementById('main-canvas');
        
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // 启用后期处理
        this.initPostProcessing();
    }
    
    /**
     * 初始化后期处理 (增强版)
     */
    initPostProcessing() {
        if (!this.renderSettings.postProcessing) return;
        
        // 创建后期处理合成器
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // 渲染通道
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom效果
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.renderSettings.bloomStrength, // 强度
            0.4, // 半径
            0.85  // 阈值
        );
        this.composer.addPass(bloomPass);
        
        // FXAA抗锯齿
        const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
        fxaaPass.material.uniforms['resolution'].value.x = 1 / window.innerWidth;
        fxaaPass.material.uniforms['resolution'].value.y = 1 / window.innerHeight;
        this.composer.addPass(fxaaPass);
        
        // 色彩校正
        const colorCorrectionPass = new THREE.ShaderPass({
            uniforms: {
                'tDiffuse': { value: null },
                'brightness': { value: 0.1 },
                'contrast': { value: 1.1 },
                'saturation': { value: 1.2 }
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
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    
                    // 亮度调整
                    color.rgb += brightness;
                    
                    // 对比度调整
                    color.rgb = (color.rgb - 0.5) * contrast + 0.5;
                    
                    // 饱和度调整
                    vec3 gray = vec3(dot(color.rgb, vec3(0.299, 0.587, 0.114)));
                    color.rgb = mix(gray, color.rgb, saturation);
                    
                    gl_FragColor = color;
                }
            `
        });
        this.composer.addPass(colorCorrectionPass);
        
        // 输出通道
        const outputPass = new THREE.ShaderPass(THREE.CopyShader);
        outputPass.renderToScreen = true;
        this.composer.addPass(outputPass);
        
        console.log('✨ 后期处理系统初始化完成');
    }
    
    /**
     * 初始化控制器
     */
    initControls() {
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxDistance = 50;
            this.controls.minDistance = 2;
        }
    }
    
    /**
     * 初始化特效系统
     */
    async initEffects() {
        // 粒子系统
        const particleSystem = new ParticleSystem(this.scene);
        this.effects.set('particles', particleSystem);
        
        // 流体模拟
        const fluidSimulator = new FluidSimulator(this.scene);
        this.effects.set('fluid', fluidSimulator);
        
        // 物理模拟
        const physicsEngine = new PhysicsEngine(this.scene);
        this.effects.set('physics', physicsEngine);
        
        // 体积渲染
        const volumetricRenderer = new VolumetricRenderer(this.scene);
        this.effects.set('volumetric', volumetricRenderer);
        
        // 光线追踪
        const rayTracingRenderer = new RayTracingRenderer(this.scene);
        this.effects.set('raytracing', rayTracingRenderer);
        
        // AI智能特效
        const aiEffectSystem = new AIEffectSystem(this.scene);
        this.effects.set('ai', aiEffectSystem);
        
        // 启动默认特效
        this.toggleEffect('particles');
    }
    
    /**
     * 初始化GUI控制器
     */
    initGUI() {
        if (typeof dat !== 'undefined') {
            this.gui = new dat.GUI({ autoPlace: true });
            this.gui.domElement.style.position = 'absolute';
            this.gui.domElement.style.top = '80px';
            this.gui.domElement.style.right = '20px';
            this.gui.domElement.style.zIndex = '1000';
            
            // 添加控制选项
            const effectsFolder = this.gui.addFolder('特效控制');
            effectsFolder.open();
            
            // 性能控制
            const performanceFolder = this.gui.addFolder('性能设置');
            performanceFolder.add(this.renderer, 'toneMappingExposure', 0, 3).name('曝光度');
            performanceFolder.open();
        }
    }
    
    /**
     * 初始化事件监听 (增强版)
     */
    initEventListeners() {
        // 窗口大小调整
        window.addEventListener('resize', this.onWindowResize, false);
        
        // 滚动事件
        window.addEventListener('scroll', this.onScroll, { passive: true });
        
        // 导航菜单
        this.initNavigation();
        
        // 移动端菜单
        this.initMobileMenu();
        
        // 浮动操作按钮
        this.initFAB();
        
        // 键盘快捷键
        this.initKeyboardShortcuts();
        
        // 性能监控
        this.initPerformanceOptimization();
        
        // 触摸手势支持
        this.initTouchGestures();
    }
    
    /**
     * 初始化导航
     */
    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                this.scrollToSection(target);
                
                // 更新活动状态
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }
    
    /**
     * 初始化移动端菜单
     */
    initMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
    }
    
    /**
     * 初始化浮动操作按钮
     */
    initFAB() {
        const fab = document.getElementById('main-fab');
        if (fab) {
            fab.addEventListener('click', () => {
                this.showEffectSelector();
            });
        }
    }
    
    /**
     * 开始渲染循环
     */
    startRenderLoop() {
        this.animate();
    }
    
    /**
     * 主渲染循环 (优化版)
     */
    animate() {
        this.animationFrameId = requestAnimationFrame(this.animate);
        
        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // 自适应质量控制
        if (this.adaptiveQuality) {
            this.adjustQualityBasedOnPerformance();
        }
        
        // 更新控制器
        if (this.controls) {
            this.controls.update();
        }
        
        // 更新特效
        this.updateEffects(deltaTime, elapsedTime);
        
        // 更新性能监控
        this.performanceMonitor.update();
        
        // 渲染场景
        if (this.composer && this.renderSettings.postProcessing) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    /**
     * 更新特效
     */
    updateEffects() {
        this.activeEffects.forEach(effectName => {
            const effect = this.effects.get(effectName);
            if (effect && effect.update) {
                effect.update();
            }
        });
    }
    
    /**
     * 窗口大小调整处理
     */
    onWindowResize() {
        const canvas = document.getElementById('main-canvas');
        if (canvas && this.camera && this.renderer) {
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            
            this.renderer.setSize(width, height);
        }
    }
    
    /**
     * 切换特效
     */
    toggleEffect(effectName) {
        const effect = this.effects.get(effectName);
        if (!effect) {
            console.warn(`特效 ${effectName} 不存在`);
            return;
        }
        
        if (this.activeEffects.has(effectName)) {
            // 停用特效
            this.activeEffects.delete(effectName);
            if (effect.stop) {
                effect.stop();
            }
            console.log(`🔴 停用特效: ${effectName}`);
        } else {
            // 启用特效
            this.activeEffects.add(effectName);
            if (effect.start) {
                effect.start();
            }
            console.log(`🟢 启用特效: ${effectName}`);
        }
        
        this.updateEffectButtons();
    }
    
    /**
     * 更新特效按钮状态
     */
    updateEffectButtons() {
        const effectCards = document.querySelectorAll('.effect-card');
        effectCards.forEach(card => {
            const effectName = card.dataset.effect;
            const button = card.querySelector('.btn');
            const icon = button.querySelector('i');
            
            if (this.activeEffects.has(effectName)) {
                button.innerHTML = '<i class="fas fa-pause"></i> 停止';
                card.classList.add('active');
            } else {
                button.innerHTML = '<i class="fas fa-play"></i> 启动';
                card.classList.remove('active');
            }
        });
    }
    
    /**
     * 配置特效
     */
    configureEffect(effectName) {
        const effect = this.effects.get(effectName);
        if (!effect) return;
        
        this.showEffectConfiguration(effectName, effect);
    }
    
    /**
     * 显示特效配置界面
     */
    showEffectConfiguration(effectName, effect) {
        const modal = document.getElementById('effect-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        
        title.textContent = `${effectName} 配置`;
        body.innerHTML = effect.getConfigurationHTML ? effect.getConfigurationHTML() : '暂无配置选项';
        
        modal.style.display = 'block';
    }
    
    /**
     * 滚动到指定区域
     */
    scrollToSection(target) {
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    /**
     * 显示加载动画
     */
    showLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }
    
    /**
     * 隐藏加载动画
     */
    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 1000);
        }
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        console.error(message);
        // 这里可以添加错误提示UI
    }
    
    /**
     * 显示特效选择器
     */
    showEffectSelector() {
        // 实现特效选择器UI
        console.log('显示特效选择器');
    }
    
    /**
     * 销毁应用
     */
    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        if (this.gui) {
            this.gui.destroy();
        }
        
        window.removeEventListener('resize', this.onWindowResize);
        
        // 清理特效
        this.effects.forEach(effect => {
            if (effect.destroy) {
                effect.destroy();
            }
        });
        
        console.log('🔄 VFX应用已销毁');
    }
}

/**
 * 性能监控器
 */
class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.particles = 0;
        this.gpuUsage = 0;
        
        this.updateStats();
    }
    
    update() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime >= this.lastTime + 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            this.updateUI();
        }
    }
    
    updateUI() {
        const fpsElement = document.getElementById('fps-counter');
        const particleElement = document.getElementById('particle-count');
        const gpuElement = document.getElementById('gpu-usage');
        
        if (fpsElement) fpsElement.textContent = this.fps;
        if (particleElement) particleElement.textContent = this.particles.toLocaleString();
        if (gpuElement) gpuElement.textContent = `${this.gpuUsage}%`;
    }
    
    updateStats() {
        // 模拟性能数据更新
        setInterval(() => {
            this.particles = Math.floor(Math.random() * 1000000) + 500000;
            this.gpuUsage = Math.floor(Math.random() * 30) + 60;
        }, 2000);
    }
}

// 全局函数
window.startDemo = function() {
    if (window.vfxApp) {
        console.log('🎬 开始演示');
        window.vfxApp.toggleEffect('particles');
    }
};

window.showDocumentation = function() {
    window.open('https://github.com/henrry179/New-Future-3D', '_blank');
};

window.toggleEffect = function(effectName) {
    if (window.vfxApp) {
        window.vfxApp.toggleEffect(effectName);
    }
};

window.configureEffect = function(effectName) {
    if (window.vfxApp) {
        window.vfxApp.configureEffect(effectName);
    }
};

window.closeModal = function() {
    const modal = document.getElementById('effect-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.startRender = function() {
    console.log('🎬 开始渲染');
};

window.exportRender = function() {
    console.log('💾 导出渲染结果');
};

window.createNewEffect = function() {
    console.log('✨ 创建新特效');
};

window.importAsset = function() {
    console.log('📁 导入资产');
};

window.openSettings = function() {
    console.log('⚙️ 打开设置');
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.vfxApp = new VFXApp();
});

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VFXApp, PerformanceMonitor };
} 
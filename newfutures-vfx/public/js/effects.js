/**
 * 🎭 NewFutures VFX - 特效系统 (增强版)
 * 实现各种高级3D视觉特效
 */

/**
 * 高级粒子系统
 */
class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = null;
        this.particleCount = 100000;
        this.positions = null;
        this.colors = null;
        this.velocities = null;
        this.sizes = null;
        this.lifetimes = null;
        this.geometry = null;
        this.material = null;
        this.isActive = false;
        this.time = 0;
        
        // 粒子发射器设置
        this.emitter = {
            position: new THREE.Vector3(0, 0, 0),
            rate: 1000, // 每秒发射粒子数
            lifetime: 5.0, // 粒子生命周期
            velocity: new THREE.Vector3(0, 5, 0),
            spread: 2.0, // 发射角度扩散
            size: 0.05,
            sizeVariation: 0.02
        };
        
        this.init();
    }
    
    init() {
        // 创建粒子几何体
        this.geometry = new THREE.BufferGeometry();
        
        // 位置数组
        this.positions = new Float32Array(this.particleCount * 3);
        this.colors = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount * 3);
        
        // 初始化粒子属性
        this.resetParticles();
        
        // 设置几何体属性
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        
        // 创建材质
        this.material = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // 创建粒子系统
        this.particles = new THREE.Points(this.geometry, this.material);
        
        console.log(`✨ 粒子系统初始化完成 - ${this.particleCount} 个粒子`);
    }
    
    resetParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // 位置 - 球形分布
            const radius = Math.random() * 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            
            this.positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            this.positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            this.positions[i3 + 2] = radius * Math.cos(phi);
            
            // 速度
            this.velocities[i3] = (Math.random() - 0.5) * 0.02;
            this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
            
            // 颜色 - 渐变色彩
            const hue = (Math.random() * 0.3 + 0.5) % 1; // 蓝紫色系
            const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
            this.colors[i3] = color.r;
            this.colors[i3 + 1] = color.g;
            this.colors[i3 + 2] = color.b;
        }
    }
    
    start() {
        if (!this.isActive) {
            this.scene.add(this.particles);
            this.isActive = true;
            console.log('🟢 粒子系统启动');
        }
    }
    
    stop() {
        if (this.isActive) {
            this.scene.remove(this.particles);
            this.isActive = false;
            console.log('🔴 粒子系统停止');
        }
    }
    
    update() {
        if (!this.isActive) return;
        
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // 更新位置
            this.positions[i3] += this.velocities[i3];
            this.positions[i3 + 1] += this.velocities[i3 + 1];
            this.positions[i3 + 2] += this.velocities[i3 + 2];
            
            // 添加重力效果
            this.velocities[i3 + 1] -= 0.0001;
            
            // 边界检测和重置
            const distance = Math.sqrt(
                this.positions[i3] ** 2 + 
                this.positions[i3 + 1] ** 2 + 
                this.positions[i3 + 2] ** 2
            );
            
            if (distance > 10 || this.positions[i3 + 1] < -5) {
                // 重置粒子位置到发射器
                this.positions[i3] = (Math.random() - 0.5) * 0.1;
                this.positions[i3 + 1] = Math.random() * 0.1;
                this.positions[i3 + 2] = (Math.random() - 0.5) * 0.1;
                
                // 重置速度
                this.velocities[i3] = (Math.random() - 0.5) * 0.02;
                this.velocities[i3 + 1] = Math.random() * 0.05 + 0.02;
                this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
            }
        }
        
        // 更新几何体属性
        this.geometry.attributes.position.needsUpdate = true;
        
        // 旋转粒子系统
        this.particles.rotation.y += 0.002;
    }
    
    getConfigurationHTML() {
        return `
            <div class="config-section">
                <h4>粒子数量</h4>
                <input type="range" min="1000" max="100000" value="${this.particleCount}" 
                       onchange="updateParticleCount(this.value)">
                <span id="particle-count-display">${this.particleCount}</span>
            </div>
            <div class="config-section">
                <h4>粒子大小</h4>
                <input type="range" min="0.01" max="0.1" step="0.01" value="${this.material.size}"
                       onchange="updateParticleSize(this.value)">
            </div>
            <div class="config-section">
                <h4>透明度</h4>
                <input type="range" min="0.1" max="1" step="0.1" value="${this.material.opacity}"
                       onchange="updateParticleOpacity(this.value)">
            </div>
        `;
    }
    
    destroy() {
        this.stop();
        if (this.geometry) this.geometry.dispose();
        if (this.material) this.material.dispose();
    }
}

/**
 * 流体模拟系统
 */
class FluidSimulator {
    constructor(scene) {
        this.scene = scene;
        this.fluid = null;
        this.isActive = false;
        this.waves = [];
        
        this.init();
    }
    
    init() {
        // 创建水面几何体
        const geometry = new THREE.PlaneGeometry(20, 20, 128, 128);
        
        // 创建水面材质
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0x667eea) },
                color2: { value: new THREE.Color(0x764ba2) },
                opacity: { value: 0.8 }
            },
            vertexShader: `
                uniform float time;
                varying vec2 vUv;
                varying float vElevation;
                
                void main() {
                    vUv = uv;
                    
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    
                    // 创建波浪效果
                    float elevation = sin(modelPosition.x * 3.0 + time) * 0.1;
                    elevation += sin(modelPosition.z * 2.0 + time * 1.5) * 0.1;
                    elevation += sin(modelPosition.x * 8.0 + time * 2.0) * 0.05;
                    
                    modelPosition.y += elevation;
                    vElevation = elevation;
                    
                    vec4 viewPosition = viewMatrix * modelPosition;
                    vec4 projectedPosition = projectionMatrix * viewPosition;
                    
                    gl_Position = projectedPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                uniform float opacity;
                varying vec2 vUv;
                varying float vElevation;
                
                void main() {
                    vec3 color = mix(color1, color2, vElevation + 0.5);
                    gl_FragColor = vec4(color, opacity);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        this.fluid = new THREE.Mesh(geometry, material);
        this.fluid.rotation.x = -Math.PI / 2;
        this.fluid.position.y = -2;
        
        console.log('🌊 流体模拟系统初始化完成');
    }
    
    start() {
        if (!this.isActive) {
            this.scene.add(this.fluid);
            this.isActive = true;
            console.log('🟢 流体模拟启动');
        }
    }
    
    stop() {
        if (this.isActive) {
            this.scene.remove(this.fluid);
            this.isActive = false;
            console.log('🔴 流体模拟停止');
        }
    }
    
    update() {
        if (!this.isActive) return;
        
        const time = Date.now() * 0.001;
        
        // 更新时间uniform
        if (this.fluid.material.uniforms.time) {
            this.fluid.material.uniforms.time.value = time;
        }
    }
    
    getConfigurationHTML() {
        return `
            <div class="config-section">
                <h4>波浪强度</h4>
                <input type="range" min="0.1" max="2" step="0.1" value="1" 
                       onchange="updateWaveIntensity(this.value)">
            </div>
            <div class="config-section">
                <h4>流体颜色</h4>
                <input type="color" value="#667eea" onchange="updateFluidColor(this.value)">
            </div>
        `;
    }
    
    destroy() {
        this.stop();
        if (this.fluid) {
            this.fluid.geometry.dispose();
            this.fluid.material.dispose();
        }
    }
}

/**
 * 物理引擎
 */
class PhysicsEngine {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.isActive = false;
        
        this.init();
    }
    
    init() {
        // 创建一些物理对象
        this.createPhysicsObjects();
        
        console.log('⚛️ 物理引擎初始化完成');
    }
    
    createPhysicsObjects() {
        // 创建下落的立方体
        for (let i = 0; i < 10; i++) {
            const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const material = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6)
            });
            
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                (Math.random() - 0.5) * 5,
                Math.random() * 10 + 5,
                (Math.random() - 0.5) * 5
            );
            
            // 添加物理属性
            cube.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                0,
                (Math.random() - 0.5) * 0.1
            );
            cube.angularVelocity = new THREE.Vector3(
                Math.random() * 0.1,
                Math.random() * 0.1,
                Math.random() * 0.1
            );
            
            this.objects.push(cube);
        }
    }
    
    start() {
        if (!this.isActive) {
            this.objects.forEach(obj => this.scene.add(obj));
            this.isActive = true;
            console.log('🟢 物理引擎启动');
        }
    }
    
    stop() {
        if (this.isActive) {
            this.objects.forEach(obj => this.scene.remove(obj));
            this.isActive = false;
            console.log('🔴 物理引擎停止');
        }
    }
    
    update() {
        if (!this.isActive) return;
        
        const gravity = -0.001;
        const bounce = 0.8;
        const friction = 0.99;
        
        this.objects.forEach(obj => {
            // 应用重力
            obj.velocity.y += gravity;
            
            // 更新位置
            obj.position.add(obj.velocity);
            
            // 更新旋转
            obj.rotation.x += obj.angularVelocity.x;
            obj.rotation.y += obj.angularVelocity.y;
            obj.rotation.z += obj.angularVelocity.z;
            
            // 地面碰撞
            if (obj.position.y < -1.9) {
                obj.position.y = -1.9;
                obj.velocity.y *= -bounce;
                obj.velocity.x *= friction;
                obj.velocity.z *= friction;
            }
            
            // 边界检测
            if (Math.abs(obj.position.x) > 10) {
                obj.velocity.x *= -bounce;
                obj.position.x = Math.sign(obj.position.x) * 10;
            }
            if (Math.abs(obj.position.z) > 10) {
                obj.velocity.z *= -bounce;
                obj.position.z = Math.sign(obj.position.z) * 10;
            }
            
            // 重置高度过低的对象
            if (obj.position.y < -10) {
                obj.position.set(
                    (Math.random() - 0.5) * 5,
                    Math.random() * 5 + 10,
                    (Math.random() - 0.5) * 5
                );
                obj.velocity.set(
                    (Math.random() - 0.5) * 0.1,
                    0,
                    (Math.random() - 0.5) * 0.1
                );
            }
        });
    }
    
    getConfigurationHTML() {
        return `
            <div class="config-section">
                <h4>对象数量</h4>
                <input type="range" min="5" max="50" value="10" 
                       onchange="updatePhysicsObjectCount(this.value)">
            </div>
            <div class="config-section">
                <h4>重力强度</h4>
                <input type="range" min="0.0001" max="0.01" step="0.0001" value="0.001"
                       onchange="updateGravity(this.value)">
            </div>
        `;
    }
    
    destroy() {
        this.stop();
        this.objects.forEach(obj => {
            obj.geometry.dispose();
            obj.material.dispose();
        });
        this.objects = [];
    }
}

// 配置更新函数
window.updateParticleCount = function(value) {
    document.getElementById('particle-count-display').textContent = value;
    // 这里可以实际更新粒子数量
};

window.updateParticleSize = function(value) {
    // 更新粒子大小
    console.log('更新粒子大小:', value);
};

window.updateParticleOpacity = function(value) {
    // 更新粒子透明度
    console.log('更新粒子透明度:', value);
};

window.updateWaveIntensity = function(value) {
    // 更新波浪强度
    console.log('更新波浪强度:', value);
};

window.updateFluidColor = function(value) {
    // 更新流体颜色
    console.log('更新流体颜色:', value);
};

window.updatePhysicsObjectCount = function(value) {
    // 更新物理对象数量
    console.log('更新物理对象数量:', value);
};

window.updateGravity = function(value) {
    // 更新重力强度
    console.log('更新重力强度:', value);
};

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ParticleSystem, FluidSimulator, PhysicsEngine };
}

/**
 * NewFutures VFX - 特效处理脚本
 */

// 特效管理器
class EffectManager {
    constructor() {
        this.activeEffects = new Map();
        this.effectCanvases = new Map();
        this.initEffectCanvases();
    }
    
    initEffectCanvases() {
        // 初始化各个特效画布
        const effectTypes = ['particles', 'fluid', 'raytracing', 'volumetric', 'physics', 'ai'];
        
        effectTypes.forEach(type => {
            const canvas = document.getElementById(`${type}-canvas`);
            if (canvas) {
                this.setupEffectCanvas(type, canvas);
            }
        });
    }
    
    setupEffectCanvas(type, canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = 300;
        canvas.height = 200;
        
        this.effectCanvases.set(type, { canvas, ctx });
        
        // 开始默认动画
        this.startDefaultAnimation(type);
    }
    
    startDefaultAnimation(type) {
        const canvasData = this.effectCanvases.get(type);
        if (!canvasData) return;
        
        const { canvas, ctx } = canvasData;
        
        switch (type) {
            case 'particles':
                this.animateParticles(ctx, canvas);
                break;
            case 'fluid':
                this.animateFluid(ctx, canvas);
                break;
            case 'raytracing':
                this.animateRaytracing(ctx, canvas);
                break;
            case 'volumetric':
                this.animateVolumetric(ctx, canvas);
                break;
            case 'physics':
                this.animatePhysics(ctx, canvas);
                break;
            case 'ai':
                this.animateAI(ctx, canvas);
                break;
        }
    }
    
    animateParticles(ctx, canvas) {
        const particles = [];
        const particleCount = 50;
        
        // 初始化粒子
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                // 更新位置
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // 边界检测
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                // 绘制粒子
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }
    
    animateFluid(ctx, canvas) {
        let time = 0;
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 创建流体波纹效果
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            const data = imageData.data;
            
            for (let x = 0; x < canvas.width; x++) {
                for (let y = 0; y < canvas.height; y++) {
                    const index = (y * canvas.width + x) * 4;
                    const wave = Math.sin((x + time) * 0.02) * Math.sin((y + time) * 0.03);
                    const intensity = Math.floor((wave + 1) * 127);
                    
                    data[index] = intensity * 0.3;     // R
                    data[index + 1] = intensity * 0.6; // G
                    data[index + 2] = intensity;       // B
                    data[index + 3] = 255;             // A
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            time += 1;
            requestAnimationFrame(animate);
        }
        
        animate();
    }
    
    animateRaytracing(ctx, canvas) {
        let angle = 0;
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 绘制光线追踪效果
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            
            for (let i = 0; i < 8; i++) {
                const rayAngle = angle + (i * Math.PI / 4);
                const endX = centerX + Math.cos(rayAngle) * 80;
                const endY = centerY + Math.sin(rayAngle) * 80;
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
                
                // 绘制光点
                ctx.beginPath();
                ctx.arc(endX, endY, 3, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${i * 45}, 100%, 70%)`;
                ctx.fill();
            }
            
            angle += 0.05;
            requestAnimationFrame(animate);
        }
        
        animate();
    }
    
    animateVolumetric(ctx, canvas) {
        let time = 0;
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 创建体积云效果
            for (let i = 0; i < 20; i++) {
                const x = (Math.sin(time * 0.01 + i) + 1) * canvas.width / 2;
                const y = (Math.cos(time * 0.015 + i * 0.5) + 1) * canvas.height / 2;
                const size = Math.sin(time * 0.02 + i) * 20 + 30;
                
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${0.3 + Math.sin(time * 0.03) * 0.2})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            time += 1;
            requestAnimationFrame(animate);
        }
        
        animate();
    }
    
    animatePhysics(ctx, canvas) {
        const balls = [];
        const ballCount = 15;
        
        // 初始化小球
        for (let i = 0; i < ballCount; i++) {
            balls.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: Math.random() * 10 + 5,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                gravity: 0.2
            });
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(20, 20, 30, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            balls.forEach(ball => {
                // 物理更新
                ball.vy += ball.gravity;
                ball.x += ball.vx;
                ball.y += ball.vy;
                
                // 边界碰撞
                if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
                    ball.vx *= -0.8;
                    ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
                }
                if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
                    ball.vy *= -0.8;
                    ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
                }
                
                // 绘制小球
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                ctx.fillStyle = ball.color;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.stroke();
            });
            
            requestAnimationFrame(animate);
        }
        
        animate();
    }
    
    animateAI(ctx, canvas) {
        let time = 0;
        const nodes = [];
        const nodeCount = 12;
        
        // 初始化神经网络节点
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                activity: Math.random()
            });
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 更新节点
            nodes.forEach((node, i) => {
                node.x += node.vx;
                node.y += node.vy;
                node.activity = Math.sin(time * 0.02 + i) * 0.5 + 0.5;
                
                // 边界处理
                if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
            });
            
            // 绘制连接线
            ctx.strokeStyle = 'rgba(0, 255, 150, 0.3)';
            ctx.lineWidth = 1;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                    if (dist < 80) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }
            
            // 绘制节点
            nodes.forEach(node => {
                const intensity = node.activity;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 4 + intensity * 6, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 255, 150, ${intensity})`;
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.stroke();
            });
            
            time += 1;
            requestAnimationFrame(animate);
        }
        
        animate();
    }
}

// 初始化特效管理器
const effectManager = new EffectManager();

/**
 * 🌫️ 体积渲染系统
 */
class VolumetricRenderer {
    constructor(scene) {
        this.scene = scene;
        this.volumetricMesh = null;
        this.isActive = false;
        this.time = 0;
        
        this.init();
    }
    
    init() {
        // 创建体积几何体
        const geometry = new THREE.BoxGeometry(5, 5, 5, 64, 64, 64);
        
        // 体积渲染着色器材质
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                density: { value: 0.3 },
                absorption: { value: 0.1 },
                scattering: { value: 0.2 },
                lightPosition: { value: new THREE.Vector3(5, 5, 5) },
                lightColor: { value: new THREE.Color(0xffffff) },
                lightIntensity: { value: 2.0 },
                cloudColor: { value: new THREE.Color(0x87ceeb) },
                steps: { value: 128 }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vWorldPosition;
                
                void main() {
                    vPosition = position;
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float density;
                uniform float absorption;
                uniform float scattering;
                uniform vec3 lightPosition;
                uniform vec3 lightColor;
                uniform float lightIntensity;
                uniform vec3 cloudColor;
                uniform int steps;
                
                varying vec3 vPosition;
                varying vec3 vWorldPosition;
                
                // 3D噪声函数
                vec3 mod289(vec3 x) {
                    return x - floor(x * (1.0 / 289.0)) * 289.0;
                }
                
                vec4 mod289(vec4 x) {
                    return x - floor(x * (1.0 / 289.0)) * 289.0;
                }
                
                vec4 permute(vec4 x) {
                    return mod289(((x*34.0)+1.0)*x);
                }
                
                vec4 taylorInvSqrt(vec4 r) {
                    return 1.79284291400159 - 0.85373472095314 * r;
                }
                
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    
                    vec3 i = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);
                    
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    
                    i = mod289(i);
                    vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                    
                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;
                    
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);
                    
                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    
                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);
                    
                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    
                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                    
                    vec3 p0 = vec3(a0.xy, h.x);
                    vec3 p1 = vec3(a0.zw, h.y);
                    vec3 p2 = vec3(a1.xy, h.z);
                    vec3 p3 = vec3(a1.zw, h.w);
                    
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;
                    
                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
                }
                
                float volumetricNoise(vec3 p) {
                    float noise = 0.0;
                    float amplitude = 1.0;
                    float frequency = 1.0;
                    
                    for(int i = 0; i < 4; i++) {
                        noise += amplitude * snoise(p * frequency + time * 0.1);
                        amplitude *= 0.5;
                        frequency *= 2.0;
                    }
                    
                    return max(0.0, noise);
                }
                
                void main() {
                    vec3 rayOrigin = cameraPosition;
                    vec3 rayDirection = normalize(vWorldPosition - rayOrigin);
                    
                    // 体积渲染
                    float stepSize = 0.1;
                    vec3 currentPos = vWorldPosition;
                    vec3 color = vec3(0.0);
                    float alpha = 0.0;
                    
                    for(int i = 0; i < 64; i++) {
                        if(alpha >= 0.99) break;
                        
                        // 采样密度
                        float noiseDensity = volumetricNoise(currentPos * 0.5);
                        float currentDensity = density * noiseDensity;
                        
                        if(currentDensity > 0.0) {
                            // 光照计算
                            vec3 lightDir = normalize(lightPosition - currentPos);
                            float lightDistance = length(lightPosition - currentPos);
                            float attenuation = 1.0 / (1.0 + 0.1 * lightDistance + 0.01 * lightDistance * lightDistance);
                            
                            // 散射
                            float scatteringFactor = scattering * currentDensity;
                            vec3 scatteredLight = lightColor * lightIntensity * attenuation * scatteringFactor;
                            
                            // 混合颜色
                            vec3 sampleColor = mix(cloudColor, scatteredLight, 0.5);
                            float sampleAlpha = 1.0 - exp(-absorption * currentDensity * stepSize);
                            
                            // Alpha混合
                            color += sampleColor * sampleAlpha * (1.0 - alpha);
                            alpha += sampleAlpha * (1.0 - alpha);
                        }
                        
                        currentPos += rayDirection * stepSize;
                    }
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            depthWrite: false
        });
        
        this.volumetricMesh = new THREE.Mesh(geometry, material);
        this.volumetricMesh.position.set(0, 2, 0);
        
        console.log('🌫️ 体积渲染系统初始化完成');
    }
    
    start() {
        if (!this.isActive) {
            this.scene.add(this.volumetricMesh);
            this.isActive = true;
            console.log('🟢 体积渲染启动');
        }
    }
    
    stop() {
        if (this.isActive) {
            this.scene.remove(this.volumetricMesh);
            this.isActive = false;
            console.log('🔴 体积渲染停止');
        }
    }
    
    update() {
        if (!this.isActive) return;
        
        this.time += 0.016;
        if (this.volumetricMesh.material.uniforms.time) {
            this.volumetricMesh.material.uniforms.time.value = this.time;
        }
        
        // 动态旋转
        this.volumetricMesh.rotation.y += 0.005;
        this.volumetricMesh.rotation.x += 0.002;
    }
    
    getConfigurationHTML() {
        return `
            <div class="config-section">
                <h4>密度</h4>
                <input type="range" min="0.1" max="1" step="0.1" value="0.3" 
                       onchange="updateVolumetricDensity(this.value)">
            </div>
            <div class="config-section">
                <h4>散射强度</h4>
                <input type="range" min="0.1" max="1" step="0.1" value="0.2"
                       onchange="updateVolumetricScattering(this.value)">
            </div>
        `;
    }
    
    destroy() {
        this.stop();
        if (this.volumetricMesh) {
            this.volumetricMesh.geometry.dispose();
            this.volumetricMesh.material.dispose();
        }
    }
}

/**
 * 🔥 高级光线追踪系统
 */
class RayTracingRenderer {
    constructor(scene) {
        this.scene = scene;
        this.rayTracingMesh = null;
        this.isActive = false;
        this.time = 0;
        
        this.init();
    }
    
    init() {
        // 创建全屏四边形
        const geometry = new THREE.PlaneGeometry(2, 2);
        
        // 光线追踪着色器
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                cameraPosition: { value: new THREE.Vector3(0, 0, 5) },
                cameraTarget: { value: new THREE.Vector3(0, 0, 0) },
                fov: { value: 75 },
                spherePositions: { value: [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(2, 1, -1),
                    new THREE.Vector3(-2, -1, 1)
                ]},
                sphereRadii: { value: [1.0, 0.8, 0.6] },
                sphereMaterials: { value: [
                    new THREE.Vector4(1.0, 0.2, 0.2, 0.8), // 红色金属
                    new THREE.Vector4(0.2, 1.0, 0.2, 0.1), // 绿色玻璃
                    new THREE.Vector4(0.2, 0.2, 1.0, 0.5)  // 蓝色塑料
                ]}
            },
            vertexShader: `
                varying vec2 vUv;
                
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec2 resolution;
                uniform vec3 cameraPosition;
                uniform vec3 cameraTarget;
                uniform float fov;
                uniform vec3 spherePositions[3];
                uniform float sphereRadii[3];
                uniform vec4 sphereMaterials[3];
                
                varying vec2 vUv;
                
                struct Ray {
                    vec3 origin;
                    vec3 direction;
                };
                
                struct Hit {
                    bool hit;
                    float distance;
                    vec3 point;
                    vec3 normal;
                    vec4 material;
                };
                
                struct Light {
                    vec3 position;
                    vec3 color;
                    float intensity;
                };
                
                // 球体相交测试
                Hit intersectSphere(Ray ray, vec3 center, float radius, vec4 material) {
                    Hit hit;
                    hit.hit = false;
                    
                    vec3 oc = ray.origin - center;
                    float a = dot(ray.direction, ray.direction);
                    float b = 2.0 * dot(oc, ray.direction);
                    float c = dot(oc, oc) - radius * radius;
                    float discriminant = b * b - 4.0 * a * c;
                    
                    if (discriminant >= 0.0) {
                        float t = (-b - sqrt(discriminant)) / (2.0 * a);
                        if (t > 0.001) {
                            hit.hit = true;
                            hit.distance = t;
                            hit.point = ray.origin + t * ray.direction;
                            hit.normal = normalize(hit.point - center);
                            hit.material = material;
                        }
                    }
                    
                    return hit;
                }
                
                // 场景相交测试
                Hit intersectScene(Ray ray) {
                    Hit closestHit;
                    closestHit.hit = false;
                    closestHit.distance = 1000000.0;
                    
                    // 测试所有球体
                    for (int i = 0; i < 3; i++) {
                        Hit hit = intersectSphere(ray, spherePositions[i], sphereRadii[i], sphereMaterials[i]);
                        if (hit.hit && hit.distance < closestHit.distance) {
                            closestHit = hit;
                        }
                    }
                    
                    // 地面平面
                    float t = (-2.0 - ray.origin.y) / ray.direction.y;
                    if (t > 0.001 && t < closestHit.distance) {
                        closestHit.hit = true;
                        closestHit.distance = t;
                        closestHit.point = ray.origin + t * ray.direction;
                        closestHit.normal = vec3(0.0, 1.0, 0.0);
                        closestHit.material = vec4(0.8, 0.8, 0.8, 0.0); // 灰色漫反射
                    }
                    
                    return closestHit;
                }
                
                // 计算光照
                vec3 calculateLighting(Hit hit, vec3 viewDir, Light light) {
                    vec3 lightDir = normalize(light.position - hit.point);
                    vec3 halfDir = normalize(lightDir + viewDir);
                    
                    // 漫反射
                    float NdotL = max(0.0, dot(hit.normal, lightDir));
                    vec3 diffuse = hit.material.rgb * NdotL;
                    
                    // 镜面反射
                    float NdotH = max(0.0, dot(hit.normal, halfDir));
                    float shininess = mix(1.0, 128.0, hit.material.a);
                    vec3 specular = vec3(pow(NdotH, shininess)) * hit.material.a;
                    
                    // 距离衰减
                    float distance = length(light.position - hit.point);
                    float attenuation = 1.0 / (1.0 + 0.1 * distance + 0.01 * distance * distance);
                    
                    return (diffuse + specular) * light.color * light.intensity * attenuation;
                }
                
                // 反射光线
                vec3 reflect(vec3 incident, vec3 normal) {
                    return incident - 2.0 * dot(incident, normal) * normal;
                }
                
                // 折射光线
                vec3 refract(vec3 incident, vec3 normal, float eta) {
                    float cosI = -dot(normal, incident);
                    float sinT2 = eta * eta * (1.0 - cosI * cosI);
                    if (sinT2 > 1.0) return vec3(0.0); // 全反射
                    float cosT = sqrt(1.0 - sinT2);
                    return eta * incident + (eta * cosI - cosT) * normal;
                }
                
                // 光线追踪主函数
                vec3 trace(Ray ray, int depth) {
                    if (depth <= 0) return vec3(0.0);
                    
                    Hit hit = intersectScene(ray);
                    if (!hit.hit) {
                        // 天空盒
                        float gradient = ray.direction.y * 0.5 + 0.5;
                        return mix(vec3(0.5, 0.7, 1.0), vec3(1.0, 1.0, 1.0), gradient);
                    }
                    
                    // 光源
                    Light light;
                    light.position = vec3(sin(time) * 3.0, 5.0, cos(time) * 3.0);
                    light.color = vec3(1.0, 1.0, 1.0);
                    light.intensity = 10.0;
                    
                    vec3 color = calculateLighting(hit, -ray.direction, light);
                    
                    // 反射
                    if (hit.material.a > 0.1) {
                        vec3 reflectDir = reflect(ray.direction, hit.normal);
                        Ray reflectRay = Ray(hit.point + hit.normal * 0.001, reflectDir);
                        vec3 reflectColor = trace(reflectRay, depth - 1);
                        color = mix(color, reflectColor, hit.material.a * 0.5);
                    }
                    
                    return color;
                }
                
                void main() {
                    vec2 uv = (vUv - 0.5) * 2.0;
                    uv.x *= resolution.x / resolution.y;
                    
                    // 相机设置
                    vec3 forward = normalize(cameraTarget - cameraPosition);
                    vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
                    vec3 up = cross(right, forward);
                    
                    float fovRadians = fov * 3.14159 / 180.0;
                    float focalLength = 1.0 / tan(fovRadians * 0.5);
                    
                    vec3 rayDirection = normalize(uv.x * right + uv.y * up + focalLength * forward);
                    
                    Ray ray = Ray(cameraPosition, rayDirection);
                    vec3 color = trace(ray, 5);
                    
                    // 色调映射
                    color = color / (color + vec3(1.0));
                    color = pow(color, vec3(1.0 / 2.2));
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });
        
        this.rayTracingMesh = new THREE.Mesh(geometry, material);
        this.rayTracingMesh.position.set(0, 0, 0);
        
        console.log('🔥 光线追踪系统初始化完成');
    }
    
    start() {
        if (!this.isActive) {
            this.scene.add(this.rayTracingMesh);
            this.isActive = true;
            console.log('🟢 光线追踪启动');
        }
    }
    
    stop() {
        if (this.isActive) {
            this.scene.remove(this.rayTracingMesh);
            this.isActive = false;
            console.log('🔴 光线追踪停止');
        }
    }
    
    update() {
        if (!this.isActive) return;
        
        this.time += 0.016;
        if (this.rayTracingMesh.material.uniforms.time) {
            this.rayTracingMesh.material.uniforms.time.value = this.time;
        }
        
        // 更新球体位置（动画）
        const positions = this.rayTracingMesh.material.uniforms.spherePositions.value;
        positions[1].x = Math.sin(this.time) * 2;
        positions[1].z = Math.cos(this.time) * 2;
        positions[2].y = Math.sin(this.time * 1.5) * 1.5;
    }
    
    getConfigurationHTML() {
        return `
            <div class="config-section">
                <h4>反射质量</h4>
                <input type="range" min="1" max="8" value="5" 
                       onchange="updateRayTracingDepth(this.value)">
            </div>
            <div class="config-section">
                <h4>分辨率</h4>
                <select onchange="updateRayTracingResolution(this.value)">
                    <option value="0.5">50%</option>
                    <option value="1.0" selected>100%</option>
                    <option value="2.0">200%</option>
                </select>
            </div>
        `;
    }
    
    destroy() {
        this.stop();
        if (this.rayTracingMesh) {
            this.rayTracingMesh.geometry.dispose();
            this.rayTracingMesh.material.dispose();
        }
    }
}

/**
 * 🤖 AI智能特效系统
 */
class AIEffectSystem {
    constructor(scene) {
        this.scene = scene;
        this.aiMeshes = [];
        this.isActive = false;
        this.time = 0;
        this.neuralNetwork = null;
        
        this.init();
    }
    
    init() {
        this.createNeuralNetworkVisualization();
        console.log('🤖 AI特效系统初始化完成');
    }
    
    createNeuralNetworkVisualization() {
        // 创建神经网络可视化
        const layers = [8, 12, 16, 12, 8, 4]; // 网络层结构
        const layerSpacing = 3;
        const nodeSpacing = 0.8;
        
        // 节点
        layers.forEach((nodeCount, layerIndex) => {
            for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
                const geometry = new THREE.SphereGeometry(0.1, 16, 16);
                const material = new THREE.MeshLambertMaterial({
                    color: new THREE.Color().setHSL(
                        (layerIndex / layers.length) * 0.8 + 0.1,
                        0.8,
                        0.6
                    ),
                    emissive: new THREE.Color().setHSL(
                        (layerIndex / layers.length) * 0.8 + 0.1,
                        0.5,
                        0.2
                    )
                });
                
                const node = new THREE.Mesh(geometry, material);
                node.position.set(
                    (layerIndex - layers.length / 2) * layerSpacing,
                    (nodeIndex - nodeCount / 2) * nodeSpacing,
                    0
                );
                
                // 添加动画属性
                node.userData = {
                    originalY: node.position.y,
                    phase: Math.random() * Math.PI * 2,
                    amplitude: 0.2
                };
                
                this.aiMeshes.push(node);
            }
        });
        
        // 连接线
        for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
            const currentLayerNodes = layers[layerIndex];
            const nextLayerNodes = layers[layerIndex + 1];
            
            for (let currentNode = 0; currentNode < currentLayerNodes; currentNode++) {
                for (let nextNode = 0; nextNode < nextLayerNodes; nextNode++) {
                    // 创建连接线
                    const startPos = new THREE.Vector3(
                        (layerIndex - layers.length / 2) * layerSpacing,
                        (currentNode - currentLayerNodes / 2) * nodeSpacing,
                        0
                    );
                    const endPos = new THREE.Vector3(
                        (layerIndex + 1 - layers.length / 2) * layerSpacing,
                        (nextNode - nextLayerNodes / 2) * nodeSpacing,
                        0
                    );
                    
                    const geometry = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);
                    const material = new THREE.LineBasicMaterial({
                        color: 0x4facfe,
                        transparent: true,
                        opacity: 0.3
                    });
                    
                    const line = new THREE.Line(geometry, material);
                    line.userData = {
                        originalOpacity: 0.3,
                        pulsePhase: Math.random() * Math.PI * 2
                    };
                    
                    this.aiMeshes.push(line);
                }
            }
        }
        
        // 数据流粒子
        this.createDataFlowParticles();
    }
    
    createDataFlowParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // 位置
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 10;
            positions[i3 + 2] = (Math.random() - 0.5) * 5;
            
            // 颜色
            const hue = Math.random() * 0.3 + 0.5;
            const color = new THREE.Color().setHSL(hue, 0.8, 0.7);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // 速度
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        this.aiMeshes.push(particles);
    }
    
    start() {
        if (!this.isActive) {
            this.aiMeshes.forEach(mesh => this.scene.add(mesh));
            this.isActive = true;
            console.log('🟢 AI特效启动');
        }
    }
    
    stop() {
        if (this.isActive) {
            this.aiMeshes.forEach(mesh => this.scene.remove(mesh));
            this.isActive = false;
            console.log('🔴 AI特效停止');
        }
    }
    
    update() {
        if (!this.isActive) return;
        
        this.time += 0.016;
        
        this.aiMeshes.forEach(mesh => {
            if (mesh.userData) {
                // 节点动画
                if (mesh.userData.originalY !== undefined) {
                    mesh.position.y = mesh.userData.originalY + 
                        Math.sin(this.time * 2 + mesh.userData.phase) * mesh.userData.amplitude;
                    
                    // 发光效果
                    if (mesh.material.emissive) {
                        const intensity = 0.2 + Math.sin(this.time * 3 + mesh.userData.phase) * 0.1;
                        mesh.material.emissive.setHSL(
                            mesh.material.color.getHSL({}).h,
                            0.5,
                            intensity
                        );
                    }
                }
                
                // 连接线脉冲
                if (mesh.userData.pulsePhase !== undefined) {
                    const opacity = mesh.userData.originalOpacity + 
                        Math.sin(this.time * 4 + mesh.userData.pulsePhase) * 0.2;
                    mesh.material.opacity = Math.max(0.1, opacity);
                }
            }
            
            // 粒子更新
            if (mesh.geometry && mesh.geometry.attributes.velocity) {
                const positions = mesh.geometry.attributes.position.array;
                const velocities = mesh.geometry.attributes.velocity.array;
                
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += velocities[i];
                    positions[i + 1] += velocities[i + 1];
                    positions[i + 2] += velocities[i + 2];
                    
                    // 边界检测
                    if (Math.abs(positions[i]) > 10) velocities[i] *= -1;
                    if (Math.abs(positions[i + 1]) > 5) velocities[i + 1] *= -1;
                    if (Math.abs(positions[i + 2]) > 2.5) velocities[i + 2] *= -1;
                }
                
                mesh.geometry.attributes.position.needsUpdate = true;
            }
        });
    }
    
    getConfigurationHTML() {
        return `
            <div class="config-section">
                <h4>网络复杂度</h4>
                <input type="range" min="1" max="5" value="3" 
                       onchange="updateAIComplexity(this.value)">
            </div>
            <div class="config-section">
                <h4>数据流速度</h4>
                <input type="range" min="0.5" max="3" step="0.1" value="1"
                       onchange="updateAIDataFlow(this.value)">
            </div>
            <div class="config-section">
                <h4>AI模式</h4>
                <select onchange="updateAIMode(this.value)">
                    <option value="neural">神经网络</option>
                    <option value="genetic">遗传算法</option>
                    <option value="deeplearning">深度学习</option>
                </select>
            </div>
        `;
    }
    
    destroy() {
        this.stop();
        this.aiMeshes.forEach(mesh => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        this.aiMeshes = [];
    }
}

// 配置更新函数扩展
window.updateVolumetricDensity = function(value) {
    console.log('更新体积密度:', value);
};

window.updateVolumetricScattering = function(value) {
    console.log('更新体积散射:', value);
};

window.updateRayTracingDepth = function(value) {
    console.log('更新光线追踪深度:', value);
};

window.updateRayTracingResolution = function(value) {
    console.log('更新光线追踪分辨率:', value);
};

window.updateAIComplexity = function(value) {
    console.log('更新AI复杂度:', value);
};

window.updateAIDataFlow = function(value) {
    console.log('更新AI数据流速度:', value);
};

window.updateAIMode = function(value) {
    console.log('更新AI模式:', value);
};

// 导出新的特效类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        ParticleSystem, 
        FluidSimulator, 
        PhysicsEngine,
        VolumetricRenderer,
        RayTracingRenderer,
        AIEffectSystem
    };
} 
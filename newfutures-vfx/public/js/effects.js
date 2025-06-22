/**
 * 🎭 NewFutures VFX - 特效系统
 * 实现各种3D视觉特效
 */

/**
 * 粒子系统
 */
class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = null;
        this.particleCount = 50000;
        this.positions = null;
        this.colors = null;
        this.velocities = null;
        this.geometry = null;
        this.material = null;
        this.isActive = false;
        
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
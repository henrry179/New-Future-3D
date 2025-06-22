# 🎨 NewFutures VFX Core Module
# 🎨 NewFutures VFX 核心模块

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/240906093-9be4d344-6782-461a-b5a6-32a07bf7b34e.gif" width="400">
  
  <p>
    <b>Professional 3D VFX Engine | 专业3D视觉特效引擎</b>
  </p>
</div>

## 📋 Overview / 概述

This is the core VFX processing module of NewFutures platform, providing high-performance 3D visual effects processing capabilities.

这是NewFutures平台的核心VFX处理模块，提供高性能的3D视觉特效处理能力。

## ✨ Features / 功能特性

### 🎬 Effects Processing / 特效处理
- **Particle Systems** / 粒子系统
- **Fluid Simulation** / 流体模拟  
- **Volumetric Rendering** / 体积渲染
- **Real-time Ray Tracing** / 实时光线追踪
- **Physics Simulation** / 物理模拟

### 🔧 Technical Features / 技术特性
- GPU acceleration with CUDA / CUDA GPU加速
- Multi-threaded rendering / 多线程渲染
- Plugin architecture / 插件架构
- Memory optimization / 内存优化
- Batch processing / 批量处理

## 📦 Installation / 安装

```bash
# Install from parent directory / 从父目录安装
cd ..
pip install -e ./newfutures-vfx

# Or install directly / 或直接安装
pip install newfutures-vfx
```

## 🚀 Quick Start / 快速开始

### Basic Usage / 基本用法

```python
from newfutures_vfx import VFXEngine, ParticleSystem

# Initialize engine / 初始化引擎
engine = VFXEngine(gpu_enabled=True)

# Create particle effect / 创建粒子特效
particles = ParticleSystem(
    count=100000,
    lifetime=5.0,
    emitter_shape="sphere"
)

# Apply effect / 应用特效
result = engine.render(particles, output="particles.mp4")
```

### Advanced Example / 高级示例

```python
from newfutures_vfx import Scene, Camera, Lighting
from newfutures_vfx.effects import Fire, Smoke, Lightning

# Create scene / 创建场景
scene = Scene(resolution=(1920, 1080), fps=60)

# Setup camera / 设置相机
camera = Camera(
    position=(0, 5, 10),
    target=(0, 0, 0),
    fov=60
)
scene.set_camera(camera)

# Add lighting / 添加光照
scene.add_light(Lighting.directional(
    direction=(-1, -1, -1),
    color=(1.0, 0.9, 0.8),
    intensity=1.5
))

# Add effects / 添加特效
fire = Fire(
    position=(0, 0, 0),
    size=2.0,
    intensity=0.8,
    color_map="realistic"
)

smoke = Smoke(
    source=fire,
    density=0.5,
    wind_direction=(0.5, 0, 0)
)

lightning = Lightning(
    start=(0, 10, 0),
    end=(0, 0, 0),
    branches=5,
    glow_intensity=2.0
)

# Add to scene / 添加到场景
scene.add_effect(fire)
scene.add_effect(smoke)
scene.add_effect(lightning, start_frame=30, duration=10)

# Render / 渲染
scene.render(
    output_path="complex_effects.mp4",
    quality="high",
    gpu_acceleration=True
)
```

## 🔌 API Reference / API参考

### VFXEngine

```python
class VFXEngine:
    def __init__(self, gpu_enabled=True, memory_limit=None):
        """
        Initialize VFX engine / 初始化VFX引擎
        
        Args:
            gpu_enabled: Enable GPU acceleration / 启用GPU加速
            memory_limit: Memory limit in GB / 内存限制(GB)
        """
        
    def render(self, effect, output=None, **kwargs):
        """
        Render effect / 渲染特效
        
        Args:
            effect: Effect object / 特效对象
            output: Output path / 输出路径
            **kwargs: Additional parameters / 额外参数
        """
```

### Effect Classes / 特效类

#### ParticleSystem
```python
ParticleSystem(
    count=1000,              # Number of particles / 粒子数量
    lifetime=5.0,            # Particle lifetime / 粒子生命周期
    emitter_shape="point",   # Emitter shape / 发射器形状
    physics_enabled=True     # Enable physics / 启用物理
)
```

#### FluidSimulator
```python
FluidSimulator(
    resolution=(128, 128, 128),  # Grid resolution / 网格分辨率
    viscosity=0.01,              # Fluid viscosity / 流体粘度
    density=1000,                # Fluid density / 流体密度
    solver="FLIP"                # Solver type / 求解器类型
)
```

## 📊 Performance Optimization / 性能优化

### GPU Memory Management / GPU内存管理

```python
# Set memory limit / 设置内存限制
engine.set_memory_limit(8)  # 8GB

# Enable memory pooling / 启用内存池
engine.enable_memory_pooling()

# Clear cache / 清理缓存
engine.clear_cache()
```

### Batch Processing / 批量处理

```python
# Process multiple effects / 处理多个特效
effects = [effect1, effect2, effect3]
results = engine.batch_render(effects, parallel=True)
```

## 🧪 Testing / 测试

```bash
# Run tests / 运行测试
pytest tests/

# Run with coverage / 运行覆盖率测试
pytest --cov=src tests/

# Run specific test / 运行特定测试
pytest tests/test_particle_system.py
```

## 📁 Project Structure / 项目结构

```
newfutures-vfx/
├── src/
│   ├── core/           # Core engine / 核心引擎
│   ├── effects/        # Effect implementations / 特效实现
│   ├── renderers/      # Rendering backends / 渲染后端
│   ├── physics/        # Physics engine / 物理引擎
│   └── utils/          # Utilities / 工具函数
├── tests/              # Test suite / 测试套件
├── docs/               # Documentation / 文档
├── examples/           # Example scripts / 示例脚本
└── benchmarks/         # Performance tests / 性能测试
```

## 🤝 Contributing / 贡献

Please read the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

请阅读主项目的 [CONTRIBUTING.md](../CONTRIBUTING.md) 了解贡献指南。

## 📄 License / 许可证

This module is part of NewFutures VFX and is licensed under the MIT License.

此模块是NewFutures VFX的一部分，基于MIT许可证授权。

---

<div align="center">
  <sub>Part of NewFutures VFX Platform | NewFutures VFX平台的一部分</sub>
</div>

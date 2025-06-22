"""
VFX特效相关API
"""

from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

@router.get("/effects")
async def get_effects():
    """获取可用特效列表"""
    return {
        "effects": [
            {
                "id": "particles",
                "name": "粒子系统",
                "description": "高性能粒子引擎",
                "type": "particle_system",
                "enabled": True
            },
            {
                "id": "fluid",
                "name": "流体模拟",
                "description": "基于物理的流体动力学模拟",
                "type": "physics_simulation",
                "enabled": True
            },
            {
                "id": "raytracing",
                "name": "实时光线追踪",
                "description": "GPU加速的实时光线追踪渲染",
                "type": "rendering",
                "enabled": True
            },
            {
                "id": "volumetric",
                "name": "体积渲染",
                "description": "云、雾、烟雾等体积效果",
                "type": "volumetric",
                "enabled": True
            },
            {
                "id": "physics",
                "name": "物理模拟",
                "description": "刚体、软体、布料等物理效果",
                "type": "physics_simulation",
                "enabled": True
            },
            {
                "id": "ai",
                "name": "AI智能特效",
                "description": "基于深度学习的智能特效生成",
                "type": "ai_generated",
                "enabled": True
            }
        ]
    }

@router.get("/effects/{effect_id}")
async def get_effect_info(effect_id: str):
    """获取特定特效的详细信息"""
    effects_info = {
        "particles": {
            "id": "particles",
            "name": "粒子系统",
            "description": "高性能粒子引擎，支持数百万粒子的实时模拟和渲染",
            "parameters": {
                "count": {"type": "int", "default": 10000, "min": 1, "max": 1000000},
                "lifetime": {"type": "float", "default": 5.0, "min": 0.1, "max": 60.0},
                "size": {"type": "float", "default": 1.0, "min": 0.1, "max": 10.0},
                "color": {"type": "rgb", "default": [1.0, 1.0, 1.0]},
                "gravity": {"type": "float", "default": -9.8, "min": -50.0, "max": 50.0}
            }
        },
        "fluid": {
            "id": "fluid",
            "name": "流体模拟",
            "description": "基于物理的流体动力学模拟，支持水、烟雾、火焰等效果",
            "parameters": {
                "viscosity": {"type": "float", "default": 0.01, "min": 0.001, "max": 1.0},
                "density": {"type": "float", "default": 1.0, "min": 0.1, "max": 10.0},
                "resolution": {"type": "int", "default": 128, "min": 32, "max": 512},
                "damping": {"type": "float", "default": 0.99, "min": 0.8, "max": 1.0}
            }
        },
        "raytracing": {
            "id": "raytracing",
            "name": "实时光线追踪",
            "description": "GPU加速的实时光线追踪渲染，提供照片级真实感光照",
            "parameters": {
                "samples": {"type": "int", "default": 16, "min": 1, "max": 256},
                "bounces": {"type": "int", "default": 8, "min": 1, "max": 32},
                "exposure": {"type": "float", "default": 1.0, "min": 0.1, "max": 10.0},
                "gamma": {"type": "float", "default": 2.2, "min": 1.0, "max": 3.0}
            }
        }
    }
    
    if effect_id not in effects_info:
        return {"error": f"Effect {effect_id} not found"}
    
    return effects_info[effect_id]

@router.post("/effects/{effect_id}/start")
async def start_effect(effect_id: str, parameters: Dict[str, Any] = None):
    """启动特效"""
    if parameters is None:
        parameters = {}
        
    return {
        "status": "started",
        "effect_id": effect_id,
        "parameters": parameters,
        "session_id": f"session_{effect_id}_{hash(str(parameters)) % 10000}"
    }

@router.post("/effects/{effect_id}/stop")
async def stop_effect(effect_id: str, session_id: str = None):
    """停止特效"""
    return {
        "status": "stopped",
        "effect_id": effect_id,
        "session_id": session_id
    } 
"""
Video Effects Processing Module
视频特效处理模块
"""

import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from enum import Enum

import cv2
import numpy as np
from moviepy.editor import VideoFileClip, CompositeVideoClip, TextClip
from loguru import logger

from src.core.config import settings


class VideoEffectType(Enum):
    """视频特效类型枚举"""
    BLUR = "blur"
    GRAYSCALE = "grayscale"
    SEPIA = "sepia"
    EDGE_DETECTION = "edge_detection"
    CARTOON = "cartoon"
    GLITCH = "glitch"
    SLOW_MOTION = "slow_motion"
    SPEED_UP = "speed_up"
    REVERSE = "reverse"
    FADE_IN = "fade_in"
    FADE_OUT = "fade_out"
    CHROMA_KEY = "chroma_key"
    COLOR_CORRECTION = "color_correction"
    STABILIZATION = "stabilization"
    TEXT_OVERLAY = "text_overlay"


class VideoEffectsProcessor:
    """
    视频特效处理器
    """
    
    def __init__(self):
        self.supported_formats = settings.SUPPORTED_VIDEO_FORMATS
        self.max_size_mb = settings.MAX_VIDEO_SIZE_MB
    
    async def apply_effect(
        self,
        video_path: Path,
        effect_type: VideoEffectType,
        output_path: Path,
        params: Optional[Dict] = None
    ) -> Path:
        """
        应用视频特效
        
        Args:
            video_path: 输入视频路径
            effect_type: 特效类型
            output_path: 输出视频路径
            params: 特效参数
            
        Returns:
            处理后的视频路径
        """
        params = params or {}
        
        # 验证输入文件
        if not video_path.exists():
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        # 检查文件格式
        if video_path.suffix[1:].lower() not in self.supported_formats:
            raise ValueError(f"Unsupported video format: {video_path.suffix}")
        
        # 检查文件大小
        file_size_mb = video_path.stat().st_size / (1024 * 1024)
        if file_size_mb > self.max_size_mb:
            raise ValueError(f"Video file too large: {file_size_mb:.2f}MB > {self.max_size_mb}MB")
        
        logger.info(f"Applying {effect_type.value} effect to {video_path.name}")
        
        # 根据特效类型处理
        if effect_type == VideoEffectType.BLUR:
            return await self._apply_blur(video_path, output_path, params)
        elif effect_type == VideoEffectType.GRAYSCALE:
            return await self._apply_grayscale(video_path, output_path)
        elif effect_type == VideoEffectType.SEPIA:
            return await self._apply_sepia(video_path, output_path)
        elif effect_type == VideoEffectType.EDGE_DETECTION:
            return await self._apply_edge_detection(video_path, output_path, params)
        elif effect_type == VideoEffectType.CARTOON:
            return await self._apply_cartoon(video_path, output_path)
        elif effect_type == VideoEffectType.SLOW_MOTION:
            return await self._apply_slow_motion(video_path, output_path, params)
        elif effect_type == VideoEffectType.SPEED_UP:
            return await self._apply_speed_up(video_path, output_path, params)
        elif effect_type == VideoEffectType.REVERSE:
            return await self._apply_reverse(video_path, output_path)
        elif effect_type == VideoEffectType.TEXT_OVERLAY:
            return await self._apply_text_overlay(video_path, output_path, params)
        else:
            raise NotImplementedError(f"Effect {effect_type.value} not implemented yet")
    
    async def _apply_blur(self, video_path: Path, output_path: Path, params: Dict) -> Path:
        """应用模糊特效"""
        blur_strength = params.get("strength", 15)
        
        def process_frame(frame):
            return cv2.GaussianBlur(frame, (blur_strength, blur_strength), 0)
        
        return await self._process_video_frames(video_path, output_path, process_frame)
    
    async def _apply_grayscale(self, video_path: Path, output_path: Path) -> Path:
        """应用灰度特效"""
        def process_frame(frame):
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            return cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
        
        return await self._process_video_frames(video_path, output_path, process_frame)
    
    async def _apply_sepia(self, video_path: Path, output_path: Path) -> Path:
        """应用复古棕褐色特效"""
        def process_frame(frame):
            # Sepia转换矩阵
            kernel = np.array([[0.272, 0.534, 0.131],
                              [0.349, 0.686, 0.168],
                              [0.393, 0.769, 0.189]])
            return cv2.transform(frame, kernel)
        
        return await self._process_video_frames(video_path, output_path, process_frame)
    
    async def _apply_edge_detection(self, video_path: Path, output_path: Path, params: Dict) -> Path:
        """应用边缘检测特效"""
        threshold1 = params.get("threshold1", 100)
        threshold2 = params.get("threshold2", 200)
        
        def process_frame(frame):
            edges = cv2.Canny(frame, threshold1, threshold2)
            return cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
        
        return await self._process_video_frames(video_path, output_path, process_frame)
    
    async def _apply_cartoon(self, video_path: Path, output_path: Path) -> Path:
        """应用卡通化特效"""
        def process_frame(frame):
            # 双边滤波
            smooth = cv2.bilateralFilter(frame, 15, 80, 80)
            # 边缘检测
            gray = cv2.cvtColor(smooth, cv2.COLOR_BGR2GRAY)
            edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, 
                                         cv2.THRESH_BINARY, 7, 7)
            # 转换回彩色
            edges_colored = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
            # 合成卡通效果
            cartoon = cv2.bitwise_and(smooth, edges_colored)
            return cartoon
        
        return await self._process_video_frames(video_path, output_path, process_frame)
    
    async def _apply_slow_motion(self, video_path: Path, output_path: Path, params: Dict) -> Path:
        """应用慢动作特效"""
        factor = params.get("factor", 0.5)  # 默认0.5倍速
        
        clip = VideoFileClip(str(video_path))
        slow_clip = clip.fx(lambda c: c.speedx(factor))
        slow_clip.write_videofile(str(output_path), codec='libx264', audio_codec='aac')
        slow_clip.close()
        
        return output_path
    
    async def _apply_speed_up(self, video_path: Path, output_path: Path, params: Dict) -> Path:
        """应用加速特效"""
        factor = params.get("factor", 2.0)  # 默认2倍速
        
        clip = VideoFileClip(str(video_path))
        fast_clip = clip.fx(lambda c: c.speedx(factor))
        fast_clip.write_videofile(str(output_path), codec='libx264', audio_codec='aac')
        fast_clip.close()
        
        return output_path
    
    async def _apply_reverse(self, video_path: Path, output_path: Path) -> Path:
        """应用倒放特效"""
        clip = VideoFileClip(str(video_path))
        reversed_clip = clip.fx(lambda c: c.reverse())
        reversed_clip.write_videofile(str(output_path), codec='libx264', audio_codec='aac')
        reversed_clip.close()
        
        return output_path
    
    async def _apply_text_overlay(self, video_path: Path, output_path: Path, params: Dict) -> Path:
        """应用文字叠加特效"""
        text = params.get("text", "NewFutures VFX")
        font_size = params.get("font_size", 50)
        color = params.get("color", "white")
        position = params.get("position", ("center", "bottom"))
        duration = params.get("duration", None)
        
        video_clip = VideoFileClip(str(video_path))
        
        # 创建文字剪辑
        text_clip = TextClip(
            text,
            fontsize=font_size,
            color=color,
            font='Arial'
        ).set_position(position)
        
        # 设置文字显示时长
        if duration:
            text_clip = text_clip.set_duration(duration)
        else:
            text_clip = text_clip.set_duration(video_clip.duration)
        
        # 合成视频
        final_clip = CompositeVideoClip([video_clip, text_clip])
        final_clip.write_videofile(str(output_path), codec='libx264', audio_codec='aac')
        
        # 清理资源
        video_clip.close()
        text_clip.close()
        final_clip.close()
        
        return output_path
    
    async def _process_video_frames(
        self,
        video_path: Path,
        output_path: Path,
        frame_processor
    ) -> Path:
        """
        逐帧处理视频
        
        Args:
            video_path: 输入视频路径
            output_path: 输出视频路径
            frame_processor: 帧处理函数
            
        Returns:
            处理后的视频路径
        """
        # 打开视频
        cap = cv2.VideoCapture(str(video_path))
        
        # 获取视频属性
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # 创建视频写入器
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))
        
        # 逐帧处理
        frame_count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # 处理帧
            processed_frame = frame_processor(frame)
            
            # 写入处理后的帧
            out.write(processed_frame)
            frame_count += 1
            
            # 每100帧输出一次进度
            if frame_count % 100 == 0:
                logger.debug(f"Processed {frame_count} frames")
        
        # 释放资源
        cap.release()
        out.release()
        cv2.destroyAllWindows()
        
        logger.info(f"Video processing completed: {frame_count} frames processed")
        return output_path
    
    async def batch_apply_effects(
        self,
        video_paths: List[Path],
        effect_type: VideoEffectType,
        output_dir: Path,
        params: Optional[Dict] = None
    ) -> List[Path]:
        """
        批量应用视频特效
        
        Args:
            video_paths: 视频路径列表
            effect_type: 特效类型
            output_dir: 输出目录
            params: 特效参数
            
        Returns:
            处理后的视频路径列表
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        
        tasks = []
        for video_path in video_paths:
            output_name = f"{video_path.stem}_{effect_type.value}{video_path.suffix}"
            output_path = output_dir / output_name
            
            task = self.apply_effect(video_path, effect_type, output_path, params)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理结果
        processed_paths = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Failed to process {video_paths[i]}: {result}")
            else:
                processed_paths.append(result)
        
        return processed_paths
    
    def get_video_info(self, video_path: Path) -> Dict:
        """
        获取视频信息
        
        Args:
            video_path: 视频路径
            
        Returns:
            视频信息字典
        """
        cap = cv2.VideoCapture(str(video_path))
        
        info = {
            "filename": video_path.name,
            "format": video_path.suffix[1:],
            "fps": cap.get(cv2.CAP_PROP_FPS),
            "frame_count": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
            "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            "duration": cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS),
            "size_mb": video_path.stat().st_size / (1024 * 1024)
        }
        
        cap.release()
        return info 
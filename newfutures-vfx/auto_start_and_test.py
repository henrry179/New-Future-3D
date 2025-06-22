#!/usr/bin/env python3
"""
🚀 NewFutures VFX 自动启动和测试脚本
自动启动Web界面并进行完整测试
"""

import os
import sys
import time
import signal
import subprocess
import requests
import threading
from pathlib import Path

class VFXAutoLauncher:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.server_process = None
        self.server_url = "http://localhost:8000"
        
    def check_port(self, port=8000):
        """检查端口是否被占用"""
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            sock.bind(('localhost', port))
            sock.close()
            return False  # 端口未被占用
        except:
            return True   # 端口被占用
    
    def kill_existing_server(self, port=8000):
        """杀死占用端口的进程"""
        try:
            # 查找占用端口的进程
            result = subprocess.run(['lsof', '-ti', f':{port}'], 
                                  capture_output=True, text=True)
            if result.stdout:
                pids = result.stdout.strip().split('\n')
                for pid in pids:
                    if pid:
                        print(f"🔄 杀死占用端口{port}的进程 PID: {pid}")
                        subprocess.run(['kill', '-9', pid])
                        time.sleep(1)
        except Exception as e:
            print(f"⚠️  清理端口时出错: {e}")
    
    def start_server(self):
        """启动Web服务器"""
        print("🚀 启动NewFutures VFX Web服务器...")
        
        # 检查并清理端口
        if self.check_port():
            print("⚠️  端口8000被占用，尝试清理...")
            self.kill_existing_server()
            time.sleep(2)
        
        # 启动服务器
        try:
            launcher_path = self.project_root / "launch_web.py"
            self.server_process = subprocess.Popen([
                sys.executable, str(launcher_path)
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            print(f"✅ 服务器进程已启动 (PID: {self.server_process.pid})")
            return True
        except Exception as e:
            print(f"❌ 服务器启动失败: {e}")
            return False
    
    def wait_for_server(self, timeout=30):
        """等待服务器启动完成"""
        print("⏳ 等待服务器启动...")
        
        for i in range(timeout):
            try:
                response = requests.get(f"{self.server_url}/health", timeout=5)
                if response.status_code == 200:
                    print(f"✅ 服务器启动成功 (耗时: {i+1}秒)")
                    return True
            except:
                pass
            
            time.sleep(1)
            if i % 5 == 0 and i > 0:
                print(f"⏳ 仍在等待... ({i}/{timeout}秒)")
        
        print(f"❌ 服务器启动超时 ({timeout}秒)")
        return False
    
    def run_tests(self):
        """运行Web界面测试"""
        print("\n🧪 开始Web界面测试...")
        try:
            test_script = self.project_root / "test_web_interface.py"
            result = subprocess.run([
                sys.executable, str(test_script)
            ], capture_output=True, text=True)
            
            print(result.stdout)
            if result.stderr:
                print("错误输出:", result.stderr)
            
            return result.returncode == 0
        except Exception as e:
            print(f"❌ 测试执行失败: {e}")
            return False
    
    def open_browser(self):
        """尝试打开浏览器"""
        try:
            import webbrowser
            print(f"🌐 尝试打开浏览器: {self.server_url}")
            webbrowser.open(self.server_url)
        except Exception as e:
            print(f"⚠️  无法自动打开浏览器: {e}")
            print(f"请手动访问: {self.server_url}")
    
    def cleanup(self):
        """清理资源"""
        if self.server_process:
            print("\n🔄 正在停止服务器...")
            self.server_process.terminate()
            try:
                self.server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.server_process.kill()
            print("✅ 服务器已停止")
    
    def run_interactive_mode(self):
        """交互式运行模式"""
        print("🎮 NewFutures VFX 交互式启动器")
        print("=" * 50)
        
        if not self.start_server():
            return False
        
        if not self.wait_for_server():
            self.cleanup()
            return False
        
        test_success = self.run_tests()
        
        if test_success:
            print("\n🎉 所有测试通过！Web界面运行正常")
            self.open_browser()
            
            print("\n" + "=" * 50)
            print("🌐 Web界面访问信息:")
            print(f"   主页面: {self.server_url}")
            print(f"   API文档: {self.server_url}/api/docs")
            print(f"   健康检查: {self.server_url}/health")
            print("=" * 50)
            print("\n按 Ctrl+C 停止服务器")
            
            try:
                # 保持服务器运行
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n👋 收到停止信号")
        else:
            print("\n⚠️  测试失败，但服务器仍在运行")
            print(f"🌐 您可以手动访问: {self.server_url}")
            
            try:
                input("\n按回车键停止服务器...")
            except KeyboardInterrupt:
                pass
        
        self.cleanup()
        return test_success
    
    def run_daemon_mode(self):
        """后台守护模式"""
        print("🔧 NewFutures VFX 后台启动模式")
        
        if not self.start_server():
            return False
        
        if not self.wait_for_server():
            self.cleanup()
            return False
        
        print(f"✅ 服务器已在后台运行")
        print(f"🌐 访问地址: {self.server_url}")
        print(f"📊 API文档: {self.server_url}/api/docs")
        print(f"🔍 进程PID: {self.server_process.pid}")
        print("\n使用以下命令停止服务器:")
        print(f"kill {self.server_process.pid}")
        
        return True

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="NewFutures VFX 自动启动器")
    parser.add_argument("--daemon", action="store_true", help="后台守护模式")
    parser.add_argument("--test-only", action="store_true", help="仅运行测试")
    parser.add_argument("--no-browser", action="store_true", help="不自动打开浏览器")
    
    args = parser.parse_args()
    
    launcher = VFXAutoLauncher()
    
    # 设置信号处理
    def signal_handler(sig, frame):
        print("\n🛑 收到停止信号")
        launcher.cleanup()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        if args.test_only:
            # 仅运行测试
            success = launcher.run_tests()
            sys.exit(0 if success else 1)
        elif args.daemon:
            # 后台模式
            success = launcher.run_daemon_mode()
            sys.exit(0 if success else 1)
        else:
            # 交互式模式
            success = launcher.run_interactive_mode()
            sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ 启动器运行出错: {e}")
        launcher.cleanup()
        sys.exit(1)

if __name__ == "__main__":
    main() 
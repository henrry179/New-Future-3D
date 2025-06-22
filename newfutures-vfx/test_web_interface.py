#!/usr/bin/env python3
"""
🧪 NewFutures VFX Web界面完整测试脚本
测试所有Web界面功能和API端点
"""

import requests
import time
import json
import sys
from urllib.parse import urljoin

class WebInterfaceTest:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.timeout = 10
        self.test_results = []
        
    def log_test(self, test_name, success, message="", response_time=0):
        """记录测试结果"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "response_time": response_time
        }
        self.test_results.append(result)
        print(f"{status} {test_name}: {message} ({response_time:.3f}s)")
        
    def test_server_connectivity(self):
        """测试服务器连通性"""
        try:
            start_time = time.time()
            response = self.session.get(urljoin(self.base_url, "/health"))
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("服务器连通性", True, f"服务器正常运行 v{data.get('version')}", response_time)
                    return True
                else:
                    self.log_test("服务器连通性", False, f"服务器状态异常: {data.get('status')}", response_time)
            else:
                self.log_test("服务器连通性", False, f"HTTP {response.status_code}", response_time)
        except Exception as e:
            self.log_test("服务器连通性", False, f"连接失败: {str(e)}")
        return False
    
    def test_api_endpoints(self):
        """测试API端点"""
        endpoints = [
            ("/health", "健康检查API"),
            ("/api/status", "API状态"),
            ("/api/test", "测试端点"),
            ("/api/docs", "API文档")
        ]
        
        for endpoint, name in endpoints:
            try:
                start_time = time.time()
                response = self.session.get(urljoin(self.base_url, endpoint))
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    self.log_test(name, True, "响应正常", response_time)
                else:
                    self.log_test(name, False, f"HTTP {response.status_code}", response_time)
            except Exception as e:
                self.log_test(name, False, f"请求失败: {str(e)}")
    
    def test_main_page(self):
        """测试主页面"""
        try:
            start_time = time.time()
            response = self.session.get(self.base_url)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                content = response.text
                # 检查关键元素
                checks = [
                    ("<!DOCTYPE html>", "HTML文档类型"),
                    ("<title>NewFutures VFX", "页面标题"),
                    ("three.js", "Three.js库"),
                    ("css/styles.css", "样式表"),
                    ("js/app.js", "应用脚本")
                ]
                
                all_passed = True
                for check, desc in checks:
                    if check in content:
                        self.log_test(f"主页面-{desc}", True, "元素存在", 0)
                    else:
                        self.log_test(f"主页面-{desc}", False, "元素缺失", 0)
                        all_passed = False
                
                if all_passed:
                    self.log_test("主页面完整性", True, "所有关键元素存在", response_time)
                else:
                    self.log_test("主页面完整性", False, "部分关键元素缺失", response_time)
            else:
                self.log_test("主页面", False, f"HTTP {response.status_code}", response_time)
        except Exception as e:
            self.log_test("主页面", False, f"加载失败: {str(e)}")
    
    def test_static_files(self):
        """测试静态文件"""
        static_files = [
            ("/static/css/styles.css", "CSS样式文件"),
            ("/static/js/app.js", "应用脚本文件"),
            ("/static/js/effects.js", "特效脚本文件")
        ]
        
        for file_path, name in static_files:
            try:
                start_time = time.time()
                response = self.session.get(urljoin(self.base_url, file_path))
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    size = len(response.content)
                    self.log_test(name, True, f"加载成功 ({size} bytes)", response_time)
                else:
                    self.log_test(name, False, f"HTTP {response.status_code}", response_time)
            except Exception as e:
                self.log_test(name, False, f"加载失败: {str(e)}")
    
    def test_cors_headers(self):
        """测试CORS头部"""
        try:
            start_time = time.time()
            response = self.session.options(self.base_url)
            response_time = time.time() - start_time
            
            cors_headers = [
                "access-control-allow-origin",
                "access-control-allow-methods",
                "access-control-allow-headers"
            ]
            
            has_cors = any(header in response.headers for header in cors_headers)
            if has_cors:
                self.log_test("CORS配置", True, "CORS头部正确配置", response_time)
            else:
                self.log_test("CORS配置", False, "CORS头部缺失", response_time)
        except Exception as e:
            self.log_test("CORS配置", False, f"测试失败: {str(e)}")
    
    def test_performance(self):
        """测试性能指标"""
        # 测试并发请求
        try:
            import threading
            
            results = []
            def make_request():
                start_time = time.time()
                response = self.session.get(urljoin(self.base_url, "/health"))
                end_time = time.time()
                results.append(end_time - start_time)
            
            # 发送10个并发请求
            threads = []
            for _ in range(10):
                thread = threading.Thread(target=make_request)
                threads.append(thread)
                thread.start()
            
            for thread in threads:
                thread.join()
            
            if results:
                avg_response_time = sum(results) / len(results)
                max_response_time = max(results)
                
                if avg_response_time < 0.5:  # 平均响应时间小于500ms
                    self.log_test("并发性能", True, f"平均响应时间: {avg_response_time:.3f}s", avg_response_time)
                else:
                    self.log_test("并发性能", False, f"响应时间过慢: {avg_response_time:.3f}s", avg_response_time)
            else:
                self.log_test("并发性能", False, "无法获取性能数据")
        except Exception as e:
            self.log_test("并发性能", False, f"性能测试失败: {str(e)}")
    
    def run_all_tests(self):
        """运行所有测试"""
        print("🧪 NewFutures VFX Web界面完整测试")
        print("=" * 60)
        print(f"🌐 测试目标: {self.base_url}")
        print("=" * 60)
        
        # 首先测试服务器连通性
        if not self.test_server_connectivity():
            print("\n❌ 服务器无法连接，停止测试")
            return False
        
        print("\n📋 执行功能测试...")
        self.test_api_endpoints()
        self.test_main_page()
        self.test_static_files()
        self.test_cors_headers()
        
        print("\n⚡ 执行性能测试...")
        self.test_performance()
        
        # 统计结果
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 60)
        print("📊 测试结果汇总")
        print("=" * 60)
        print(f"总测试数: {total_tests}")
        print(f"✅ 通过: {passed_tests}")
        print(f"❌ 失败: {failed_tests}")
        print(f"成功率: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ 失败的测试:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)
        if failed_tests == 0:
            print("🎉 所有测试通过！Web界面运行正常")
            print(f"🌐 访问地址: {self.base_url}")
            print(f"📊 API文档: {self.base_url}/api/docs")
            return True
        else:
            print("⚠️  部分测试失败，请检查上述问题")
            return False

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="NewFutures VFX Web界面测试")
    parser.add_argument("--url", default="http://localhost:8000", help="服务器URL")
    parser.add_argument("--wait", type=int, default=0, help="等待服务器启动的秒数")
    
    args = parser.parse_args()
    
    if args.wait > 0:
        print(f"⏳ 等待服务器启动 ({args.wait}秒)...")
        time.sleep(args.wait)
    
    tester = WebInterfaceTest(args.url)
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 
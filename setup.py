"""
NewFutures VFX - Professional VFX Operations Platform
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="newfutures-vfx",
    version="0.1.0",
    author="NewFutures Team",
    author_email="contact@newfutures-vfx.com",
    description="Professional VFX operations platform with AI-powered effects and rendering",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/newfutures-vfx",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Multimedia :: Video",
        "Topic :: Multimedia :: Sound/Audio",
        "Topic :: Multimedia :: Graphics",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.10",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.4.3",
            "pytest-asyncio>=0.21.1",
            "pytest-cov>=4.1.0",
            "black>=23.11.0",
            "flake8>=6.1.0",
            "mypy>=1.7.1",
            "pre-commit>=3.5.0",
        ],
        "gpu": [
            "torch>=2.1.1+cu118",
            "torchvision>=0.16.1+cu118",
        ],
    },
    entry_points={
        "console_scripts": [
            "newfutures-vfx=src.main:main",
            "vfx-server=src.main:run_server",
            "vfx-worker=src.worker:run_worker",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.json", "*.yaml", "*.yml", "*.html", "*.css", "*.js"],
    },
) 
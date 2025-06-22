# Contributing to NewFutures VFX

First off, thank you for considering contributing to NewFutures VFX! It's people like you that make NewFutures VFX such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to contact@newfutures-vfx.com.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Push to your fork and submit a pull request

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs** if possible
* **Include your environment details** (OS, Python version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior** and **explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these `beginner` and `help-wanted` issues:

* [Beginner issues](https://github.com/yourusername/newfutures-vfx/labels/beginner) - issues which should only require a few lines of code
* [Help wanted issues](https://github.com/yourusername/newfutures-vfx/labels/help%20wanted) - issues which should be a bit more involved

## Development Setup

1. **Install Python 3.10+**
   ```bash
   # Check Python version
   python --version
   ```

2. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/newfutures-vfx.git
   cd newfutures-vfx
   ```

3. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt  # Development dependencies
   ```

5. **Set up pre-commit hooks**
   ```bash
   pre-commit install
   ```

6. **Run tests**
   ```bash
   pytest
   ```

## Style Guidelines

### Python Style Guide

We use [Black](https://github.com/psf/black) for Python code formatting and follow [PEP 8](https://www.python.org/dev/peps/pep-0008/).

```bash
# Format code
black src/

# Check code style
flake8 src/

# Sort imports
isort src/
```

### Documentation Style

* Use clear and concise language
* Include code examples where appropriate
* Update the README.md if needed
* Add docstrings to all public functions and classes

Example docstring:
```python
def apply_effect(video_path: str, effect_name: str, **kwargs) -> str:
    """
    Apply a visual effect to a video file.
    
    Args:
        video_path: Path to the input video file
        effect_name: Name of the effect to apply
        **kwargs: Additional parameters for the effect
        
    Returns:
        Path to the processed video file
        
    Raises:
        ValueError: If the effect name is not recognized
        FileNotFoundError: If the video file doesn't exist
    """
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

* `feat:` A new feature
* `fix:` A bug fix
* `docs:` Documentation only changes
* `style:` Changes that do not affect the meaning of the code
* `refactor:` A code change that neither fixes a bug nor adds a feature
* `perf:` A code change that improves performance
* `test:` Adding missing tests or correcting existing tests
* `chore:` Changes to the build process or auxiliary tools

Examples:
```
feat: add blur effect to video processor
fix: resolve memory leak in batch processing
docs: update installation instructions
```

## Pull Request Process

1. **Ensure your code follows the style guidelines**
2. **Update the documentation** if you're changing functionality
3. **Add tests** for any new functionality
4. **Ensure all tests pass** by running `pytest`
5. **Update the README.md** with details of changes to the interface
6. **Increase version numbers** in any examples files and the README.md to the new version that this Pull Request would represent

### Pull Request Template

When creating a pull request, please use this template:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## Questions?

Feel free to open an issue with your question or contact us at contact@newfutures-vfx.com.

Thank you for contributing! 🎉 
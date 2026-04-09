from setuptools import find_packages, setup


def get_requirements(file_path: str) -> list[str]:
    with open(file_path, encoding="utf-8") as file_obj:
        requirements = [
            requirement.strip()
            for requirement in file_obj.readlines()
            if requirement.strip() and not requirement.startswith("#")
        ]
    return requirements


setup(
    name="primetrade_ml_project",
    version="0.0.1",
    author="Ayan Mansuri",
    author_email="ayan@example.com",
    packages=find_packages(),
    install_requires=get_requirements("requirements.txt"),
)

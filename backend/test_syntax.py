import py_compile
import sys

try:
    py_compile.compile('main.py', doraise=True)
    print("SUCCESS: main.py compiles without errors")
except py_compile.PyCompileError as e:
    print(f"ERROR: {e}")
    sys.exit(1)

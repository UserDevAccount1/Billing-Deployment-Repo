# Activates project venv (if present) and loads .env before importing Django.
import os
import sys

PROJECT_ROOT = os.path.dirname(__file__)
sys.path.insert(0, PROJECT_ROOT)

# --- Activate virtualenv (best-effort) -------------------------------------
# If you have a venv at PROJECT_ROOT/venv, put its site-packages on sys.path
VENV_DIR = os.path.join(PROJECT_ROOT, "venv")
if os.path.isdir(VENV_DIR):
    # Add venv/bin to PATH so subprocesses and scripts use the venv binaries
    venv_bin = os.path.join(VENV_DIR, "bin")
    os.environ["PATH"] = venv_bin + os.pathsep + os.environ.get("PATH", "")

    # Compute site-packages path for this python minor version and add to sys.path
    py_ver = f"python{sys.version_info.major}.{sys.version_info.minor}"
    candidate = os.path.join(VENV_DIR, "lib", py_ver, "site-packages")
    if os.path.isdir(candidate):
        sys.path.insert(0, candidate)
    # Some systems place site-packages under "lib64"
    candidate64 = os.path.join(VENV_DIR, "lib64", py_ver, "site-packages")
    if os.path.isdir(candidate64):
        sys.path.insert(0, candidate64)

# --- Load .env (if present) -------------------------------------------------
ENV_PATH = os.path.join(PROJECT_ROOT, ".env")
if os.path.exists(ENV_PATH):
    # Prefer python-dotenv if installed
    try:
        from dotenv import load_dotenv
        load_dotenv(ENV_PATH)
    except Exception:
        # Fallback: simple parser (KEY=VAL lines, ignores comments)
        try:
            with open(ENV_PATH, "r") as f:
                for ln in f:
                    ln = ln.strip()
                    if not ln or ln.startswith("#"):
                        continue
                    if "=" not in ln:
                        continue
                    k, v = ln.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    # only set if not already set in environment
                    if k and (k not in os.environ):
                        os.environ[k] = v
        except Exception:
            pass

# --- Ensure DJANGO_SETTINGS_MODULE set (fallback) ---------------------------
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "excis_billing.settings")

# --- Import Django WSGI application ----------------------------------------
# Delay import until venv/env loaded
try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
except Exception:
    # If import fails, raise with helpful context (Passenger will log)
    raise

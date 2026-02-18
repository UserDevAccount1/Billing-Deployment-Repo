import os
import sys

# Add project directory to python path
sys.path.insert(0, os.path.dirname(__file__))

# Point to your Django project's wsgi file
from excis_billing.wsgi import application
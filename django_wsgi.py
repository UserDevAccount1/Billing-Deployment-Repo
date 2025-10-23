import os
import sys

# Add your project directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))

# Set Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'excis_billing.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
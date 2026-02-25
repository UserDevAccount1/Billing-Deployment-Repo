import re

# Read the file
with open('/app/excis_billing/settings.py', 'r') as f:
    content = f.read()

# Remove the bad line
content = re.sub(r'\\n# Added humanize\\nINSTALLED_APPS\.append\(.*?\)', '', content)

# Write back
with open('/app/excis_billing/settings.py', 'w') as f:
    f.write(content)

print("Fixed settings.py")
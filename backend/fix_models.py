import re

# Read the file
with open('app/models.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace users.id with f-string using TableNames.USERS
content = content.replace('"users.id"', 'f"{TableNames.USERS}.id"')

# Replace cascade strings
content = content.replace('"all, delete-orphan"', 'CascadeOptions.ALL_DELETE_ORPHAN')

# Write back
with open('app/models.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed all literal duplications in models.py')
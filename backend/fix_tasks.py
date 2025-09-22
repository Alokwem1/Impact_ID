import re

# Read the file
with open('app/routers/tasks.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace utcnow() with utcnow()
content = content.replace('utcnow()', 'utcnow()')

# Replace "Task not found" with ErrorMessages.TASK_NOT_FOUND
content = content.replace('"Task not found"', 'ErrorMessages.TASK_NOT_FOUND')

# Write back
with open('app/routers/tasks.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed datetime and error message literals in tasks.py')
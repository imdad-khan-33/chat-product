import os

env_path = os.path.join('backend', '.env')
new_key = 'DEEPSEEK_API_KEY=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'

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    with open(env_path, 'w') as f:
        found = False
        for line in lines:
            if line.startswith('DEEPSEEK_API_KEY='):
                f.write(new_key + '\n')
                found = True
            else:
                f.write(line)
        if not found:
            f.write('\n' + new_key + '\n')
    print(f"Updated {env_path}")
else:
    with open(env_path, 'w') as f:
        f.write(new_key + '\n')
    print(f"Created {env_path}")

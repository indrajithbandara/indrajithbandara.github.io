with open('index.html', 'r') as f:
    content = f.read()

with open('/sdcard/Download/social_section.html', 'r') as f:
    social = f.read()

# Testimonials section කලින් දාන්න
target = '    <!-- ============ TESTIMONIALS ============ -->'

if target in content:
    content = content.replace(target, social + '\n\n' + target)
    with open('index.html', 'w') as f:
        f.write(content)
    print("SUCCESS!")
else:
    print("NOT FOUND")


import os

index_path = 'd:/IncoziProject/Incozi/index.html'
style_path = 'd:/IncoziProject/Incozi/style.css'

# 1. Update HTML
with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace "Includes:" header
# Replaced with "Key Features" as requested ("tweak in something else")
html = html.replace('>Includes:</h5>', '>Key Features</h5>')

# Replace ticks with circles
html = html.replace('fa-solid fa-check', 'fa-solid fa-circle')

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Update CSS
# Need to adjust the circle size to look like a "point"
css_content = """
/* Custom styling for the new bullet points */
.feature-list li i.fa-circle {
  font-size: 0.4rem; /* Small dot */
  top: 10px; /* Vertically centered relative to text */
  opacity: 0.8;
}
"""

with open(style_path, 'a', encoding='utf-8') as f:
    f.write(css_content)

print("Updates complete.")

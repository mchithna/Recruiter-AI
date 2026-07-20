import cv2
import numpy as np
from PIL import Image
import os

input_path = 'frontend/public/assets/chatbot-media/Gif.gif'
output_path = 'frontend/public/assets/chatbot-media/Gif_clean.gif'

gif = Image.open(input_path)
frames = []

# Assuming the background touches the borders (top-left, top-right, etc.)
# We will use floodFill to mask out the background.

for frame_idx in range(gif.n_frames):
    gif.seek(frame_idx)
    # Convert frame to RGBA
    frame_rgba = gif.convert("RGBA")
    
    # Convert to OpenCV format (numpy array)
    arr = np.array(frame_rgba)
    
    # Create a mask for flood fill. Must be 2 pixels larger than the image.
    h, w = arr.shape[:2]
    mask = np.zeros((h + 2, w + 2), np.uint8)
    
    # We will flood fill from all 4 corners to be safe
    corners = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    
    # The checkerboard has some variation, so we use a generous tolerance
    # Let's flood fill on a grayscale version to catch both white and gray checkerboards easily
    gray = cv2.cvtColor(arr, cv2.COLOR_RGBA2GRAY)
    
    for corner in corners:
        # Flood fill the gray image. 
        # Tolerance: diff between white (255) and gray (say 200) is 55. We'll use 60.
        cv2.floodFill(gray, mask, corner, 255, loDiff=60, upDiff=60, flags=4 | (255 << 8))
    
    # The mask now has 255 where the background was flooded.
    # Note: mask is 2 pixels larger. We need to crop it back.
    mask_cropped = mask[1:h+1, 1:w+1]
    
    # Set alpha channel to 0 where mask_cropped is 255
    arr[mask_cropped == 255, 3] = 0
    
    # Convert back to PIL Image
    clean_frame = Image.fromarray(arr, 'RGBA')
    frames.append(clean_frame)

# Save as new GIF
frames[0].save(
    output_path,
    save_all=True,
    append_images=frames[1:],
    duration=gif.info.get('duration', 80),
    loop=gif.info.get('loop', 0),
    disposal=2,
    transparency=0 # Ensure the fully transparent pixels are treated as transparent background in GIF
)
print("Cleaned GIF saved to", output_path)

import cv2
import numpy as np
from rembg import remove
from PIL import Image

def process_video():
    input_path = 'frontend/public/assets/chatbot-media/Gif_light.mp4'
    output_path = 'frontend/public/assets/chatbot-media/Gif_light_clean.mp4'
    
    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
    
    # Solid background color #F8FAFC (BGR format for OpenCV)
    # RGB = (248, 250, 252) -> BGR = (252, 250, 248)
    bg_color = (252, 250, 248)
    
    print(f"Starting processing of {total_frames} frames...")
    
    count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Convert BGR to RGB for PIL/rembg
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb_frame)
        
        # Remove background (returns RGBA PIL image)
        out_img = remove(pil_img)
        
        # Convert back to numpy array
        rgba = np.array(out_img)
        
        # Extract alpha channel
        alpha = rgba[:, :, 3] / 255.0
        
        # Create solid background image
        bg = np.zeros((h, w, 3), dtype=np.uint8)
        bg[:] = bg_color
        
        # Composite foreground over background
        fg = rgba[:, :, :3]
        
        # Alpha blending
        # Result = fg * alpha + bg * (1 - alpha)
        # Note: fg is RGB, bg is BGR. We must convert fg to BGR first
        fg_bgr = cv2.cvtColor(fg, cv2.COLOR_RGB2BGR)
        
        alpha_3d = np.expand_dims(alpha, axis=2)
        blended = (fg_bgr * alpha_3d + bg * (1 - alpha_3d)).astype(np.uint8)
        
        out.write(blended)
        count += 1
        
        if count % 10 == 0:
            print(f"Processed {count}/{total_frames} frames")
            
    cap.release()
    out.release()
    print("Video processing complete!")

if __name__ == "__main__":
    process_video()

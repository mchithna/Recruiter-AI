import cv2
import numpy as np
from rembg import remove
from PIL import Image
import imageio

def process_video():
    input_path = 'frontend/public/assets/chatbot-media/Gif_light.mp4'
    output_path = 'frontend/public/assets/chatbot-media/Gif_clean.webm'
    
    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Initialize imageio writer for WEBM with VP9 and alpha channel
    writer = imageio.get_writer(
        output_path, 
        format='FFMPEG', 
        fps=fps, 
        codec='libvpx-vp9', 
        pixelformat='yuva420p'
    )
    
    print(f"Starting processing of {total_frames} frames to WEBM with Alpha...")
    
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
        
        # Write the RGBA frame to the webm
        writer.append_data(np.array(out_img))
        
        count += 1
        if count % 10 == 0:
            print(f"Processed {count}/{total_frames} frames")
            
    cap.release()
    writer.close()
    print("Video processing complete!")

if __name__ == "__main__":
    process_video()

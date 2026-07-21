import sys
from rembg import remove
from PIL import Image

def process_gif():
    input_path = 'frontend/public/assets/chatbot-media/Gif.gif'
    output_path = 'frontend/public/assets/chatbot-media/Gif_ai_clean.gif'
    
    try:
        print("Loading GIF...")
        gif = Image.open(input_path)
        frames = []
        
        print(f"Processing {gif.n_frames} frames with rembg AI...")
        for i in range(gif.n_frames):
            gif.seek(i)
            frame = gif.convert("RGBA")
            # The remove function uses a pre-trained neural network (U2-Net)
            out = remove(frame)
            frames.append(out)
            if i % 10 == 0:
                print(f"Processed {i}/{gif.n_frames} frames")
        
        print("Saving cleaned GIF...")
        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            duration=gif.info.get('duration', 80),
            loop=gif.info.get('loop', 0),
            disposal=2,
            transparency=0
        )
        print("Done! Clean GIF saved to:", output_path)
    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    process_gif()

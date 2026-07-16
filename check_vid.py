import cv2
cap = cv2.VideoCapture('frontend/public/assets/chatbot-media/Gif_light.mp4')
fps = cap.get(cv2.CAP_PROP_FPS)
frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
print(f"FPS: {fps}, Frames: {frame_count}")
cap.release()

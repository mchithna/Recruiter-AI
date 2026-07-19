import cv2
import numpy as np

cap = cv2.VideoCapture('frontend/public/assets/chatbot-media/Gif_light_clean.mp4')
ret, frame = cap.read()
if ret:
    print("Frame max value:", np.max(frame))
    print("Frame min value:", np.min(frame))
    print("Frame std dev:", np.std(frame))
else:
    print("Failed to read frame")
cap.release()

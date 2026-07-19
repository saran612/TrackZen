import cv2
cap = cv2.VideoCapture("/home/saran/project/TrackZen/backend/models/test/Copy of Hafidz 2 Store-Touching-8.mp4")
width = cap.get(cv2.CAP_PROP_FRAME_WIDTH)
height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
fps = cap.get(cv2.CAP_PROP_FPS)
length = cap.get(cv2.CAP_PROP_FRAME_COUNT)
print(f"Width: {width}, Height: {height}, FPS: {fps}, Frame Count: {length}")
cap.release()

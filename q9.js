document.addEventListener("DOMContentLoaded", () => {
    const startCameraBtn = document.getElementById("startCameraBtn");
    const q9Camera = document.getElementById("q9camera");
    const q9CamStatus = document.getElementById("q9CamStatus");
    const q9Status = document.getElementById("q9Status");
    const q9Score = document.getElementById("q9Score");

    if (
        startCameraBtn &&
        q9Camera &&
        q9CamStatus &&
        q9Status &&
        q9Score
    ) {
        let faceLandmarker = null;
        let cameraStream = null;
        let checkingEyes = false;
        let eyesClosedSince = null;
        let animationId = null;
        let lastVideoTime = -1;
        let completed = false;

        // Tính khoảng cách giữa hai điểm trên khuôn mặt
        function distance(a, b) {
            return Math.hypot(a.x - b.x, a.y - b.y);
        }

        // Tính độ mở mắt bằng Eye Aspect Ratio (EAR)
        function eyeAspectRatio(landmarks, indices) {
            const [p1, p2, p3, p4, p5, p6] =
                indices.map(i => landmarks[i]);

            return (
                distance(p2, p6) + distance(p3, p5)
            ) / (
                    2 * distance(p1, p4)
                );
        }

        function stopChecking() {
            checkingEyes = false;
            eyesClosedSince = null;

            if (animationId !== null) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }

        function stopCamera() {
            stopChecking();

            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
                cameraStream = null;
            }

            q9Camera.srcObject = null;
            q9Camera.style.display = "none";
            q9CamStatus.textContent = "Camera đã tắt";
        }

        startCameraBtn.addEventListener("click", async () => {
            if (completed || checkingEyes) return;

            startCameraBtn.disabled = true;
            q9CamStatus.textContent = "Đang khởi tạo camera và mô hình...";

            try {
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error("Trình duyệt không hỗ trợ camera.");
                }
                console.log("bắt đầu tải mp");
                const vision = await import(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14"
                );

                const fileset = await vision.FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
                );

                faceLandmarker = await vision.FaceLandmarker.createFromOptions(
                    fileset,
                    {
                        baseOptions: {
                            modelAssetPath:
                                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
                        },
                        runningMode: "VIDEO",
                        numFaces: 1
                    }
                );

                cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                    audio: false
                });

                q9Camera.srcObject = cameraStream;
                q9Camera.style.display = "block";

                await q9Camera.play();

                q9CamStatus.textContent =
                    "Camera đã bật. Hãy nhìn vào camera và nhắm mắt liên tục 3 giây.";
                q9Status.textContent = "Trạng thái: Đang kiểm tra...";
                q9Score.value = "0";

                checkingEyes = true;
                checkEyesFrame();

            } catch (error) {
                console.error("Lỗi Câu 9:", error);

                q9CamStatus.textContent =
                    "Không khởi tạo được camera hoặc mô hình. Hãy kiểm tra quyền camera và kết nối mạng.";

                startCameraBtn.disabled = false;
                stopCamera();
            }
        });

        function checkEyesFrame() {
            if (!checkingEyes || completed) return;

            if (
                q9Camera.readyState < 2 ||
                q9Camera.currentTime === lastVideoTime
            ) {
                animationId = requestAnimationFrame(checkEyesFrame);
                return;
            }

            lastVideoTime = q9Camera.currentTime;

            try {
                const result = faceLandmarker.detectForVideo(
                    q9Camera,
                    performance.now()
                );

                const face = result.faceLandmarks?.[0];

                if (!face) {
                    eyesClosedSince = null;
                    q9CamStatus.textContent =
                        "Chưa thấy rõ khuôn mặt. Hãy nhìn vào camera.";
                    animationId = requestAnimationFrame(checkEyesFrame);
                    return;
                }

                // Các điểm quanh mắt trái và mắt phải của Face Mesh
                const leftEAR = eyeAspectRatio(
                    face, [362, 385, 387, 263, 373, 380]
                );

                const rightEAR = eyeAspectRatio(
                    face, [33, 160, 158, 133, 153, 144]
                );

                const averageEAR = (leftEAR + rightEAR) / 2;

                console.log("EAR:", averageEAR.toFixed(3));

                // Ngưỡng thử nghiệm; cần kiểm tra thực tế với từng người
                const eyesClosed = averageEAR < 0.20;
                console.log("Mắt đang được nhận diện là:", eyesClosed ? "nhắm" : "mở");
                if (eyesClosed) {
                    if (eyesClosedSince === null) {
                        eyesClosedSince = performance.now();
                    }

                    const elapsed =
                        (performance.now() - eyesClosedSince) / 1000;

                    q9CamStatus.textContent =
                        `Đang nhận diện mắt nhắm: ${Math.min(elapsed, 3).toFixed(1)}/3 giây`;

                    if (elapsed >= 3) {
                        completed = true;
                        stopChecking();

                        q9Score.value = "1";
                        q9Status.textContent =
                            "Trạng thái: Hoàn thành!";
                        q9Status.style.color = "#22b169";

                        q9CamStatus.textContent =
                            "Đã ghi nhận đủ 3 giây. Bạn có thể tắt camera.";

                        startCameraBtn.textContent = "Đã hoàn thành";
                        console.log("điểm câu 9:", q9Score.value);
                        return;
                    }
                } else {
                    eyesClosedSince = null;
                    q9CamStatus.textContent = "Chưa xác nhận nhắm mắt hãy thử lại";
                }

            } catch (error) {
                console.error("Lỗi nhận diện mắt:", error);
                q9CamStatus.textContent =
                    "Lỗi nhận diện hãy thử lại trang";
                stopChecking();
                startCameraBtn.disabled = false;
                return;
            }

            animationId = requestAnimationFrame(checkEyesFrame);
        }
        q9Score.value = "0";
    }
});